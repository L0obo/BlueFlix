// movie-app/src/screens/MovieDetailsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, StatusBar, TouchableOpacity, Linking, Modal, Dimensions, SafeAreaView } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { getMovieDetails, getMovieVideos, getWatchProviders } from '../api/tmdbApi';
import { createMovie, getMovies, getWatchedMovies, deleteMovie } from '../api/api';
import { IMAGE_BASE_URL } from '../api/tmdbApi';
import { colors } from '../styles/colors';
import MovieDetailsSkeleton from '../components/MovieDetailsSkeleton';
import BackButton from '../components/BackButton';

const { width } = Dimensions.get('window');

export default function MovieDetailsScreen({ route, navigation }) {
  const { movieId, onGoBack } = route.params; // Recebe a função de callback
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedStatus, setSavedStatus] = useState('none');
  const [isSaving, setIsSaving] = useState(false);
  const [localMovie, setLocalMovie] = useState(null);
  const [error, setError] = useState(null);
  const [trailerId, setTrailerId] = useState(null);
  const [watchProviders, setWatchProviders] = useState(null);
  const [isTrailerVisible, setIsTrailerVisible] = useState(false);

  // --- LÓGICA DE ATUALIZAÇÃO AO VOLTAR ---
  // Este efeito é ativado quando o utilizador está prestes a sair da tela
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Chama a função de callback para atualizar a tela anterior
      if (onGoBack) {
        onGoBack();
      }
    });
    return unsubscribe;
  }, [navigation, onGoBack]);

  const checkIfMovieIsSaved = useCallback(async () => {
    try {
      const savedMovies = await getMovies();
      const watchedMovies = await getWatchedMovies();
      const watched = watchedMovies.find(m => m.tmdbId === movieId);
      const saved = savedMovies.find(m => m.tmdbId === movieId);

      if (watched) {
        setSavedStatus('watched');
        setLocalMovie(watched);
      } else if (saved) {
        setSavedStatus('saved');
        setLocalMovie(saved);
      } else {
        setSavedStatus('none');
        setLocalMovie(null);
      }
    } catch (e) {
      console.error("Erro ao verificar filmes guardados:", e);
    }
  }, [movieId]);

  const fetchAllDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [details, trailer, providers] = await Promise.all([
        getMovieDetails(movieId),
        getMovieVideos(movieId),
        getWatchProviders(movieId)
      ]);
      
      setMovie(details);
      setTrailerId(trailer);
      setWatchProviders(providers);

      if (details) {
        await checkIfMovieIsSaved();
      }
    } catch (e) {
      console.error("Erro ao buscar detalhes completos:", e);
      setError("Não foi possível carregar os detalhes do filme.");
    } finally {
      setLoading(false);
    }
  }, [movieId, checkIfMovieIsSaved]);

  useEffect(() => {
    fetchAllDetails();
  }, [fetchAllDetails]);

  const handleToggleSave = async () => {
    setError(null);
    
    if (savedStatus === 'none') {
      if (!movie) return;
      setIsSaving(true);
      try {
        const newMovie = {
          title: movie.title,
          year: movie.release_date ? parseInt(movie.release_date.substring(0, 4)) : 0,
          posterURL: movie.poster_path,
          tmdbId: movie.id,
        };
        const savedMovie = await createMovie(newMovie);
        setSavedStatus('saved');
        setLocalMovie(savedMovie);
      } catch (e) {
        setError(e.message);
      } finally {
        setIsSaving(false);
      }
    } 
    else if (savedStatus === 'saved') {
      if (!localMovie) return;
      setIsSaving(true);
      try {
        await deleteMovie(localMovie.id);
        setSavedStatus('none');
        setLocalMovie(null);
      } catch (e) {
        setError(e.message);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const getButtonText = () => {
      if (savedStatus === 'watched') return '✓ Filme Assistido';
      if (savedStatus === 'saved') return 'Remover da Minha Lista';
      return '+ Salvar na Minha Lista';
  };

  const renderContent = () => {
    if (loading) {
        return <MovieDetailsSkeleton />;
    }

    if (!movie || error) {
        return <View style={styles.centered}><Text style={styles.title}>{error || "Filme não encontrado."}</Text></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <Image 
                source={{ uri: `${IMAGE_BASE_URL}${movie.poster_path}` }}
                style={styles.poster}
            />
            <View style={styles.detailsContainer}>
                <Text style={styles.title}>{movie.title}</Text>
                <Text style={styles.tagline}>{movie.tagline}</Text>
                
                <View style={styles.infoRow}>
                    <Text style={styles.infoText}>⭐ {movie.vote_average.toFixed(1)}</Text>
                    <Text style={styles.infoText}>🗓️ {movie.release_date ? movie.release_date.substring(0, 4) : ''}</Text>
                    <Text style={styles.infoText}>🕒 {movie.runtime} min</Text>
                </View>

                <View style={styles.genresContainer}>
                    {movie.genres.map(genre => (
                        <View key={genre.id} style={styles.genreBadge}><Text style={styles.genreText}>{genre.name}</Text></View>
                    ))}
                </View>

                {trailerId ? (
                    <TouchableOpacity style={styles.trailerButton} onPress={() => setIsTrailerVisible(true)}>
                        <Text style={styles.saveButtonText}>🎬 Ver Trailer</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.disabledButton}><Text style={styles.saveButtonText}>Trailer Indisponível</Text></View>
                )}

                <TouchableOpacity 
                    style={[ styles.saveButton, savedStatus === 'saved' && styles.removeButton, savedStatus === 'watched' && styles.watchedButton ]} 
                    onPress={handleToggleSave}
                    disabled={savedStatus === 'watched' || isSaving}
                >
                    {isSaving ? <ActivityIndicator color={colors.accent} /> : <Text style={styles.saveButtonText}>{getButtonText()}</Text>}
                </TouchableOpacity>
                
                {error && <Text style={styles.errorText}>{error}</Text>}

                <Text style={styles.overviewTitle}>Onde Assistir</Text>
                {watchProviders && watchProviders.link && watchProviders.flatrate ? (
                    <TouchableOpacity onPress={() => Linking.openURL(watchProviders.link)}>
                        <View style={styles.providersContainer}>
                            {watchProviders.flatrate.map(provider => (
                            <View key={provider.provider_id} style={styles.providerBadge}>
                                <Image source={{ uri: `${IMAGE_BASE_URL}${provider.logo_path}`}} style={styles.providerLogo}/>
                            </View>
                            ))}
                        </View>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.overview}>Não disponível em serviços de streaming no seu país.</Text>
                )}

                <Text style={styles.overviewTitle}>Sinopse</Text>
                <Text style={styles.overview}>{movie.overview || "Sinopse não disponível."}</Text>
            </View>
        </ScrollView>
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
        <Modal
            animationType="fade"
            transparent={true}
            visible={isTrailerVisible}
            onRequestClose={() => setIsTrailerVisible(false)}
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.playerContainer}>
                        <YoutubePlayer
                            height={300}
                            play={true}
                            videoId={trailerId}
                            webViewStyle={{opacity: 0.99}}
                        />
                    </View>
                    <TouchableOpacity style={styles.modalCloseButton} onPress={() => setIsTrailerVisible(false)}>
                        <Text style={styles.modalCloseText}>Fechar</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>

        {renderContent()}
        
        <View style={styles.fabContainer}>
            <TouchableOpacity style={styles.fabButton} onPress={() => navigation.goBack()}>
                <Text style={styles.fabIcon}>‹</Text>
            </TouchableOpacity>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    poster: { width: '100%', height: 500, resizeMode: 'cover' },
    detailsContainer: { padding: 20, marginTop: -30, borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: colors.background, minHeight: 400, paddingBottom: 80 },
    title: { fontSize: 28, fontWeight: 'bold', color: colors.accent, marginBottom: 5 },
    tagline: { fontSize: 16, fontStyle: 'italic', color: colors.secondary, marginBottom: 20 },
    infoRow: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 15 },
    infoText: { color: colors.accent, fontSize: 16, marginRight: 20 },
    genresContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
    genreBadge: { backgroundColor: colors.primary, borderRadius: 15, paddingVertical: 5, paddingHorizontal: 12, marginRight: 10, marginBottom: 10 },
    genreText: { color: colors.accent, fontSize: 12 },
    trailerButton: { backgroundColor: '#c4302b', borderRadius: 10, padding: 15, alignItems: 'center', marginBottom: 15, flexDirection: 'row', justifyContent: 'center' },
    saveButton: { backgroundColor: 'rgba(65, 90, 119, 0.8)', borderRadius: 10, padding: 15, alignItems: 'center', marginBottom: 15, flexDirection: 'row', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(119, 141, 169, 0.5)' },
    disabledButton: { backgroundColor: colors.secondary, borderRadius: 10, padding: 15, alignItems: 'center', marginBottom: 15, flexDirection: 'row', justifyContent: 'center' },
    removeButton: { backgroundColor: colors.danger, borderColor: colors.danger },
    watchedButton: { backgroundColor: '#0D3B66', borderColor: '#0D3B66' },
    saveButtonText: { color: colors.accent, fontSize: 16, fontWeight: 'bold' },
    overviewTitle: { fontSize: 20, fontWeight: 'bold', color: colors.accent, marginBottom: 10, marginTop: 10 },
    overview: { fontSize: 16, color: colors.secondary, lineHeight: 24 },
    errorText: { color: colors.danger, textAlign: 'center', marginBottom: 15, fontSize: 14, fontWeight: '600' },
    providersContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
    providerBadge: { width: 50, height: 50, borderRadius: 10, backgroundColor: '#FFF', marginRight: 15, marginBottom: 15, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    providerLogo: { width: '100%', height: '100%', resizeMode: 'contain' },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.9)' },
    modalContent: { width: '100%', paddingHorizontal: 10, },
    playerContainer: { width: '100%', aspectRatio: 16/9, backgroundColor: '#000', borderRadius: 10, overflow: 'hidden' },
    modalCloseButton: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, alignSelf: 'flex-end', marginTop: 15 },
    modalCloseText: { color: colors.accent, fontWeight: 'bold', fontSize: 14 },
    fabContainer: {
        position: 'absolute',
        bottom: 45,
        right: 25,
        alignItems: 'center',
    },
    fabButton: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        backgroundColor: 'rgba(65, 90, 119, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
    },
    fabIcon: {
        color: colors.accent,
        fontSize: 30,
        fontWeight: 'bold',
        lineHeight: 32,
    },
});

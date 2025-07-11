// movie-app/src/screens/ValeAPenaVerDeNovoScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, StatusBar, TouchableOpacity, Modal, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from '@react-navigation/native'; // 1. Importar o hook
import { getWatchedMovies } from '../api/api';
import MovieItem from '../components/MovieItem';
import MovieItemSkeleton from '../components/MovieItemSkeleton';
import { colors } from '../styles/colors';
import { IMAGE_BASE_URL } from '../api/tmdbApi';

const ITEM_MARGIN_HORIZONTAL = 12;
const SKELETON_DATA = Array(8).fill(0);

export default function ValeAPenaVerDeNovoScreen({ navigation }) {
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendedMovie, setRecommendedMovie] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const isFocused = useIsFocused(); // 2. Usar o hook para saber se a tela está em foco

  const fetchWatched = useCallback(async () => {
    if (!isRefreshing) setLoading(true);
    setError(null);
    try {
      const movies = await getWatchedMovies();
      setWatchedMovies(movies);
    } catch (error) {
      console.error("Erro ao buscar filmes assistidos:", error);
      setError("Não foi possível carregar os seus filmes.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  useEffect(() => {
    // 3. Buscar os dados sempre que a tela estiver em foco
    if (isFocused) {
      fetchWatched();
    }
  }, [isFocused, fetchWatched]); // 4. Adicionar 'isFocused' e 'fetchWatched' como dependências

  const handleRecommend = () => {
    if (watchedMovies.length > 0) {
      const randomIndex = Math.floor(Math.random() * watchedMovies.length);
      setRecommendedMovie(watchedMovies[randomIndex]);
      setIsModalVisible(true);
    }
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchWatched();
  }, [fetchWatched]);

  const renderContent = () => {
    if (loading) {
        return (
            <FlatList
              data={SKELETON_DATA}
              keyExtractor={(_, index) => `skeleton-${index}`}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              contentContainerStyle={styles.listContainer}
              renderItem={() => <MovieItemSkeleton />}
            />
        );
    }
    if (error) {
        return (
            <View style={styles.centeredEmpty}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={fetchWatched}>
                    <Text style={styles.retryText}>Tentar Novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }
    return (
        <FlatList
            data={watchedMovies}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            contentContainerStyle={styles.listContainer}
            onRefresh={handleRefresh}
            refreshing={isRefreshing}
            ListHeaderComponent={
            watchedMovies.length > 0 ? (
                <TouchableOpacity style={styles.recommendButton} onPress={handleRecommend}>
                <Text style={styles.recommendButtonText}>✨ Me recomende um filme</Text>
                </TouchableOpacity>
            ) : null
            }
            ListEmptyComponent={
            <View style={styles.centeredEmpty}>
                <Text style={styles.emptyText}>Nenhum filme assistido ainda.</Text>
                <Text style={styles.emptySubText}>Marque um filme como assistido na sua galeria.</Text>
            </View>
            }
            renderItem={({ item }) => (
            <MovieItem
                movie={item}
                isSavedList={true}
                onDelete={() => navigation.navigate('Apagar Filme', { id: item.id, listType: 'watched' })}
                onPress={() => navigation.navigate('Detalhes do Filme', { movieId: item.tmdbId })}
            />
            )}
        />
    );
  };

  return (
    <LinearGradient
      colors={[colors.background, '#0A1828', colors.primary]}
      style={styles.gradient}
    >
        <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Modal
            animationType="fade"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setIsModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Que tal rever este clássico?</Text>
                    {recommendedMovie && (
                        <>
                            <Image source={{ uri: `${IMAGE_BASE_URL}${recommendedMovie.posterURL}` }} style={styles.modalImage} />
                            <Text style={styles.modalMovieTitle}>{recommendedMovie.title}</Text>
                            <Text style={styles.modalMovieYear}>{recommendedMovie.year}</Text>
                        </>
                    )}
                    <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
                        <Text style={styles.closeButtonText}>Fechar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>

        {renderContent()}
        </View>
        <View style={styles.fabContainer}>
            <TouchableOpacity style={styles.fabButton} onPress={() => navigation.goBack()}>
                <Text style={styles.fabIcon}>‹</Text>
            </TouchableOpacity>
        </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, backgroundColor: 'transparent' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  centeredEmpty: { flex: 1, paddingTop: 50, alignItems: 'center', justifyContent: 'center' },
  listContainer: { paddingHorizontal: ITEM_MARGIN_HORIZONTAL, paddingTop: 15, paddingBottom: 100 },
  emptyText: { color: colors.accent, fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  emptySubText: { color: colors.secondary, fontSize: 14, marginTop: 8, textAlign: 'center' },
  recommendButton: { backgroundColor: colors.primary, marginHorizontal: 15, marginBottom: 20, padding: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.secondary, },
  recommendButtonText: { color: colors.accent, fontSize: 16, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' },
  modalContent: { width: '85%', backgroundColor: colors.background, borderRadius: 20, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.secondary, marginBottom: 20 },
  modalImage: { width: 200, height: 300, borderRadius: 10, marginBottom: 15 },
  modalMovieTitle: { fontSize: 22, fontWeight: 'bold', color: colors.accent, textAlign: 'center' },
  modalMovieYear: { fontSize: 16, color: colors.secondary, marginTop: 5, marginBottom: 25 },
  closeButton: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 30, elevation: 2 },
  closeButtonText: { color: colors.accent, fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
  errorText: { color: colors.danger, fontSize: 18, textAlign: 'center', marginBottom: 20, paddingHorizontal: 20, },
  retryText: { color: colors.accent, fontSize: 16, fontWeight: 'bold', textDecorationLine: 'underline', },
  fabContainer: {
    position: 'absolute',
    bottom: 45,
    right: 25,
    flexDirection: 'row',
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

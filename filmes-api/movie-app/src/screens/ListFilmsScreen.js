// movie-app/src/screens/ListFilmsScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, StatusBar, TouchableOpacity, Text, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { discoverMovies, searchMovies, getGenres } from '../api/tmdbApi';
import { createMovie, getMovies, getWatchedMovies, deleteMovie } from '../api/api';
import MovieItem from '../components/MovieItem';
import MovieItemSkeleton from '../components/MovieItemSkeleton';
import FilterModal from '../components/FilterModal';
import { colors } from '../styles/colors';

const ITEM_MARGIN_HORIZONTAL = 12;
const SKELETON_DATA = Array(10).fill(0);

// Componente para o rodapé de carregamento com esqueletos
const SkeletonFooter = () => (
  <View style={styles.footerContainer}>
    <MovieItemSkeleton />
    <MovieItemSkeleton />
  </View>
);

export default function ListFilmsScreen({ navigation }) {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [error, setError] = useState(null);
  const [savingMovieId, setSavingMovieId] = useState(null);
  const [myMovies, setMyMovies] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    genreId: null,
    rating: null,
    ageRating: null,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchInitialData = useCallback(async () => {
    if (!isRefreshing) setInitialLoading(true);
    setError(null);
    try {
      await Promise.all([
        (async () => {
          const results = await getGenres();
          setGenres([{ id: null, name: 'Populares' }, ...results]);
        })(),
        (async () => {
          const saved = await getMovies();
          const watched = await getWatchedMovies();
          setMyMovies(saved);
          setWatchedMovies(watched);
        })()
      ]);
    } catch (e) {
      console.error("Falha ao carregar dados iniciais:", e);
      setError("Não foi possível carregar os dados. Verifique a sua conexão.");
    } finally {
      setInitialLoading(false);
    }
  }, [isRefreshing]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchInitialData);
    return unsubscribe;
  }, [navigation, fetchInitialData]);

  const fetchMovies = useCallback(async (query, filters, pageNum) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("A busca demorou muito. Verifique a sua conexão.")), 10000)
    );

    try {
      let fetchPromise;
      const isFilterActive = filters.genreId || filters.rating || filters.ageRating;
      
      if (query && !isFilterActive) {
        fetchPromise = searchMovies(query, pageNum);
      } else {
        fetchPromise = discoverMovies({ ...filters, page: pageNum });
      }

      const results = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (results.length === 0) {
        setHasMore(false);
      }
      
      setMovies(prev => pageNum === 1 ? results : [...prev, ...results]);
    } catch (e) {
      console.error("Falha ao buscar filmes: ", e.message);
      setError(e.message);
      setMovies([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (!initialLoading) {
      setPage(1);
      setHasMore(true);
      fetchMovies(debouncedSearchQuery, activeFilters, 1);
    }
  }, [debouncedSearchQuery, activeFilters, fetchMovies, initialLoading]);

  const handleLoadMore = () => {
    if (loadingMore || loading || !hasMore) return;
    const newPage = page + 1;
    setPage(newPage);
    fetchMovies(debouncedSearchQuery, activeFilters, newPage);
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setPage(1);
    setHasMore(true);
    await Promise.all([
        fetchInitialData(),
        fetchMovies(debouncedSearchQuery, activeFilters, 1)
    ]);
    setIsRefreshing(false);
  }, [debouncedSearchQuery, activeFilters, fetchInitialData, fetchMovies]);

  const handleApplyFilters = (newFilters) => {
    // A linha setSearchQuery('') foi removida daqui
    setActiveFilters(newFilters);
  };
  
  const handleSaveMovie = async (movieToSave) => {
    setSavingMovieId(movieToSave.id);
    try {
      const newMovie = {
        title: movieToSave.title,
        year: movieToSave.release_date ? parseInt(movieToSave.release_date.substring(0, 4)) : 0,
        posterURL: movieToSave.poster_path,
        tmdbId: movieToSave.id,
      };
      const savedMovie = await createMovie(newMovie);
      setMyMovies(prev => [...prev, savedMovie]);
    } catch (error) {
      console.error('Erro ao salvar o filme:', error.message);
    } finally {
      setSavingMovieId(null);
    }
  };
  
  const handleRemoveMovie = async (movieToRemove) => {
    const movieInMyList = myMovies.find(m => m.tmdbId === movieToRemove.id);
    if (!movieInMyList) return;
    setSavingMovieId(movieToRemove.id);
    try {
        await deleteMovie(movieInMyList.id);
        setMyMovies(prev => prev.filter(m => m.id !== movieInMyList.id));
    } catch (error) {
        console.error('Erro ao remover o filme:', error.message);
    } finally {
        setSavingMovieId(null);
    }
  };

  const renderContent = () => {
    if (loading || initialLoading) {
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
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleRefresh}>
              <Text style={styles.retryText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <FlatList
        data={movies}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={styles.listContainer}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore && hasMore ? <SkeletonFooter /> : null}
        ListEmptyComponent={() => (
            !loading && (
              <View style={styles.centered}>
                  <Text style={styles.emptyText}>Nenhum filme encontrado.</Text>
                  <Text style={styles.emptySubText}>Tente uma busca ou um filtro diferente.</Text>
              </View>
            )
        )}
        renderItem={({ item }) => {
          const isWatched = watchedMovies.some(m => m.tmdbId === item.id);
          const isSaved = myMovies.some(m => m.tmdbId === item.id);
          const status = isWatched ? 'watched' : isSaved ? 'saved' : 'none';
          
          return (
            <MovieItem
              movie={item}
              onSave={() => handleSaveMovie(item)}
              onRemove={() => handleRemoveMovie(item)}
              isSavedList={false}
              onPress={() => navigation.navigate('Detalhes do Filme', { movieId: item.id })}
              isSaving={savingMovieId === item.id}
              savedStatus={status}
            />
          );
        }}
      />
    );
  };

  return (
    <LinearGradient colors={[colors.background, '#0A1828', colors.primary]} style={styles.gradient}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <FilterModal 
          visible={isFilterModalVisible}
          onClose={() => setIsFilterModalVisible(false)}
          onApplyFilters={handleApplyFilters}
          genres={genres}
          currentFilters={activeFilters}
        />
        <View style={styles.searchContainer}>
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar filmes..."
                placeholderTextColor={colors.secondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.filterButton} onPress={() => setIsFilterModalVisible(true)}>
                <Text style={styles.filterIcon}>📊</Text>
            </TouchableOpacity>
        </View>
        
        {renderContent()}
        
        <View style={styles.fabContainer}>
            <TouchableOpacity style={styles.fabButton} onPress={() => navigation.navigate('Novo Filme')}>
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fabButton} onPress={() => navigation.goBack()}>
                <Text style={styles.fabIcon}>‹</Text>
            </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, backgroundColor: 'transparent' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  listContainer: { paddingHorizontal: ITEM_MARGIN_HORIZONTAL, paddingTop: 15, paddingBottom: 100 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginTop: 15, marginBottom: 10 },
  searchInput: { flex: 1, backgroundColor: colors.primary, color: colors.accent, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, fontSize: 16 },
  filterButton: { marginLeft: 10, backgroundColor: colors.primary, padding: 12, borderRadius: 25 },
  filterIcon: { fontSize: 20 },
  fabContainer: { position: 'absolute', bottom: 45, right: 25, flexDirection: 'row', alignItems: 'center' },
  fabButton: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: 'rgba(65, 90, 119, 0.7)', justifyContent: 'center', alignItems: 'center', marginLeft: 15, elevation: 8 },
  fabIcon: { color: colors.accent, fontSize: 30, fontWeight: 'bold', lineHeight: 32 },
  errorText: { color: colors.danger, fontSize: 18, textAlign: 'center', marginBottom: 20, paddingHorizontal: 20, },
  retryText: { color: colors.accent, fontSize: 16, fontWeight: 'bold', textDecorationLine: 'underline', },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: ITEM_MARGIN_HORIZONTAL,
    paddingTop: 15,
  },
  emptyText: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptySubText: {
    color: colors.secondary,
    fontSize: 14,
    marginTop: 8,
  }
});

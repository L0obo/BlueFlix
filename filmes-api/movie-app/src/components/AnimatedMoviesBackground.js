// movie-app/src/components/AnimatedMoviesBackground.js
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { discoverMovies } from '../api/tmdbApi';
import { IMAGE_BASE_URL } from '../api/tmdbApi';
import { colors } from '../styles/colors';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const POSTER_WIDTH = width / 3;
const POSTER_HEIGHT = POSTER_WIDTH * 1.5;
const POSTER_MARGIN = 2;

// Componente para uma única coluna de filmes que se anima
const MovieColumn = ({ movies, direction = 'up' }) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const columnHeight = movies.length * (POSTER_HEIGHT + POSTER_MARGIN * 2);

  useEffect(() => {
    if (columnHeight > 0) {
      const animation = Animated.loop(
        Animated.timing(animValue, {
          toValue: 1,
          duration: 300000,
          useNativeDriver: true,
        })
      );
      animation.start();
      return () => animation.stop();
    }
  }, [animValue, columnHeight]);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: direction === 'up' ? [0, -columnHeight] : [-columnHeight, 0],
  });

  return (
    <Animated.View style={{ transform: [{ translateY }] }}>
      {[...movies, ...movies].map((movie, index) => (
        <View key={`col-${movie.id}-${index}`} style={styles.posterContainer}>
          <Image
            source={{ uri: `${IMAGE_BASE_URL}${movie.poster_path}` }}
            style={styles.posterImage}
          />
          <View style={styles.grayscaleOverlay} />
        </View>
      ))}
    </Animated.View>
  );
};

export default function AnimatedMoviesBackground({ children }) {
  const [columns, setColumns] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(false);
  const backgroundOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchMoviesForBackground = async () => {
      try {
        // --- ALTERAÇÃO APLICADA AQUI ---
        // Adicionado `include_adult: false` para garantir que a API não retorne conteúdo +18.
        const pagePromises = [1, 2, 3].map(page => discoverMovies({ page, include_adult: false }));
        const pages = await Promise.all(pagePromises);
        
        // O filtro `!m.adult` é mantido como uma segunda camada de segurança.
        const allMovies = pages.flat().filter(m => !m.adult && m.poster_path);
        
        if (allMovies.length > 0) {
          const distributedColumns = Array.from({ length: NUM_COLUMNS }, () => []);
          allMovies.forEach((movie, index) => {
            distributedColumns[index % NUM_COLUMNS].push(movie);
          });
          setColumns(distributedColumns);
          setIsReady(true);
        } else {
          setError(true);
        }
      } catch (e) {
        console.error("Erro ao buscar filmes para o fundo:", e);
        setError(true);
      }
    };
    fetchMoviesForBackground();
  }, []);

  useEffect(() => {
    if (isReady) {
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start();
    }
  }, [isReady, backgroundOpacity]);

  // Se houver um erro, mostra um gradiente estático como fallback
  if (error) {
    return (
        <LinearGradient
            colors={[colors.background, '#0A1828', colors.primary]}
            style={styles.container}
        >
            {children}
        </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.animatedContainer, { opacity: backgroundOpacity }]}>
        {columns.length > 0 && (
          <View style={styles.columnsContainer}>
            {columns.map((col, i) => (
              <MovieColumn
                key={`column-${i}`}
                movies={col}
                direction={i % 2 === 0 ? 'up' : 'down'} 
              />
            ))}
          </View>
        )}
      </Animated.View>
      
      <View style={styles.overlay} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
  animatedContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  columnsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'space-evenly',
    top: -POSTER_HEIGHT, 
  },
  posterContainer: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    margin: POSTER_MARGIN,
    borderRadius: 6,
    overflow: 'hidden',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  grayscaleOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    opacity: 0.5,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 27, 42, 0.88)',
  },
});

// movie-app/src/components/MovieDetailsSkeleton.js
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/colors';

// Um componente simples para criar as barras do esqueleto
const Placeholder = ({ width, height, style }) => (
  <View style={[{ width, height, backgroundColor: colors.primary, borderRadius: 4 }, style]} />
);

export default function MovieDetailsSkeleton() {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação de loop para o efeito de pulsação
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Interpola a opacidade para criar o efeito de "piscar"
  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <LinearGradient
      colors={[colors.background, '#0A1828', colors.primary]}
      style={styles.gradient}
    >
      <Animated.View style={[styles.container, { opacity: pulseOpacity }]}>
        {/* Placeholder para o poster */}
        <View style={styles.poster} />
        
        {/* Placeholders para o conteúdo de texto */}
        <View style={styles.detailsContainer}>
          <Placeholder width="80%" height={28} style={{ marginBottom: 10 }} />
          <Placeholder width="50%" height={16} style={{ marginBottom: 25 }} />
          
          <View style={styles.infoRow}>
            <Placeholder width={70} height={16} />
            <Placeholder width={70} height={16} />
            <Placeholder width={70} height={16} />
          </View>

          <View style={styles.genresContainer}>
            <Placeholder width={80} height={30} style={{ borderRadius: 15 }} />
            <Placeholder width={100} height={30} style={{ borderRadius: 15 }} />
          </View>

          <Placeholder width="100%" height={45} style={{ marginBottom: 25, borderRadius: 10 }} />

          <Placeholder width="40%" height={20} style={{ marginBottom: 15 }} />
          <Placeholder width="100%" height={16} />
          <Placeholder width="100%" height={16} style={{ marginTop: 8 }} />
          <Placeholder width="70%" height={16} style={{ marginTop: 8 }} />
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  poster: {
    width: '100%',
    height: 500,
    backgroundColor: colors.primary,
  },
  detailsContainer: {
    padding: 20,
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: colors.background,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 20,
    marginBottom: 20,
  },
  genresContainer: {
    flexDirection: 'row',
    marginBottom: 25,
    gap: 10,
  },
});

// movie-app/src/components/MovieItemSkeleton.js
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { colors } from '../styles/colors';

// Usamos as mesmas dimensões do MovieItem para consistência
const { width } = Dimensions.get('window');
const ITEM_MARGIN_HORIZONTAL = 12;
const ITEM_SPACING = 12;
const ITEM_WIDTH = (width - (ITEM_MARGIN_HORIZONTAL * 2) - ITEM_SPACING) / 2;
const ITEM_HEIGHT = ITEM_WIDTH * 1.5;

export default function MovieItemSkeleton() {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação de loop para o efeito de pulsação
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Interpola a opacidade para criar o efeito de "piscar"
  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1], // Varia a opacidade entre 50% e 100%
  });

  return (
    <Animated.View style={[styles.container, { opacity: pulseOpacity }]} />
  );
}

const styles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    marginBottom: ITEM_SPACING + 8,
    borderRadius: 12,
    backgroundColor: colors.primary, // Usa a cor primária como base do esqueleto
  },
});

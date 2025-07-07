import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { colors } from '../styles/colors';

export default function BackButton({ onPress }) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      {/* Usamos um caractere de seta para o ícone */}
      <Text style={styles.fabIcon}>‹</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    right: 25,
    bottom: 35, // Um pouco mais para cima para não ficar colado na borda
    backgroundColor: colors.primary,
    borderRadius: 25, // Círculo perfeito
    elevation: 8,
    shadowColor: '#000',
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowOffset: { height: 4, width: 0 },
    zIndex: 10, // Garante que o botão fique por cima de outros elementos
  },
  fabIcon: {
    fontSize: 34,
    color: colors.accent,
    // Ajustes para centralizar a seta perfeitamente
    fontWeight: 'bold',
    lineHeight: 50,
    textAlign: 'center',
  },
});
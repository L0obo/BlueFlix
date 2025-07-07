// movie-app/src/components/FilterModal.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, SafeAreaView, TouchableWithoutFeedback } from 'react-native';
import { colors } from '../styles/colors';

// Opções de filtro pré-definidas
const RATINGS = [ { label: '7+', value: 7 }, { label: '8+', value: 8 }, { label: '9+', value: 9 }];
const AGE_RATINGS = [
    { label: 'Livre', value: 'BR-L' }, { label: '10', value: 'BR-10' }, 
    { label: '12', value: 'BR-12' }, { label: '14', value: 'BR-14' }, 
    { label: '16', value: 'BR-16' }, { label: '18', value: 'BR-18' }
];

export default function FilterModal({ visible, onClose, onApplyFilters }) {
  const [rating, setRating] = useState(null);
  const [ageRating, setAgeRating] = useState(null);

  const handleApply = () => {
    onApplyFilters({ rating, ageRating });
    onClose();
  };

  const handleClear = () => {
    setRating(null);
    setAgeRating(null);
    onApplyFilters({ rating: null, ageRating: null });
    onClose();
  };

  const renderFilterSection = (title, options, selectedValue, onSelect) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[styles.optionButton, selectedValue === option.value && styles.optionButtonSelected]}
            onPress={() => onSelect(selectedValue === option.value ? null : option.value)}
          >
            <Text style={[styles.optionText, selectedValue === option.value && styles.optionTextSelected]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalContainer} 
        activeOpacity={1} 
        onPressOut={onClose}
      >
        <TouchableWithoutFeedback>
            <SafeAreaView style={styles.modalContent}>
              <View style={styles.header}>
                <Text style={styles.modalTitle}>Filtros Avançados</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>
              </View>
              
              {renderFilterSection("Nota Mínima (Estrelas)", RATINGS, rating, setRating)}
              {renderFilterSection("Classificação Indicativa", AGE_RATINGS, ageRating, setAgeRating)}

              <View style={styles.footerButtons}>
                <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={handleClear}>
                  <Text style={styles.buttonText}>Limpar Filtros</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.applyButton]} onPress={handleApply}>
                  <Text style={styles.buttonText}>Aplicar</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { 
    flex: 1, 
    justifyContent: 'flex-end', 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    height: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: colors.accent, 
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: -5, // Ajustado para alinhar melhor com o título
    width: 32,
    height: 32,
    borderRadius: 16, // Metade da largura/altura para um círculo perfeito
    backgroundColor: 'rgba(164, 22, 26, 0.7)', // Vermelho com transparência
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '900', // Mais forte para destacar o 'X'
    lineHeight: 18, // Ajuste para centralização vertical
  },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.secondary, marginBottom: 15 },
  optionsContainer: { paddingRight: 20 },
  optionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionButtonSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  optionText: { color: colors.accent, fontWeight: 'bold' },
  optionTextSelected: { color: colors.background },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  button: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center' },
  clearButton: { backgroundColor: colors.secondary, marginRight: 10 },
  applyButton: { backgroundColor: colors.primary, marginLeft: 10 },
  buttonText: { color: colors.accent, fontSize: 16, fontWeight: 'bold' },
});

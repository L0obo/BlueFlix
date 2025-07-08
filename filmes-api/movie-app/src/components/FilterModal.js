// movie-app/src/components/FilterModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, SafeAreaView, TouchableWithoutFeedback } from 'react-native';
import { colors } from '../styles/colors';

// Opções de filtro pré-definidas
const RATINGS = [ { label: '7+', value: 7 }, { label: '8+', value: 8 }, { label: '9+', value: 9 }];
const AGE_RATINGS = [
    { label: 'Livre', value: 'L' }, { label: '10', value: '10' }, 
    { label: '12', value: '12' }, { label: '14', value: '14' }, 
    { label: '16', value: '16' }, { label: '18', value: '18' }
];

export default function FilterModal({ visible, onClose, onApplyFilters, genres = [], currentFilters }) {
  const [rating, setRating] = useState(currentFilters.rating);
  const [ageRating, setAgeRating] = useState(currentFilters.ageRating);
  const [genreId, setGenreId] = useState(currentFilters.genreId);

  useEffect(() => {
    setRating(currentFilters.rating);
    setAgeRating(currentFilters.ageRating);
    setGenreId(currentFilters.genreId);
  }, [currentFilters]);

  const handleApply = () => {
    onApplyFilters({ rating, ageRating, genreId });
    onClose();
  };

  const handleClear = () => {
    setRating(null);
    setAgeRating(null);
    setGenreId(null);
    onApplyFilters({ rating: null, ageRating: null, genreId: null });
    onClose();
  };

  const renderFilterSection = (title, options, selectedValue, onSelect) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={`${title}-${option.id || option.value}`}
            style={[styles.optionButton, selectedValue === (option.id || option.value) && styles.optionButtonSelected]}
            onPress={() => onSelect(selectedValue === (option.id || option.value) ? null : (option.id || option.value))}
          >
            <Text style={[styles.optionText, selectedValue === (option.id || option.value) && styles.optionTextSelected]}>
              {option.name || option.label}
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
              
              <View style={{ flex: 1 }}>
                <ScrollView>
                    {renderFilterSection("Géneros", genres, genreId, setGenreId)}
                    {renderFilterSection("Nota Mínima", RATINGS, rating, setRating)}
                    {renderFilterSection("Classificação Indicativa", AGE_RATINGS, ageRating, setAgeRating)}
                </ScrollView>
              </View>

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
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '65%',
    flexDirection: 'column',
  },
  header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: colors.accent, textAlign: 'center' },
  closeButton: { position: 'absolute', right: 0, top: -5, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(164, 22, 26, 0.7)', justifyContent: 'center', alignItems: 'center' },
  closeButtonText: { fontSize: 16, color: colors.accent, fontWeight: '900', lineHeight: 18 },
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
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.primary,
    // --- ALTERAÇÃO APLICADA AQUI ---
    marginBottom: 10, // Adiciona uma margem para levantar os botões
  },
  button: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center' },
  clearButton: { backgroundColor: colors.secondary, marginRight: 10 },
  applyButton: { backgroundColor: colors.primary, marginLeft: 10 },
  buttonText: { color: colors.accent, fontSize: 16, fontWeight: 'bold' },
});

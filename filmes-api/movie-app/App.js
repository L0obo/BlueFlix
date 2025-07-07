// movie-app/App.js
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from './src/styles/colors';

import TermsScreen from './src/screens/TermsScreen';
import HomeScreen from './src/screens/HomeScreen';
import ListFilmsScreen from './src/screens/ListFilmsScreen';
import ViewMovieScreen from './src/screens/ViewMovieScreen';
import MovieDetailsScreen from './src/screens/MovieDetailsScreen';
import ValeAPenaVerDeNovoScreen from './src/screens/ValeAPenaVerDeNovoScreen';
import CreateMovieScreen from './src/screens/CreateMovieScreen';
import EditMovieScreen from './src/screens/EditMovieScreen';
import DeleteMovieScreen from './src/screens/DeleteMovieScreen';
import MarkAsWatchedScreen from './src/screens/MarkAsWatchedScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.accent,
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          // --- ALTERAÇÃO APLICADA AQUI ---
          // Remove a animação de deslize lateral
          animation: 'none',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Descobrir Filmes" component={ListFilmsScreen} /> 
        <Stack.Screen name="Meus Filmes Salvos" component={ViewMovieScreen} options={{ title: "Minha Galeria" }} />
        <Stack.Screen name="Vale a pena ver de novo" component={ValeAPenaVerDeNovoScreen} />
        <Stack.Screen name="Detalhes do Filme" component={MovieDetailsScreen} options={{ headerTransparent: true, title: '' }} />
        <Stack.Screen name="Novo Filme" component={CreateMovieScreen} options={{title: "Adicionar Novo Filme"}}/>
        <Stack.Screen name="Editar Filme" component={EditMovieScreen} options={{title: "Editar Filme"}}/>
        <Stack.Screen name="Apagar Filme" component={DeleteMovieScreen} options={{ presentation: 'modal', title: "Confirmar Exclusão" }} />
        <Stack.Screen name="Marcar como Assistido" component={MarkAsWatchedScreen} options={{ presentation: 'modal', title: "Confirmar Ação" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  useEffect(() => {
    const checkTerms = async () => {
      try {
        const value = await AsyncStorage.getItem('@terms_accepted');
        if (value !== null) {
          setHasAcceptedTerms(true);
        }
      } catch (e) {
        console.error("Falha ao ler o estado dos termos.", e);
      } finally {
        setIsLoading(false);
      }
    };
    checkTerms();
  }, []);

  const handleAcceptTerms = async () => {
    try {
      await AsyncStorage.setItem('@terms_accepted', 'true');
      setHasAcceptedTerms(true);
    } catch (e) {
      console.error("Falha ao guardar o estado dos termos.", e);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return hasAcceptedTerms ? <AppNavigator /> : <TermsScreen onAccept={handleAcceptTerms} />;
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    }
});

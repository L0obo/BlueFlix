// movie-app/src/screens/HomeScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView, Linking, Animated } from 'react-native';
import { colors } from '../styles/colors';
import AnimatedMoviesBackground from '../components/AnimatedMoviesBackground';

export default function HomeScreen({ navigation }) {
  // --- LÓGICA DA ANIMAÇÃO DE INTRODUÇÃO ---
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleOneAnim = useRef(new Animated.Value(0)).current;
  const subtitleTwoAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação em sequência para cada elemento
    Animated.sequence([
      // 1. Anima o título
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // 2. Anima a primeira linha do subtítulo
      Animated.timing(subtitleOneAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      // 3. Anima a segunda linha do subtítulo
      Animated.timing(subtitleTwoAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      // 4. Anima os botões
      Animated.timing(buttonsAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [titleAnim, subtitleOneAnim, subtitleTwoAnim, buttonsAnim]);

  // Interpola os valores da animação para criar os efeitos
  const titleTranslateY = titleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });
  const subtitleOneTranslateY = subtitleOneAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });
   const subtitleTwoTranslateY = subtitleTwoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });
  const buttonsTranslateY = buttonsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });


  const handleContactPress = () => {
    const email = 'icaroiagoifnmg@gmail.com';
    const subject = 'Contacto a partir do App BlueFlix';
    
    Linking.openURL(`mailto:${email}?subject=${subject}`).catch(err => {
      console.error("Não foi possível abrir o cliente de e-mail", err);
    });
  };

  return (
    <AnimatedMoviesBackground>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <View style={styles.headerContainer}>
          <Animated.View style={{ opacity: titleAnim, transform: [{ translateY: titleTranslateY }] }}>
            <Text style={styles.title}>BlueFlix</Text>
          </Animated.View>
          
          <View style={styles.subtitleContainer}>
            <Animated.View style={{ opacity: subtitleOneAnim, transform: [{ translateY: subtitleOneTranslateY }] }}>
              <Text style={styles.subtitleLineOne}>Decidir o que assistir...</Text>
            </Animated.View>
            <Animated.View style={{ opacity: subtitleTwoAnim, transform: [{ translateY: subtitleTwoTranslateY }] }}>
              <Text style={styles.subtitleLineTwo}>Nunca foi tão fácil!</Text>
            </Animated.View>
          </View>
        </View>

        <Animated.View style={[styles.buttonsContainer, { opacity: buttonsAnim, transform: [{ translateY: buttonsTranslateY }] }]}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Descobrir Filmes')}
          >
            <Text style={styles.buttonText}>Descobrir Filmes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Meus Filmes Salvos')}
          >
            <Text style={styles.buttonText}>Minha Galeria Particular</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Vale a pena ver de novo')}
          >
            <Text style={styles.buttonText}>Vale a pena ver de novo</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.footerContainer}>
            <TouchableOpacity onPress={handleContactPress}>
                <Text style={styles.contactText}>Feedback ou Suporte?</Text>
            </TouchableOpacity>
        </View>
      </SafeAreaView>
    </AnimatedMoviesBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'transparent',
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20,
    paddingVertical: 50,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  footerContainer: {
    paddingBottom: 20,
  },
  title: { 
    fontSize: 52,
    fontWeight: 'bold', 
    color: colors.accent, 
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  subtitleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  subtitleLineOne: {
    fontSize: 18,
    color: colors.accent,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 5,
  },
  subtitleLineTwo: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.accent,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 5,
  },
  button: { 
    backgroundColor: 'rgba(65, 90, 119, 0.8)',
    paddingVertical: 15, 
    paddingHorizontal: 30, 
    borderRadius: 25, 
    width: '90%', 
    alignItems: 'center', 
    marginBottom: 20, 
    borderWidth: 1,
    borderColor: 'rgba(119, 141, 169, 0.5)'
  },
  buttonText: { 
    color: colors.accent, 
    fontSize: 16, 
    fontWeight: '600' 
  },
  contactText: {
    color: colors.secondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  }
});

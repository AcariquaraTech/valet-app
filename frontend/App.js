import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function App() {
  const [screen, setScreen] = React.useState('home');

  return (
    <ScrollView style={styles.container}>
      {screen === 'home' && (
        <View style={styles.screen}>
          <Text style={styles.title}>APP VALET</Text>
          <Text style={styles.subtitle}>Gerenciamento de Estacionamento</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => setScreen('login')}
            >
              <Text style={styles.buttonText}>Ir para Login</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]}
              onPress={() => setScreen('vehicles')}
            >
              <Text style={[styles.buttonText, styles.secondaryText]}>Ver Veículos</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {screen === 'login' && (
        <View style={styles.screen}>
          <Text style={styles.title}>Login</Text>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>admin@valet.com</Text>
            <Text style={styles.label}>Senha:</Text>
            <Text style={styles.value}>senha123</Text>
          </View>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => setScreen('home')}
          >
            <Text style={styles.buttonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      )}

      {screen === 'vehicles' && (
        <View style={styles.screen}>
          <Text style={styles.title}>Veículos</Text>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Teste Funcional</Text>
            <Text style={styles.value}>App rodando via Expo ✓</Text>
          </View>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => setScreen('home')}
          >
            <Text style={styles.buttonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  screen: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryText: {
    color: '#007AFF',
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
});

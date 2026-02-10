// Force Metro rebuild - 2026-02-01 14:20
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Image,
} from 'react-native';
import { useAccessKey } from '../store/AccessKeyContext';

export default function AccessKeyScreen({ navigation }) {
  const [key, setKey] = useState('');
  const { validateNewAccessKey, loading } = useAccessKey();

  console.log('[AccessKeyScreen] RENDERIZANDO AGORA!');

  const handleValidateKey = async () => {
    if (!key.trim()) {
      Alert.alert('Erro', 'Insira a chave de acesso');
      return;
    }

    const result = await validateNewAccessKey(key.trim());

    if (result.success) {
      Alert.alert(
        'Sucesso!',
        `Bem-vindo, ${result.data.clientName}!\n\nSua mensalidade vence em ${result.data.daysRemaining} dias.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // A navegação automática acontece na App.js
            },
          },
        ]
      );
    } else {
      Alert.alert('Erro', result.error);
    }
  };

  const handleTestConnection = async () => {
    try {
      console.log('[AccessKeyScreen] Testando conexão com backend...');
      const response = await fetch('http://valet-app-production.up.railway.app/api/health');
      const data = await response.json();
      console.log('[AccessKeyScreen] Resposta do health check:', data);
      Alert.alert('Sucesso', 'Backend está acessível!\n\n' + JSON.stringify(data, null, 2));
    } catch (err) {
      console.log('[AccessKeyScreen] Erro na conexão:', err);
      Alert.alert('Erro', 'Não conseguiu conectar ao backend:\n' + err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Header */}
        <View style={styles.header}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appSubtitle}>Sistema de Estacionamento</Text>
        </View>

        {/* Instruction Box */}
        <View style={styles.instructionBox}>
          <Text style={styles.instructionTitle}>🔑 Ative sua Licença</Text>
          <Text style={styles.instructionText}>
            Insira a chave de acesso que você recebeu do administrador para
            começar a usar o aplicativo.
          </Text>
        </View>

        {/* Input Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Chave de Acesso</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: VALET-ABC123XYZ"
            placeholderTextColor="#999"
            value={key}
            onChangeText={setKey}
            editable={!loading}
            autoCapitalize="upper"
            autoCorrect={false}
          />
          <Text style={styles.hint}>
            A chave deve começar com VALET- seguida de números e letras
          </Text>
        </View>

        {/* Button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleValidateKey}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Validar Chave</Text>
          )}
        </TouchableOpacity>

        {/* Test Connection Button */}
        <TouchableOpacity
          style={styles.testButton}
          onPress={handleTestConnection}
        >
          <Text style={styles.testButtonText}>🔧 Testar Conexão</Text>
        </TouchableOpacity>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ Não tem uma chave?</Text>
          <Text style={styles.infoText}>
            Entre em contato com o administrador do sistema para obter sua
            chave de acesso. Telefone: (92) 98429-2032
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2026 AcariquaraTech. Todos os direitos reservados.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 120,
    marginBottom: 20,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  instructionBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
    color: '#000',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

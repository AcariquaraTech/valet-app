import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, TextInput } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { Button, Card } from '../components/Common';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('admin@valet.com');
  const [password, setPassword] = useState('password123');
  const [accessKeyCode, setAccessKeyCode] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password || !accessKeyCode) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      await login(email, password, accessKeyCode);
    } catch (error) {
      Alert.alert('Erro de Login', error.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>APP Valet</Text>
          <Text style={styles.subtitle}>Gerenciamento de Estacionamento</Text>
        </View>

        <Card>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
            style={styles.input}
          />
        </Card>

        <Card>
          <TextInput
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
            style={styles.input}
          />
        </Card>

        <Card>
          <TextInput
            placeholder="Código da Chave de Acesso"
            value={accessKeyCode}
            onChangeText={setAccessKeyCode}
            autoCapitalize="upper"
            editable={!loading}
            style={styles.input}
          />
        </Card>

        <Button
          title="Entrar"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
});

export default LoginScreen;

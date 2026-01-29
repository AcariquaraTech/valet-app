import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, TouchableOpacity } from 'react-native';
import { TextInput } from '../components/Common';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../store/AuthContext';
import { Button, Card } from '../components/Common';

const LoginScreen = ({ navigation }) => {
  const [nickname, setNickname] = useState('admin');
  const [password, setPassword] = useState('');
  const [accessKeyCode, setAccessKeyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!nickname || !password || !accessKeyCode) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    try {
      setLoading(true);
      await login(nickname, password, accessKeyCode);
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
            placeholder="Usuário"
            value={nickname}
            onChangeText={setNickname}
            autoCapitalize="none"
            editable={!loading}
          />
        </Card>

        <Card>
          <TextInput
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!loading}
            autoCapitalize="none"
          >
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={{ marginLeft: 8, padding: 4 }}>
              <Icon
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color="#888"
              />
            </TouchableOpacity>
          </TextInput>
        </Card>

        <Card>
          <TextInput
            placeholder="Código da Chave de Acesso"
            value={accessKeyCode}
            onChangeText={setAccessKeyCode}
            autoCapitalize="characters"
            editable={!loading}
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

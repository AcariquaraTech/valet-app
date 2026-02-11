import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, TouchableOpacity } from 'react-native';
import { TextInput } from '../components/Common';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../store/AuthContext';
import { useAccessKey } from '../store/AccessKeyContext';
import { Button, Card } from '../components/Common';

const LoginScreen = ({ navigation }) => {
  const [nickname, setNickname] = useState('admin');
  const [password, setPassword] = useState('');
  const [accessKeyCode, setAccessKeyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const { accessKey, clearAccessKey } = useAccessKey();

  useEffect(() => {
    if (accessKey) {
      setAccessKeyCode(accessKey);
    }
  }, [accessKey]);

  const handleLogin = async () => {
    if (!nickname || !password || !accessKeyCode) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    try {
      setLoading(true);
      
      // Adiciona timeout de 10 segundos
      const loginPromise = login(nickname, password, accessKeyCode);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Conexão expirou. Verifique seu usuário e tente novamente.')), 10000)
      );
      
      await Promise.race([loginPromise, timeoutPromise]);
    } catch (error) {
      Alert.alert('Erro de Login', error.message || error.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleResetKey = async () => {
    Alert.alert(
      'Trocar chave',
      'Deseja voltar e inserir uma nova chave de acesso?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            await clearAccessKey();
            setAccessKeyCode('');
          },
        },
      ]
    );
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
            inputKey={showPassword ? 'password-visible' : 'password-hidden'}
            editable={!loading}
            autoCapitalize="none"
          >
            <TouchableOpacity
              onPress={() => setShowPassword((v) => !v)}
              style={{ marginLeft: 8, padding: 4 }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
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
            editable={!loading && !accessKey}
          />
        </Card>

        {accessKey && (
          <Button
            title="Trocar chave"
            onPress={handleResetKey}
            variant="secondary"
            disabled={loading}
          />
        )}

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

import React, { createContext, useContext, useState, useEffect } from 'react';
import { setGlobalLogout } from '../services/apiClient';
import { navigationRef } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services';
import { usePayment } from './PaymentContext';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [accessKey, setAccessKey] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Permite atualização do token/usuário a partir de fora (ex: interceptor)
  const setTokenAndUser = async (newToken, newUser, newCompany, newAccessKey) => {
    setToken(newToken);
    setUser(newUser);
    setCompany(newCompany);
    setAccessKey(newAccessKey);
    if (newToken) await AsyncStorage.setItem('authToken', newToken);
    if (newUser) await AsyncStorage.setItem('user', JSON.stringify(newUser));
    if (newCompany) await AsyncStorage.setItem('company', JSON.stringify(newCompany));
    if (newAccessKey) await AsyncStorage.setItem('accessKey', JSON.stringify(newAccessKey));
  };

  // Força um token inválido para teste automatizado
  const forceInvalidToken = async () => {
    const invalidToken = 'INVALID_TOKEN_TESTE';
    await AsyncStorage.setItem('authToken', invalidToken);
    setToken(invalidToken);
  };
  // O hook usePayment só pode ser chamado dentro do PaymentProvider
  const payment = usePayment();

  // Ao montar, registra função global de logout para interceptador
  useEffect(() => {
    setGlobalLogout(logout);
  }, []);
  // Verificar token ao iniciar
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('authToken');
      const savedUser = await AsyncStorage.getItem('user');
      const savedCompany = await AsyncStorage.getItem('company');
      const savedAccessKey = await AsyncStorage.getItem('accessKey');

      if (savedToken && savedUser) {
        // Tenta validar o token no backend antes de usá-lo
        try {
          console.log('[AuthContext.bootstrapAsync] Validando token salvo...');
          const response = await authService.validateToken(savedToken);
          console.log('[AuthContext.bootstrapAsync] Token validado com sucesso');
          
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          if (savedCompany) {
            setCompany(JSON.parse(savedCompany));
          }
          if (savedAccessKey) {
            setAccessKey(JSON.parse(savedAccessKey));
          }
        } catch (validationError) {
          // Token inválido ou expirou
          console.log('[AuthContext.bootstrapAsync] Token inválido ou expirou, fazendo logout');
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('user');
          await AsyncStorage.removeItem('company');
          await AsyncStorage.removeItem('accessKey');
          setToken(null);
          setUser(null);
          setCompany(null);
          setAccessKey(null);
        }
      }
    } catch (e) {
      console.error('Erro ao restaurar token:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (nickname, password, accessKeyCode) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('[AuthContext.login] Iniciando login com:', { nickname, accessKeyCode });
      const response = await authService.login(nickname, password, accessKeyCode);
      console.log('[AuthContext.login] Resposta recebida:', JSON.stringify(response, null, 2));
      
      // Compatível com backend: response.data.token, response.data.user, response.data.company, response.data.accessKey
      const token = response?.data?.token || response?.token;
      const user = response?.data?.user || response?.user;
      const company = response?.data?.company || response?.company;
      const accessKeyData = response?.data?.accessKey;

      console.log('[AuthContext.login] Token extraído:', !!token, 'User:', user?.nickname, 'AccessKey:', accessKeyData?.clientName);

      if (!token) {
        throw new Error('Token não fornecido na resposta do servidor');
      }

      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      if (accessKeyData) {
        await AsyncStorage.setItem('accessKey', JSON.stringify(accessKeyData));
        setAccessKey(accessKeyData);
        console.log('[AuthContext.login] AccessKey salvo:', accessKeyData.clientName);
      }
      
      if (company) {
        await AsyncStorage.setItem('company', JSON.stringify(company));
      }

      setToken(token);
      setUser(user);
      setCompany(company);

      // Após login, recarregar configs de pagamento do AsyncStorage
      if (payment && payment.reloadPaymentSettings) {
        await payment.reloadPaymentSettings();
      }

      console.log('[AuthContext.login] Login bem-sucedido!');
      return { token, user, company, accessKey: accessKeyData };
    } catch (err) {
      console.log('[AuthContext.login] Erro capturado:', err.message, err.response?.data);
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao fazer login';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('company');
      await AsyncStorage.removeItem('accessKey');

      setToken(null);
      setUser(null);
      setCompany(null);
      setAccessKey(null);
      // Redireciona para tela de login se possível
      if (navigationRef.isReady()) {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    company,
    accessKey,
    token,
    isLoading,
    error,
    login,
    logout,
    isSignedIn: !!token,
    setTokenAndUser, // expõe função para atualização externa
    forceInvalidToken, // expõe função de teste
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

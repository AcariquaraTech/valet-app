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
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Permite atualização do token/usuário a partir de fora (ex: interceptor)
  const setTokenAndUser = async (newToken, newUser, newCompany) => {
    setToken(newToken);
    setUser(newUser);
    setCompany(newCompany);
    if (newToken) await AsyncStorage.setItem('authToken', newToken);
    if (newUser) await AsyncStorage.setItem('user', JSON.stringify(newUser));
    if (newCompany) await AsyncStorage.setItem('company', JSON.stringify(newCompany));
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

      if (savedToken && savedUser && savedCompany) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setCompany(JSON.parse(savedCompany));
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

      const response = await authService.login(nickname, password, accessKeyCode);
      // Compatível com backend: response.data.token, response.data.user, response.data.company
      const token = response?.data?.token || response?.token;
      const user = response?.data?.user || response?.user;
      const company = response?.data?.company || response?.company;

      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('company', JSON.stringify(company));

      setToken(token);
      setUser(user);
      setCompany(company);

      // Após login, recarregar configs de pagamento do AsyncStorage
      if (payment && payment.reloadPaymentSettings) {
        await payment.reloadPaymentSettings();
      }

      return { token, user, company };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro ao fazer login';
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

      setToken(null);
      setUser(null);
      setCompany(null);
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

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services';

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

  const login = async (email, password, accessKeyCode) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login(email, password, accessKeyCode);

      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      await AsyncStorage.setItem('company', JSON.stringify(response.company));

      setToken(response.token);
      setUser(response.user);
      setCompany(response.company);

      return response;
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

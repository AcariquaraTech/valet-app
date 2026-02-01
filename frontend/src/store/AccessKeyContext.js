import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../services';

const AccessKeyContext = createContext();

export const useAccessKey = () => {
  const context = useContext(AccessKeyContext);
  if (!context) {
    throw new Error('useAccessKey deve ser usado dentro de AccessKeyProvider');
  }
  return context;
};

export const AccessKeyProvider = ({ children }) => {
  const [accessKey, setAccessKey] = useState(null);
  const [isValidated, setIsValidated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(null);

  // Carregar chave salva ao iniciar
  useEffect(() => {
    loadStoredAccessKey();
  }, []);

  const loadStoredAccessKey = async () => {
    try {
      setLoading(true);
      const storedKey = await AsyncStorage.getItem('accessKey');
      const storedData = await AsyncStorage.getItem('accessKeyData');

      if (storedKey && storedData) {
        setAccessKey(storedKey);
        const data = JSON.parse(storedData);
        setDaysRemaining(data.daysRemaining);
        
        // Validar a chave a cada 7 dias
        const lastValidation = await AsyncStorage.getItem('accessKeyLastValidation');
        const now = Date.now();
        const lastValidationTime = lastValidation ? parseInt(lastValidation) : 0;
        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

        if (now - lastValidationTime > sevenDaysInMs) {
          await validateAccessKeyWithServer(storedKey);
        } else {
          setIsValidated(true);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar chave armazenada:', err);
      setError('Erro ao carregar configurações');
      setLoading(false);
    }
  };

  const validateAccessKeyWithServer = async (key) => {
    try {
      const response = await apiClient.post('/access-keys/validate', {
        code: key,
        deviceId: 'mobile-device',
        appVersion: '1.0.0',
        osVersion: 'android',
      });

      if (response.data.success) {
        // Atualizar data de validação
        await AsyncStorage.setItem(
          'accessKeyLastValidation',
          Date.now().toString()
        );
        await AsyncStorage.setItem(
          'accessKeyData',
          JSON.stringify(response.data.data)
        );
        setDaysRemaining(response.data.data.daysRemaining);
        setIsValidated(true);
        setError(null);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro ao validar chave';
      setError(errorMessage);
      setIsValidated(false);
      
      // Se acesso expirou ou foi revogado, limpar dados
      if (
        err.response?.data?.code === 'ACCESS_EXPIRED' ||
        err.response?.data?.code === 'ACCESS_REVOKED'
      ) {
        await clearAccessKey();
      }
    }
  };

  const validateNewAccessKey = async (key) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/access-keys/validate', {
        code: key,
        deviceId: 'mobile-device',
        appVersion: '1.0.0',
        osVersion: 'android',
      });

      if (response.data.success) {
        // Salvar chave localmente
        await AsyncStorage.setItem('accessKey', key);
        await AsyncStorage.setItem(
          'accessKeyData',
          JSON.stringify(response.data.data)
        );
        await AsyncStorage.setItem(
          'accessKeyLastValidation',
          Date.now().toString()
        );

        setAccessKey(key);
        setDaysRemaining(response.data.data.daysRemaining);
        setIsValidated(true);
        setLoading(false);

        return {
          success: true,
          message: 'Chave validada com sucesso!',
          data: response.data.data,
        };
      }
    } catch (err) {
      console.log('[validateNewAccessKey] Erro completo:', err);
      console.log('[validateNewAccessKey] Response data:', err.response?.data);
      
      const errorCode = err.response?.data?.code;
      let errorMessage = err.response?.data?.error || 'Erro ao validar chave';

      if (errorCode === 'INVALID_KEY') {
        errorMessage = 'Chave inválida. Verifique e tente novamente.';
      } else if (errorCode === 'ACCESS_EXPIRED') {
        errorMessage = 'Acesso expirado. Renove sua mensalidade.';
      } else if (errorCode === 'ACCESS_REVOKED') {
        errorMessage =
          'Acesso revogado: ' +
          (err.response?.data?.reason || 'Sem motivo especificado');
      }

      setError(errorMessage);
      setIsValidated(false);
      setLoading(false);

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const clearAccessKey = async () => {
    try {
      await AsyncStorage.removeItem('accessKey');
      await AsyncStorage.removeItem('accessKeyData');
      await AsyncStorage.removeItem('accessKeyLastValidation');
      setAccessKey(null);
      setIsValidated(false);
      setDaysRemaining(null);
    } catch (err) {
      console.error('Erro ao limpar chave:', err);
    }
  };

  const value = {
    accessKey,
    isValidated,
    loading,
    error,
    daysRemaining,
    validateNewAccessKey,
    clearAccessKey,
    revalidateAccessKey: () =>
      accessKey ? validateAccessKeyWithServer(accessKey) : null,
  };

  return (
    <AccessKeyContext.Provider value={value}>
      {children}
    </AccessKeyContext.Provider>
  );
};

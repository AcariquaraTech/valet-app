import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AccessKeyContext = createContext();

// URL do backend em produção - Railway (HTTPS - Railway força HTTPS)
const RAILWAY_URL = 'https://valet-app-production.up.railway.app/api';

const accessKeyClient = axios.create({
  baseURL: RAILWAY_URL,
  timeout: 30000,
});

console.log('[AccessKeyContext] Inicializado com URL:', RAILWAY_URL);

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
      const storedKey = await AsyncStorage.getItem('accessKeyCode');
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
      const response = await accessKeyClient.post('access-keys/validate', {
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
      console.log('[AccessKeyContext] Validando nova chave:', key);
      
      setLoading(true);
      setError(null);

      const response = await accessKeyClient.post('access-keys/validate', {
        code: key,
        deviceId: 'mobile-device',
        appVersion: '1.0.0',
        osVersion: 'android',
      });

      console.log('[AccessKeyContext] Resposta de validação:', response.data);

      if (response.data.success) {
        console.log('[AccessKeyContext] Chave válida! Salvando em AsyncStorage...');
        
        // GARANTIR que TUDO é salvo ANTES de atualizar estado
        await Promise.all([
          AsyncStorage.setItem('accessKeyCode', key),
          AsyncStorage.setItem(
            'accessKeyData',
            JSON.stringify(response.data.data)
          ),
          AsyncStorage.setItem(
            'accessKeyLastValidation',
            Date.now().toString()
          ),
        ]);

        console.log('[AccessKeyContext] AsyncStorage atualizado com sucesso!');

        // SÓ AGORA atualizar o estado React
        setAccessKey(key);
        setDaysRemaining(response.data.data.daysRemaining);
        setIsValidated(true);
        setLoading(false);

        console.log('[AccessKeyContext] Estado React atualizado');

        return {
          success: true,
          message: 'Chave validada com sucesso!',
          data: response.data.data,
        };
      }
    } catch (err) {
      console.error('[AccessKeyContext] Erro de validação:', {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        data: err.response?.data,
      });
      
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
      } else if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        errorMessage = 'Não conseguiu conectar ao servidor. Verifique sua conexão de internet.';
      } else if (err.code === 'ENOTFOUND' || err.response?.status === 404) {
        errorMessage = 'Servidor não encontrado. Há problema com a conexão.';
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
      await AsyncStorage.removeItem('accessKeyCode');
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

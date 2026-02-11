import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Permite setar função global de logout (será setada pelo App.js)
let globalLogout = null;
export const setGlobalLogout = (fn) => { globalLogout = fn; };

// URL do backend - Produção Railway (HTTPS - Railway força HTTPS mesmo em desenvolvimento)
const RAILWAY_URL = 'https://valet-app-production.up.railway.app/api';
const API_URL = RAILWAY_URL;

console.log('[apiClient] ✓ Iniciando com URL:', API_URL, 'Platform:', Platform.OS);

const axiosConfig = {
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': `AppValet/${Platform.OS}`,
  },
};

console.log('[apiClient] Config criada:', { baseURL: axiosConfig.baseURL, timeout: axiosConfig.timeout, platform: Platform.OS });

const apiClient = axios.create(axiosConfig);

// Interceptor para adicionar token
apiClient.interceptors.request.use(
  async (config) => {
    let token = await AsyncStorage.getItem('authToken');
    // Validação extra: token deve ser string simples
    if (token && typeof token !== 'string') {
      console.warn('[apiClient] Token não é string, limpando:', token);
      await AsyncStorage.removeItem('authToken');
      token = null;
    }
    // Se token for string '[object Object]', também limpa
    if (token && (token === '[object Object]' || token.startsWith('{'))) {
      console.warn('[apiClient] Token malformado detectado, limpando:', token);
      await AsyncStorage.removeItem('authToken');
      token = null;
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Interceptor para tratar erros e renovar token automaticamente
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    console.log('[apiClient] ✓ Sucesso:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.log('[apiClient] ✗ Erro completo:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
    });
    const originalRequest = error.config;
    // Se erro 401 OU resposta com código INVALID_TOKEN, força logout global
    const isInvalidToken = error.response?.status === 401 || error.response?.data?.code === 'INVALID_TOKEN';
    if (isInvalidToken && !originalRequest._retry) {
      originalRequest._retry = true;
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({resolve, reject});
        })
        .then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        })
        .catch(err => Promise.reject(err));
      }
      isRefreshing = true;
      try {
        const oldToken = await AsyncStorage.getItem('authToken');
        const response = await import('./index').then(m => m.authService.refreshToken(oldToken));
        const newToken = response.token || response.data?.token;
        const newUser = response.user || response.data?.user;
        const newCompany = response.company || response.data?.company;
        if (newToken) {
          await AsyncStorage.setItem('authToken', newToken);
          apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
          // Atualiza contexto global se possível
          if (setTokenAndUserGlobal) {
            setTokenAndUserGlobal(newToken, newUser, newCompany);
          }
          processQueue(null, newToken);
          originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
          return apiClient(originalRequest);
        } else {
          await AsyncStorage.removeItem('authToken');
          processQueue(new Error('Falha ao renovar token'), null);
        }
      } catch (err) {
        await AsyncStorage.removeItem('authToken');
        processQueue(err, null);
        // Se houver função global de logout, chama para forçar logout e redirecionar
        if (globalLogout) {
          globalLogout();
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

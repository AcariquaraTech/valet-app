import axios from 'axios';

// URL do backend - Railway em produção
const API_BASE_URL = 'https://valet-app-production.up.railway.app/api/admin';
const CORE_API_URL = 'https://valet-app-production.up.railway.app/api';

// Recuperar token do localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return {
    Authorization: `Bearer ${token}`,
  };
};

// ========== CLIENTS ==========
export const clientService = {
  // Listar todos os clientes
  listClients: async () => {
    const response = await axios.get(`${API_BASE_URL}/clients`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Obter cliente por ID
  getClientById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/clients/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Criar novo cliente
  createClient: async (clientData) => {
    const response = await axios.post(`${API_BASE_URL}/clients`, clientData, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Atualizar cliente
  updateClient: async (id, clientData) => {
    const response = await axios.put(`${API_BASE_URL}/clients/${id}`, clientData, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Deletar cliente
  deleteClient: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/clients/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Obter estatísticas do cliente
  getClientStats: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/clients/${id}/stats`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};

// ========== ACCESS KEYS ==========
export const accessKeyService = {
  // Listar todas as chaves
  listAccessKeys: async () => {
    const response = await axios.get(`${API_BASE_URL}/access-keys`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Obter chave por ID
  getAccessKeyById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/access-keys/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Criar nova chave
  createAccessKey: async (keyData) => {
    const response = await axios.post(`${API_BASE_URL}/access-keys`, keyData, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Atualizar chave
  updateAccessKey: async (id, keyData) => {
    const response = await axios.put(`${API_BASE_URL}/access-keys/${id}`, keyData, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Deletar chave
  deleteAccessKey: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/access-keys/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Vincular usuário à chave
  bindUserToKey: async (keyId, userId) => {
    const response = await axios.post(
      `${API_BASE_URL}/access-keys/${keyId}/bind-user/${userId}`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Desvincular usuário da chave
  unbindUserFromKey: async (keyId, userId) => {
    const response = await axios.delete(
      `${API_BASE_URL}/access-keys/${keyId}/unbind-user/${userId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Obter usuários da chave
  getKeyUsers: async (keyId) => {
    const response = await axios.get(`${API_BASE_URL}/access-keys/${keyId}/users`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Obter usuários disponíveis para vincular (livres + mesmo cliente)
  getAvailableUsers: async (keyId) => {
    const response = await axios.get(`${API_BASE_URL}/access-keys/${keyId}/available-users`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Ativar chave
  activateKey: async (id) => {
    const response = await axios.patch(
      `${API_BASE_URL}/access-keys/${id}/activate`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Desativar chave
  deactivateKey: async (id) => {
    const response = await axios.patch(
      `${API_BASE_URL}/access-keys/${id}/deactivate`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Renovar chave
  renewKey: async (id, months = 12) => {
    const response = await axios.patch(
      `${API_BASE_URL}/access-keys/${id}/renew`,
      { months },
      { headers: getAuthHeader() }
    );
    return response.data;
  },
};

// ========== USERS ==========
export const userService = {
  listUsers: async () => {
    const response = await axios.get(`${CORE_API_URL}/users`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  createUser: async (userData) => {
    const response = await axios.post(`${CORE_API_URL}/users`, userData, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await axios.put(`${CORE_API_URL}/users/${userId}`, userData, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await axios.delete(`${CORE_API_URL}/users/${userId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};

// ========== REPORTS ==========
export const reportService = {
  // Relatório de movimento diário
  getDailyMovement: async (date) => {
    const response = await axios.get(`${CORE_API_URL}/reports/daily-movement`, {
      params: { date },
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Relatório de movimento por período
  getMovementByPeriod: async (startDate, endDate) => {
    const response = await axios.get(`${CORE_API_URL}/reports/daily-movement`, {
      params: { start_date: startDate, end_date: endDate },
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Relatório de picos de horário
  getPeakHours: async (startDate, endDate, groupBy = 'hour') => {
    const response = await axios.get(`${CORE_API_URL}/reports/peak-hours`, {
      params: { start_date: startDate, end_date: endDate, group_by: groupBy },
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Relatório de veículos
  getVehicleReport: async (startDate, endDate) => {
    const response = await axios.get(`${CORE_API_URL}/reports/vehicles`, {
      params: { start_date: startDate, end_date: endDate },
      headers: getAuthHeader(),
    });
    return response.data;
  },
};

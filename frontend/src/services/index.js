import apiClient from './apiClient';

// Exportar apiClient para uso direto em outros lugares
export { apiClient };

export const authService = {
  login: async (nickname, password, accessKeyCode) => {
    // Garante que está enviando nickname e não email
    const response = await apiClient.post('auth/login', {
      nickname,
      password,
      accessKeyCode,
    });
    console.log('[authService.login] Response completo:', JSON.stringify(response.data, null, 2));
    return response.data;
  },

  refreshToken: async (token) => {
    // Envia o token no header Authorization, igual às outras rotas
    const response = await apiClient.post('auth/refresh', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('auth/logout');
    return response.data;
  },

  validateToken: async (token) => {
    // Valida o token fazendo uma requisição simples ao backend
    const response = await apiClient.get('users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export const vehicleService = {
  registerEntry: async (plate, vehicleType, color, clientName, clientPhone, notes) => {
    const response = await apiClient.post('vehicles/entry', {
      plate,
      vehicle_type: vehicleType,
      color,
      client_name: clientName,
      client_phone: clientPhone,
      notes,
    });
    return response.data;
  },

  registerExit: async (entryId, notes = '', totalPrice = undefined) => {
    const response = await apiClient.post('vehicles/exit', { entryId, notes, totalPrice });
    return response.data;
  },

  getParkedVehicles: async (page = 1, limit = 20, search = '') => {
    const response = await apiClient.get('vehicles/parked', {
      params: { page, limit, search },
    });
    return response.data;
  },

  searchVehicle: async (plate) => {
    const response = await apiClient.get(`vehicles/search/${plate}`);
    return response.data;
  },

  getVehicleDetails: async (vehicleId) => {
    const response = await apiClient.get(`vehicles/${vehicleId}`);
    return response.data;
  },
};

export const reportService = {
  getDailyMovement: async (options = {}) => {
    const params = typeof options === 'string'
      ? { date: options }
      : {
          date: options.date,
          start_date: options.startDate,
          end_date: options.endDate,
        };
    const response = await apiClient.get('reports/daily-movement', { params });
    return response.data;
  },

  getPeakHours: async (options = 7) => {
    const params = typeof options === 'number'
      ? { days: options }
      : {
          start_date: options.startDate,
          end_date: options.endDate,
          group_by: options.groupBy,
        };
    const response = await apiClient.get('reports/peak-hours', { params });
    return response.data;
  },

  getVehiclesReport: async (startDate, endDate) => {
    const response = await apiClient.get('reports/vehicles', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },
};

export const ocrService = {
  recognizePlate: async (imageBase64) => {
    const response = await apiClient.post('ocr/recognize-plate', {
      image_base64: imageBase64,
    });
    return response.data;
  },

  quickEntry: async (plate, imageBase64, clientName, clientPhone) => {
    const response = await apiClient.post('ocr/quick-entry', {
      plate,
      image_base64: imageBase64,
      client_name: clientName,
      client_phone: clientPhone,
    });
    return response.data;
  },
};

export const smsService = {
  getLogs: async (page = 1, limit = 20, status = null) => {
    const response = await apiClient.get('sms/logs', {
      params: { page, limit, status },
    });
    return response.data;
  },

  resendSMS: async (smsId) => {
    const response = await apiClient.post(`sms/resend/${smsId}`);
    return response.data;
  },
};

export const userService = {
  listUsers: async (page = 1, limit = 20) => {
    const response = await apiClient.get('users', {
      params: { page, limit },
    });
    return response.data;
  },

  createUser: async (name, nickname, password, role, accessKeyId) => {
    const response = await apiClient.post('users', {
      name,
      nickname,
      password,
      role,
      access_key_id: accessKeyId,
    });
    return response.data;
  },

  updateUser: async (userId, name, role, status) => {
    const response = await apiClient.put(`users/${userId}`, {
      name,
      role,
      status,
    });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await apiClient.delete(`users/${userId}`);
    return response.data;
  },
};

export const accessKeyService = {
  listKeys: async () => {
    const response = await apiClient.get('access-keys');
    return response.data;
  },

  createKey: async (keyName) => {
    const response = await apiClient.post('access-keys', {
      key_name: keyName,
    });
    return response.data;
  },

  updateKeyStatus: async (keyId, status) => {
    const response = await apiClient.put(`access-keys/${keyId}`, { status });
    return response.data;
  },
};

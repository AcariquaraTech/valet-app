import apiClient from './apiClient';

const userService = {
  // Listar usuários da mesma chave de acesso (minha equipe)
  async listMyTeam() {
    const response = await apiClient.get('users/my-team');
    return response.data;
  },

  // Criar novo usuário
  async createUser(userData) {
    const response = await apiClient.post('users', userData);
    return response.data;
  },

  // Atualizar usuário
  async updateUser(userId, userData) {
    const response = await apiClient.put(`users/${userId}`, userData);
    return response.data;
  },

  // Deletar usuário
  async deleteUser(userId) {
    const response = await apiClient.delete(`users/${userId}`);
    return response.data;
  },
};

export default userService;

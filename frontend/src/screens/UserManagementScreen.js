import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../store/AuthContext';
import userService from '../services/userService';

export default function UserManagementScreen({ navigation }) {
  const { accessKey, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    password: '',
    role: 'operator',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.listMyTeam();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      const apiError = error.response?.data?.error || error.response?.data?.message;
      const apiCode = error.response?.data?.code;
      const detail = apiError ? `${apiError}${apiCode ? ` (${apiCode})` : ''}` : 'Não foi possível carregar os usuários';
      Alert.alert('Erro', detail);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      nickname: '',
      password: '',
      role: 'operator',
    });
    setModalVisible(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      nickname: user.nickname,
      password: '', // Não mostra a senha atual
      role: user.role,
    });
    setModalVisible(true);
  };

  const handleSaveUser = async () => {
    if (!formData.name || !formData.nickname) {
      Alert.alert('Atenção', 'Nome e apelido são obrigatórios');
      return;
    }

    if (!editingUser && !formData.password) {
      Alert.alert('Atenção', 'Senha é obrigatória para novos usuários');
      return;
    }

    try {
      setLoading(true);
      
      if (editingUser) {
        // Editar usuário
        const updateData = {
          name: formData.name,
          role: formData.role,
        };
        
        // Só envia senha se foi preenchida
        if (formData.password) {
          updateData.password = formData.password;
        }

        await userService.updateUser(editingUser.id, updateData);
        Alert.alert('Sucesso', 'Usuário atualizado com sucesso');
      } else {
        // Criar novo usuário
        await userService.createUser({
          ...formData,
          accessKeyId: accessKey.id,
        });
        Alert.alert('Sucesso', 'Usuário criado com sucesso');
      }

      setModalVisible(false);
      loadUsers();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      const message = error.response?.data?.error || 'Erro ao salvar usuário';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (user) => {
    if (user.id === currentUser.id) {
      Alert.alert('Atenção', 'Você não pode deletar seu próprio usuário');
      return;
    }

    Alert.alert(
      'Confirmar exclusão',
      `Deseja realmente excluir o usuário "${user.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await userService.deleteUser(user.id);
              Alert.alert('Sucesso', 'Usuário excluído com sucesso');
              loadUsers();
            } catch (error) {
              console.error('Erro ao excluir usuário:', error);
              Alert.alert('Erro', 'Não foi possível excluir o usuário');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading && users.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando usuários...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>👥 Gerenciar Usuários</Text>
        <TouchableOpacity onPress={handleAddUser} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de usuários */}
      <ScrollView style={styles.content}>
        <Text style={styles.subtitle}>
          Total: {users.length} usuário{users.length !== 1 ? 's' : ''}
        </Text>

        {users.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userNickname}>@{user.nickname}</Text>
              <View style={styles.userMeta}>
                <Text style={[styles.roleBadge, user.role === 'admin' ? styles.roleAdmin : styles.roleOperator]}>
                  {user.role === 'admin' ? '👑 Admin' : '👤 Operador'}
                </Text>
                {user.id === currentUser.id && (
                  <Text style={styles.currentUserBadge}>• Você</Text>
                )}
              </View>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity
                onPress={() => handleEditUser(user)}
                style={[styles.actionButton, styles.editButton]}
              >
                <Text style={styles.actionButtonText}>✏️</Text>
              </TouchableOpacity>
              {user.id !== currentUser.id && (
                <TouchableOpacity
                  onPress={() => handleDeleteUser(user)}
                  style={[styles.actionButton, styles.deleteButton]}
                >
                  <Text style={styles.actionButtonText}>🗑️</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal de criação/edição */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingUser ? '✏️ Editar Usuário' : '➕ Novo Usuário'}
            </Text>

            <Text style={styles.label}>Nome completo *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Ex: João Silva"
            />

            <Text style={styles.label}>Apelido (Login) *</Text>
            <TextInput
              style={styles.input}
              value={formData.nickname}
              onChangeText={(text) => setFormData({ ...formData, nickname: text })}
              placeholder="Ex: joao"
              autoCapitalize="none"
              editable={!editingUser} // Não permite editar nickname
            />

            <Text style={styles.label}>
              Senha {editingUser ? '(deixe vazio para manter)' : '*'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              placeholder={editingUser ? 'Nova senha (opcional)' : 'Digite a senha'}
              secureTextEntry
            />

            <Text style={styles.label}>Tipo de usuário</Text>
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  formData.role === 'operator' && styles.roleOptionSelected,
                ]}
                onPress={() => setFormData({ ...formData, role: 'operator' })}
              >
                <Text style={[styles.roleOptionText, formData.role === 'operator' && styles.roleOptionTextSelected]}>
                  👤 Operador
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  formData.role === 'admin' && styles.roleOptionSelected,
                ]}
                onPress={() => setFormData({ ...formData, role: 'admin' })}
              >
                <Text style={[styles.roleOptionText, formData.role === 'admin' && styles.roleOptionTextSelected]}>
                  👑 Admin
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveUser}
              >
                <Text style={styles.saveButtonText}>
                  {editingUser ? 'Salvar' : 'Criar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingTop: 50,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userNickname: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roleBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  roleAdmin: {
    backgroundColor: '#FFD700',
    color: '#000',
  },
  roleOperator: {
    backgroundColor: '#E3F2FD',
    color: '#1976D2',
  },
  currentUserBadge: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  userActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  roleOption: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  roleOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  roleOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  roleOptionTextSelected: {
    color: '#007AFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 25,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

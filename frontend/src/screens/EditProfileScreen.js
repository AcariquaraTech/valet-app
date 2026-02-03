import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { Button, Card } from '../components/Common';
import { vehicleService } from '../services';

const ProfileScreen = ({ navigation }) => {
  const { user, accessKey, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accessKeys, setAccessKeys] = useState([]);

  useEffect(() => {
    loadAccessKeys();
  }, []);

  const loadAccessKeys = async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getAccessKeys();
      setAccessKeys(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar chaves de acesso:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!token || !user || !accessKey) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Seu Perfil</Text>
      </View>

      <View style={styles.content}>
        {/* Informações da Chave de Acesso (Dados do Cliente) */}
        <Card>
          <Text style={styles.sectionTitle}>👤 Dados do Cliente</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Nome do Cliente</Text>
            <Text style={styles.infoValue}>{accessKey.clientName || 'N/A'}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Empresa</Text>
            <Text style={styles.infoValue}>{accessKey.companyName || 'N/A'}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{accessKey.clientEmail || 'N/A'}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Telefone</Text>
            <Text style={styles.infoValue}>{accessKey.clientPhone || 'N/A'}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoValue, { color: accessKey.status === 'active' ? '#4CAF50' : '#F44336' }]}>
              {accessKey.status === 'active' ? '✅ Ativa' : '❌ Inativa'}
            </Text>
          </View>

          {accessKey.expiresAt && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Válida até</Text>
              <Text style={styles.infoValue}>
                {new Date(accessKey.expiresAt).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          )}
        </Card>

        {/* Informações do Usuário (Conta de Acesso) */}
        <Card>
          <Text style={styles.sectionTitle}>🔑 Conta de Acesso</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Apelido (Nickname)</Text>
            <Text style={styles.infoValue}>{user.nickname || 'N/A'}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Tipo de Usuário</Text>
            <Text style={styles.infoValue}>
              {user.role === 'admin' ? '👨‍💼 Administrador' : '👨‍🔧 Operador'}
            </Text>
          </View>
        </Card>

        {/* Chaves de Acesso Vinculadas */}
        {accessKeys.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>🔐 Chaves de Acesso Vinculadas</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              accessKeys.map((key) => (
                <View key={key.id} style={styles.keyItem}>
                  <View style={styles.keyContent}>
                    <Text style={styles.keyName}>{key.code}</Text>
                    <Text style={styles.keyDetail}>
                      Cliente: {key.clientName}
                    </Text>
                    <Text style={styles.keyDetail}>
                      Empresa: {key.companyName}
                    </Text>
                    <Text style={styles.keyDate}>
                      Criada em: {new Date(key.createdAt).toLocaleDateString('pt-BR')}
                    </Text>
                    <Text style={[styles.keyStatus, { color: key.status === 'active' ? '#4CAF50' : '#F44336' }]}>
                      {key.status === 'active' ? '✅ Ativa' : '❌ Inativa'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </Card>
        )}

        {/* Botão Voltar */}
        <Card>
          <Button
            title="← Voltar"
            onPress={() => navigation.goBack()}
            variant="secondary"
          />
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#007AFF',
  },
  infoBox: {
    marginVertical: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
  },
  keyItem: {
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    padding: 12,
    marginVertical: 8,
    borderRadius: 6,
  },
  keyContent: {
    flex: 1,
  },
  keyName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  keyDetail: {
    fontSize: 13,
    color: '#555',
    marginBottom: 3,
  },
  keyDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  keyStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ProfileScreen;

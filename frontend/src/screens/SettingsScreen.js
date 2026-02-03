import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { usePayment } from '../store/PaymentContext';
import { Button, Card } from '../components/Common';

const SettingsScreen = ({ navigation }) => {
  const { user, accessKey, company, logout } = useAuth();
  const { mode, hourValue, dayValue, saveSettings, loading: paymentLoading, saving: paymentSaving, reloadPaymentSettings } = usePayment();
  
  const [editMode, setEditMode] = useState(false);
  const [localMode, setLocalMode] = useState(mode);
  const [localHour, setLocalHour] = useState(hourValue);
  const [localDay, setLocalDay] = useState(dayValue);

  useEffect(() => {
    setLocalMode(mode);
    setLocalHour(hourValue);
    setLocalDay(dayValue);
  }, [mode, hourValue, dayValue]);

  const { user: authUser, token } = useAuth();

  if (!token || !authUser) {
    return null;
  }

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da aplicação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Erro', 'Erro ao fazer logout');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚙️ Configurações</Text>
      </View>

      <View style={styles.content}>
        {/* Informações do Usuário */}
        <Card>
          <Text style={styles.sectionTitle}>👤 Seu Perfil</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Nome do Cliente</Text>
            <Text style={styles.infoValue}>{accessKey?.clientName || user?.name || 'N/A'}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Empresa</Text>
            <Text style={styles.infoValue}>{accessKey?.companyName || company?.company_name || 'N/A'}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Apelido (Usuário)</Text>
            <Text style={styles.infoValue}>{user?.nickname}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Tipo de Usuário</Text>
            <Text style={[styles.infoValue, { textTransform: 'capitalize' }]}>{user?.role === 'admin' ? 'Administrador' : 'Operador'}</Text>
          </View>
          <Button
            title="✏️ Ver Perfil Completo"
            onPress={() => navigation.navigate('EditProfileScreen')}
            variant="secondary"
          />
        </Card>

        {/* Configuração de Pagamento */}
        <Card>
          <Text style={styles.sectionTitle}>💳 Modo de Pagamento</Text>
          {paymentLoading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : editMode ? (
            <>
              <Text style={styles.label}>Selecione o Modo</Text>
              <View style={{ flexDirection: 'row', marginBottom: 10, gap: 8 }}>
                <TouchableOpacity
                  style={[styles.modeButton, localMode === 'pago' && styles.modeButtonActive]}
                  onPress={() => setLocalMode('pago')}
                >
                  <Text style={[styles.modeButtonText, localMode === 'pago' && styles.modeButtonTextActive]}>💳 Pago</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeButton, localMode === 'gratuito' && styles.modeButtonActive]}
                  onPress={() => setLocalMode('gratuito')}
                >
                  <Text style={[styles.modeButtonText, localMode === 'gratuito' && styles.modeButtonTextActive]}>🆓 Gratuito</Text>
                </TouchableOpacity>
              </View>
              {localMode === 'pago' && (
                <>
                  <Text style={styles.label}>Valor por Hora (R$)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    value={localHour}
                    onChangeText={setLocalHour}
                    placeholder="Ex: 10.00"
                  />
                  <Text style={styles.label}>Valor por Dia (R$)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    value={localDay}
                    onChangeText={setLocalDay}
                    placeholder="Ex: 50.00"
                  />
                </>
              )}
              <View style={{ marginTop: 15, gap: 8 }}>
                <Button
                  title={paymentSaving ? "Salvando..." : "Salvar Alterações"}
                  onPress={async () => {
                    await saveSettings(localMode, localHour, localDay);
                    setEditMode(false);
                  }}
                  loading={paymentSaving}
                  disabled={paymentSaving}
                />
                <Button
                  title="Cancelar"
                  onPress={() => {
                    setLocalMode(mode);
                    setLocalHour(hourValue);
                    setLocalDay(dayValue);
                    setEditMode(false);
                  }}
                  variant="secondary"
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Modo Atual</Text>
                <Text style={styles.infoValue}>
                  {mode === 'pago'
                    ? `💳 PAGO (R$ ${hourValue}/hora, R$ ${dayValue}/dia)`
                    : '🆓 GRATUITO'}
                </Text>
              </View>
              <Button
                title="✏️ Editar Configurações"
                onPress={() => setEditMode(true)}
                variant="secondary"
              />
            </>
          )}
        </Card>

        {/* Gerenciamento de Usuários (apenas admin) */}
        {user?.role === 'admin' && (
          <Card>
            <Text style={styles.sectionTitle}>👥 Gerenciamento</Text>
            <Button
              title="👥 Gerenciar Usuários"
              onPress={() => navigation.navigate('UsersScreen')}
            />
          </Card>
        )}

        {/* Relatórios (apenas admin) */}
        {user?.role === 'admin' && (
          <Card>
            <Text style={styles.sectionTitle}>📊 Análises</Text>
            <Button
              title="📊 Visualizar Relatórios"
              onPress={() => navigation.navigate('ReportsScreen')}
            />
          </Card>
        )}

        {/* Reconhecer Placa */}
        <Card>
          <Text style={styles.sectionTitle}>📷 Ferramentas</Text>
          <Button
            title="📷 Reconhecer Placa por Camera"
            onPress={() => navigation.navigate('CameraScreen')}
          />
        </Card>

        {/* Logout */}
        <Card>
          <Button
            title="🚪 Sair da Conta"
            onPress={handleLogout}
            variant="destructive"
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  infoBox: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 10,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  modeButton: {
    flex: 1,
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  modeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  modeButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  modeButtonTextActive: {
    color: '#fff',
  },
});

export default SettingsScreen;

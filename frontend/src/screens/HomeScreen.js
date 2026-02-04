
import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, Alert, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, AppState, Modal } from 'react-native';
import { useAuth } from '../store/AuthContext';
import apiClient from '../services/apiClient';
import { usePayment } from '../store/PaymentContext';
import { vehicleService } from '../services';
import { openSmsApp } from '../services/smsHelper';
import { Button, Card } from '../components/Common';

const HomeScreen = ({ navigation }) => {
  const [plate, setPlate] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [parkedVehicles, setParkedVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { user, company, forceInvalidToken, token } = useAuth();
  const { mode, hourValue, dayValue, saveSettings, loading: paymentLoading, saving: paymentSaving, reloadPaymentSettings } = usePayment();
  const [editMode, setEditMode] = useState(false);
  const [localMode, setLocalMode] = useState(mode);
  const [localHour, setLocalHour] = useState(hourValue);
  const [localDay, setLocalDay] = useState(dayValue);

  // Forçar recarregamento ao voltar do background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && reloadPaymentSettings) reloadPaymentSettings();
    });
    return () => subscription.remove();
  }, [reloadPaymentSettings]);

  // Se perder o token (logout global), redireciona para LoginScreen
  useEffect(() => {
    if (!token) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [token, navigation]);

  useEffect(() => {
    setLocalMode(mode);
    setLocalHour(hourValue);
    setLocalDay(dayValue);
  }, [mode, hourValue, dayValue]);

  // Sempre que a HomeScreen ganhar foco, recarrega configs do AsyncStorage
  useFocusEffect(
    React.useCallback(() => {
      if (reloadPaymentSettings) reloadPaymentSettings();
    }, [reloadPaymentSettings])
  );

  useEffect(() => {
    if (token && user) {
      loadParkedVehicles();
    }
  }, [token, user]);

  // Função para testar rejeição automática de token inválido
  const testInvalidToken = async () => {
    await forceInvalidToken();
    try {
      // Tenta acessar um endpoint protegido (ex: /users/me)
      await apiClient.get('/users/me');
      Alert.alert('Falha', 'Token inválido NÃO foi rejeitado!');
    } catch (err) {
      Alert.alert('Sucesso', 'Token inválido rejeitado e usuário deslogado!');
    }
  };

  // Não renderiza nada se não estiver autenticado (evita mostrar erro após logout)
  if (!token || !user) {
    return null;
  }

  const loadParkedVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getParkedVehicles();
      console.log('[HomeScreen] Dados dos veículos:', JSON.stringify(data, null, 2));
      // Backend retorna array direto em 'data'
      const vehicles = Array.isArray(data.data) ? data.data : [];
      console.log('[HomeScreen] Veículos processados:', vehicles.length, vehicles);
      setParkedVehicles(vehicles);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      Alert.alert('Erro', 'Erro ao carregar veículos');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterEntry = async () => {
    if (!plate) {
      Alert.alert('Erro', 'Informe a placa do veículo');
      return;
    }

    try {
      setLoading(true);
      await vehicleService.registerEntry(
        plate.toUpperCase(),
        '',
        '',
        clientName,
        clientPhone,
        ''
      );
      // Envio automático de SMS na entrada
      if (clientPhone) {
        const message = `Seu veículo placa ${plate.toUpperCase()} entrou no estacionamento às ${new Date().toLocaleTimeString('pt-BR')}`;
        console.log('Chamando openSmsApp para entrada:', clientPhone, message);
        openSmsApp(clientPhone, message);
      }
      Alert.alert('Sucesso', 'Entrada registrada com sucesso');
      setPlate('');
      setClientName('');
      setClientPhone('');
      loadParkedVehicles();
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao registrar entrada');
      setPlate('');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterExit = async (entryId) => {
    try {
      setLoading(true);
      // Buscar dados da entrada para pegar telefone e placa
      const details = await vehicleService.getVehicleDetails(entryId);
      const entry = details?.entry || details?.data?.entry;
      const plate = entry?.vehicle?.plate;
      const clientPhone = entry?.vehicle?.clientPhone || entry?.vehicle?.client_phone;
      
      const totalPrice = mode === 'gratuito' ? 0 : undefined;
      await vehicleService.registerExit(entryId, '', totalPrice);
      
      // Envio automático de SMS na saída
      if (clientPhone) {
        const message = `Seu veículo placa ${plate} saiu do estacionamento às ${new Date().toLocaleTimeString('pt-BR')}`;
        console.log('Chamando openSmsApp para saída:', clientPhone, message);
        openSmsApp(clientPhone, message);
      }
      Alert.alert('Sucesso', 'Saída registrada com sucesso');
      loadParkedVehicles();
    } catch (error) {
      console.error('Erro ao registrar saída:', error);
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao registrar saída');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bem-vindo, {user?.name}</Text>
        <Text style={styles.company}>{company?.company_name}</Text>
      </View>

      <View style={styles.content}>
        {/* Configuração de Pagamento */}
        <Card>
          <Text style={styles.sectionTitle}>Modo de Pagamento</Text>
          {paymentLoading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : editMode ? (
            <>
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
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
                  />
                  <Text style={styles.label}>Valor por Dia (R$)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    value={localDay}
                    onChangeText={setLocalDay}
                  />
                </>
              )}
              <View style={{ marginTop: 15, gap: 8 }}>
                <Button
                  title={paymentSaving ? "Salvando..." : "Salvar"}
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
              <Text style={styles.infoText}>
                {mode === 'pago'
                  ? `💳 Modo PAGO (R$/hora: ${hourValue}, R$/dia: ${dayValue})`
                  : '🆓 Modo GRATUITO'}
              </Text>
              <Button
                title="Editar"
                onPress={() => setEditMode(true)}
                variant="secondary"
                style={{ marginTop: 10 }}
              />
            </>
          )}
        </Card>

        {/* Botão de teste de token inválido (apenas em dev) */}
        {__DEV__ && (
          <Card>
            <Button
              title="Testar token inválido"
              onPress={testInvalidToken}
              variant="secondary"
              style={{ marginTop: 10 }}
            />
          </Card>
        )}

        {/* Entrada de Veículo */}
        <Card>
          <Text style={styles.sectionTitle}>Entrada de Veículo</Text>
          <TextInput
            placeholder="Placa (ABC-1234)"
            value={plate}
            onChangeText={setPlate}
            autoCapitalize="upper"
            editable={!loading}
            style={styles.input}
          />
          <TextInput
            placeholder="Nome do Cliente (opcional)"
            value={clientName}
            onChangeText={setClientName}
            editable={!loading}
            style={styles.input}
          />
          <TextInput
            placeholder="Telefone (opcional)"
            value={clientPhone}
            onChangeText={setClientPhone}
            keyboardType="phone-pad"
            editable={!loading}
            style={styles.input}
          />
          <Button
            title="Registrar Entrada"
            onPress={handleRegisterEntry}
            loading={loading}
          />
        </Card>

        {/* Veículos Estacionados */}
        <Card>
          <Text style={styles.sectionTitle}>
            Veículos Estacionados ({parkedVehicles.length})
          </Text>
          {parkedVehicles.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum veículo estacionado</Text>
          ) : (
            <FlatList
              data={parkedVehicles}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const entryTime = new Date(item.entryTime || item.entry_time);
                const now = new Date();
                const durationMinutes = Math.floor((now - entryTime) / 60000);
                const durationHours = Math.floor(durationMinutes / 60);
                const durationDisplay = durationHours > 0 ? `${durationHours}h ${durationMinutes % 60}m` : `${durationMinutes}m`;
                return (
                <TouchableOpacity 
                  style={styles.vehicleItem}
                  onPress={() => {
                    setSelectedVehicle({ ...item, entryTime, durationMinutes, durationHours, durationDisplay });
                    setShowModal(true);
                  }}
                >
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehiclePlate}>{item.plate || item.vehicle?.plate || 'SEM PLACA'}</Text>
                    <Text style={styles.vehicleDetails}>
                      Entrada: {entryTime.toLocaleTimeString('pt-BR')}
                    </Text>
                    {(item.vehicle?.clientName || item.client_name || item.vehicle?.client?.name) && (
                      <Text style={styles.vehicleDetails}>Cliente: {item.vehicle?.clientName || item.client_name || item.vehicle?.client?.name}</Text>
                    )}
                    <Text style={styles.vehicleDetails}>
                      Tempo: {durationDisplay}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleRegisterExit(item.id)}
                    style={styles.exitButtonContainer}
                    disabled={loading}
                  >
                    <Text style={styles.exitButtonText}>Saída</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
              }}
            />
          )}
        </Card>

        {/* Botões Adicionais */}
        <Card>
          <Button
            title="📷 Reconhecer Placa"
            onPress={() => navigation.navigate('CameraScreen')}
          />
          {user?.role === 'admin' && (
            <Button
              title="📊 Relatórios"
              onPress={() => navigation.navigate('ReportsScreen')}
              variant="secondary"
            />
          )}
          {user?.role === 'admin' && (
            <Button
              title="👥 Gerenciar Usuários"
              onPress={() => navigation.navigate('UsersScreen')}
              variant="secondary"
            />
          )}
        </Card>
      </View>

      {/* Modal de Detalhes do Veículo */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            {selectedVehicle && (
              <>
                <Text style={styles.modalTitle}>Detalhes do Veículo</Text>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Placa</Text>
                  <Text style={styles.detailValue}>{selectedVehicle.plate || selectedVehicle.vehicle?.plate || 'SEM PLACA'}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Hora de Entrada</Text>
                  <Text style={styles.detailValue}>{selectedVehicle.entryTime.toLocaleTimeString('pt-BR')}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Tempo de Permanência</Text>
                  <Text style={styles.detailValueBig}>{selectedVehicle.durationDisplay}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Cliente</Text>
                  <Text style={styles.detailValue}>{selectedVehicle.vehicle?.clientName || selectedVehicle.client_name || selectedVehicle.vehicle?.client?.name || 'Sem informação'}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Telefone</Text>
                  <Text style={styles.detailValue}>{selectedVehicle.vehicle?.clientPhone || selectedVehicle.vehicle?.client_phone || selectedVehicle.vehicle?.client?.phone || 'Sem informação'}</Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                  <Button
                    title="Cancelar"
                    onPress={() => setShowModal(false)}
                    variant="secondary"
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Registrar Saída"
                    onPress={() => {
                      setShowModal(false);
                      handleRegisterExit(selectedVehicle.id);
                    }}
                    style={{ flex: 1 }}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    modeButton: {
      flex: 1,
      backgroundColor: '#eee',
      padding: 10,
      borderRadius: 8,
      marginRight: 8,
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
    },
    modeButtonTextActive: {
      color: '#fff',
    },
    infoText: {
      fontSize: 16,
      color: '#007AFF',
      marginBottom: 10,
      textAlign: 'center',
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: '#666',
      marginTop: 10,
    },
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
  company: {
    fontSize: 14,
    color: '#e0e0e0',
    marginTop: 4,
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  vehicleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
    paddingHorizontal: 12,
    minHeight: 80,
  },
  vehicleInfo: {
    flex: 1,
    marginRight: 10,
  },
  vehiclePlate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 6,
  },
  vehicleDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  exitButtonContainer: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  exitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    paddingBottom: 30,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
    marginBottom: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  detailValueBig: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

export default HomeScreen;

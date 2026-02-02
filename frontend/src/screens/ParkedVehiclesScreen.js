import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, Alert, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { vehicleService } from '../services';
import { openSmsApp } from '../services/smsHelper';
import { Button, Card } from '../components/Common';

const ParkedVehiclesScreen = ({ navigation }) => {
  const [parkedVehicles, setParkedVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { user, token } = useAuth();

  useFocusEffect(
    React.useCallback(() => {
      if (token && user) {
        loadParkedVehicles();
      }
    }, [token, user])
  );

  if (!token || !user) {
    return null;
  }

  const loadParkedVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getParkedVehicles();
      console.log('[ParkedVehiclesScreen] Dados dos veículos:', JSON.stringify(data, null, 2));
      const vehicles = Array.isArray(data.data) ? data.data : [];
      console.log('[ParkedVehiclesScreen] Veículos processados:', vehicles.length, vehicles);
      setParkedVehicles(vehicles);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      Alert.alert('Erro', 'Erro ao carregar veículos');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterExit = async (entryId) => {
    try {
      setLoading(true);
      const details = await vehicleService.getVehicleDetails(entryId);
      const entry = details?.entry || details?.data?.entry;
      const plate = entry?.vehicle?.plate;
      const clientPhone = entry?.vehicle?.client?.phone;
      
      await vehicleService.registerExit(entryId, '', undefined);
      
      if (clientPhone) {
        const message = `Seu veículo placa ${plate} saiu do estacionamento às ${new Date().toLocaleTimeString('pt-BR')}`;
        console.log('Chamando openSmsApp para saída:', clientPhone, message);
        openSmsApp(clientPhone, message);
      }
      Alert.alert('Sucesso', 'Saída registrada com sucesso');
      setShowModal(false);
      loadParkedVehicles();
    } catch (error) {
      console.error('Erro ao registrar saída:', error);
      Alert.alert('Erro', error.response?.data?.error || error.response?.data?.message || 'Erro ao registrar saída');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Veículos no Pátio</Text>
        <Text style={styles.subtitle}>{parkedVehicles.length} veículos estacionados</Text>
      </View>

      <View style={styles.content}>
        {loading && parkedVehicles.length === 0 ? (
          <Card>
            <ActivityIndicator size="large" color="#007AFF" />
          </Card>
        ) : parkedVehicles.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>Nenhum veículo estacionado</Text>
          </Card>
        ) : (
          <Card>
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
                      {(item.client_name || item.vehicle?.client?.name) && (
                        <Text style={styles.vehicleDetails}>Cliente: {item.client_name || item.vehicle?.client?.name}</Text>
                      )}
                      <Text style={styles.vehicleDetails}>
                        ⏱️ {durationDisplay}
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
          </Card>
        )}

        <Card>
          <Button
            title="🔄 Recarregar"
            onPress={loadParkedVehicles}
            variant="secondary"
          />
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
              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
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
                  <Text style={styles.detailValue}>{selectedVehicle.client_name || selectedVehicle.vehicle?.client?.name || 'Sem informação'}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Telefone</Text>
                  <Text style={styles.detailValue}>{selectedVehicle.vehicle?.client?.phone || 'Sem informação'}</Text>
                </View>

                <View style={{ marginTop: 20 }}>
                  <Button
                    title="Saída"
                    onPress={() => handleRegisterExit(selectedVehicle.id)}
                    style={{ width: '100%' }}
                    loading={loading}
                  />
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  subtitle: {
    fontSize: 14,
    color: '#e0e0e0',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
    fontSize: 16,
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
  modalScroll: {
    flexGrow: 0,
  },
  modalScrollContent: {
    paddingBottom: 10,
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

export default ParkedVehiclesScreen;

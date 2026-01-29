
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../store/AuthContext';
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


  const { user, company } = useAuth();
  const { mode, hourValue, dayValue, saveSettings, loading: paymentLoading } = usePayment();
  const [editMode, setEditMode] = useState(false);
  const [localMode, setLocalMode] = useState(mode);
  const [localHour, setLocalHour] = useState(hourValue);
  const [localDay, setLocalDay] = useState(dayValue);

  useEffect(() => {
    setLocalMode(mode);
    setLocalHour(hourValue);
    setLocalDay(dayValue);
  }, [mode, hourValue, dayValue]);

  useEffect(() => {
    loadParkedVehicles();
  }, []);

  const loadParkedVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getParkedVehicles();
      setParkedVehicles(data.data);
    } catch (error) {
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
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterExit = async (vehicleId) => {
    try {
      setLoading(true);
      // Buscar dados do veículo para pegar telefone e placa
      const details = await vehicleService.getVehicleDetails(vehicleId);
      const { plate, client_phone } = details.data || {};
      await vehicleService.registerExit(vehicleId);
      // Envio automático de SMS na saída
      if (client_phone) {
        const message = `Seu veículo placa ${plate} saiu do estacionamento às ${new Date().toLocaleTimeString('pt-BR')}`;
        console.log('Chamando openSmsApp para saída:', client_phone, message);
        openSmsApp(client_phone, message);
      }
      Alert.alert('Sucesso', 'Saída registrada com sucesso');
      loadParkedVehicles();
    } catch (error) {
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
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <Button
                  title="Salvar"
                  onPress={async () => {
                    await saveSettings(localMode, localHour, localDay);
                    setEditMode(false);
                  }}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="Cancelar"
                  onPress={() => {
                    setLocalMode(mode);
                    setLocalHour(hourValue);
                    setLocalDay(dayValue);
                    setEditMode(false);
                  }}
                  style={{ flex: 1 }}
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
                title="Alterar Configuração"
                onPress={() => setEditMode(true)}
                style={{ marginTop: 10 }}
                variant="secondary"
              />
            </>
          )}
        </Card>

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
              renderItem={({ item }) => (
                <View style={styles.vehicleItem}>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehiclePlate}>{item.plate}</Text>
                    <Text style={styles.vehicleDetails}>
                      Entrada: {new Date(item.entry_time).toLocaleTimeString()}
                    </Text>
                    {item.client_name && (
                      <Text style={styles.vehicleDetails}>Cliente: {item.client_name}</Text>
                    )}
                    <Text style={styles.vehicleDetails}>
                      Tempo: {item.duration_minutes}min
                    </Text>
                  </View>
                  <Button
                    title="Saída"
                    onPress={() => handleRegisterExit(item.id)}
                    loading={loading}
                    variant="primary"
                    style={styles.exitButton}
                  />
                </View>
              )}
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
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehiclePlate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  vehicleDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  exitButton: {
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
  },
});

export default HomeScreen;

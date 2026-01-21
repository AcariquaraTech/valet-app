import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { vehicleService } from '../services';
import { Button, Card } from '../components/Common';

const HomeScreen = ({ navigation }) => {
  const [plate, setPlate] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [parkedVehicles, setParkedVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, company } = useAuth();

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
      await vehicleService.registerExit(vehicleId);
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

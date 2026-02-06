import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, TextInput, ActivityIndicator } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { vehicleService } from '../services';
import { openSmsApp } from '../services/smsHelper';
import { Button, Card } from '../components/Common';

const EntryExitScreen = ({ navigation }) => {
  const [plate, setPlate] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, token } = useAuth();

  if (!token || !user) {
    return null;
  }

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
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || error.response?.data?.message || 'Erro ao registrar entrada');
      setPlate('');
      setClientName('');
      setClientPhone('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Entrada de Veículo</Text>
      </View>

      <View style={styles.content}>
        <Card>
          <Text style={styles.sectionTitle}>Registrar Entrada</Text>
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
            title="📸 Reconhecer Placa"
            onPress={() =>
              navigation.navigate('Camera', {
                onPlateDetected: (detectedPlate) => setPlate(detectedPlate),
              })
            }
            variant="secondary"
            style={{ marginBottom: 10 }}
          />
          <Button
            title="Registrar Entrada"
            onPress={handleRegisterEntry}
            loading={loading}
          />
        </Card>

        <Card>
          <Text style={styles.infoText}>
            💡 Dica: Deixe os campos de cliente e telefone em branco para entrada rápida.
          </Text>
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
  },
});

export default EntryExitScreen;

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Button, Alert } from 'react-native';
import { reportService } from '../services';

const ReportsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [daily, setDaily] = useState([]);
  const [peak, setPeak] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const dailyData = await reportService.getDailyMovement(today);
      const peakData = await reportService.getPeakHours(7);
      const vehiclesData = await reportService.getVehiclesReport(today, today);
      setDaily(dailyData);
      setPeak(peakData);
      setVehicles(vehiclesData);
    } catch (e) {
      setError('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Relatórios</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <Text style={styles.section}>Movimentação do Dia</Text>
          <FlatList
            data={daily}
            keyExtractor={(_, i) => 'daily-' + i}
            renderItem={({ item }) => (
              <Text>{JSON.stringify(item)}</Text>
            )}
            ListEmptyComponent={<Text>Nenhum dado</Text>}
          />
          <Text style={styles.section}>Horários de Pico</Text>
          <FlatList
            data={peak}
            keyExtractor={(_, i) => 'peak-' + i}
            renderItem={({ item }) => (
              <Text>{JSON.stringify(item)}</Text>
            )}
            ListEmptyComponent={<Text>Nenhum dado</Text>}
          />
          <Text style={styles.section}>Relatório de Veículos</Text>
          <FlatList
            data={vehicles}
            keyExtractor={(_, i) => 'vehicles-' + i}
            renderItem={({ item }) => (
              <Text>{JSON.stringify(item)}</Text>
            )}
            ListEmptyComponent={<Text>Nenhum dado</Text>}
          />
        </>
      )}
      <Button title="Voltar" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  section: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  error: { color: 'red', marginVertical: 16 },
});

export default ReportsScreen;

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { reportService } from '../services';
import { Card, Button } from '../components/Common';

const ReportsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [daily, setDaily] = useState([]);
  const [peak, setPeak] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      loadReports();
    }, [])
  );

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const dailyData = await reportService.getDailyMovement(today);
      const peakData = await reportService.getPeakHours(7);
      const vehiclesData = await reportService.getVehiclesReport(today, today);
      setDaily(dailyData?.data || dailyData || []);
      setPeak(peakData?.data || peakData || []);
      setVehicles(vehiclesData?.data || vehiclesData || []);
    } catch (e) {
      console.error('Erro ao carregar relatórios:', e);
      setError('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Relatórios</Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <Card>
            <ActivityIndicator size="large" color="#007AFF" />
          </Card>
        ) : error ? (
          <Card>
            <Text style={styles.error}>{error}</Text>
            <Button
              title="🔄 Tentar Novamente"
              onPress={loadReports}
              variant="secondary"
              style={{ marginTop: 10 }}
            />
          </Card>
        ) : (
          <>
            <Card>
              <Text style={styles.sectionTitle}>📈 Movimentação do Dia</Text>
              <FlatList
                data={daily}
                keyExtractor={(_, i) => 'daily-' + i}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={styles.reportItem}>
                    <Text style={styles.reportText}>{JSON.stringify(item, null, 2)}</Text>
                  </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhum dado disponível</Text>}
              />
            </Card>

            <Card>
              <Text style={styles.sectionTitle}>⏰ Horários de Pico (7 dias)</Text>
              <FlatList
                data={peak}
                keyExtractor={(_, i) => 'peak-' + i}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={styles.reportItem}>
                    <Text style={styles.reportText}>{JSON.stringify(item, null, 2)}</Text>
                  </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhum dado disponível</Text>}
              />
            </Card>

            <Card>
              <Text style={styles.sectionTitle}>🚗 Relatório de Veículos</Text>
              <FlatList
                data={vehicles}
                keyExtractor={(_, i) => 'vehicles-' + i}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={styles.reportItem}>
                    <Text style={styles.reportText}>{JSON.stringify(item, null, 2)}</Text>
                  </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhum dado disponível</Text>}
              />
            </Card>

            <Card>
              <Button
                title="🔄 Recarregar Relatórios"
                onPress={loadReports}
                variant="secondary"
              />
            </Card>
          </>
        )}
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
  reportItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reportText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 12,
    fontStyle: 'italic',
  },
  error: {
    color: '#FF3B30',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default ReportsScreen;

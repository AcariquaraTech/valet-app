import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { reportService } from '../services';
import { Card, Button } from '../components/Common';

const ReportsScreen = ({ navigation }) => {
  console.log('[ReportsScreen] RENDERIZANDO COMPONENTE');
  const [loading, setLoading] = useState(true);
  const [daily, setDaily] = useState(null);
  const [peak, setPeak] = useState(null);
  const [vehicles, setVehicles] = useState(null);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('today');
  const [groupBy, setGroupBy] = useState('hour');
  
  console.log('[ReportsScreen] Estado:', { loading, hasDaily: !!daily, hasPeak: !!peak, hasVehicles: !!vehicles, error });

  useFocusEffect(
    React.useCallback(() => {
      loadReports();
    }, [period, groupBy])
  );

  useEffect(() => {
    loadReports();
  }, [period, groupBy]);

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getRange = () => {
    const today = new Date();
    const endDate = formatLocalDate(today);
    let startDate = endDate;

    if (period === '7d') {
      const d = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
      startDate = formatLocalDate(d);
    }
    if (period === '30d') {
      const d = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);
      startDate = formatLocalDate(d);
    }
    if (period === 'month') {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate = formatLocalDate(d);
    }
    if (period === 'year') {
      const d = new Date(today.getFullYear(), 0, 1);
      startDate = formatLocalDate(d);
    }

    return { startDate, endDate };
  };

  // Período independente para o gráfico de horários de pico
  const getPeakRange = () => {
    const today = new Date();
    const endDate = formatLocalDate(today);
    let startDate = endDate;

    // Se groupBy é 'hour', mostra últimas 24h (hoje)
    if (groupBy === 'hour') {
      startDate = endDate;
    }
    // Se groupBy é 'day', mostra últimos 7 dias
    else if (groupBy === 'day') {
      const d = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
      startDate = formatLocalDate(d);
    }
    // Se groupBy é 'month', mostra último ano
    else if (groupBy === 'month') {
      const d = new Date(today.getFullYear(), 0, 1);
      startDate = formatLocalDate(d);
    }
    // Se groupBy é 'year', mostra últimos 5 anos
    else if (groupBy === 'year') {
      const d = new Date(today.getFullYear() - 4, 0, 1);
      startDate = formatLocalDate(d);
    }

    return { startDate, endDate };
  };

  const loadReports = async () => {
    console.log('[ReportsScreen] Iniciando loadReports...');
    setLoading(true);
    setError(null);
    try {
      const today = formatLocalDate(new Date());
      const { startDate, endDate } = getRange();
      const { startDate: peakStartDate, endDate: peakEndDate } = getPeakRange();
      console.log('[ReportsScreen] Range:', { 
        today, 
        daily: { startDate, endDate }, 
        peak: { startDate: peakStartDate, endDate: peakEndDate },
        period, 
        groupBy 
      });
      
      console.log('[ReportsScreen] Carregando dailyData...');
      const dailyData = await reportService.getDailyMovement({
        date: today,
        startDate,
        endDate,
      });
      console.log('[ReportsScreen] dailyData:', dailyData);
      
      console.log('[ReportsScreen] Carregando peakData...');
      const peakData = await reportService.getPeakHours({
        startDate: peakStartDate,
        endDate: peakEndDate,
        groupBy,
      });
      console.log('[ReportsScreen] peakData:', peakData);

      const vehiclesData = await reportService.getVehiclesReport(startDate, endDate);
      console.log('[ReportsScreen] vehiclesData:', vehiclesData);
      
      setDaily(dailyData || null);
      setPeak(peakData || null);
      setVehicles(vehiclesData || null);
      console.log('[ReportsScreen] Dados carregados com sucesso!');
    } catch (e) {
      console.error('[ReportsScreen] ERRO ao carregar relatórios:', e);
      console.error('[ReportsScreen] Erro detalhado:', e.message, e.response?.data);
      setError('Erro ao carregar relatórios: ' + (e.message || 'desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const renderSummaryItem = (label, value) => (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );

  const renderBarChart = (data = []) => {
    const max = Math.max(...data.map((item) => item.total_movements || 0), 1);
    
    // Formata o label de acordo com o tipo de agrupamento
    const formatLabel = (label) => {
      if (label === null || label === undefined || label === '') {
        console.warn('[ReportsScreen] Label vazio/nulo:', label);
        return '-';
      }
      
      const labelStr = label.toString().trim();
      if (!labelStr) return '-';
      
      if (groupBy === 'hour') {
        // Label já deve ser só a hora (ex: "08")
        return `${labelStr}h`;
      }
      if (groupBy === 'day') {
        // 2026-02-03 -> 03/02
        try {
          const parts = labelStr.split('-');
          if (parts.length >= 3) return `${parts[2]}/${parts[1]}`;
          return labelStr;
        } catch (e) {
          console.error('[ReportsScreen] Erro ao formatar label dia:', labelStr, e);
          return labelStr;
        }
      }
      if (groupBy === 'month') {
        // 2026-02 -> Fev/26
        try {
          const [year, month] = labelStr.split('-');
          const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
          const monthName = months[parseInt(month) - 1] || '?';
          return `${monthName}/${year.slice(2)}`;
        } catch (e) {
          console.error('[ReportsScreen] Erro ao formatar label mês:', labelStr, e);
          return labelStr;
        }
      }
      if (groupBy === 'year') {
        return labelStr;
      }
      return labelStr;
    };

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
        <View style={styles.chartContainer}>
          {data.map((item, index) => {
            const height = Math.round((item.total_movements / max) * 120);
            console.log('[ReportsScreen] Renderizando item:', { label: item.label, formatted: formatLabel(item.label), movements: item.total_movements });
            return (
              <View key={`${item.label}-${index}`} style={styles.chartItem}>
                <View style={styles.chartBarWrapper}>
                  <Text style={styles.chartValue}>{item.total_movements}</Text>
                  <View style={[styles.chartBar, { height: Math.max(height, 4) }]} />
                </View>
                <Text style={styles.chartLabel}>{formatLabel(item.label)}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  // Proteção contra renderização com dados inválidos
  const renderSafeContent = () => {
    try {
      if (loading) {
        console.log('[ReportsScreen] Renderizando LOADING');
        return (
          <Card>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={{ textAlign: 'center', marginTop: 10 }}>Carregando relatórios...</Text>
          </Card>
        );
      }

      if (error) {
        console.log('[ReportsScreen] Renderizando ERRO:', error);
        return (
          <Card>
            <Text style={styles.error}>{error}</Text>
            <Button
              title="🔄 Tentar Novamente"
              onPress={loadReports}
              variant="secondary"
              style={{ marginTop: 10 }}
            />
          </Card>
        );
      }

      console.log('[ReportsScreen] Renderizando DADOS - daily:', daily, 'peak:', peak);

      const recentLogs = Array.isArray(vehicles?.vehicles)
        ? vehicles.vehicles.flatMap((item) => {
            const logs = [];
            if (item.entry_time) {
              logs.push({
                type: 'Entrada',
                time: item.entry_time,
                plate: item.plate,
                vehicleNumber: item.vehicle_number,
              });
            }
            if (item.exit_time) {
              logs.push({
                type: 'Saída',
                time: item.exit_time,
                plate: item.plate,
                vehicleNumber: item.vehicle_number,
              });
            }
            return logs;
          })
        : [];
      const recentLogsToShow = recentLogs
        .filter((item) => item.time)
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 30);
      
      return (
        <>
          <Card>
            <Text style={styles.sectionTitle}>📅 Período</Text>
            <View style={styles.filterRow}>
              {['today', '7d', '30d', 'month', 'year'].map((key) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setPeriod(key)}
                  style={[styles.filterButton, period === key && styles.filterButtonActive]}
                >
                  <Text style={[styles.filterButtonText, period === key && styles.filterButtonTextActive]}>
                    {key === 'today' ? 'Hoje' : key === '7d' ? '7 dias' : key === '30d' ? '30 dias' : key === 'month' ? 'Mês' : 'Ano'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>📈 Movimentação do Dia</Text>
            {daily?.summary ? (
              <View style={styles.summaryGrid}>
                {renderSummaryItem('No Pátio', daily.summary.currently_parked || 0)}
                {renderSummaryItem('Entraram', daily.summary.total_entries || 0)}
                {renderSummaryItem('Saíram', daily.summary.total_exits || 0)}
                {renderSummaryItem('Únicos', daily.summary.unique_vehicles || 0)}
                {renderSummaryItem('Média (min)', daily.summary.avg_parking_duration_minutes || 0)}
                {renderSummaryItem('Pico (hora)', daily.summary.peak_hour || '-')}
              </View>
            ) : (
              <Text style={styles.emptyText}>Nenhum dado disponível</Text>
            )}
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>⏰ Horários de Pico</Text>
            <View style={styles.filterRow}>
              {['hour', 'day', 'month', 'year'].map((key) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setGroupBy(key)}
                  style={[styles.filterButton, groupBy === key && styles.filterButtonActive]}
                >
                  <Text style={[styles.filterButtonText, groupBy === key && styles.filterButtonTextActive]}>
                    {key === 'hour' ? 'Hora' : key === 'day' ? 'Dia' : key === 'month' ? 'Mês' : 'Ano'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {peak?.data && Array.isArray(peak.data) && peak.data.length > 0 ? (
              renderBarChart(peak.data)
            ) : (
              <Text style={styles.emptyText}>Nenhum dado disponível</Text>
            )}
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>🚗 Veículos Recentes</Text>
            {recentLogsToShow.length > 0 ? (
              <View style={styles.recentVehiclesList}>
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
                  {recentLogsToShow.map((item, index) => (
                    <View
                      key={`${item.plate || 'N/A'}-${item.type}-${item.time}-${index}`}
                      style={styles.vehicleRow}
                    >
                      <Text style={[
                        styles.vehiclePlate,
                        item.type === 'Entrada' ? styles.vehicleLogEntry : styles.vehicleLogExit,
                      ]}>
                        {item.plate || 'N/A'}
                      </Text>
                      <Text style={styles.vehicleClient}>
                        {item.type} • {new Date(item.time).toLocaleString('pt-BR')}
                        {item.vehicleNumber ? ` • ${item.vehicleNumber}` : ''}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <Text style={styles.emptyText}>Nenhum veículo recente</Text>
            )}
          </Card>

          <Card>
            <Button
              title="🔄 Recarregar Relatórios"
              onPress={loadReports}
              variant="secondary"
            />
          </Card>
        </>
      );
    } catch (err) {
      console.error('[ReportsScreen] ERRO FATAL ao renderizar:', err);
      return (
        <Card>
          <Text style={styles.error}>Erro ao exibir relatórios: {err.message}</Text>
          <Button
            title="🔄 Recarregar"
            onPress={() => {
              setError(null);
              loadReports();
            }}
            variant="secondary"
            style={{ marginTop: 10 }}
          />
        </Card>
      );
    }
  };

  return (
    <ScrollView style={styles.container} nestedScrollEnabled>
      {console.log('[ReportsScreen] RETURN - loading:', loading, 'error:', error)}
      <View style={styles.header}>
        <Text style={styles.title}>📊 Relatórios</Text>
      </View>

      <View style={styles.content}>
        {renderSafeContent()}
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  chartScroll: {
    marginTop: 12,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingBottom: 8,
  },
  chartItem: {
    alignItems: 'center',
    width: 30,
  },
  chartBarWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 140,
  },
  chartValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  chartBar: {
    width: 18,
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  chartLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  historyDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  historyValue: {
    fontSize: 12,
    color: '#666',
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fafafa',
    paddingHorizontal: 10,
    marginVertical: 4,
    borderRadius: 6,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
  },
  vehiclePlate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  vehicleLogEntry: {
    color: '#2E7D32',
  },
  vehicleLogExit: {
    color: '#C62828',
  },
  vehicleClient: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  recentVehiclesList: {
    maxHeight: 240,
    overflow: 'hidden',
  },
  recentVehiclesListInner: {
    flexGrow: 0,
  },
  vehicleTime: {
    alignItems: 'flex-end',
  },
  timeLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  timeValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  duration: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: '#FF3B30',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default ReportsScreen;

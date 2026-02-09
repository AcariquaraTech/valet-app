import React, { useState, useEffect } from 'react';
import { reportService } from '../services/api';
import { Calendar, AlertCircle, RefreshCw } from 'lucide-react';

export default function PeakHoursReport({ dateRange, setDateRange }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [groupBy, setGroupBy] = useState('hour');
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    loadPeakData();
    
    // Auto-refresh a cada 60 segundos
    const interval = setInterval(() => {
      loadPeakData();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [dateRange, groupBy]);

  const loadPeakData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await reportService.getPeakHours(
        undefined,
        undefined,
        groupBy,
        true
      );
      const result = response.data || response;
      // Backend retorna { data: [...], start_date, end_date }
      setData(result.data || result);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadPeakData();
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange({ ...dateRange, [field]: value });
  };

  const setQuickRange = (days) => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    setDateRange({ startDate, endDate });
  };

  // Calcular estatísticas
  const stats = Array.isArray(data) && data.length > 0
    ? {
        totalEntries: data.reduce((sum, item) => sum + (item.entries || 0), 0),
        totalExits: data.reduce((sum, item) => sum + (item.exits || 0), 0),
        peakHour: data.reduce((peak, item) =>
          (item.entries || 0) > (peak.entries || 0) ? item : peak
        , data[0]),
      }
    : {
        totalEntries: 0,
        totalExits: 0,
        peakHour: null,
      };

  const chartData = Array.isArray(data)
    ? data.map((item) => {
        const entries = item.entries || 0;
        const exits = item.exits || 0;
        const total = Number.isFinite(item.total_movements)
          ? item.total_movements
          : entries + exits;
        return {
          label: item.label || '-',
          total,
        };
      })
    : [];
  const maxTotal = chartData.reduce((max, item) => Math.max(max, item.total), 0);

  return (
    <div className="report-section">
      <div className="report-filters">
        <div className="filter-group">
          <label>De</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
            disabled
          />
        </div>

        <div className="filter-group">
          <label>Até</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
            disabled
          />
        </div>

        <div className="quick-filters">
          <button onClick={() => setQuickRange(7)} className="quick-btn">
            Últimos 7 dias
          </button>
          <button onClick={() => setQuickRange(30)} className="quick-btn">
            Últimos 30 dias
          </button>
        </div>
        
        <button 
          className="refresh-btn" 
          onClick={handleRefresh} 
          disabled={loading}
          title="Atualizar dados"
        >
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          Atualizar
        </button>
        
        {lastUpdate && (
          <div className="last-update">
            Última atualização: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>

      <div className="chart-note">Grafico considera todo o historico do cliente.</div>

      {error && (
        <div className="error-box">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {loading && <div className="loading">Carregando dados...</div>}

      {!loading && (
        <>
          <div className="chart-card">
            <div className="chart-header">
              <h3>Horários de Pico</h3>
              <div className="chart-tabs">
                <button
                  className={`chart-tab ${groupBy === 'hour' ? 'active' : ''}`}
                  onClick={() => setGroupBy('hour')}
                >
                  Hora
                </button>
                <button
                  className={`chart-tab ${groupBy === 'day' ? 'active' : ''}`}
                  onClick={() => setGroupBy('day')}
                >
                  Dia
                </button>
                <button
                  className={`chart-tab ${groupBy === 'month' ? 'active' : ''}`}
                  onClick={() => setGroupBy('month')}
                >
                  Mês
                </button>
                <button
                  className={`chart-tab ${groupBy === 'year' ? 'active' : ''}`}
                  onClick={() => setGroupBy('year')}
                >
                  Ano
                </button>
              </div>
            </div>

            {chartData.length > 0 ? (
              <div className="bar-chart">
                {chartData.map((item, index) => (
                  <div key={`${item.label}-${index}`} className="bar-item">
                    <div className="bar-label-top">{item.total}</div>
                    <div className="bar">
                      <div
                        className="bar-fill"
                        style={{ height: `${maxTotal ? (item.total / maxTotal) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="bar-label-bottom">{item.label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="chart-empty">Nenhum dado disponível para o período selecionado</div>
            )}
          </div>

          <div className="data-cards">
            <div className="card">
              <div className="card-label">📥 Total Entradas</div>
              <div className="card-value">{stats.totalEntries || 0}</div>
            </div>

            <div className="card">
              <div className="card-label">📤 Total Saídas</div>
              <div className="card-value">{stats.totalExits || 0}</div>
            </div>

            <div className="card">
              <div className="card-label">⏰ Pico</div>
              <div className="card-value">{stats.peakHour?.label || '-'}</div>
            </div>
          </div>

          <div className="report-details">
            <h3>Distribuição de Movimento por {groupBy === 'hour' ? 'Hora' : 'Dia'}</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{groupBy === 'hour' ? 'Hora' : 'Data'}</th>
                  <th>Entradas</th>
                  <th>Saídas</th>
                  <th>Saldo</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(data) && data.length > 0 ? (
                  data.map((item, index) => (
                    <tr key={index}>
                      <td className="bold">{item.label || '-'}</td>
                      <td>{item.entries || 0}</td>
                      <td>{item.exits || 0}</td>
                      <td>{(item.entries || 0) - (item.exits || 0)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-gray">
                      Nenhum dado disponível para o período selecionado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

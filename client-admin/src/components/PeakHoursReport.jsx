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
        dateRange.startDate,
        dateRange.endDate,
        groupBy
      );
      setData(response.data || response);
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

  return (
    <div className="report-section">
      <div className="report-filters">
        <div className="filter-group">
          <label>De</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Até</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Agrupar por</label>
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="hour">Hora</option>
            <option value="day">Dia</option>
          </select>
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

      {error && (
        <div className="error-box">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {loading && <div className="loading">Carregando dados...</div>}

      {!loading && (
        <>
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
              <div className="card-value">{stats.peakHour?.period || '-'}</div>
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
                      <td className="bold">{item.period || item.date || '-'}</td>
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

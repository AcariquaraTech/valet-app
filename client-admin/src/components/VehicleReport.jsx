import React, { useState, useEffect } from 'react';
import { reportService } from '../services/api';
import { Calendar, AlertCircle, Search, RefreshCw } from 'lucide-react';

export default function VehicleReport({ dateRange, setDateRange }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchPlate, setSearchPlate] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);

  const normalizeVehicles = (items) => {
    if (!Array.isArray(items)) return [];
    const map = new Map();

    items.forEach((entry) => {
      const plate = entry.plate || '-';
      const existing = map.get(plate) || {
        plate,
        entries: 0,
        exits: 0,
        total_duration: 0,
        avg_duration: 0,
      };

      existing.entries += 1;

      const durationMinutes = entry.duration_minutes;
      if (entry.exit_time && Number.isFinite(durationMinutes)) {
        existing.exits += 1;
        existing.total_duration += durationMinutes / 60;
      }

      map.set(plate, existing);
    });

    return Array.from(map.values()).map((item) => ({
      ...item,
      avg_duration: item.exits ? item.total_duration / item.exits : 0,
    }));
  };

  useEffect(() => {
    loadVehicleData();
    
    // Auto-refresh a cada 45 segundos
    const interval = setInterval(() => {
      loadVehicleData();
    }, 45000);
    
    return () => clearInterval(interval);
  }, [dateRange]);

  const loadVehicleData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await reportService.getVehicleReport(
        dateRange.startDate,
        dateRange.endDate
      );
      const result = response.data || response;
      // Backend retorna { vehicles: [...], total_vehicles: X }
      const normalized = normalizeVehicles(result.vehicles || result);
      setData(normalized);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadVehicleData();
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

  // Filtrar veículos por placa
  const filteredVehicles = Array.isArray(data)
    ? data.filter((vehicle) =>
        vehicle.plate && vehicle.plate.toLowerCase().includes(searchPlate.toLowerCase())
      )
    : [];

  // Calcular estatísticas
  const stats = {
    totalVehicles: filteredVehicles.length,
    totalEntries: filteredVehicles.reduce((sum, v) => sum + (v.entries || 0), 0),
    avgVisits: filteredVehicles.length > 0 ? (filteredVehicles.reduce((sum, v) => sum + (v.entries || 0), 0) / filteredVehicles.length).toFixed(1) : 0,
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

      <div className="search-box">
        <Search size={18} />
        <input
          type="text"
          placeholder="Buscar por placa..."
          value={searchPlate}
          onChange={(e) => setSearchPlate(e.target.value)}
        />
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
              <div className="card-label">🚗 Total de Veículos</div>
              <div className="card-value">{stats.totalVehicles}</div>
            </div>

            <div className="card">
              <div className="card-label">📥 Total de Entradas</div>
              <div className="card-value">{stats.totalEntries}</div>
            </div>

            <div className="card">
              <div className="card-label">📊 Média de Visitas</div>
              <div className="card-value">{stats.avgVisits}</div>
            </div>
          </div>

          <div className="report-details">
            <h3>
              Veículos {searchPlate && `(${filteredVehicles.length} encontrados)`}
            </h3>
            <div className="table-wrapper">
              <table className="data-table vehicle-table">
                <thead>
                  <tr>
                    <th>Placa</th>
                    <th>Entradas</th>
                    <th>Saídas</th>
                    <th>Tempo Total (horas)</th>
                    <th>Tempo Médio (horas)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.length > 0 ? (
                    filteredVehicles.map((vehicle, index) => (
                      <tr key={index}>
                        <td className="plate">{vehicle.plate || '-'}</td>
                        <td>{vehicle.entries || 0}</td>
                        <td>{vehicle.exits || 0}</td>
                        <td>{vehicle.total_duration ? vehicle.total_duration.toFixed(1) : '0'}</td>
                        <td>{vehicle.avg_duration ? vehicle.avg_duration.toFixed(1) : '0'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-gray">
                        {searchPlate
                          ? 'Nenhum veículo encontrado com essa placa'
                          : 'Nenhum dado disponível para o período selecionado'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

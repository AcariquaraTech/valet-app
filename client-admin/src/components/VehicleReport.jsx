import React, { useState, useEffect } from 'react';
import { reportService } from '../services/api';
import { AlertCircle, Search, RefreshCw, Car } from 'lucide-react';

export default function VehicleReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchPlate, setSearchPlate] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    loadParkedVehicles();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(() => {
      loadParkedVehicles();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadParkedVehicles = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await reportService.getParkedVehicles();
      const result = response.data || response;
      // Backend retorna { vehicles: [...], total_parked: X }
      setData(result.vehicles || []);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadParkedVehicles();
  };

  const filteredVehicles = Array.isArray(data)
    ? data.filter((vehicle) =>
        vehicle.plate && vehicle.plate.toLowerCase().includes(searchPlate.toLowerCase())
      )
    : [];

  // Calcular estatísticas
  const stats = {
    totalParked: data.length,
    avgDuration: data.length > 0
      ? (data.reduce((sum, v) => sum + (v.duration_minutes || 0), 0) / data.length / 60).toFixed(1)
      : 0,
    maxDuration: data.length > 0
      ? Math.max(...data.map(v => v.duration_minutes || 0))
      : 0,

    const formatTime = (date) => {
      const d = new Date(date);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };
  };

  return (
    <div className="report-section">
      <div className="report-filters">
        <h2 className="report-title">
          <Car size={24} /> Veículos no Pátio
        </h2>

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
              <div className="card-label">🚗 Total no Pátio</div>
              <div className="card-value">{stats.totalParked}</div>
            </div>

            <div className="card">
              <div className="card-label">⏱️ Tempo Médio</div>
              <div className="card-value">{stats.avgDuration}h</div>
            </div>

            <div className="card">
              <div className="card-label">⏰ Maior Permanência</div>
              <div className="card-value">{Math.floor(stats.maxDuration / 60)}h {stats.maxDuration % 60}m</div>
            </div>
          </div>

          <div className="report-details">
            <h3>
              {searchPlate ? `${filteredVehicles.length} veículos encontrados` : `${data.length} veículos estacionados`}
            </h3>
            <div className="table-wrapper">
              <table className="data-table vehicle-table">
                <thead>
                  <tr>
                    <th>PLACA</th>
                    <th>NOME DO PROPRIETÁRIO</th>
                    <th>TELEFONE</th>
                    <th>HORA DE ENTRADA</th>
                    <th>TEMPO DE PERMANÊNCIA</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.length > 0 ? (
                    filteredVehicles.map((vehicle, index) => (
                      <tr key={index}>
                        <td className="plate">{vehicle.plate || '-'}</td>
                        <td>{vehicle.client_name || '-'}</td>
                        <td>{vehicle.client_phone || '-'}</td>
                        <td>{formatTime(vehicle.entry_time)}</td>
                        <td>{vehicle.duration_formatted || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-gray">
                        {searchPlate
                          ? 'Nenhum veículo encontrado com essa placa'
                          : 'Nenhum veículo no pátio no momento'}
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

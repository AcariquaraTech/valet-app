import React, { useState, useEffect } from 'react';
import { reportService } from '../services/api';
import { Calendar, AlertCircle } from 'lucide-react';

export default function DailyMovementReport({ selectedDate, setSelectedDate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDailyData();
  }, [selectedDate]);

  const loadDailyData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await reportService.getDailyMovement(selectedDate);
      setData(response.data || response);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className="report-section">
      <div className="report-filters">
        <div className="filter-group">
          <label>
            <Calendar size={16} /> Data
          </label>
          <input type="date" value={selectedDate} onChange={handleDateChange} />
        </div>
      </div>

      {error && (
        <div className="error-box">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {loading && <div className="loading">Carregando dados...</div>}

      {data && !loading && (
        <div className="data-cards">
          <div className="card">
            <div className="card-label">📥 Entradas</div>
            <div className="card-value">{data.entries || 0}</div>
          </div>

          <div className="card">
            <div className="card-label">📤 Saídas</div>
            <div className="card-value">{data.exits || 0}</div>
          </div>

          <div className="card">
            <div className="card-label">🚗 Veículos Únicos</div>
            <div className="card-value">{data.unique_vehicles || 0}</div>
          </div>

          <div className="card">
            <div className="card-label">⏰ Pico de Horário</div>
            <div className="card-value">{data.peak_hour ? `${data.peak_hour}h` : '-'}</div>
          </div>
        </div>
      )}

      {!loading && data && (
        <div className="report-details">
          <h3>Detalhes do Dia</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Métrica</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total de Entradas</td>
                <td>{data.entries}</td>
              </tr>
              <tr>
                <td>Total de Saídas</td>
                <td>{data.exits}</td>
              </tr>
              <tr>
                <td>Saldo (Veículos Estacionados)</td>
                <td>{(data.entries || 0) - (data.exits || 0)}</td>
              </tr>
              <tr>
                <td>Veículos Únicos</td>
                <td>{data.unique_vehicles}</td>
              </tr>
              <tr>
                <td>Pico de Horário</td>
                <td>{data.peak_hour ? `${data.peak_hour}:00` : 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

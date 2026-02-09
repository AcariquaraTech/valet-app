import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Truck, Calendar } from 'lucide-react';
import { reportService } from '../services/api';
import DailyMovementReport from '../components/DailyMovementReport';
import PeakHoursReport from '../components/PeakHoursReport';
import VehicleReport from '../components/VehicleReport';
import './Reports.css';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('daily');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>📊 Relatórios e Análises</h2>
        <p>Visualize o movimento, picos de horário e dados de veículos</p>
      </div>

      <div className="reports-tabs">
        <button
          className={`tab-button ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          <BarChart3 size={20} /> Movimento Diário
        </button>
        <button
          className={`tab-button ${activeTab === 'peaks' ? 'active' : ''}`}
          onClick={() => setActiveTab('peaks')}
        >
          <TrendingUp size={20} /> Picos de Horário
        </button>
        <button
          className={`tab-button ${activeTab === 'vehicles' ? 'active' : ''}`}
          onClick={() => setActiveTab('vehicles')}
        >
          <Truck size={20} /> Veículos
        </button>
      </div>

      <div className="reports-content">
        {activeTab === 'daily' && (
          <DailyMovementReport selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        )}

        {activeTab === 'peaks' && (
          <PeakHoursReport dateRange={dateRange} setDateRange={setDateRange} />
        )}

        {activeTab === 'vehicles' && (
          <VehicleReport dateRange={dateRange} setDateRange={setDateRange} />
        )}
      </div>
    </div>
  );
}

import express from 'express';
import { authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/reports/daily-movement
router.get('/daily-movement', authorize('admin'), async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];

    res.json({
      date,
      total_entries: 45,
      total_exits: 42,
      currently_parked: 3,
      unique_vehicles: 45,
      avg_parking_duration: 128,
      peak_hour: 12,
      movements: [
        {
          id: 'movement-1',
          plate: 'ABC-1234',
          movement_type: 'entry',
          time: new Date().toISOString(),
          user: 'João Silva',
          client_name: 'João',
        },
      ],
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao obter movimento do dia',
      code: 'DAILY_MOVEMENT_ERROR',
      message: error.message,
    });
  }
});

// GET /api/reports/peak-hours
router.get('/peak-hours', authorize('admin'), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;

    res.json({
      period: `last_${days}_days`,
      peak_hours: [
        {
          hour: 12,
          entries: 25,
          exits: 23,
          total_movements: 48,
        },
        {
          hour: 13,
          entries: 22,
          exits: 24,
          total_movements: 46,
        },
      ],
      highest_peak_hour: 12,
      avg_movements_per_hour: 35,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao obter horários de pico',
      code: 'PEAK_HOURS_ERROR',
      message: error.message,
    });
  }
});

// GET /api/reports/vehicles
router.get('/vehicles', authorize('admin'), async (req, res) => {
  try {
    res.json({
      total_vehicles: 150,
      avg_duration: 145,
      max_duration: 480,
      min_duration: 15,
      vehicles: [
        {
          id: 'vehicle-1',
          plate: 'ABC-1234',
          entry_time: new Date().toISOString(),
          exit_time: new Date().toISOString(),
          duration: 135,
          client_name: 'João Silva',
        },
      ],
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao obter relatório de veículos',
      code: 'VEHICLES_REPORT_ERROR',
      message: error.message,
    });
  }
});

export default router;

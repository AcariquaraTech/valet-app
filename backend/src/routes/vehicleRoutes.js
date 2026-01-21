import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  registerEntry,
  registerExit,
  listParkedVehicles,
  getVehicleHistory,
  recognizePlate,
} from '../controllers/vehicleController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// POST /api/vehicles/entry
router.post('/entry', registerEntry);

// POST /api/vehicles/exit
router.post('/exit', registerExit);

// GET /api/vehicles/parked
router.get('/parked', listParkedVehicles);

// GET /api/vehicles/:plate/history
router.get('/:plate/history', getVehicleHistory);

// POST /api/vehicles/recognize-plate
router.post('/recognize-plate', recognizePlate);

export default router;

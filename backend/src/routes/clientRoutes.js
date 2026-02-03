import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth.js';
import * as clientController from '../controllers/clientController.js';

const router = express.Router();

// Middleware de autenticação e autorização (somente admin)
router.use(authenticateToken, authorize('admin'));

// CRUD de Clientes (Donos de Estacionamentos)
router.get('/', clientController.listClients);
router.get('/:id', clientController.getClientById);
router.post('/', clientController.createClient);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

// Obter estatísticas do cliente
router.get('/:id/stats', clientController.getClientStats);

export default router;

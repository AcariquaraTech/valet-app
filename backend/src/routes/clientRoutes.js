import express from 'express';
import { authorize } from '../middleware/auth.js';
import * as clientController from '../controllers/clientController.js';

const router = express.Router();

// Middleware de autorização (somente admin) - autenticação já aplicada no app.js
router.use(authorize('admin'));

// CRUD de Clientes (Donos de Estacionamentos)
router.get('/', clientController.listClients);
router.get('/:id', clientController.getClientById);
router.post('/', clientController.createClient);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

// Obter estatísticas do cliente
router.get('/:id/stats', clientController.getClientStats);

export default router;

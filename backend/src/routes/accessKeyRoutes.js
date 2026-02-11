import express from 'express';
import { authorize } from '../middleware/auth.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  generateAccessKey,
  listAccessKeys,
  validateAccessKey,
  revokeAccessKey,
  renewAccessKey,
  getAccessKeyLogs,
} from '../controllers/accessKeyController.js';

const router = express.Router();

console.log('[accessKeyRoutes] Inicializando router...');

// PUBLIC - Validar chave (primeira execução do app)
console.log('[accessKeyRoutes] Registrando POST /validate');
router.post('/validate', validateAccessKey);
console.log('[accessKeyRoutes] POST /validate registrado!');

// ADMIN - Gerar nova chave
router.post('/generate', authenticateToken, authorize('admin'), generateAccessKey);

// ADMIN - Listar todas as chaves
router.get('/', authenticateToken, authorize('admin'), listAccessKeys);

// ADMIN - Renovar chave (estender expiração)
router.put('/:id/renew', authenticateToken, authorize('admin'), renewAccessKey);

// ADMIN - Revogar chave
router.put('/:id/revoke', authenticateToken, authorize('admin'), revokeAccessKey);

// ADMIN - Ver logs de validação
router.get('/:id/logs', authenticateToken, authorize('admin'), getAccessKeyLogs);

export default router;

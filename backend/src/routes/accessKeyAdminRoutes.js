import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth.js';
import * as accessKeyController from '../controllers/accessKeyAdminController.js';

const router = express.Router();

// Middleware de autenticação e autorização (somente admin)
router.use(authenticateToken, authorize('admin'));

// CRUD de AccessKeys (para Admin)
router.get('/', accessKeyController.listAccessKeys);
router.get('/:id', accessKeyController.getAccessKeyById);
router.post('/', accessKeyController.createAccessKey);
router.put('/:id', accessKeyController.updateAccessKey);
router.delete('/:id', accessKeyController.deleteAccessKey);

// Vinculação de usuários à chave
router.post('/:id/bind-user/:userId', accessKeyController.bindUserToKey);
router.delete('/:id/unbind-user/:userId', accessKeyController.unbindUserFromKey);
router.get('/:id/users', accessKeyController.getKeyUsers);

// Ativar/Desativar chave
router.patch('/:id/activate', accessKeyController.activateKey);
router.patch('/:id/deactivate', accessKeyController.deactivateKey);

// Renovar chave
router.patch('/:id/renew', accessKeyController.renewKey);

export default router;

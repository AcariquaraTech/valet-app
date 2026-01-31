import express from 'express';
import { register, login, me, refreshToken } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/refresh
router.post('/refresh', refreshToken);

// GET /api/auth/me
router.get('/me', authenticateToken, me);

export default router;


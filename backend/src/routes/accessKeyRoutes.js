import express from 'express';
import { authorize } from '../middleware/auth.js';
import { generateAccessKeyCode } from '../utils/crypto.js';

const router = express.Router();

// GET /api/access-keys
router.get('/', authorize('admin'), async (req, res) => {
  try {
    res.json({
      data: [
        {
          id: 'key-1',
          key_name: 'Celular Principal',
          key_code: 'KEY123ABC',
          status: 'active',
          created_at: new Date().toISOString(),
          last_used_at: new Date().toISOString(),
          active_users: 2,
        },
      ],
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao listar chaves de acesso',
      code: 'LIST_KEYS_ERROR',
      message: error.message,
    });
  }
});

// POST /api/access-keys
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const { key_name } = req.body;

    if (!key_name) {
      return res.status(400).json({
        error: 'Nome da chave é obrigatório',
        code: 'MISSING_KEY_NAME',
      });
    }

    const keyCode = generateAccessKeyCode();

    res.status(201).json({
      id: `key-${Date.now()}`,
      key_name,
      key_code: keyCode,
      status: 'active',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao criar chave de acesso',
      code: 'CREATE_KEY_ERROR',
      message: error.message,
    });
  }
});

// PUT /api/access-keys/:keyId
router.put('/:keyId', authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;

    res.json({
      id: req.params.keyId,
      status,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao atualizar chave de acesso',
      code: 'UPDATE_KEY_ERROR',
      message: error.message,
    });
  }
});

export default router;

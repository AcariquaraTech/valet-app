import express from 'express';
import { authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    res.json({
      data: [
        {
          id: 'user-1',
          name: 'João Silva',
          nickname: 'joaosilva',
          role: 'admin',
          status: 'active',
          last_login_at: new Date().toISOString(),
        },
      ],
      total: 5,
      page,
      limit,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao listar usuários',
      code: 'LIST_USERS_ERROR',
      message: error.message,
    });
  }
});

// POST /api/users
router.post('/', authorize('admin'), async (req, res) => {
  try {

    const { name, nickname, password, role, access_key_id } = req.body;

    if (!name || !nickname || !password || !access_key_id) {
      return res.status(400).json({
        error: 'Nome, nome de usuário, senha e chave de acesso são obrigatórios',
        code: 'MISSING_FIELDS',
      });
    }

    res.status(201).json({
      id: 'user-new',
      name,
      nickname,
      role: role || 'operator',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao criar usuário',
      code: 'CREATE_USER_ERROR',
      message: error.message,
    });
  }
});

// PUT /api/users/:userId
router.put('/:userId', authorize('admin'), async (req, res) => {
  try {
    const { name, role, status } = req.body;

    res.json({
      id: req.params.userId,
      name,
      role,
      status,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao atualizar usuário',
      code: 'UPDATE_USER_ERROR',
      message: error.message,
    });
  }
});

// DELETE /api/users/:userId
router.delete('/:userId', authorize('admin'), async (req, res) => {
  try {
    res.json({
      message: 'Usuário deletado com sucesso',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao deletar usuário',
      code: 'DELETE_USER_ERROR',
      message: error.message,
    });
  }
});

export default router;

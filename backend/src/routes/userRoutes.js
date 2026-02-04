import express from 'express';
import bcrypt from 'bcryptjs';
import { authorize, authenticateToken } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router = express.Router();

// GET /api/user/me - Obter dados do usuário logado (para validação de token)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        nickname: true,
        role: true,
        phone: true,
        active: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error in GET /me:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados do usuário',
      error: error.message,
    });
  }
});

// GET /api/user/my-team - Listar usuários da mesma chave de acesso (admin e operador)
router.get('/my-team', authenticateToken, async (req, res) => {
  try {
    const valetClientId = req.user.valetClientId;

    if (!valetClientId) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Busca todos os usuários vinculados à mesma chave de acesso
    const accessKeys = await prisma.accessKey.findMany({
      where: {
        clientId: valetClientId,
      },
      include: {
        users: {
          select: {
            id: true,
            nickname: true,
            name: true,
            phone: true,
            email: true,
            role: true,
            active: true,
          },
        },
      },
    });

    // Combina todos os usuários de todas as chaves do cliente
    const allUsers = [];
    accessKeys.forEach((key) => {
      allUsers.push(...key.users);
    });

    // Remove duplicatas por ID
    const uniqueUsers = Array.from(
      new Map(allUsers.map((u) => [u.id, u])).values()
    );

    res.json({
      success: true,
      data: uniqueUsers,
    });
  } catch (error) {
    console.error('Error in GET /my-team:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar equipe',
      error: error.message,
    });
  }
});

// GET /api/users
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [total, users] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          nickname: true,
          role: true,
          phone: true,
          email: true,
          active: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    res.json({
      data: users,
      total,
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
    const {
      name,
      nickname,
      password,
      role,
      phone,
      email,
      active,
      accessKeyId,
      access_key_id,
    } = req.body;

    const keyId = accessKeyId || access_key_id || null;

    if (!name || !nickname || !password) {
      return res.status(400).json({
        error: 'Nome, nome de usuário e senha são obrigatórios',
        code: 'MISSING_FIELDS',
      });
    }

    // Se houver accessKeyId, buscar clientId para verificar nickname dentro do mesmo cliente
    let clientIdToCheck = null;
    if (keyId) {
      const accessKey = await prisma.accessKey.findUnique({
        where: { id: keyId },
        select: { clientId: true },
      });
      clientIdToCheck = accessKey?.clientId;
    }

    // Verificar se nickname já existe no mesmo cliente
    if (clientIdToCheck) {
      // Buscar todos os usuários vinculados às access keys deste cliente
      const existingUsers = await prisma.user.findMany({
        where: {
          nickname,
          accessKeys: {
            some: {
              clientId: clientIdToCheck,
            },
          },
        },
      });

      if (existingUsers.length > 0) {
        return res.status(409).json({
          error: 'Nickname já cadastrado para este cliente',
          code: 'NICKNAME_EXISTS',
        });
      }
    } else {
      // Se não tem clientId, faz verificação global (para compatibilidade)
      const existing = await prisma.user.findUnique({
        where: { nickname },
      });

      if (existing) {
        return res.status(409).json({
          error: 'Nickname já cadastrado',
          code: 'NICKNAME_EXISTS',
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        nickname,
        password: hashedPassword,
        role: role || 'operator',
        phone: phone || null,
        email: email || null,
        active: active !== undefined ? !!active : true,
        ...(keyId && {
          accessKeys: {
            connect: { id: keyId },
          },
        }),
      },
      select: {
        id: true,
        name: true,
        nickname: true,
        role: true,
        phone: true,
        email: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      data: user,
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
    const { name, role, phone, email, active, password } = req.body;
    const { userId } = req.params;

    const data = {
      ...(name && { name }),
      ...(role && { role }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(active !== undefined && { active: !!active }),
    };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        nickname: true,
        role: true,
        phone: true,
        email: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      data: user,
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
    const { userId } = req.params;

    await prisma.user.delete({
      where: { id: userId },
    });

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

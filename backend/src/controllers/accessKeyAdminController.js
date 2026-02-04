import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Gerar código de chave único
const generateAccessKeyCode = () => {
  return 'VALET-' + crypto.randomBytes(6).toString('hex').toUpperCase();
};

// Listar todas as chaves de acesso
export const listAccessKeys = async (req, res) => {
  try {
    const keys = await prisma.accessKey.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        users: {
          select: {
            id: true,
            nickname: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: keys,
    });
  } catch (error) {
    console.error('Error listing access keys:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar chaves de acesso',
    });
  }
};

// Obter uma chave de acesso pelo ID
export const getAccessKeyById = async (req, res) => {
  try {
    const { id } = req.params;

    const key = await prisma.accessKey.findUnique({
      where: { id },
      include: {
        client: true,
        users: {
          select: {
            id: true,
            nickname: true,
            name: true,
            phone: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!key) {
      return res.status(404).json({
        success: false,
        error: 'Chave de acesso não encontrada',
      });
    }

    res.json({
      success: true,
      data: key,
    });
  } catch (error) {
    console.error('Error getting access key:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter chave de acesso',
    });
  }
};

// Criar nova chave de acesso
export const createAccessKey = async (req, res) => {
  try {
    const {
      clientId,
      clientName,
      clientEmail,
      clientPhone,
      companyName,
      expiresAt,
      status = 'active',
      observations,
    } = req.body;

    if (!clientId || !clientName || !clientEmail || !clientPhone) {
      return res.status(400).json({
        success: false,
        error: 'Cliente, nome, email e telefone são obrigatórios',
      });
    }

    // Verificar se cliente existe
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado',
      });
    }

    // Gerar código único
    let code;
    let isUnique = false;
    while (!isUnique) {
      code = generateAccessKeyCode();
      const existing = await prisma.accessKey.findUnique({
        where: { code },
      });
      isUnique = !existing;
    }

    const accessKey = await prisma.accessKey.create({
      data: {
        code,
        clientId,
        clientName,
        clientEmail,
        clientPhone,
        companyName: companyName || client.companyName,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        status,
        observations,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Chave de acesso criada com sucesso',
      data: accessKey,
    });
  } catch (error) {
    console.error('Error creating access key:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar chave de acesso',
    });
  }
};

// Atualizar chave de acesso
export const updateAccessKey = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      clientName,
      clientEmail,
      clientPhone,
      companyName,
      expiresAt,
      status,
      observations,
    } = req.body;

    const accessKey = await prisma.accessKey.update({
      where: { id },
      data: {
        ...(clientName && { clientName }),
        ...(clientEmail && { clientEmail }),
        ...(clientPhone && { clientPhone }),
        ...(companyName && { companyName }),
        ...(expiresAt && { expiresAt: new Date(expiresAt) }),
        ...(status && { status }),
        ...(observations && { observations }),
      },
      include: {
        client: true,
        users: true,
      },
    });

    res.json({
      success: true,
      message: 'Chave de acesso atualizada com sucesso',
      data: accessKey,
    });
  } catch (error) {
    console.error('Error updating access key:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar chave de acesso',
    });
  }
};

// Deletar chave de acesso
export const deleteAccessKey = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.accessKey.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Chave de acesso deletada com sucesso',
    });
  } catch (error) {
    console.error('Error deleting access key:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar chave de acesso',
    });
  }
};

// Vincular usuário à chave de acesso
export const bindUserToKey = async (req, res) => {
  try {
    const { id, userId } = req.params;

    // Verificar se chave existe
    const key = await prisma.accessKey.findUnique({
      where: { id },
    });

    if (!key) {
      return res.status(404).json({
        success: false,
        error: 'Chave de acesso não encontrada',
      });
    }

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }

    // Vincular (Prisma many-to-many)
    const updated = await prisma.accessKey.update({
      where: { id },
      data: {
        users: {
          connect: { id: userId },
        },
      },
      include: {
        users: true,
      },
    });

    res.json({
      success: true,
      message: 'Usuário vinculado à chave com sucesso',
      data: updated,
    });
  } catch (error) {
    console.error('Error binding user to key:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao vincular usuário',
    });
  }
};

// Desvincular usuário da chave de acesso
export const unbindUserFromKey = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const updated = await prisma.accessKey.update({
      where: { id },
      data: {
        users: {
          disconnect: { id: userId },
        },
      },
      include: {
        users: true,
      },
    });

    res.json({
      success: true,
      message: 'Usuário desvinculado da chave com sucesso',
      data: updated,
    });
  } catch (error) {
    console.error('Error unbinding user from key:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao desvincular usuário',
    });
  }
};

// Obter usuários vinculados à chave
export const getKeyUsers = async (req, res) => {
  try {
    const { id } = req.params;

    const key = await prisma.accessKey.findUnique({
      where: { id },
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

    if (!key) {
      return res.status(404).json({
        success: false,
        error: 'Chave de acesso não encontrada',
      });
    }

    res.json({
      success: true,
      data: key.users,
    });
  } catch (error) {
    console.error('Error getting key users:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter usuários',
    });
  }
};

// Ativar chave
export const activateKey = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await prisma.accessKey.update({
      where: { id },
      data: { status: 'active' },
    });

    res.json({
      success: true,
      message: 'Chave ativada com sucesso',
      data: updated,
    });
  } catch (error) {
    console.error('Error activating key:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao ativar chave',
    });
  }
};

// Desativar chave
export const deactivateKey = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await prisma.accessKey.update({
      where: { id },
      data: { status: 'inactive' },
    });

    res.json({
      success: true,
      message: 'Chave desativada com sucesso',
      data: updated,
    });
  } catch (error) {
    console.error('Error deactivating key:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao desativar chave',
    });
  }
};

// Renovar chave (estender data de expiração)
export const renewKey = async (req, res) => {
  try {
    const { id } = req.params;
    const { months = 12 } = req.body;

    const now = new Date();
    const expiresAt = new Date(now.getFullYear(), now.getMonth() + months, now.getDate());

    const updated = await prisma.accessKey.update({
      where: { id },
      data: { expiresAt },
    });

    res.json({
      success: true,
      message: `Chave renovada por ${months} meses`,
      data: updated,
    });
  } catch (error) {
    console.error('Error renewing key:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao renovar chave',
    });
  }
};

// Obter usuários disponíveis para vincular (usuários livres + usuários do mesmo cliente)
export const getAvailableUsers = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar a access key para obter o clientId
    const accessKey = await prisma.accessKey.findUnique({
      where: { id },
      select: { clientId: true },
    });

    if (!accessKey) {
      return res.status(404).json({
        success: false,
        error: 'Chave de acesso não encontrada',
      });
    }

    // Buscar todos os usuários
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        nickname: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        active: true,
        accessKeys: {
          select: {
            clientId: true,
          },
        },
      },
    });

    // Filtrar:
    // 1. Usuários sem access keys (livres)
    // 2. Usuários vinculados a access keys do mesmo cliente
    const availableUsers = allUsers.filter((user) => {
      if (user.accessKeys.length === 0) {
        return true; // Usuário livre
      }
      // Verifica se pelo menos uma das access keys do usuário pertence ao mesmo cliente
      return user.accessKeys.some((ak) => ak.clientId === accessKey.clientId);
    });

    // Remover o campo accessKeys do retorno
    const cleanedUsers = availableUsers.map((user) => {
      const { accessKeys, ...userWithoutKeys } = user;
      return userWithoutKeys;
    });

    res.json({
      success: true,
      data: cleanedUsers,
    });
  } catch (error) {
    console.error('Error getting available users:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter usuários disponíveis',
    });
  }
};

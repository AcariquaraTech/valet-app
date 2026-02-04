import prisma from '../lib/prisma.js';
import { generateAccessKeyCode } from '../utils/crypto.js';
import crypto from 'crypto';

/**
 * GERAR NOVA CHAVE DE ACESSO (Admin)
 * POST /api/access-keys/generate
 */
export const generateAccessKey = async (req, res) => {
  try {
    const { clientId, clientName, clientEmail, clientPhone, expiresAt } = req.body;

    if (!clientId || !clientName || !expiresAt) {
      return res.status(400).json({
        error: 'ID do cliente, nome do cliente e data de expiração são obrigatórios',
      });
    }

    // Validar data de expiração
    const expireDate = new Date(expiresAt);
    if (expireDate <= new Date()) {
      return res.status(400).json({
        error: 'Data de expiração deve ser no futuro',
      });
    }

    // Verificar se o cliente existe
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado',
      });
    }

    // Gerar código único
    const code = generateAccessKeyCode();

    const accessKey = await prisma.accessKey.create({
      data: {
        code,
        clientId, // ISOLAMENTO: vincula ao cliente (valet)
        clientName,
        companyName: client.companyName,
        clientEmail,
        clientPhone,
        expiresAt: expireDate,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Chave de acesso gerada com sucesso',
      data: accessKey,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao gerar chave de acesso',
      message: error.message,
    });
  }
};

/**
 * LISTAR TODAS AS CHAVES (Admin)
 * GET /api/access-keys
 */
export const listAccessKeys = async (req, res) => {
  try {
    const keys = await prisma.accessKey.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        clientName: true,
        clientEmail: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        lastValidatedAt: true,
      },
    });

    res.json({
      success: true,
      count: keys.length,
      data: keys,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao listar chaves',
      message: error.message,
    });
  }
};

/**
 * VALIDAR CHAVE DE ACESSO (do App)
 * POST /api/access-keys/validate
 * Body: { code, deviceId, appVersion, osVersion }
 */
export const validateAccessKey = async (req, res) => {
  try {
    const { code, deviceId, appVersion, osVersion } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Chave de acesso obrigatória',
        code: 'MISSING_KEY',
      });
    }

    // Buscar a chave
    const accessKey = await prisma.accessKey.findUnique({
      where: { code },
    });

    if (!accessKey) {
      // Log da tentativa falhada
      await prisma.accessValidationLog.create({
        data: {
          accessKeyId: 'unknown',
          deviceId,
          status: 'invalid',
          appVersion,
          osVersion,
        },
      });

      return res.status(401).json({
        success: false,
        error: 'Chave inválida',
        code: 'INVALID_KEY',
      });
    }

    // Verificar se está revogada
    if (accessKey.status === 'revoked') {
      await prisma.accessValidationLog.create({
        data: {
          accessKeyId: accessKey.id,
          deviceId,
          status: 'revoked',
          appVersion,
          osVersion,
        },
      });

      return res.status(401).json({
        success: false,
        error: 'Acesso revogado pelo administrador',
        code: 'ACCESS_REVOKED',
        reason: accessKey.revokedReason,
      });
    }

    // Verificar se expirou
    if (accessKey.expiresAt <= new Date()) {
      await prisma.accessValidationLog.create({
        data: {
          accessKeyId: accessKey.id,
          deviceId,
          status: 'expired',
          appVersion,
          osVersion,
        },
      });

      return res.status(401).json({
        success: false,
        error: 'Acesso expirado. Renove sua mensalidade',
        code: 'ACCESS_EXPIRED',
        expiresAt: accessKey.expiresAt,
      });
    }

    // Atualizar deviceId e lastValidatedAt
    const updated = await prisma.accessKey.update({
      where: { id: accessKey.id },
      data: {
        deviceId,
        lastValidatedAt: new Date(),
      },
    });

    // Log da validação bem-sucedida
    await prisma.accessValidationLog.create({
      data: {
        accessKeyId: accessKey.id,
        deviceId,
        status: 'valid',
        appVersion,
        osVersion,
      },
    });

    res.json({
      success: true,
      message: 'Chave válida',
      data: {
        id: updated.id,
        clientName: updated.clientName,
        expiresAt: updated.expiresAt,
        daysRemaining: Math.ceil(
          (updated.expiresAt - new Date()) / (1000 * 60 * 60 * 24)
        ),
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao validar chave',
      message: error.message,
    });
  }
};

/**
 * REVOGAR CHAVE DE ACESSO (Admin)
 * PUT /api/access-keys/:id/revoke
 */
export const revokeAccessKey = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const accessKey = await prisma.accessKey.update({
      where: { id },
      data: {
        status: 'revoked',
        revokedAt: new Date(),
        revokedReason: reason || 'Sem motivo especificado',
      },
    });

    res.json({
      success: true,
      message: 'Chave revogada com sucesso',
      data: accessKey,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao revogar chave',
      message: error.message,
    });
  }
};

/**
 * RENOVAR CHAVE (estender expiração)
 * PUT /api/access-keys/:id/renew
 */
export const renewAccessKey = async (req, res) => {
  try {
    const { id } = req.params;
    const { expiresAt } = req.body;

    if (!expiresAt) {
      return res.status(400).json({
        error: 'Nova data de expiração é obrigatória',
      });
    }

    const accessKey = await prisma.accessKey.update({
      where: { id },
      data: {
        expiresAt: new Date(expiresAt),
        status: 'active',
      },
    });

    res.json({
      success: true,
      message: 'Chave renovada com sucesso',
      data: accessKey,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao renovar chave',
      message: error.message,
    });
  }
};

/**
 * VER LOGS DE VALIDAÇÃO
 * GET /api/access-keys/:id/logs
 */
export const getAccessKeyLogs = async (req, res) => {
  try {
    const { id } = req.params;

    const logs = await prisma.accessValidationLog.findMany({
      where: { accessKeyId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao buscar logs',
      message: error.message,
    });
  }
};

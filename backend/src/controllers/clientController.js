import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Listar todos os clientes
export const listClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      include: {
        accessKeys: {
          select: {
            id: true,
            code: true,
            status: true,
            expiresAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: clients,
    });
  } catch (error) {
    console.error('Error listing clients:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar clientes',
    });
  }
};

// Obter um cliente pelo ID
export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        accessKeys: {
          select: {
            id: true,
            code: true,
            clientName: true,
            clientEmail: true,
            clientPhone: true,
            companyName: true,
            status: true,
            expiresAt: true,
          },
        },
      },
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado',
      });
    }

    res.json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error('Error getting client:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter cliente',
    });
  }
};

// Criar novo cliente
export const createClient = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      companyName,
      address,
      city,
      state,
      zipCode,
      document, // CNPJ
      contactName,
      contactEmail,
      contactPhone,
    } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Nome, email e telefone são obrigatórios',
      });
    }

    // Verificar se email já existe
    const existingClient = await prisma.client.findUnique({
      where: { email },
    });

    if (existingClient) {
      return res.status(400).json({
        success: false,
        error: 'Este email já está registrado',
      });
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        companyName,
        address,
        city,
        state,
        zipCode,
        document,
        contactName,
        contactEmail,
        contactPhone,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      data: client,
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar cliente',
    });
  }
};

// Atualizar cliente
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      companyName,
      address,
      city,
      state,
      zipCode,
      document,
      contactName,
      contactEmail,
      contactPhone,
    } = req.body;

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(companyName && { companyName }),
        ...(address && { address }),
        ...(city && { city }),
        ...(state && { state }),
        ...(zipCode && { zipCode }),
        ...(document && { document }),
        ...(contactName && { contactName }),
        ...(contactEmail && { contactEmail }),
        ...(contactPhone && { contactPhone }),
      },
    });

    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      data: client,
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar cliente',
    });
  }
};

// Deletar cliente
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se tem chaves de acesso ativas
    const activeKeys = await prisma.accessKey.findMany({
      where: {
        clientId: id,
        status: 'active',
      },
    });

    if (activeKeys.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível deletar cliente com chaves de acesso ativas. Desative as chaves primeiro.',
      });
    }

    await prisma.client.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Cliente deletado com sucesso',
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar cliente',
    });
  }
};

// Obter estatísticas do cliente
export const getClientStats = async (req, res) => {
  try {
    const { id } = req.params;

    const keyCount = await prisma.accessKey.count({
      where: { clientId: id },
    });

    const activeKeyCount = await prisma.accessKey.count({
      where: {
        clientId: id,
        status: 'active',
      },
    });

    res.json({
      success: true,
      data: {
        keyCount,
        activeKeyCount,
      },
    });
  } catch (error) {
    console.error('Error getting client stats:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter estatísticas',
    });
  }
};

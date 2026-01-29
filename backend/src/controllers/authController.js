
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

// Register new user (by nickname)
export const register = async (req, res) => {
  try {
    const { name, nickname, password, phone, role = 'operator' } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { nickname },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já existe com este nome de usuário',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        nickname,
        password: hashedPassword,
        phone,
        role,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, nickname: user.nickname, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          nickname: user.nickname,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário',
      error: error.message,
    });
  }
};

// Login (by nickname)
export const login = async (req, res) => {
    console.log('REQ.BODY LOGIN:', req.body);
  try {
    const { nickname, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { nickname },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
      });
    }

    // Check if user is active
    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: 'Usuário inativo',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, nickname: user.nickname, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          nickname: user.nickname,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login',
      error: error.message,
    });
  }
};

// Get current user
export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        nickname: true,
        phone: true,
        role: true,
        active: true,
        createdAt: true,
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
      data: { user },
    });
  } catch (error) {
    console.error('Error in me:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuário',
      error: error.message,
    });
  }
};

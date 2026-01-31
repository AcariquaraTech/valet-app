// Renova o token JWT
export const refreshToken = async (req, res) => {
  try {
    // Permitir token tanto no corpo quanto no header Authorization
    let token = req.body.token;
    if (!token && req.headers['authorization']) {
      const authHeader = req.headers['authorization'];
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }
    console.log('[refreshToken] Token recebido:', token);
    if (!token) {
      return res.status(400).json({ error: 'Token não fornecido' });
    }
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', { ignoreExpiration: true });
    } catch (err) {
      console.error('[refreshToken] Erro ao verificar token:', err.message);
      return res.status(401).json({ error: 'Token inválido' });
    }
    // Remove campos sensíveis e datas antigas
    const { iat, exp, ...userData } = payload;
    // Gera novo token
    const newToken = jwt.sign(userData, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '8h' });
    res.json({ token: newToken });
  } catch (err) {
    console.error('[refreshToken] Erro inesperado:', err.message);
    res.status(500).json({ error: 'Erro ao renovar token', message: err.message });
  }
};

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
    console.log('[REGISTER] Usuário existente?', !!existingUser);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já existe com este nome de usuário',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('[REGISTER] Senha hash gerada');

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
    console.log('[REGISTER] Usuário criado:', user.nickname);

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, nickname: user.nickname, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    console.log('[REGISTER] Token gerado:', token);

    console.log('[REGISTER] Usuário registrado com sucesso, retornando dados e token');
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
  console.log('[LOGIN] Body recebido:', req.body);
  try {
    const { nickname, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { nickname },
    });
    console.log('[LOGIN] Usuário encontrado:', user ? user.nickname : 'NÃO ENCONTRADO');

    if (!user) {
      console.log('[LOGIN] Usuário não encontrado');
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
      });
    }

    // Check if user is active
    if (!user.active) {
      console.log('[LOGIN] Usuário inativo');
      return res.status(403).json({
        success: false,
        message: 'Usuário inativo',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('[LOGIN] Senha válida?', isPasswordValid);

    if (!isPasswordValid) {
      console.log('[LOGIN] Senha inválida');
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
    console.log('[LOGIN] Token gerado:', token);

    console.log('[LOGIN] Login realizado com sucesso, retornando dados e token');
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

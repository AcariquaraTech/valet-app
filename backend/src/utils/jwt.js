import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export const generateToken = (userId, companyId, accessKeyId, role) => {
  const token = jwt.sign(
    {
      userId,
      companyId,
      accessKeyId,
      role,
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiry,
    }
  );
  console.log('[JWT] Token gerado (generateToken):', token);
  return token;
};

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    console.log('[JWT] Token verificado com sucesso:', decoded);
    return decoded;
  } catch (error) {
    console.log('[JWT] Erro ao verificar token:', error.message);
    throw new Error('Token inválido ou expirado');
  }
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};

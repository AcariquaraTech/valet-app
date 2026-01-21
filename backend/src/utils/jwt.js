import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export const generateToken = (userId, companyId, accessKeyId, role) => {
  return jwt.sign(
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
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    throw new Error('Token inválido ou expirado');
  }
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};

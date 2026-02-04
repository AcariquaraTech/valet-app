import { verifyToken } from '../utils/jwt.js';

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log('[MIDDLEWARE] Authorization header:', authHeader);
    if (!token) {
      console.log('[MIDDLEWARE] Token não fornecido');
      return res.status(401).json({
        error: 'Token não fornecido',
        code: 'MISSING_TOKEN',
      });
    }
    const decoded = verifyToken(token);
    console.log('[MIDDLEWARE] Token decodificado:', decoded);
    req.user = decoded;
    
    // Garantir que valetClientId está disponível
    if (!req.user.valetClientId) {
      console.warn('[MIDDLEWARE] AVISO: usuário sem valetClientId, pode causar problemas de isolamento');
    }
    
    next();
  } catch (error) {
    console.log('[MIDDLEWARE] Token inválido ou expirado:', error.message);
    return res.status(401).json({
      error: 'Token inválido ou expirado',
      code: 'INVALID_TOKEN',
    });
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Não autenticado',
        code: 'NOT_AUTHENTICATED',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Acesso não permitido',
        code: 'FORBIDDEN',
      });
    }

    next();
  };
};

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  res.status(statusCode).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

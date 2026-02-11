import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/index.js';
import { authenticateToken, errorHandler } from './middleware/auth.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import ocrRoutes from './routes/ocrRoutes.js';
import smsRoutes from './routes/smsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import accessKeyRoutes from './routes/accessKeyRoutes.js';
import { validateAccessKey } from './controllers/accessKeyController.js';
import clientRoutes from './routes/clientRoutes.js';
import accessKeyAdminRoutes from './routes/accessKeyAdminRoutes.js';

const app = express();

// Middleware
app.use(helmet());
// CORS permissivo para mobile e admin panel
app.use(cors({
  origin: (origin, callback) => {
    // Permitir qualquer origem (útil para desenvolvimento)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend API is healthy',
    timestamp: new Date().toISOString(),
  });
});
// Endpoint de teste para validar deploy
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend foi deployado com sucesso!', timestamp: new Date().toISOString() });
});
// Rota direta para validar chave (garante disponibilidade do endpoint)
app.post('/api/access-keys/validate', (req, res, next) => {
  console.log('[DEBUG] validate route hit:', req.method, req.path);
  next();
}, validateAccessKey);
app.use('/api/vehicles', authenticateToken, vehicleRoutes);
app.use('/api/reports', authenticateToken, reportRoutes);
app.use('/api/ocr', authenticateToken, ocrRoutes);
app.use('/api/sms', authenticateToken, smsRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/access-keys', accessKeyRoutes);

// Admin Routes (with authentication)
app.use('/api/admin/clients', authenticateToken, clientRoutes);
app.use('/api/admin/access-keys', authenticateToken, accessKeyAdminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    code: 'NOT_FOUND',
    path: req.path,
  });
});

// Error Handler
app.use(errorHandler);

// Server
const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     APP VALET - Backend Running        ║
║     Servidor na porta ${PORT}                  ║
║     Ambiente: ${config.nodeEnv}              ║
╚════════════════════════════════════════╝
  `);
});

// Handlers para evitar crashes
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

server.on('clientError', (err, socket) => {
  console.error('[CLIENT ERROR]', err);
  if (socket.writable) {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  }
});

export default app;

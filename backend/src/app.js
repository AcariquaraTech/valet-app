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

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
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
app.use('/api/vehicles', authenticateToken, vehicleRoutes);
app.use('/api/reports', authenticateToken, reportRoutes);
app.use('/api/ocr', authenticateToken, ocrRoutes);
app.use('/api/sms', authenticateToken, smsRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/access-keys', accessKeyRoutes);

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

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     APP VALET - Backend Running        ║
║     Servidor na porta ${PORT}                  ║
║     Ambiente: ${config.nodeEnv}              ║
╚════════════════════════════════════════╝
  `);
});

export default app;

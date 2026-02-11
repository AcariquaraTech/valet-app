// Prisma Client Instance
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
  // Timeout para queries (em ms)
  // Padrão é Infinity, vamos usar 10 segundos
});

// Identificar e prevenir desconexões
prisma.$on('error', e => {
  console.error('[PRISMA ERROR]', e);
});

prisma.$on('warn', e => {
  console.warn('[PRISMA WARN]', e);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('[Prisma] Desconectando gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('[Prisma] Desconectando gracefully (SIGTERM)...');
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;

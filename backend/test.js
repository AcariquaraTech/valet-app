// Test Script - Register User and Test API
import prisma from './src/lib/prisma.js';
import bcrypt from 'bcryptjs';

async function test() {
  try {
    console.log('🔄 Testando conexão com banco...');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Conectado ao banco!');

    // Create admin user
    const hashedPassword = await bcrypt.hash('senha123', 10);
    
    const user = await prisma.user.create({
      data: {
        name: 'Admin Valet',
        email: 'admin@valet.com',
        password: hashedPassword,
        phone: '11987654321',
        role: 'admin',
      },
    });

    console.log('✅ Usuário criado:', user);

    // List all users
    const users = await prisma.user.findMany();
    console.log('📋 Total de usuários:', users.length);

    await prisma.$disconnect();
    console.log('✅ Teste concluído!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

test();

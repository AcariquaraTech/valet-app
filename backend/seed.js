import prisma from './src/lib/prisma.js';
import bcrypt from 'bcryptjs';
import { generateAccessKeyCode } from './src/utils/crypto.js';

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  try {
    // 1. Criar Client (Valet) de teste
    const client = await prisma.client.create({
      data: {
        name: 'Valet Demo',
        email: 'admin@valet-demo.com.br',
        phone: '11999999999',
        companyName: 'APP Valet Demo',
        address: 'Rua Exemplo, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        document: '12345678000190',
      },
    });
    console.log('✅ Client criado:', client.id, client.name);

    // 2. Criar usuário admin
    const hashedPassword = await bcrypt.hash('admin', 10);
    const user = await prisma.user.create({
      data: {
        name: 'Administrador Demo',
        nickname: 'admin',
        password: hashedPassword,
        phone: '11999999999',
        email: 'admin@valet-demo.com.br',
        role: 'admin',
      },
    });
    console.log('✅ Usuário criado:', user.nickname);

    // 3. Criar Access Key
    const accessKeyCode = generateAccessKeyCode();
    const accessKey = await prisma.accessKey.create({
      data: {
        code: accessKeyCode,
        clientId: client.id, // NOVO: obrigatório vincular ao client
        clientName: client.name,
        companyName: client.companyName,
        clientEmail: client.email,
        clientPhone: client.phone,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
        status: 'active',
      },
    });
    console.log('✅ Access Key criada:', accessKey.code);

    // 4. Vincular usuário à access key
    await prisma.accessKey.update({
      where: { id: accessKey.id },
      data: {
        users: {
          connect: { id: user.id },
        },
      },
    });
    console.log('✅ Usuário vinculado à Access Key');

    console.log('\n═══════════════════════════════════════');
    console.log('📱 CREDENCIAIS PARA LOGIN NO APP:');
    console.log('═══════════════════════════════════════');
    console.log('Usuário:', user.nickname);
    console.log('Senha:', 'admin');
    console.log('Access Key Code:', accessKey.code);
    console.log('═══════════════════════════════════════\n');

    console.log('✅ Seed concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

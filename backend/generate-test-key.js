import prisma from './src/lib/prisma.js';

async function generateTestKey() {
  try {
    const key = await prisma.accessKey.create({
      data: {
        code: 'VALET-TEST2026DEMO',
        clientName: 'Teste João',
        clientEmail: 'joao@teste.com',
        clientPhone: '11999999999',
        status: 'active',
        expiresAt: new Date('2026-12-31T23:59:59Z'),
      },
    });

    console.log('✅ Chave gerada com sucesso!');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 CHAVE DE ACESSO PARA TESTE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Código:        ${key.code}`);
    console.log(`Cliente:       ${key.clientName}`);
    console.log(`Email:         ${key.clientEmail}`);
    console.log(`Telefone:      ${key.clientPhone}`);
    console.log(`Status:        ${key.status}`);
    console.log(`Válida até:    ${key.expiresAt.toLocaleDateString('pt-BR')}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('Use essa chave no app para testar!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

generateTestKey();

// Script de Migração: SQLite → PostgreSQL (Railway)
// Migra todos os dados preservando IDs e relações

import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';

// Cliente para PostgreSQL (Railway)
const postgresClient = new PrismaClient();

// Cliente para SQLite (local)
const sqlite = new Database('./prisma/dev.db', { readonly: true });

async function migrateData() {
  console.log('🚀 Iniciando migração SQLite → PostgreSQL (Railway)...\n');

  try {
    // Limpar dados existentes no Railway (para evitar conflitos)
    console.log('🧹 Limpando dados existentes no Railway...');
    await postgresClient.vehicleEntry.deleteMany({});
    await postgresClient.vehicle.deleteMany({});
    await postgresClient.accessKey.deleteMany({});
    await postgresClient.user.deleteMany({});
    await postgresClient.client.deleteMany({});
    console.log('   ✅ Dados limpos\n');

    // 1. Migrar Clients
    console.log('📦 Migrando Clients...');
    const clients = sqlite.prepare('SELECT * FROM clients').all();
    console.log(`   Encontrados: ${clients.length} clients`);
    
    for (const client of clients) {
      await postgresClient.client.upsert({
        where: { id: client.id },
        update: {},
        create: {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          companyName: client.companyName,
          address: client.address,
          city: client.city,
          state: client.state,
          zipCode: client.zipCode,
          document: client.document,
          contactName: client.contactName,
          contactEmail: client.contactEmail,
          contactPhone: client.contactPhone,
          active: Boolean(client.active),
          createdAt: new Date(client.createdAt),
          updatedAt: new Date(client.updatedAt)
        }
      });
    }
    console.log('   ✅ Clients migrados\n');

    // 2. Migrar Users
    console.log('👥 Migrando Users...');
    const users = sqlite.prepare('SELECT * FROM users').all();
    console.log(`   Encontrados: ${users.length} users`);
    
    for (const user of users) {
      await postgresClient.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          name: user.name,
          nickname: user.nickname,
          password: user.password,
          phone: user.phone,
          email: user.email,
          role: user.role,
          active: Boolean(user.active),
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt)
        }
      });
    }
    console.log('   ✅ Users migrados\n');

    // 3. Migrar Access Keys
    console.log('🔑 Migrando Access Keys...');
    const accessKeys = sqlite.prepare('SELECT * FROM access_keys').all();
    console.log(`   Encontrados: ${accessKeys.length} access keys`);
    
    for (const key of accessKeys) {
      // Buscar usuários vinculados a esta access key
      const userIds = sqlite.prepare(
        'SELECT B as userId FROM _UserAccessKeys WHERE A = ?'
      ).all(key.id).map(row => row.userId);

      await postgresClient.accessKey.upsert({
        where: { id: key.id },
        update: {},
        create: {
          id: key.id,
          code: key.code,
          clientId: key.clientId,
          clientName: key.clientName,
          companyName: key.companyName,
          clientEmail: key.clientEmail,
          clientPhone: key.clientPhone,
          observations: key.observations,
          status: key.status,
          expiresAt: key.expiresAt ? new Date(key.expiresAt) : null,
          revokedAt: key.revokedAt ? new Date(key.revokedAt) : null,
          revokedReason: key.revokedReason,
          lastValidatedAt: key.lastValidatedAt ? new Date(key.lastValidatedAt) : null,
          deviceId: key.deviceId,
          createdAt: new Date(key.createdAt),
          updatedAt: new Date(key.updatedAt),
          users: {
            connect: userIds.map(userId => ({ id: userId }))
          }
        }
      });
    }
    console.log('   ✅ Access Keys migradas\n');

    // 4. Migrar Vehicles
    console.log('🚗 Migrando Vehicles...');
    const vehicles = sqlite.prepare('SELECT * FROM vehicles').all();
    console.log(`   Encontrados: ${vehicles.length} vehicles`);
    
    for (const vehicle of vehicles) {
      await postgresClient.vehicle.upsert({
        where: { id: vehicle.id },
        update: {},
        create: {
          id: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          plate: vehicle.plate,
          model: vehicle.model,
          color: vehicle.color,
          year: vehicle.year,
          clientId: vehicle.clientId,
          clientName: vehicle.clientName,
          clientPhone: vehicle.clientPhone,
          notes: vehicle.notes,
          valetClientId: vehicle.valetClientId,
          createdAt: new Date(vehicle.createdAt),
          updatedAt: new Date(vehicle.updatedAt)
        }
      });
    }
    console.log('   ✅ Vehicles migrados\n');

    // 5. Migrar Vehicle Entries
    console.log('📊 Migrando Vehicle Entries...');
    const entries = sqlite.prepare('SELECT * FROM vehicle_entries').all();
    console.log(`   Encontrados: ${entries.length} entries`);
    
    for (const entry of entries) {
      await postgresClient.vehicleEntry.upsert({
        where: { id: entry.id },
        update: {},
        create: {
          id: entry.id,
          entryNumber: entry.entryNumber,
          vehicleId: entry.vehicleId,
          operatorId: entry.operatorId,
          valetClientId: entry.valetClientId,
          entryTime: new Date(entry.entryTime),
          exitTime: entry.exitTime ? new Date(entry.exitTime) : null,
          spotNumber: entry.spotNumber,
          observations: entry.observations,
          totalPrice: entry.totalPrice,
          status: entry.status,
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt)
        }
      });
    }
    console.log('   ✅ Vehicle Entries migrados\n');

    // 7. Verificar dados migrados
    console.log('🔍 Verificando migração...');
    const counts = {
      clients: await postgresClient.client.count(),
      users: await postgresClient.user.count(),
      accessKeys: await postgresClient.accessKey.count(),
      vehicles: await postgresClient.vehicle.count(),
      entries: await postgresClient.vehicleEntry.count()
    };
    
    console.log('\n📊 Resumo da Migração:');
    console.log(`   Clients: ${counts.clients}`);
    console.log(`   Users: ${counts.users}`);
    console.log(`   Access Keys: ${counts.accessKeys}`);
    console.log(`   Vehicles: ${counts.vehicles}`);
    console.log(`   Vehicle Entries: ${counts.entries}`);
    
    console.log('\n✅ Migração concluída com sucesso!');
    console.log('🎉 Todos os dados foram transferidos para o Railway');

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    sqlite.close();
    await postgresClient.$disconnect();
  }
}

// Executar migração
migrateData()
  .catch((error) => {
    console.error('❌ Falha na migração:', error);
    process.exit(1);
  });

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Script de Backup Automático do Banco PostgreSQL
 * 
 * USO:
 * - Local: node scripts/backup-database.js
 * - Agendado (cron): 0 2 * * * node /path/to/backup-database.js
 */

const BACKUP_DIR = path.join(__dirname, '../../backups');
const DATABASE_URL = process.env.DATABASE_URL;
const MAX_BACKUPS = 30; // Manter últimos 30 backups

async function createBackup() {
  try {
    console.log('🔄 Iniciando backup do banco de dados...');

    // Criar pasta de backups se não existir
    await fs.mkdir(BACKUP_DIR, { recursive: true });

    // Nome do arquivo com timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `backup-${timestamp}-${time}.sql`;
    const filepath = path.join(BACKUP_DIR, filename);

    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL não configurada no .env');
    }

    // Extrair componentes da URL
    const url = new URL(DATABASE_URL);
    const host = url.hostname;
    const port = url.port || 5432;
    const database = url.pathname.substring(1);
    const username = url.username;
    const password = url.password;

    console.log(`📦 Fazendo backup de: ${database}@${host}`);

    // Usar pg_dump para criar backup
    const command = process.platform === 'win32'
      ? `set PGPASSWORD=${password}&& pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -F c -f "${filepath}"`
      : `PGPASSWORD=${password} pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -F c -f "${filepath}"`;

    await execAsync(command);

    // Verificar tamanho do arquivo
    const stats = await fs.stat(filepath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`✅ Backup criado com sucesso!`);
    console.log(`📁 Arquivo: ${filename}`);
    console.log(`💾 Tamanho: ${sizeMB} MB`);

    // Limpar backups antigos
    await cleanOldBackups();

    return filepath;
  } catch (error) {
    console.error('❌ Erro ao criar backup:', error.message);
    throw error;
  }
}

async function cleanOldBackups() {
  try {
    const files = await fs.readdir(BACKUP_DIR);
    const backupFiles = files
      .filter(f => f.startsWith('backup-') && f.endsWith('.sql'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        time: fs.stat(path.join(BACKUP_DIR, f)).then(s => s.mtime)
      }));

    const filesWithTime = await Promise.all(
      backupFiles.map(async f => ({
        ...f,
        time: await f.time
      }))
    );

    // Ordenar por data (mais antigo primeiro)
    filesWithTime.sort((a, b) => a.time - b.time);

    // Deletar backups excedentes
    if (filesWithTime.length > MAX_BACKUPS) {
      const toDelete = filesWithTime.slice(0, filesWithTime.length - MAX_BACKUPS);
      for (const file of toDelete) {
        await fs.unlink(file.path);
        console.log(`🗑️  Backup antigo removido: ${file.name}`);
      }
    }
  } catch (error) {
    console.error('⚠️  Erro ao limpar backups antigos:', error.message);
  }
}

async function restoreBackup(backupFile) {
  try {
    console.log('🔄 Restaurando backup do banco de dados...');

    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL não configurada no .env');
    }

    const url = new URL(DATABASE_URL);
    const host = url.hostname;
    const port = url.port || 5432;
    const database = url.pathname.substring(1);
    const username = url.username;
    const password = url.password;

    const command = process.platform === 'win32'
      ? `set PGPASSWORD=${password}&& pg_restore -h ${host} -p ${port} -U ${username} -d ${database} -c "${backupFile}"`
      : `PGPASSWORD=${password} pg_restore -h ${host} -p ${port} -U ${username} -d ${database} -c "${backupFile}"`;

    await execAsync(command);

    console.log(`✅ Backup restaurado com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao restaurar backup:', error.message);
    throw error;
  }
}

// Executar backup se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'restore' && args[1]) {
    restoreBackup(args[1])
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    createBackup()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}

export { createBackup, restoreBackup };

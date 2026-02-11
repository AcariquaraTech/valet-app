#!/usr/bin/env node

/**
 * DIAGNOSTIC SCRIPT - APP VALET BACKEND
 * Testa cada componente para identificar o problema
 */

import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const BASE_URL = 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testDatabaseConnection() {
  log(colors.cyan, '\n=== TEST 1: Database Connection ===');
  try {
    // Try importing Prisma
    const { default: prisma } = await import('../src/lib/prisma.js');
    
    log(colors.yellow, 'Tentando conectar ao banco...');
    
    // Try simple query with timeout
    const promise = prisma.client.findMany({
      take: 1,
    });
    
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database query timeout after 5s')), 5000)
    );
    
    const result = await Promise.race([promise, timeoutPromise]);
    
    log(colors.green, '✓ Database connection OK - consulta respondeu em tempo');
    await prisma.$disconnect();
    return true;
  } catch (error) {
    log(colors.red, `✗ Database connection FAILED: ${error.message}`);
    return false;
  }
}

async function testHealthEndpoint() {
  log(colors.cyan, '\n=== TEST 2: Health Endpoint ===');
  try {
    const startTime = Date.now();
    const response = await axios.get(`${BASE_URL}/health`, {
      timeout: 3000,
    });
    const elapsed = Date.now() - startTime;
    
    log(colors.green, `✓ /health responded in ${elapsed}ms`);
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    log(colors.red, `✗ /health FAILED: ${error.message}`);
    return false;
  }
}

async function testValidateEndpoint() {
  log(colors.cyan, '\n=== TEST 3: Validate Access Key Endpoint ===');
  try {
    const startTime = Date.now();
    const response = await axios.post(
      `${BASE_URL}/api/access-keys/validate`,
      {
        code: 'VALET-INVALID-TEST',
        deviceId: 'test-device',
        appVersion: '1.0.0',
        osVersion: 'test',
      },
      { timeout: 5000 }
    );
    const elapsed = Date.now() - startTime;
    
    log(colors.green, `✓ /validate responded in ${elapsed}ms`);
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    if (error.response) {
      const elapsed = Date.now() - (error.config?.startTime || 0);
      log(colors.yellow, `✓ /validate responded in ${error.response.status} - ${elapsed}ms`);
      console.log('Error Response:', error.response.data);
      return true; // Expected - invalid key
    } else {
      log(colors.red, `✗ /validate FAILED: ${error.message}`);
      return false;
    }
  }
}

async function testSequentialRequests() {
  log(colors.cyan, '\n=== TEST 4: Sequential Requests (Check for 3s crash) ===');
  try {
    for (let i = 1; i <= 5; i++) {
      log(colors.yellow, `Request ${i}...`);
      const startTime = Date.now();
      
      try {
        await axios.get(`${BASE_URL}/api/health`, { timeout: 3000 });
        const elapsed = Date.now() - startTime;
        log(colors.green, `  ✓ Responded in ${elapsed}ms`);
      } catch (err) {
        const elapsed = Date.now() - startTime;
        log(colors.red, `  ✗ Failed after ${elapsed}ms: ${err.message}`);
      }
      
      await wait(1000); // Wait 1s between requests
    }
    return true;
  } catch (error) {
    log(colors.red, `Sequential test error: ${error.message}`);
    return false;
  }
}

async function testDatabasePool() {
  log(colors.cyan, '\n=== TEST 5: Database Pool Status ===');
  try {
    const { default: prisma } = await import('../src/lib/prisma.js');
    
    // Try multiple concurrent queries
    const promises = Array(5).fill(null).map((_, i) =>
      prisma.client.count().catch(err => `Error ${i}: ${err.message}`)
    );
    
    const results = await Promise.allSettled(promises);
    
    let success = 0;
    let failed = 0;
    
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        log(colors.green, `  ✓ Query ${i} succeeded`);
        success++;
      } else {
        log(colors.red, `  ✗ Query ${i} failed: ${result.reason}`);
        failed++;
      }
    });
    
    log(colors.yellow, `\nSummary: ${success} succeeded, ${failed} failed`);
    
    await prisma.$disconnect();
    return failed === 0;
  } catch (error) {
    log(colors.red, `Pool test error: ${error.message}`);
    return false;
  }
}

async function main() {
  log(colors.blue, '╔════════════════════════════════════════╗');
  log(colors.blue, '║    APP VALET - DIAGNOSTIC SCRIPT       ║');
  log(colors.blue, '╚════════════════════════════════════════╝\n');

  const results = {
    database: false,
    health: false,
    validate: false,
    sequential: false,
    pool: false,
  };

  // Test 1: Database
  log(colors.yellow, 'Aguarde 10s para teste de banco...');
  await wait(2000);
  // results.database = await testDatabaseConnection();

  // Test 2: Health
  log(colors.yellow, 'Testando /health endpoint...');
  await wait(1000);
  results.health = await testHealthEndpoint();

  // Test 3: Validate
  log(colors.yellow, 'Testando /validate endpoint...');
  await wait(1000);
  results.validate = await testValidateEndpoint();

  // Test 4: Sequential
  log(colors.yellow, 'Testando requisições sequenciais...');
  await wait(1000);
  results.sequential = await testSequentialRequests();

  // Summary
  log(colors.blue, '\n╔════════════════════════════════════════╗');
  log(colors.blue, '║           RESUMO FINAL                 ║');
  log(colors.blue, '╚════════════════════════════════════════╝\n');

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✓ PASS' : '✗ FAIL';
    const color = passed ? colors.green : colors.red;
    log(color, `${status.padEnd(8)} - ${test}`);
  });

  const passCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.values(results).length;

  log(colors.cyan, `\nTotal: ${passCount}/${totalCount} testes passaram`);

  if (passCount === totalCount) {
    log(colors.green, '\n✓ Sistema está funcionando normalmente!');
  } else {
    log(colors.red, '\n✗ Existem problemas a investigar');
  }
}

main().catch(err => {
  log(colors.red, `Erro fatal: ${err.message}`);
  process.exit(1);
});

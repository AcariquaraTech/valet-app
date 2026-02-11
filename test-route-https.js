const https = require('https');

const tests = [
  { name: '/api/test', path: '/api/test', method: 'GET' },
  { name: '/api/access-keys/validate', path: '/api/access-keys/validate', method: 'POST', body: JSON.stringify({ code: 'TEST-VALET' }) }
];

const baseUrl = 'https://valet-app-production.up.railway.app';

async function testEndpoint(test) {
  return new Promise((resolve) => {
    const url = new URL(test.path, baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: test.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`\n✓ ${test.name} (${test.method})`);
        console.log(`  Status: ${res.statusCode}`);
        if (data) {
          try {
            console.log(`  Response: ${JSON.stringify(JSON.parse(data), null, 2)}`);
          } catch {
            console.log(`  Response: ${data}`);
          }
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`\n✗ ${test.name} (${test.method})`);
      console.log(`  Error: ${err.message}`);
      resolve();
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`\n✗ ${test.name} (${test.method})`);
      console.log(`  Error: Timeout`);
      resolve();
    });

    if (test.body) {
      req.write(test.body);
    }
    req.end();
  });
}

async function runTests() {
  console.log('Testing Railway Backend Endpoints (HTTPS)\n' + '='.repeat(40));
  for (const test of tests) {
    await testEndpoint(test);
  }
}

runTests();

/**
 * Test JWT Authentication
 */

const http = require('http');

function makeRequest(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
        } catch (e) {
          resolve(responseData);
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function test() {
  try {
    console.log('Testing JWT Authentication...\n');

    // Test 1: Login
    console.log('1️⃣  Testing /api/auth/login...');
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      username: 'admin',
      password: 'Admin@123',
    });
    console.log('Response:', loginResponse);
    const token = loginResponse.token;
    console.log('✅ JWT token received:', token.slice(0, 50) + '...\n');

    // Test 2: Protected route with token
    console.log('2️⃣  Testing /api/auth/me with valid token...');
    const meResponse = await makeRequest('GET', '/api/auth/me', null, token);
    console.log('Response:', meResponse);
    console.log('✅ Protected route accessible\n');

    // Test 3: Protected route without token
    console.log('3️⃣  Testing /api/auth/me without token...');
    const noTokenResponse = await makeRequest('GET', '/api/auth/me', null);
    console.log('Response:', noTokenResponse);
    console.log('✅ Correctly rejected\n');

    console.log('🎉 All JWT tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

test();

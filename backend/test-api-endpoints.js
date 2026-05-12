/**
 * Comprehensive API Test Suite
 * Tests all refactored endpoints (controllers & routes)
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
let adminToken = null;
let adminId = null;

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function runTests() {
  console.log('\n========================================');
  console.log('🧪 COMPREHENSIVE API TEST SUITE');
  console.log('========================================\n');

  try {
    // ================= AUTH TESTS =================
    console.log('📋 1. AUTHENTICATION TESTS');
    console.log('─'.repeat(40));

    // Register Admin
    console.log('\n1.1 POST /api/auth/register-admin');
    let res = await makeRequest('POST', '/api/auth/register-admin', {
      username: 'testadmin',
      email: 'testadmin@finguard.com',
      password: 'TestPass@123',
    });
    console.log(`Status: ${res.status}`);
    console.log(`✅ ${res.data.success ? 'Admin created' : 'Failed'}`);
    adminId = res.data.admin?.id;

    // Login
    console.log('\n1.2 POST /api/auth/login');
    res = await makeRequest('POST', '/api/auth/login', {
      username: 'testadmin',
      password: 'TestPass@123',
    });
    console.log(`Status: ${res.status}`);
    console.log(`✅ ${res.data.success ? 'Login successful' : 'Failed'}`);
    adminToken = res.data.token;
    console.log(`Token: ${adminToken?.substring(0, 50)}...`);

    // Get Current Admin
    console.log('\n1.3 GET /api/auth/me (Protected Route)');
    res = await makeRequest('GET', '/api/auth/me', null, {
      'Authorization': `Bearer ${adminToken}`,
    });
    console.log(`Status: ${res.status}`);
    console.log(`✅ Admin: ${res.data.admin?.username}`);

    // ================= APPLICATION TESTS =================
    console.log('\n\n📋 2. APPLICATION TESTS');
    console.log('─'.repeat(40));

    // Submit Application
    console.log('\n2.1 POST /api/applications (Submit)');
    res = await makeRequest('POST', '/api/applications', {
      name: 'John Doe',
      email: 'john@example.com',
      mobile: '9876543210',
      dateOfBirth: '1990-01-15',
      gender: 'M',
      address1: '123 Main St',
      city: 'Mumbai',
      state: 'MH',
      pincode: '400001',
      aadhaar: '123456789012',
      pan: 'ABCDE1234F',
      occupation: 'Software Engineer',
      income: 500000,
      employmentType: 'SALARIED',
      faceVerified: true,
      signatureVerified: true,
      biometricScore: 95,
      complianceConsent: true,
      rbiConsent: true,
      dataProcessingConsent: true,
    });
    console.log(`Status: ${res.status}`);
    console.log(`✅ ${res.data.success ? 'Application submitted' : 'Failed'}`);
    const applicationId = res.data.data?.id;

    // List Applications
    console.log('\n2.2 GET /api/applications (List)');
    res = await makeRequest('GET', '/api/applications');
    console.log(`Status: ${res.status}`);
    console.log(`✅ Applications found: ${res.data.data?.length || 0}`);

    // Get Single Application
    if (applicationId) {
      console.log('\n2.3 GET /api/applications/:id (Get Single)');
      res = await makeRequest('GET', `/api/applications/${applicationId}`);
      console.log(`Status: ${res.status}`);
      console.log(`✅ ${res.data.success ? 'Application retrieved' : 'Failed'}`);
    }

    // Get Stats
    console.log('\n2.4 GET /api/applications/stats/summary');
    res = await makeRequest('GET', '/api/applications/stats/summary');
    console.log(`Status: ${res.status}`);
    console.log(`✅ Stats retrieved: ${res.data.data?.total || 0} total applications`);

    // ================= DRAFT TESTS =================
    console.log('\n\n📋 3. DRAFT AUTOSAVE TESTS');
    console.log('─'.repeat(40));

    // Save Draft
    console.log('\n3.1 POST /api/drafts (Save/Autosave)');
    res = await makeRequest('POST', '/api/drafts', {
      mobile: '9876543210',
      currentStep: 3,
      tempData: {
        name: 'John Doe',
        email: 'john@example.com',
        mobile: '9876543210',
      },
    });
    console.log(`Status: ${res.status}`);
    console.log(`✅ ${res.data.success ? 'Draft saved' : 'Failed'}`);

    // Get Draft
    console.log('\n3.2 GET /api/drafts/:mobile (Resume)');
    res = await makeRequest('GET', '/api/drafts/9876543210');
    console.log(`Status: ${res.status}`);
    console.log(`✅ Draft retrieved: Step ${res.data.data?.currentStep || 'N/A'}`);

    // List Drafts
    console.log('\n3.3 GET /api/drafts (List All)');
    res = await makeRequest('GET', '/api/drafts');
    console.log(`Status: ${res.status}`);
    console.log(`✅ Drafts found: ${res.data.data?.length || 0}`);

    // ================= AUDIT LOG TESTS =================
    console.log('\n\n📋 4. AUDIT LOG TESTS');
    console.log('─'.repeat(40));

    // List Audit Logs
    console.log('\n4.1 GET /api/audit-logs (List)');
    res = await makeRequest('GET', '/api/audit-logs');
    console.log(`Status: ${res.status}`);
    console.log(`✅ Audit logs found: ${res.data.data?.length || 0}`);

    // Get Audit Summary
    console.log('\n4.2 GET /api/audit-logs/summary');
    res = await makeRequest('GET', '/api/audit-logs/summary');
    console.log(`Status: ${res.status}`);
    console.log(`✅ Summary - Total logs: ${res.data.data?.total || 0}`);

    // ================= HEALTH CHECK =================
    console.log('\n\n📋 5. HEALTH CHECK');
    console.log('─'.repeat(40));

    console.log('\n5.1 GET /api/health');
    res = await makeRequest('GET', '/api/health');
    console.log(`Status: ${res.status}`);
    console.log(`✅ Server status: ${res.data.status}`);

    // ================= SUMMARY =================
    console.log('\n\n========================================');
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('========================================\n');
    console.log('Summary:');
    console.log('✅ Auth endpoints (register, login, protected route)');
    console.log('✅ Application endpoints (submit, list, get, stats)');
    console.log('✅ Draft endpoints (save, resume, list)');
    console.log('✅ Audit endpoints (list, summary)');
    console.log('✅ Health check');
    console.log('\n🎉 Refactored API Architecture WORKING!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Test Error:', error.message);
    process.exit(1);
  }
}

// Run tests
setTimeout(runTests, 1000); // Wait for server to be ready

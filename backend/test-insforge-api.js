/**
 * 测试 InsForge API 连接
 * 运行: node backend/test-insforge-api.js
 */

const INSFORGE_CONFIG = {
  API_KEY: 'ik_39bb1da4b36fb9faef1047c398f44bf8',
  API_BASE_URL: 'https://zrqg6y6j.us-west.insforge.app'
};

async function testEndpoint(endpoint, method = 'GET', body = null) {
  const url = `${INSFORGE_CONFIG.API_BASE_URL}${endpoint}`;
  console.log(`\n📡 ${method} ${url}`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${INSFORGE_CONFIG.API_KEY}`,
        'X-API-Key': INSFORGE_CONFIG.API_KEY,
        'apikey': INSFORGE_CONFIG.API_KEY
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const text = await response.text();
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Response: ${text.substring(0, 300)}${text.length > 300 ? '...' : ''}`);
    
    return { status: response.status, ok: response.ok, body: text };
  } catch (error) {
    console.log(`   Error: ${error.message}`);
    return { error: error.message };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('InsForge API 连接测试');
  console.log('='.repeat(60));
  console.log(`Base URL: ${INSFORGE_CONFIG.API_BASE_URL}`);
  console.log(`API Key: ${INSFORGE_CONFIG.API_KEY.substring(0, 10)}...`);
  
  // 测试各种 GET 端点
  console.log('\n\n📋 测试 GET 端点...');
  
  const getEndpoints = [
    '/',
    '/api',
    '/api/tables',
    '/api/v1/tables',
    '/tables',
    '/rest/v1',
    '/health',
    '/api/health',
    '/api/tables/users',
    '/api/v1/tables/users',
    '/rest/v1/users'
  ];

  for (const endpoint of getEndpoints) {
    await testEndpoint(endpoint, 'GET');
  }

  // 测试 POST 到 users 表
  console.log('\n\n📝 测试 POST 端点 (users 表)...');
  
  const testUserData = {
    email: 'test@example.com',
    name: 'Test User'
  };

  const postEndpoints = [
    '/api/tables/users/rows',
    '/api/v1/tables/users/rows',
    '/api/tables/users',
    '/api/v1/tables/users',
    '/tables/users/rows',
    '/tables/users',
    '/api/users',
    '/users',
    '/rest/v1/users'
  ];

  for (const endpoint of postEndpoints) {
    await testEndpoint(endpoint, 'POST', testUserData);
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('测试完成！');
  console.log('='.repeat(60));
}

main().catch(console.error);

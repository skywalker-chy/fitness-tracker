/**
 * 直接测试 InsForge HTTP API
 * 尝试各种可能的端点格式
 */

const API_KEY = 'ik_39bb1da4b36fb9faef1047c398f44bf8';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2Njc4NDZ9.uVjGPWXdBruie4yjltrdzy_xzAWu6gcu2Sf31EtPmTw';
const BASE_URL = 'https://zrqg6y6j.us-west.insforge.app';

const testData = {
  email: 'test_' + Date.now() + '@example.com',
  name: 'Test User ' + Date.now()
};

async function tryEndpoint(endpoint, method, body, headers) {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`\n🔄 ${method} ${url}`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const text = await response.text();
    
    const status = response.ok ? '✅' : '❌';
    console.log(`   ${status} Status: ${response.status}`);
    console.log(`   Response: ${text.substring(0, 300)}`);
    
    return { ok: response.ok, status: response.status, body: text };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { ok: false, error: error.message };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('InsForge HTTP API 测试');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Data: ${JSON.stringify(testData)}`);
  console.log('');

  // 不同的认证头组合
  const authHeaders = [
    { 'Authorization': `Bearer ${API_KEY}`, 'apikey': API_KEY },
    { 'Authorization': `Bearer ${ANON_KEY}`, 'apikey': ANON_KEY },
    { 'X-API-Key': API_KEY },
    { 'api-key': API_KEY },
    { 'x-insforge-key': API_KEY },
  ];

  // 测试 GET 端点 (使用第一种认证)
  console.log('\n📋 测试 GET 端点...');
  const getEndpoints = [
    '/api/v1/tables',
    '/api/tables', 
    '/v1/tables',
    '/tables',
  ];

  for (const endpoint of getEndpoints) {
    await tryEndpoint(endpoint, 'GET', null, authHeaders[0]);
  }

  // 测试 POST 端点到 users 表
  console.log('\n\n📝 测试 POST 端点 (users 表)...');
  
  const postEndpoints = [
    '/api/v1/tables/users/rows',
    '/api/tables/users/rows',
    '/api/v1/tables/users',
    '/api/tables/users',
    '/v1/tables/users/rows',
    '/tables/users/rows',
    '/tables/users',
  ];

  for (const endpoint of postEndpoints) {
    // 尝试不同的认证方式
    for (let i = 0; i < authHeaders.length; i++) {
      const result = await tryEndpoint(endpoint, 'POST', testData, authHeaders[i]);
      if (result.ok) {
        console.log(`\n🎉 成功! 端点: ${endpoint}, 认证方式: ${i + 1}`);
        return;
      }
    }
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('所有端点测试完成');
  console.log('='.repeat(60));
  console.log('\n💡 提示: 如果所有端点都返回 404，说明 InsForge 可能:');
  console.log('   1. 不支持直接 HTTP API，只能通过 MCP 操作');
  console.log('   2. 需要先在 InsForge 控制台创建表结构');
  console.log('   3. API 端点格式不同于预期');
}

main().catch(console.error);

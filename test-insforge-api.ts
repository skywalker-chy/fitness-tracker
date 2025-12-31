/**
 * InsForge API 测试脚本
 * 测试正确的 PostgREST 端点格式: /api/database/records/{table}
 * 
 * 运行: npx ts-node test-insforge-api.ts
 */

const API_KEY = 'ik_39bb1da4b36fb9faef1047c398f44bf8';
const BASE_URL = 'https://zrqg6y6j.us-west.insforge.app';

async function testInsForgeAPI() {
  console.log('=========================================');
  console.log('InsForge API 测试');
  console.log('=========================================');
  console.log('');
  console.log('API Base URL:', BASE_URL);
  console.log('API Key:', API_KEY.substring(0, 10) + '...');
  console.log('');

  // 测试数据
  const testUser = {
    email: `test_${Date.now()}@test.com`,
    name: 'Test User',
    created_at: new Date().toISOString(),
  };

  // 测试正确的端点格式
  const endpoint = '/api/database/records/users';
  const url = `${BASE_URL}${endpoint}`;
  
  console.log('=========================================');
  console.log('测试端点:', endpoint);
  console.log('完整 URL:', url);
  console.log('=========================================');
  console.log('');
  console.log('请求数据:', JSON.stringify(testUser, null, 2));
  console.log('');

  try {
    console.log('发送 POST 请求...');
    console.log('');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'apikey': API_KEY,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(testUser),
    });

    console.log('响应状态:', response.status, response.statusText);
    console.log('响应头:');
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });
    console.log('');

    const responseText = await response.text();
    console.log('响应内容:');
    console.log(responseText);
    console.log('');

    if (response.ok || response.status === 201) {
      console.log('=========================================');
      console.log('✅ 测试成功! API 连接正常');
      console.log('=========================================');
    } else {
      console.log('=========================================');
      console.log('❌ 测试失败');
      console.log('状态码:', response.status);
      console.log('=========================================');
    }
  } catch (error: any) {
    console.log('=========================================');
    console.log('❌ 请求错误:', error.message);
    console.log('=========================================');
  }

  // 额外测试：GET 请求查看表是否存在
  console.log('');
  console.log('=========================================');
  console.log('测试 GET 请求 (查看 users 表)');
  console.log('=========================================');
  
  try {
    const getResponse = await fetch(`${BASE_URL}/api/database/records/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'apikey': API_KEY,
      },
    });
    
    console.log('GET 响应状态:', getResponse.status, getResponse.statusText);
    const getData = await getResponse.text();
    console.log('GET 响应内容:', getData.substring(0, 500));
  } catch (error: any) {
    console.log('GET 请求错误:', error.message);
  }
}

testInsForgeAPI();

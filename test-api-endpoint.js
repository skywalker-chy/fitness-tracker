/**
 * InsForge API 测试脚本 (纯 JavaScript)
 * 测试正确的 PostgREST 端点格式: /api/database/records/{table}
 * 
 * 运行: node test-api-endpoint.js
 */

const API_KEY = 'ik_39bb1da4b36fb9faef1047c398f44bf8';
const BASE_URL = 'https://zrqg6y6j.us-west.insforge.app';

async function testTable(tableName, testData) {
  console.log('');
  console.log(`=========================================`);
  console.log(`测试表: ${tableName}`);
  console.log(`=========================================`);
  
  const endpoint = `/api/database/records/${tableName}`;
  const url = `${BASE_URL}${endpoint}`;
  
  // 测试 GET
  console.log(`GET ${endpoint}...`);
  try {
    const getResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'apikey': API_KEY,
      },
    });
    console.log(`  GET 状态: ${getResponse.status} ${getResponse.statusText}`);
    const getData = await getResponse.text();
    console.log(`  GET 响应: ${getData.substring(0, 200)}`);
  } catch (error) {
    console.log(`  GET 错误: ${error.message}`);
  }
  
  // 测试 POST
  console.log(`POST ${endpoint}...`);
  console.log(`  数据: ${JSON.stringify(testData)}`);
  try {
    const postResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'apikey': API_KEY,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(testData),
    });
    console.log(`  POST 状态: ${postResponse.status} ${postResponse.statusText}`);
    const postData = await postResponse.text();
    console.log(`  POST 响应: ${postData.substring(0, 300)}`);
    
    if (postResponse.ok || postResponse.status === 201) {
      console.log(`  ✅ ${tableName} 表写入成功!`);
      return true;
    }
  } catch (error) {
    console.log(`  POST 错误: ${error.message}`);
  }
  return false;
}

async function main() {
  console.log('=========================================');
  console.log('InsForge API 全面测试');
  console.log('=========================================');
  console.log('');
  console.log('API Base URL:', BASE_URL);
  console.log('API Key:', API_KEY.substring(0, 15) + '...');
  
  // 测试 users 表
  await testTable('users', {
    email: `test_${Date.now()}@test.com`,
    name: 'Test User',
  });
  
  // 测试 accounts 表
  await testTable('accounts', {
    name: 'Test Account',
    balance: 100.00,
    icon: '💰',
    color: '#007AFF',
  });
  
  // 测试 transactions 表
  await testTable('transactions', {
    type: 'expense',
    amount: 50.00,
    category: 'Food',
    category_icon: '🍔',
    account_id: 1,
    date: new Date().toISOString().split('T')[0],
    description: 'Test transaction',
  });
  
  // 测试 courses 表
  await testTable('courses', {
    name: 'Test Course',
  });
  
  // 测试 inspirations 表
  await testTable('inspirations', {
    content: 'Test inspiration',
  });
  
  console.log('');
  console.log('=========================================');
  console.log('测试完成');
  console.log('=========================================');
}

main();

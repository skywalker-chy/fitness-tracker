/**
 * InsForge 连接诊断脚本
 * 检查与 InsForge MCP 服务器的连接状态
 */

const API_KEY = 'ik_39bb1da4b36fb9faef1047c398f44bf8';
const API_BASE_URL = 'https://zrqg6y6j.us-west.insforge.app';

async function testInsForgeConnection() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 InsForge MCP 服务器连接诊断');
  console.log('='.repeat(70));

  console.log('\n📋 配置信息:');
  console.log(`   API_KEY: ${API_KEY}`);
  console.log(`   API_BASE_URL: ${API_BASE_URL}`);

  // 测试 1: 检查基础连接
  console.log('\n\n[测试 1] 基础连接检查');
  console.log('-'.repeat(70));
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`✓ 服务器响应: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ 连接成功！响应: ${JSON.stringify(data)}`);
    } else {
      const text = await response.text();
      console.log(`⚠️ 服务器返回错误状态`);
      console.log(`   响应内容: ${text.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`❌ 连接失败: ${error.message}`);
  }

  // 测试 2: 验证认证
  console.log('\n\n[测试 2] API 认证验证');
  console.log('-'.repeat(70));
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`✓ 认证端点响应: ${response.status}`);
    
    if (response.status === 401) {
      console.log(`ℹ️ API_KEY 可能需要有效的用户认证令牌`);
    } else if (response.ok) {
      console.log(`✅ 认证有效！`);
    } else {
      console.log(`⚠️ 响应状态: ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ 测试失败: ${error.message}`);
  }

  // 测试 3: 获取数据库表信息
  console.log('\n\n[测试 3] 获取数据库表信息');
  console.log('-'.repeat(70));
  try {
    const response = await fetch(`${API_BASE_URL}/api/database/tables`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`✓ 表查询响应: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ 找到数据库表：`);
      if (Array.isArray(data)) {
        data.forEach(table => {
          console.log(`   • ${table.name || JSON.stringify(table)}`);
        });
      } else {
        console.log(`   ${JSON.stringify(data, null, 2).substring(0, 300)}`);
      }
    } else {
      const text = await response.text();
      console.log(`⚠️ 无法获取表列表`);
      console.log(`   响应: ${text.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`❌ 测试失败: ${error.message}`);
  }

  // 测试 4: 测试认证端点 (注册)
  console.log('\n\n[测试 4] 注册端点验证');
  console.log('-'.repeat(70));
  try {
    const testEmail = `test-${Date.now()}@example.com`;
    const response = await fetch(`${API_BASE_URL}/api/auth/sign-up`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'Test123456',
        user_metadata: { name: 'Test User' },
      }),
    });

    console.log(`✓ 注册端点响应: ${response.status}`);
    
    const text = await response.text();
    console.log(`   响应预览: ${text.substring(0, 200)}`);
    
    if (response.ok) {
      console.log(`✅ 注册端点正常！`);
    } else if (response.status === 400 || response.status === 409) {
      console.log(`ℹ️ 用户可能已存在，但端点可访问`);
    }
  } catch (error) {
    console.log(`❌ 测试失败: ${error.message}`);
  }

  // 测试 5: 测试数据表端点
  console.log('\n\n[测试 5] 数据表端点验证');
  console.log('-'.repeat(70));
  
  const endpoints = [
    { name: '账户表', path: '/api/accounts', method: 'GET' },
    { name: '交易表', path: '/api/transactions', method: 'GET' },
    { name: '用户表', path: '/api/courses', method: 'GET' },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const status = response.ok ? '✅' : '⚠️';
      console.log(`${status} ${endpoint.name} (${endpoint.path}): ${response.status}`);
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
    }
  }

  // 总结
  console.log('\n' + '='.repeat(70));
  console.log('📊 诊断总结');
  console.log('='.repeat(70));
  console.log(`\n✅ 配置检查:`);
  console.log(`   • API_KEY 已配置`);
  console.log(`   • API_BASE_URL: ${API_BASE_URL}`);
  console.log(`\n💡 下一步:`);
  console.log(`   1. 如果所有测试都通过，说明 InsForge 连接正常`);
  console.log(`   2. 如果有失败，检查网络连接和 API 密钥有效性`);
  console.log(`   3. 可以在应用中正常进行注册和数据同步`);
  console.log('\n' + '='.repeat(70) + '\n');
}

testInsForgeConnection().catch(console.error);

/**
 * 测试 InsForge API 连接
 */

const API_KEY = 'ik_39bb1da4b36fb9faef1047c398f44bf8';
const BASE_URL = 'https://zrqg6y6j.us-west.insforge.app';

async function testSignUp() {
  try {
    console.log('🔍 测试注册端点...');
    console.log(`API_KEY: ${API_KEY}`);
    console.log(`BASE_URL: ${BASE_URL}`);

    const url = `${BASE_URL}/auth/sign-up`;
    const body = {
      email: `test-${Date.now()}@example.com`,
      password: 'testPassword123',
      user_metadata: {
        name: 'Test User',
      },
    };

    console.log(`\n📡 发送请求到: ${url}`);
    console.log(`📦 请求体:`, JSON.stringify(body, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    console.log(`\n📊 响应状态: ${response.status}`);
    console.log(`📋 响应头:`, {
      'content-type': response.headers.get('content-type'),
      'content-length': response.headers.get('content-length'),
    });

    const responseText = await response.text();
    console.log(`\n📝 响应内容 (前 500 字符):`);
    console.log(responseText.substring(0, 500));

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('\n✅ 成功! 响应数据:', JSON.stringify(data, null, 2));
    } else {
      console.log('\n❌ 失败!');
      console.log('状态码:', response.status);
      if (responseText.includes('<!DOCTYPE')) {
        console.log('⚠️ 返回的是 HTML 而不是 JSON！');
        console.log('这通常表示:');
        console.log('  1. 端点路径错误');
        console.log('  2. API 服务器配置错误');
        console.log('  3. URL 错误');
      }
    }
  } catch (error) {
    console.error('❌ 请求失败:', error);
  }
}

async function testSignIn() {
  try {
    console.log('\n\n🔍 测试登录端点...');

    const url = `${BASE_URL}/auth/sign-in`;
    const body = {
      email: 'test@example.com',
      password: 'testPassword123',
    };

    console.log(`\n📡 发送请求到: ${url}`);
    console.log(`📦 请求体:`, JSON.stringify(body, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    console.log(`\n📊 响应状态: ${response.status}`);
    const responseText = await response.text();
    console.log(`\n📝 响应内容 (前 500 字符):`);
    console.log(responseText.substring(0, 500));
  } catch (error) {
    console.error('❌ 请求失败:', error);
  }
}

async function testHealth() {
  try {
    console.log('\n\n🔍 测试健康检查端点...');

    const url = `${BASE_URL}/api/health`;

    console.log(`\n📡 发送请求到: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    console.log(`\n📊 响应状态: ${response.status}`);
    const responseText = await response.text();
    console.log(`\n📝 响应内容 (前 500 字符):`);
    console.log(responseText.substring(0, 500));
  } catch (error) {
    console.error('❌ 请求失败:', error);
  }
}

// 运行测试
async function main() {
  console.log('='.repeat(60));
  console.log('🧪 InsForge API 连接测试');
  console.log('='.repeat(60));

  await testHealth();
  await testSignUp();
  await testSignIn();

  console.log('\n' + '='.repeat(60));
  console.log('✅ 测试完成！');
  console.log('='.repeat(60));
}

main().catch(console.error);

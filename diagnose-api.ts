/**
 * InsForge API 诊断脚本
 * 用于测试不同的 API 端点配置
 */

const BASE_URLS = [
  'https://zrqg6y6j.us-west.insforge.app',
];

const ENDPOINTS = [
  '/auth/signup',
  '/auth/signin',
  '/auth/v1/signup',
  '/auth/v1/signin',
  '/api/auth/signup',
  '/api/auth/signin',
];

const API_KEY = 'ik_39bb1da4b36fb9faef1047c398f44bf8';

async function testEndpoint(baseUrl: string, endpoint: string) {
  const url = `${baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test123456',
        name: 'Test User',
      }),
    });

    const contentType = response.headers.get('content-type');
    const text = await response.text();

    console.log(`\n✓ ${baseUrl}${endpoint}`);
    console.log(`  Status: ${response.status}`);
    console.log(`  Content-Type: ${contentType}`);
    console.log(`  Response (first 100 chars): ${text.substring(0, 100)}`);

    return {
      url,
      status: response.status,
      contentType,
      success: response.ok && contentType?.includes('application/json'),
    };
  } catch (error: any) {
    console.log(`\n✗ ${baseUrl}${endpoint}`);
    console.log(`  Error: ${error.message}`);
    return {
      url,
      status: 0,
      contentType: null,
      success: false,
      error: error.message,
    };
  }
}

async function main() {
  console.log('🔍 开始诊断 InsForge API 端点...\n');
  
  const results = [];

  for (const baseUrl of BASE_URLS) {
    for (const endpoint of ENDPOINTS) {
      const result = await testEndpoint(baseUrl, endpoint);
      results.push(result);
    }
  }

  console.log('\n\n📊 诊断结果总结:');
  console.log('================');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\n✓ 成功的端点 (${successful.length}):`);
  successful.forEach(r => console.log(`  - ${r.url}`));

  console.log(`\n✗ 失败的端点 (${failed.length}):`);
  failed.forEach(r => console.log(`  - ${r.url}`));

  if (successful.length === 0) {
    console.log('\n⚠️  没有找到工作的端点!');
    console.log('建议:');
    console.log('1. 检查 InsForge Base URL 是否正确');
    console.log('2. 检查 API Key 是否有效');
    console.log('3. 查看 InsForge 官方文档确认端点名称');
  }
}

// 运行诊断
main().catch(console.error);

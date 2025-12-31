// 快速 InsForge 连接检查
const API_KEY = 'ik_39bb1da4b36fb9faef1047c398f44bf8';
const API_BASE_URL = 'https://zrqg6y6j.us-west.insforge.app';

(async () => {
  console.log('\n🔍 InsForge 连接检查\n');
  
  try {
    console.log(`正在测试: ${API_BASE_URL}/api/health`);
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    console.log(`✅ 响应状态: ${res.status}`);
  } catch (e) {
    console.log(`❌ 错误: ${e.message}`);
  }
})();

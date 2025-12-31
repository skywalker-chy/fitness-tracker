/**
 * 简单测试 InsForge API
 */

const API_KEY = 'ik_39bb1da4b36fb9faef1047c398f44bf8';
const BASE_URL = 'https://zrqg6y6j.us-west.insforge.app';

async function test() {
  console.log('Testing InsForge connection...');
  console.log('Base URL:', BASE_URL);
  
  try {
    // 测试根路径
    console.log('\n1. Testing root path...');
    const r1 = await fetch(BASE_URL, {
      headers: { 'X-API-Key': API_KEY }
    });
    console.log('Root:', r1.status, await r1.text().then(t => t.substring(0, 200)));
    
    // 测试 /api/tables
    console.log('\n2. Testing /api/tables...');
    const r2 = await fetch(`${BASE_URL}/api/tables`, {
      headers: { 
        'X-API-Key': API_KEY,
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    console.log('/api/tables:', r2.status, await r2.text().then(t => t.substring(0, 500)));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();

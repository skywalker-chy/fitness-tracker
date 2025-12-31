/**
 * 快速测试 InsForge API - 带超时
 */

const API_KEY = 'ik_39bb1da4b36fb9faef1047c398f44bf8';
const BASE_URL = 'https://zrqg6y6j.us-west.insforge.app';

async function test() {
  console.log('Testing InsForge API...');
  console.log('URL:', BASE_URL);
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${BASE_URL}/api/v1/tables`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'X-API-Key': API_KEY
      },
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response:', text.substring(0, 500));
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      console.log('Request timed out after 10 seconds');
    } else {
      console.log('Error:', error.message);
    }
  }
}

test();

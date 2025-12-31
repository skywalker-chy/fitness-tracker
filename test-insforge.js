const API_KEY = 'ik_39bb1da4b36fb9faef1047c398f44bf8';
const BASE_URL = 'https://zrqg6y6j.us-west.insforge.app';

async function testAPI() {
  console.log('Testing InsForge API...');
  console.log('BASE_URL:', BASE_URL);
  
  const testUser = {
    email: 'test_' + Date.now() + '@example.com',
    name: 'Test User',
    created_at: new Date().toISOString()
  };
  
  // Test 1: Supabase style /rest/v1/users
  console.log('\n=== Test 1: POST /rest/v1/users (Supabase style) ===');
  try {
    const res1 = await fetch(`${BASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'apikey': API_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testUser)
    });
    console.log('Status:', res1.status);
    const text1 = await res1.text();
    console.log('Response:', text1.substring(0, 500));
  } catch (e) {
    console.log('Error:', e.message);
  }
  
  // Test 2: /api/users
  console.log('\n=== Test 2: POST /api/users ===');
  try {
    const res2 = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    console.log('Status:', res2.status);
    const text2 = await res2.text();
    console.log('Response:', text2.substring(0, 500));
  } catch (e) {
    console.log('Error:', e.message);
  }
  
  // Test 3: GET /rest/v1/users
  console.log('\n=== Test 3: GET /rest/v1/users ===');
  try {
    const res3 = await fetch(`${BASE_URL}/rest/v1/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'apikey': API_KEY
      }
    });
    console.log('Status:', res3.status);
    const text3 = await res3.text();
    console.log('Response:', text3.substring(0, 500));
  } catch (e) {
    console.log('Error:', e.message);
  }
}

testAPI();

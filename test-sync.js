const API_KEY = 'ik_39bb1da4b36fb9faef1047c398f44bf8';
const BASE_URL = 'https://zrqg6y6j.us-west.insforge.app';

async function testSync() {
  // 1. 先创建一个 plan（训练计划）
  const testPlan = {
    id: 1,
    name: '跑步计划',
    balance: 100,
    icon: '🏃',
    color: '#10B981'
  };

  console.log('1. Creating plan:', JSON.stringify(testPlan, null, 2));
  
  const planRes = await fetch(`${BASE_URL}/api/database/records/plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'apikey': API_KEY,
      'Prefer': 'return=representation,resolution=merge-duplicates',
    },
    body: JSON.stringify(testPlan),
  });
  
  console.log('Plan Status:', planRes.status);
  const planText = await planRes.text();
  console.log('Plan Response:', planText);

  // 2. 然后创建 transaction（运动记录）
  const testTransaction = {
    type: 'expense',
    amount: 20,
    category: '跑步',
    category_icon: '🏃',
    account_id: 1,  // 关联到 plan id=1
    date: '2024-12-30',
    description: '测试跑步20分钟'
  };

  console.log('\n2. Creating transaction:', JSON.stringify(testTransaction, null, 2));

  const txRes = await fetch(`${BASE_URL}/api/database/records/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'apikey': API_KEY,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(testTransaction),
  });

  console.log('Transaction Status:', txRes.status);
  const txText = await txRes.text();
  console.log('Transaction Response:', txText);
}

testSync().catch(console.error);

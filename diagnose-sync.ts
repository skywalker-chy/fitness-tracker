/**
 * InsForge 数据同步诊断工具
 * 
 * 用于检查数据是否已成功同步到 InsForge 后端
 * 在浏览器 Console 中运行此代码
 */

async function diagnoseDataSync() {
  console.log('%c🔍 开始诊断数据同步...', 'color: blue; font-size: 14px; font-weight: bold;');
  
  const API_KEY = 'ik_39bb1da4b36fb9faef1047c398f44bf8';
  const BASE_URL = 'https://zrqg6y6j.us-west.insforge.app';
  
  // 步骤 1: 测试 API 连接
  console.log('\n%c1️⃣ 测试 API 连接...', 'color: green; font-weight: bold;');
  try {
    const connectionTest = await fetch(`${BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });
    console.log(`✅ API 连接: ${connectionTest.ok ? '✅ 正常' : '❌ 失败'} (Status: ${connectionTest.status})`);
  } catch (error: any) {
    console.log(`❌ API 连接失败: ${error.message}`);
  }
  
  // 步骤 2: 检查各个表的数据
  console.log('\n%c2️⃣ 检查数据表...', 'color: green; font-weight: bold;');
  
  const tables = ['courses', 'accounts', 'transactions'];
  const tableData: any = {};
  
  for (const tableName of tables) {
    try {
      const response = await fetch(`${BASE_URL}/api/${tableName}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        tableData[tableName] = data;
        console.log(`\n📋 表: ${tableName}`);
        console.log(`   状态: ✅ 连接成功 (${response.status})`);
        console.log(`   记录数: ${Array.isArray(data) ? data.length : Object.keys(data || {}).length}`);
        
        if (Array.isArray(data) && data.length > 0) {
          console.log(`   样本数据:`, data[0]);
        } else if (typeof data === 'object' && Object.keys(data).length > 0) {
          console.log(`   数据:`, data);
        }
      } else {
        const errorText = await response.text();
        console.log(`\n📋 表: ${tableName}`);
        console.log(`   状态: ❌ 失败 (${response.status})`);
        console.log(`   错误: ${errorText.substring(0, 100)}`);
      }
    } catch (error: any) {
      console.log(`\n📋 表: ${tableName}`);
      console.log(`   状态: ❌ 连接失败`);
      console.log(`   错误: ${error.message}`);
    }
  }
  
  // 步骤 3: 生成诊断报告
  console.log('\n%c3️⃣ 诊断报告...', 'color: green; font-weight: bold;');
  
  const courseCount = Array.isArray(tableData.courses) ? tableData.courses.length : 0;
  const accountCount = Array.isArray(tableData.accounts) ? tableData.accounts.length : 0;
  const transactionCount = Array.isArray(tableData.transactions) ? tableData.transactions.length : 0;
  
  console.log(`\n📊 数据统计:`);
  console.log(`   - courses (用户): ${courseCount} 条记录`);
  console.log(`   - accounts (账户): ${accountCount} 条记录`);
  console.log(`   - transactions (交易): ${transactionCount} 条记录`);
  
  // 步骤 4: 同步状态评估
  console.log(`\n%c✅ 同步状态:`, 'color: blue; font-weight: bold;');
  
  if (courseCount > 0) {
    console.log(`   ✅ 用户数据已同步 (${courseCount} 个用户)`);
  } else {
    console.log(`   ⚠️ 用户数据未同步 (请先完成注册)`);
  }
  
  if (accountCount > 0) {
    console.log(`   ✅ 账户数据已同步 (${accountCount} 个账户)`);
  } else {
    console.log(`   ❌ 账户数据未同步 (请创建账户)`);
  }
  
  if (transactionCount > 0) {
    console.log(`   ✅ 交易数据已同步 (${transactionCount} 笔交易)`);
  } else {
    console.log(`   ❌ 交易数据未同步 (请创建交易)`);
  }
  
  // 最终结论
  console.log(`\n%c🎯 最终结论:`, 'color: purple; font-size: 14px; font-weight: bold;');
  
  const syncStatus = {
    users: courseCount > 0,
    accounts: accountCount > 0,
    transactions: transactionCount > 0,
  };
  
  const syncedCount = Object.values(syncStatus).filter(Boolean).length;
  const allSynced = courseCount > 0 && accountCount > 0 && transactionCount > 0;
  
  if (allSynced) {
    console.log(`%c✅ 数据同步正常！所有类型的数据都已成功同步到 InsForge。`, 'color: green; font-weight: bold; font-size: 14px;');
  } else if (syncedCount > 0) {
    console.log(`%c⚠️ 部分数据已同步 (${syncedCount}/3)，请检查未同步的部分。`, 'color: orange; font-weight: bold; font-size: 14px;');
  } else {
    console.log(`%c❌ 数据未同步！请检查:`, 'color: red; font-weight: bold; font-size: 14px;');
    console.log(`   1. 是否已完成注册/登录`);
    console.log(`   2. 是否创建了账户或交易`);
    console.log(`   3. 浏览器控制台是否有错误日志`);
    console.log(`   4. InsForge API Key 是否正确`);
  }
  
  console.log(`\n%c诊断完成！`, 'color: blue; font-size: 14px; font-weight: bold;');
  
  return {
    connectionStatus: 'ok',
    tables: tableData,
    summary: {
      users: courseCount,
      accounts: accountCount,
      transactions: transactionCount,
      allSynced,
    }
  };
}

// 如何使用:
// 1. 打开浏览器开发者工具 (F12)
// 2. 进入 Console 标签
// 3. 复制并粘贴此代码
// 4. 按 Enter 运行
// 5. 查看诊断结果

console.log('%c📌 提示: 在 Console 中运行此诊断工具', 'color: blue; font-size: 12px;');
console.log('diagnoseDataSync().then(result => console.log("诊断完成", result))');

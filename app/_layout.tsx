import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { DATABASE_TYPE } from '@/db/config';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // 根据配置的数据库类型初始化
        if (DATABASE_TYPE === 'sqlite') {
          const { initDatabase } = await import('@/db/sqlite/database');
          await initDatabase();
        } else if (DATABASE_TYPE === 'insforge') {
          // InsForge数据库连接测试
          console.log('\n====================================');
          console.log('🔍 使用InsForge数据库，开始详细连接测试...');
          console.log('====================================');
          
          try {
            const { client } = await import('@/lib/insforge');
            const database = client.database;
            
            // 打印客户端和数据库信息
            console.log('\n🧪 客户端和数据库信息:');
            console.log('InsForge客户端:', typeof client);
            console.log('InsForge数据库:', typeof database);
            console.log('InsForge客户端方法:', Object.keys(client));
            console.log('InsForge数据库方法:', Object.keys(database));
            
            // 打印环境变量配置
            const envVars = {
              BASE_URL: process.env.EXPO_PUBLIC_INSFORGE_BASE_URL,
              API_KEY: process.env.EXPO_PUBLIC_INSFORGE_API_KEY,
              ANON_KEY: process.env.EXPO_PUBLIC_INSFORGE_ANON_KEY,
            };
            
            console.log('\n⚙️ 环境变量配置:');
            Object.entries(envVars).forEach(([key, value]) => {
              console.log(` - ${key}: ${value ? (key.includes('KEY') ? '********' : value) : '❌ 未设置'}`);
            });
            
            // 检查必要的配置
            const baseUrl = process.env.EXPO_PUBLIC_INSFORGE_BASE_URL;
            const apiKey = process.env.EXPO_PUBLIC_INSFORGE_API_KEY;
            const anonKey = process.env.EXPO_PUBLIC_INSFORGE_ANON_KEY;
            
            if (!baseUrl) {
              console.error('❌ 错误: EXPO_PUBLIC_INSFORGE_BASE_URL 未设置');
              return;
            }
            
            if (!apiKey && !anonKey) {
              console.error('❌ 错误: 至少需要设置 EXPO_PUBLIC_INSFORGE_API_KEY 或 EXPO_PUBLIC_INSFORGE_ANON_KEY');
              return;
            }
            
            // 测试连接到 InsForge API
            const testApiConnection = async () => {
              try {
                console.log('\n🌐 测试 InsForge API 连接:');
                
                const authToken = apiKey || anonKey;
                
                // 测试1: 基础连接
                console.log('   测试1: 基础连接到', baseUrl);
                const response = await fetch(baseUrl, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${authToken}`,
                  }
                });
                console.log('   基础连接状态:', response.status);
                const baseResponse = await response.text();
                console.log('   基础连接响应:', baseResponse.substring(0, 100) + '...');
                
                // 测试2: 获取表列表
                console.log('   测试2: 获取表列表');
                const tablesUrl = `${baseUrl}/api/database/tables`;
                const tablesResponse = await fetch(tablesUrl, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                  }
                });
                console.log('   获取表列表状态:', tablesResponse.status);
                
                if (tablesResponse.ok) {
                  const tables = await tablesResponse.json();
                  console.log('   表列表:', tables);
                } else {
                  const errorText = await tablesResponse.text();
                  console.error('   获取表列表失败:', errorText);
                }
                
                // 测试3: 尝试创建表
                console.log('   测试3: 尝试创建账户表');
                const createTableUrl = `${baseUrl}/api/database/sql`;
                const createTableSql = `
                  CREATE TABLE IF NOT EXISTS accounts (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    name VARCHAR(255) NOT NULL,
                    balance DECIMAL(12, 2) DEFAULT 0,
                    icon VARCHAR(255),
                    color VARCHAR(20),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                  );
                `;
                
                const createTableResponse = await fetch(createTableUrl, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    query: createTableSql
                  })
                });
                console.log('   创建表状态:', createTableResponse.status);
                
                if (createTableResponse.ok) {
                  const createTableResult = await createTableResponse.json();
                  console.log('   创建表结果:', createTableResult);
                } else {
                  const errorText = await createTableResponse.text();
                  console.error('   创建表失败:', errorText);
                }
                
              } catch (error: any) {
                console.error('   ❌ API连接测试失败:', error.message || error);
                if (error.stack) {
                  console.error('   错误堆栈:', error.stack);
                }
              }
            };
            
            // 测试数据库操作
            const testDatabaseOperations = async () => {
              try {
                console.log('\n📊 测试数据库操作:');
                
                if (!database.table) {
                  console.error('   ❌ 错误: database.table 方法不存在');
                  return;
                }
                
                // 测试1: 获取账户表实例
                console.log('   测试1: 获取账户表实例');
                const accountsTable = database.table('accounts');
                console.log('   账户表:', typeof accountsTable);
                console.log('   账户表方法:', Object.keys(accountsTable));
                
                // 测试2: 尝试获取账户列表
                console.log('   测试2: 尝试获取账户列表');
                const accounts = await accountsTable.select();
                console.log('   成功获取账户列表:', accounts);
                
                // 测试3: 如果没有账户，尝试创建一个
                if (accounts.length === 0) {
                  console.log('   测试3: 创建测试账户');
                  const newAccount = await accountsTable.insert({
                    name: '测试账户',
                    balance: 1000,
                    icon: '💰',
                    color: '#FFD700',
                    created_at: new Date().toISOString()
                  });
                  console.log('   成功创建账户:', newAccount);
                  
                  // 再次获取账户列表
                  console.log('   测试4: 再次获取账户列表');
                  const updatedAccounts = await accountsTable.select();
                  console.log('   更新后的账户列表:', updatedAccounts);
                }
                
              } catch (error: any) {
                console.error('   ❌ 数据库操作测试失败:', error.message || error);
                if (error.stack) {
                  console.error('   错误堆栈:', error.stack);
                }
              }
            };
            
            // 运行测试
            await testApiConnection();
            await testDatabaseOperations();
            
            console.log('\n✅ InsForge连接测试完成');
            console.log('====================================');
          } catch (importError: any) {
            console.error('❌ 导入InsForge客户端失败:', importError.message || importError);
            if (importError.stack) {
              console.error('导入错误堆栈:', importError.stack);
            }
          }
        }
      } catch (error) {
        console.error('数据库初始化错误:', error);
      }
    };
    
    initializeDatabase();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="add-transaction" options={{ presentation: 'modal', title: '记一笔', headerShown: false }} />
        <Stack.Screen name="add-account" options={{ presentation: 'modal', title: '添加账户', headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
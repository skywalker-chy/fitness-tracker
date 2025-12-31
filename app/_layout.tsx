import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { DATABASE_TYPE } from '@/db/config';
import { useAuthStore } from '@/store/useAuthStore';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: 'login', // 改为指向登录页面作为初始锚点
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isSignedIn, isLoading } = useAuthStore();

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // 根据配置的数据库类型初始化
        if (DATABASE_TYPE === 'sqlite') {
          const { initDatabase } = await import('@/db/sqlite/database');
          await initDatabase();
          console.log('✓ SQLite 数据库初始化完成');
        } else if (DATABASE_TYPE === 'insforge') {
          console.log('✓ InsForge 数据库配置完成');
          console.log('  - Base URL:', process.env.EXPO_PUBLIC_INSFORGE_BASE_URL);
          console.log('  - API 密钥已配置');
        }
      } catch (error) {
        console.error('数据库初始化错误:', error);
      }
    };
    
    initializeDatabase();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* 认证页面 - 始终定义，通过 href 和条件导航来控制 */}
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="register" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="forgot-password" 
          options={{ 
            headerShown: false,
          }} 
        />

        {/* 主应用页面 - 始终定义，通过条件导航来控制 */}
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="add-transaction" 
          options={{ 
            presentation: 'modal', 
            title: '记一笔', 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="add-account" 
          options={{ 
            presentation: 'modal', 
            title: '添加账户', 
            headerShown: false 
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
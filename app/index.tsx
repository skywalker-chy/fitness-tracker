import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * 根索引页面 - 处理初始路由重定向
 * 根据认证状态重定向到登录页面或主应用
 */
export default function RootIndex() {
  const { isSignedIn, isLoading } = useAuthStore();

  console.log('[RootIndex] isSignedIn:', isSignedIn, 'isLoading:', isLoading);

  // 显示加载状态（可选）
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  // 如果已认证 - 重定向到主应用
  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  // 未认证 - 重定向到登录页面
  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

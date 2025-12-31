import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccountStore } from '@/store/useAccountStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'expo-router';
import { ChevronRight, LogOut, Paintbrush, Settings, Shield, User, Brain } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Platform, AlertButton } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Web 兼容的 alert 函数
const showAlert = (title: string, message: string, buttons?: AlertButton[]) => {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 1) {
      const confirmed = window.confirm(`${title}\n${message}`);
      if (confirmed) {
        const confirmBtn = buttons.find(b => b.style === 'destructive' || b.text === '确定' || b.text === '退出');
        confirmBtn?.onPress?.();
      }
    } else {
      window.alert(`${title}: ${message}`);
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

const getMenuItems = (onLogout: () => void, onAICoach: () => void) => [
  { icon: Brain, label: 'AI 健身教练', color: '#10B981', onPress: onAICoach },
  { icon: User, label: '编辑资料', color: '#F472B6', onPress: () => showAlert('提示', '功能开发中...') },
  { icon: Paintbrush, label: '界面设置', color: '#F472B6', onPress: () => showAlert('提示', '功能开发中...') },
  { icon: Settings, label: '系统设置', color: '#9CA3AF', onPress: () => showAlert('提示', '功能开发中...') },
  { icon: Shield, label: '隐私政策', color: '#60A5FA', onPress: () => showAlert('提示', '功能开发中...') },
  { icon: LogOut, label: '退出登录', color: '#F472B6', onPress: onLogout },
];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const { accounts, fetchAccounts } = useAccountStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  const { user, isSignedIn, signOut } = useAuthStore();

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, []);

  const planCount = accounts.length;
  const workoutCount = transactions.length;

  const handleLogout = async () => {
    showAlert('确认', '确定要退出登录吗？', [
      {
        text: '取消',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: '退出',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
        style: 'destructive',
      },
    ]);
  };

  const handleAICoach = () => {
    router.push('/ai-coach');
  };

  const menuItems = getMenuItems(handleLogout, handleAICoach);

  const displayName = user?.name || user?.email?.split('@')[0] || '健身达人';
  const firstChar = displayName.charAt(0).toUpperCase();
  const statusText = isSignedIn ? (user?.email || '已登录') : '未登录';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>个人中心</Text>
          <Text style={[styles.title, { color: colors.text }]}>我的</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>{firstChar}</Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{displayName}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{statusText}</Text>
        </View>

        <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>训练计划</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{planCount}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>运动记录</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{workoutCount}</Text>
          </View>
        </View>

        <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
                <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                  <IconComponent size={20} color={item.color} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                <ChevronRight size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.version, { color: colors.textSecondary }]}>版本 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10 },
  subtitle: { fontSize: 14 },
  title: { fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  profileSection: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 32, fontWeight: 'bold' },
  userName: { fontSize: 20, fontWeight: '600', marginTop: 16 },
  userEmail: { fontSize: 14, marginTop: 4 },
  statsCard: { marginHorizontal: 20, borderRadius: 16, padding: 20, flexDirection: 'row' },
  statItem: { flex: 1 },
  statLabel: { fontSize: 12 },
  statValue: { fontSize: 32, fontWeight: 'bold', marginTop: 4 },
  statDivider: { width: 1, marginHorizontal: 16 },
  menuCard: { margin: 20, borderRadius: 16, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  menuIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 16, marginLeft: 12 },
  version: { textAlign: 'center', fontSize: 12, paddingBottom: 24 },
});
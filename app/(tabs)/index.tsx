import { BalanceCard } from '@/components/BalanceCard';
import { EmptyState } from '@/components/EmptyState';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { TransactionItem } from '@/components/TransactionItem';
import { Colors } from '@/constants/theme';
import { Transaction } from '@/db/sqlite/schema';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccountStore } from '@/store/useAccountStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useFocusEffect, useRouter } from 'expo-router';
import { Bell, Search, BarChart3 } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const { fetchAccounts } = useAccountStore();
  const { recentTransactions, expense, fetchRecentTransactions, fetchSummary, removeTransaction } = useTransactionStore();

  useFocusEffect(
    useCallback(() => {
      fetchAccounts();
      fetchRecentTransactions(5);
      fetchSummary('week'); // 获取本周数据
    }, [])
  );

  // 计算本周运动总时长（expense 是支出类型的运动记录总时长）
  const totalWorkoutMinutes = expense;
  // 计算训练次数
  const workoutCount = recentTransactions.length;
  // 估算消耗热量（假设每分钟消耗 5 千卡）
  const caloriesBurned = Math.round(totalWorkoutMinutes * 5);

  const handleAddTransaction = () => router.push('/add-transaction');
  const handleQuickInput = () => router.push('/quick-input');
  const handleVoiceInput = () => router.push('/voice-input');
  const handleCameraInput = () => router.push('/camera-input');

  const handleEditTransaction = (transaction: Transaction) => {
    router.push(`/add-transaction?id=${transaction.id}`);
  };

  const handleDeleteTransaction = async (id: number) => {
    await removeTransaction(id);
    fetchAccounts(); // 刷新数据
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>欢迎回来</Text>
            <Text style={[styles.titleText, { color: colors.text }]}>健身记录助手</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/stats')}>
              <BarChart3 size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}><Bell size={24} color={colors.text} /></TouchableOpacity>
          </View>
        </View>

        <BalanceCard totalBalance={totalWorkoutMinutes} income={workoutCount} expense={caloriesBurned} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>最近运动</Text>
            <TouchableOpacity><Text style={[styles.sectionLink, { color: colors.primary }]}>查看全部</Text></TouchableOpacity>
          </View>
          <View style={[styles.billCard, { backgroundColor: colors.card }]}>
            {recentTransactions.length > 0 ? (
              recentTransactions.map((t) => (
                <TransactionItem
                  key={t.id}
                  transaction={t}
                  onEdit={handleEditTransaction}
                  onDelete={handleDeleteTransaction}
                />
              ))
            ) : (
              <EmptyState title="暂无运动记录" description="点击右下角按钮开始记录你的第一次运动" emoji="🏃" />
            )}
          </View>
        </View>
      </ScrollView>
      <FloatingActionButton
        onAddTransaction={handleAddTransaction}
        onQuickInput={handleQuickInput}
        onVoiceInput={handleVoiceInput}
        onCameraInput={handleCameraInput}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
  welcomeText: { fontSize: 14 },
  titleText: { fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  headerIcons: { flexDirection: 'row', gap: 12 },
  iconButton: { padding: 8 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  sectionLink: { fontSize: 14 },
  billCard: { borderRadius: 16, padding: 16 },
});
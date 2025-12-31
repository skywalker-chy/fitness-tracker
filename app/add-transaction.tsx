import { CategoryPicker } from '@/components/CategoryPicker';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccountStore } from '@/store/useAccountStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/utils/categories';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronDown, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TransactionType = 'expense' | 'income';

export default function AddTransactionScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { id, prefill } = useLocalSearchParams<{ id?: string; prefill?: string }>();
  const isEditMode = !!id;

  const { accounts, fetchAccounts } = useAccountStore();
  const { addTransaction, updateTransaction, getTransactionById } = useTransactionStore();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [originalDate, setOriginalDate] = useState<string | null>(null);

  // 加载训练计划数据
  useEffect(() => { fetchAccounts(); }, []);

  // 处理 AI 识别预填数据
  useEffect(() => {
    if (prefill && !isEditMode) {
      try {
        const data = JSON.parse(prefill);
        if (data.type) setType(data.type);
        if (data.amount) setAmount(data.amount);
        if (data.description) setDescription(data.description);
        if (data.category) {
          const categories = data.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
          const category = categories.find(c => c.name === data.category);
          if (category) setSelectedCategory(category);
        }
      } catch (error) {
        console.error('[AddWorkout] Parse prefill error:', error);
      }
    }
  }, [prefill]);

  // 编辑模式下加载运动记录数据
  useEffect(() => {
    if (isEditMode && id) {
      loadTransaction(parseInt(id));
    }
  }, [id]);

  // 仅在新建模式下自动选择第一个训练计划
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId && !isEditMode) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, isEditMode]);

  // 仅在新建模式下，切换类型时重置分类
  useEffect(() => {
    if (!isEditMode) {
      setSelectedCategory((type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES)[0]);
    }
  }, [type, isEditMode]);

  const loadTransaction = async (transactionId: number) => {
    setIsLoading(true);
    try {
      const transaction = await getTransactionById(transactionId);
      if (transaction) {
        setType(transaction.type);
        setAmount(transaction.amount.toString());
        setSelectedAccountId(transaction.account_id);
        setDescription(transaction.description);
        setOriginalDate(transaction.date);

        // 设置分类
        const categories = transaction.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
        const category = categories.find(c => c.name === transaction.category) || categories[0];
        setSelectedCategory(category);
      }
    } catch (error) {
      Alert.alert('错误', '加载运动记录失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('提示', '请输入有效时长');
      return;
    }
    if (!selectedAccountId) {
      Alert.alert(
        '提示', 
        '请先创建一个训练计划',
        [
          { text: '取消', style: 'cancel' },
          { text: '去创建', onPress: () => router.push('/add-account') }
        ]
      );
      return;
    }

    try {
      if (isEditMode && id) {
        await updateTransaction(parseInt(id), {
          type,
          amount: parseFloat(amount),
          category: selectedCategory.name,
          category_icon: selectedCategory.icon,
          account_id: selectedAccountId,
          date: originalDate || new Date().toISOString(),
          description: description || selectedCategory.name
        });
      } else {
        await addTransaction({
          type,
          amount: parseFloat(amount),
          category: selectedCategory.name,
          category_icon: selectedCategory.icon,
          account_id: selectedAccountId,
          date: new Date().toISOString(),
          description: description || selectedCategory.name
        });
      }
      // 使用 replace 跳转到首页，避免返回到 index 触发认证检查
      router.replace('/(tabs)');
    } catch (error) {
      console.error('[AddTransaction] Save error:', error);
      Alert.alert('错误', isEditMode ? '更新失败' : '保存失败');
    }
  };

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><X size={24} color={colors.text} /></TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{isEditMode ? '编辑记录' : '记录运动'}</Text>
        <TouchableOpacity onPress={handleSave} disabled={isLoading}>
          <Text style={[styles.saveBtn, { color: isLoading ? colors.textSecondary : colors.primary }]}>
            {isLoading ? '加载中...' : '保存'}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.typeSelector}>
          <TouchableOpacity style={[styles.typeBtn, type === 'expense' && { backgroundColor: colors.primary }]} onPress={() => setType('expense')}>
            <Text style={[styles.typeText, { color: type === 'expense' ? '#FFF' : colors.textSecondary }]}>运动类型</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.typeBtn, type === 'income' && { backgroundColor: colors.income }]} onPress={() => setType('income')}>
            <Text style={[styles.typeText, { color: type === 'income' ? '#FFF' : colors.textSecondary }]}>训练部位</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.amountCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>运动时长（分钟）</Text>
          <View style={styles.amountRow}>
            <Text style={[styles.currency, { color: colors.primary }]}>⏱</Text>
            <TextInput style={[styles.amountInput, { color: colors.text }]} placeholder="0" placeholderTextColor={colors.textSecondary} keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
          </View>
        </View>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>分类</Text>
          <CategoryPicker type={type} selectedCategory={selectedCategory.name} onSelect={(cat) => setSelectedCategory(cat)} />
        </View>
        <TouchableOpacity style={[styles.accountSelector, { backgroundColor: colors.card }]} onPress={() => setShowAccountPicker(!showAccountPicker)}>
          <Text style={[styles.accountLabel, { color: colors.textSecondary }]}>训练计划</Text>
          <View style={styles.accountValue}>
            <Text style={[styles.accountName, { color: colors.text }]}>{selectedAccount?.name || '选择计划'}</Text>
            <ChevronDown size={20} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>
        {showAccountPicker && (
          <View style={[styles.accountList, { backgroundColor: colors.card }]}>
            {accounts.map((account) => (
              <TouchableOpacity key={account.id} style={[styles.accountItem, selectedAccountId === account.id && { backgroundColor: colors.primaryLight }]} onPress={() => { setSelectedAccountId(account.id); setShowAccountPicker(false); }}>
                <Text style={[styles.accountItemText, { color: colors.text }]}>{account.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>备注</Text>
          <TextInput style={[styles.descInput, { color: colors.text, borderColor: colors.border }]} placeholder="添加运动备注..." placeholderTextColor={colors.textSecondary} value={description} onChangeText={setDescription} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 18, fontWeight: '600' },
  saveBtn: { fontSize: 16, fontWeight: '600' },
  typeSelector: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, gap: 12 },
  typeBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  typeText: { fontSize: 16, fontWeight: '500' },
  amountCard: { marginHorizontal: 20, borderRadius: 16, padding: 20, marginBottom: 16 },
  amountLabel: { fontSize: 14 },
  amountRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  currency: { fontSize: 32, fontWeight: 'bold', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 32, fontWeight: 'bold' },
  section: { marginHorizontal: 20, borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  accountSelector: { marginHorizontal: 20, borderRadius: 16, padding: 16, marginBottom: 16 },
  accountLabel: { fontSize: 14 },
  accountValue: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  accountName: { fontSize: 16, fontWeight: '500' },
  accountList: { marginHorizontal: 20, borderRadius: 16, marginBottom: 16, overflow: 'hidden' },
  accountItem: { padding: 16 },
  accountItemText: { fontSize: 16 },
  descInput: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 16 },
});
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccountStore } from '@/store/useAccountStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { Brain, Dumbbell, Apple, Moon, RefreshCw } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AIAdvice {
  workout: string;
  rest: string;
  diet: string;
  summary: string;
}

// 根据运动数据生成 AI 建议
function generateAIAdvice(
  totalMinutes: number,
  workoutCount: number,
  categories: { category: string; total: number }[],
  weeklyGoal: number
): AIAdvice {
  const completionRate = weeklyGoal > 0 ? (totalMinutes / weeklyGoal) * 100 : 0;
  const avgPerWorkout = workoutCount > 0 ? Math.round(totalMinutes / workoutCount) : 0;
  
  // 分析运动类型分布
  const topCategory = categories.length > 0 ? categories[0].category : '跑步';
  const hasVariety = categories.length >= 3;
  
  let workout = '';
  let rest = '';
  let diet = '';
  let summary = '';

  // 根据完成率生成建议
  if (completionRate >= 100) {
    summary = `🎉 太棒了！你已经完成了本周 ${Math.round(completionRate)}% 的运动目标！继续保持这个势头！`;
    workout = `你本周已经完成 ${totalMinutes} 分钟的运动，超额完成目标。建议：
• 可以适当增加运动强度或尝试新的运动类型
• 如果感觉疲劳，可以进行一些轻松的恢复性训练
• 考虑挑战自己，提高下周的运动目标`;
    rest = `运动量充足，注意休息恢复：
• 确保每晚 7-8 小时的高质量睡眠
• 运动后进行 10-15 分钟的拉伸放松
• 如果肌肉酸痛，可以使用泡沫轴放松
• 每周安排 1-2 天完全休息日`;
    diet = `运动量大，需要充足营养支持：
• 增加优质蛋白质摄入（鸡胸肉、鱼、蛋、豆腐）
• 运动后 30 分钟内补充蛋白质和碳水
• 多喝水，每天至少 2L
• 补充新鲜蔬果，保证维生素摄入`;
  } else if (completionRate >= 70) {
    summary = `👍 不错！你已经完成了本周 ${Math.round(completionRate)}% 的运动目标，再加把劲就能达标！`;
    workout = `本周运动 ${totalMinutes} 分钟，距离目标还差 ${weeklyGoal - totalMinutes} 分钟。建议：
• 接下来几天每天增加 ${Math.ceil((weeklyGoal - totalMinutes) / 3)} 分钟运动
• 尝试高效的 HIIT 训练，短时间内消耗更多热量
• 利用碎片时间做一些简单运动`;
    rest = `保持适度休息：
• 睡眠时间保持 7-8 小时
• 高强度训练后休息一天再进行
• 注意运动前热身和运动后拉伸`;
    diet = `均衡饮食助力目标达成：
• 控制碳水摄入，选择全谷物
• 每餐包含优质蛋白质
• 减少加工食品和含糖饮料
• 运动前 2 小时吃一顿轻食`;
  } else if (completionRate >= 40) {
    summary = `💪 继续努力！你已经完成了本周 ${Math.round(completionRate)}% 的运动目标，还有时间赶上进度！`;
    workout = `本周运动 ${totalMinutes} 分钟，建议加强锻炼：
• 制定每日运动计划，设置提醒
• 从低强度开始，逐渐增加时长
• 找一个运动伙伴互相督促
• 选择你喜欢的运动方式，更容易坚持`;
    rest = `建立规律作息：
• 固定每天的运动时间
• 保证充足睡眠，有助于恢复和减脂
• 避免熬夜，影响第二天运动状态`;
    diet = `调整饮食习惯：
• 减少高热量零食
• 增加蔬菜比例
• 按时吃三餐，避免暴饮暴食
• 多喝水，少喝含糖饮料`;
  } else {
    summary = `🌱 本周运动 ${totalMinutes} 分钟，完成了 ${Math.round(completionRate)}% 的目标。从现在开始，每一步都是进步！`;
    workout = `建议从小目标开始：
• 每天运动 15-20 分钟，培养习惯
• 选择简单易行的运动（散步、拉伸、健身操）
• 不要给自己太大压力，循序渐进
• 记录每次运动，看到自己的进步`;
    rest = `充足休息是基础：
• 保证每晚 7-8 小时睡眠
• 运动后适当休息，不要过度疲劳
• 听从身体信号，累了就休息`;
    diet = `从饮食开始改变：
• 减少外卖，多自己做饭
• 每天吃早餐，补充能量
• 多喝白开水
• 晚餐少吃，避免宵夜`;
  }

  // 根据运动类型多样性添加建议
  if (!hasVariety && workoutCount > 2) {
    workout += `\n\n💡 你主要进行${topCategory}运动，建议增加运动多样性：
• 有氧运动：跑步、游泳、骑行
• 力量训练：深蹲、俯卧撑、哑铃
• 柔韧性：瑜伽、普拉提、拉伸`;
  }

  return { workout, rest, diet, summary };
}

export default function AICoachScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { accounts, totalBalance } = useAccountStore();
  const { expense, categorySummary, fetchSummary, fetchCategorySummary } = useTransactionStore();

  const [advice, setAdvice] = useState<AIAdvice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'workout' | 'rest' | 'diet'>('workout');

  // 计算周目标（所有训练计划的目标之和）
  const weeklyGoal = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    await fetchSummary('week');
    await fetchCategorySummary('expense', 'week');
    
    // 模拟 AI 分析延迟
    setTimeout(() => {
      const totalMinutes = expense || 0;
      const workoutCount = categorySummary.length;
      const generatedAdvice = generateAIAdvice(totalMinutes, workoutCount, categorySummary, weeklyGoal);
      setAdvice(generatedAdvice);
      setIsLoading(false);
    }, 800);
  };

  const tabs = [
    { key: 'workout', label: '锻炼建议', icon: Dumbbell, color: '#10B981' },
    { key: 'rest', label: '休息恢复', icon: Moon, color: '#8B5CF6' },
    { key: 'diet', label: '饮食建议', icon: Apple, color: '#F59E0B' },
  ] as const;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* 标题栏 */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Brain size={24} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>AI 健身教练</Text>
        </View>
        <TouchableOpacity onPress={loadData} style={styles.refreshBtn}>
          <RefreshCw size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            AI 正在分析你的运动数据...
          </Text>
        </View>
      ) : advice ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 总结卡片 */}
          <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
            <Text style={styles.summaryText}>{advice.summary}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{expense || 0}</Text>
                <Text style={styles.statLabel}>本周运动(分钟)</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{weeklyGoal}</Text>
                <Text style={styles.statLabel}>周目标(分钟)</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {weeklyGoal > 0 ? Math.round((expense / weeklyGoal) * 100) : 0}%
                </Text>
                <Text style={styles.statLabel}>完成率</Text>
              </View>
            </View>
          </View>

          {/* 标签切换 */}
          <View style={styles.tabContainer}>
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.tab,
                    isActive && { backgroundColor: tab.color + '20', borderColor: tab.color }
                  ]}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <IconComponent size={20} color={isActive ? tab.color : colors.textSecondary} />
                  <Text style={[
                    styles.tabText,
                    { color: isActive ? tab.color : colors.textSecondary }
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 建议内容 */}
          <View style={[styles.adviceCard, { backgroundColor: colors.card }]}>
            <View style={styles.adviceHeader}>
              {activeTab === 'workout' && <Dumbbell size={24} color="#10B981" />}
              {activeTab === 'rest' && <Moon size={24} color="#8B5CF6" />}
              {activeTab === 'diet' && <Apple size={24} color="#F59E0B" />}
              <Text style={[styles.adviceTitle, { color: colors.text }]}>
                {tabs.find(t => t.key === activeTab)?.label}
              </Text>
            </View>
            <Text style={[styles.adviceContent, { color: colors.text }]}>
              {activeTab === 'workout' && advice.workout}
              {activeTab === 'rest' && advice.rest}
              {activeTab === 'diet' && advice.diet}
            </Text>
          </View>

          {/* 温馨提示 */}
          <View style={[styles.tipCard, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.tipTitle, { color: colors.primary }]}>💡 温馨提示</Text>
            <Text style={[styles.tipText, { color: colors.text }]}>
              以上建议基于你的运动数据生成，仅供参考。如有特殊健康状况，请咨询专业医生或健身教练。
            </Text>
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  refreshBtn: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  summaryCard: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  summaryText: {
    color: '#FFF',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  adviceCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  adviceTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  adviceContent: {
    fontSize: 15,
    lineHeight: 24,
  },
  tipCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
  },
});

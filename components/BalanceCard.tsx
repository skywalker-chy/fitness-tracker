import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Timer, Flame } from 'lucide-react-native';

interface BalanceCardProps {
  totalBalance: number;
  income: number;
  expense: number;
}

export function BalanceCard({ totalBalance, income, expense }: BalanceCardProps) {
  return (
    <LinearGradient
      colors={['#34D399', '#10B981', '#059669']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <Text style={styles.label}>本周运动总时长</Text>
      <Text style={styles.amount}>{totalBalance} 分钟</Text>
      
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <View style={styles.iconWrap}>
            <Timer size={16} color="#10B981" />
          </View>
          <Text style={styles.detailLabel}>训练次数</Text>
          <Text style={styles.detailAmount}>{income} 次</Text>
        </View>
        
        <View style={styles.detailItem}>
          <View style={styles.iconWrap}>
            <Flame size={16} color="#F97316" />
          </View>
          <Text style={styles.detailLabel}>消耗热量</Text>
          <Text style={styles.detailAmount}>{expense} 千卡</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 20,
    borderRadius: 20,
    padding: 20,
  },
  label: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  amount: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 8,
  },
  details: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 16,
  },
  detailItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  detailAmount: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
});


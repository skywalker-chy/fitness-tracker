import { Colors } from '@/constants/theme';
import { Account } from '@/db/sqlite/schema';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Target, Trophy, Flame, Dumbbell, Heart, Zap, ChevronRight, Edit3, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  'target': Target,
  'trophy': Trophy,
  'flame': Flame,
  'dumbbell': Dumbbell,
  'heart': Heart,
  'zap': Zap,
  'Target': Target,
  'Trophy': Trophy,
  'Flame': Flame,
  'Dumbbell': Dumbbell,
  'Heart': Heart,
  'Zap': Zap,
};

interface AccountItemProps {
  account: Account;
  onPress?: () => void;
  onEdit?: (account: Account) => void;
  onDelete?: (id: number) => void;
  showArrow?: boolean;
  showActions?: boolean;
}

export function AccountItem({
  account,
  onPress,
  onEdit,
  onDelete,
  showArrow = true,
  showActions = true
}: AccountItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showMenu, setShowMenu] = useState(false);
  const IconComponent = ICON_MAP[account.icon] || Target;

  const handleLongPress = () => {
    if (showActions) {
      setShowMenu(true);
    }
  };

  const handleEdit = () => {
    setShowMenu(false);
    onEdit?.(account);
  };

  const handleDelete = () => {
    setShowMenu(false);
    // Web 端使用 window.confirm，移动端使用 Alert.alert
    if (typeof window !== 'undefined' && window.confirm) {
      const confirmed = window.confirm(`确定要删除训练计划"${account.name}"吗？关联的运动记录也会被删除，此操作不可撤销。`);
      if (confirmed) {
        onDelete?.(account.id);
      }
    } else {
      Alert.alert(
        '确认删除',
        `确定要删除训练计划"${account.name}"吗？关联的运动记录也会被删除，此操作不可撤销。`,
        [
          { text: '取消', style: 'cancel' },
          {
            text: '删除',
            style: 'destructive',
            onPress: () => onDelete?.(account.id)
          },
        ]
      );
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: colors.card }]}
        onPress={() => setShowMenu(!showMenu)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconWrap, { backgroundColor: (account.color || '#60A5FA') + '20' }]}>
          <IconComponent size={24} color={account.color || '#60A5FA'} />
        </View>

        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]}>{account.name}</Text>
          <Text style={[styles.balance, { color: colors.textSecondary }]}>
            目标: {account.balance} 分钟/周
          </Text>
        </View>

        {showArrow && <ChevronRight size={20} color={colors.textSecondary} />}
      </TouchableOpacity>

      {showMenu && (
        <View style={[styles.actionMenu, { backgroundColor: colors.card, marginTop: 8, marginHorizontal: 0 }]}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <Edit3 size={18} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>编辑</Text>
          </TouchableOpacity>
          <View style={[styles.actionDivider, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <Trash2 size={18} color={colors.expense} />
            <Text style={[styles.actionText, { color: colors.expense }]}>删除</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  balance: {
    fontSize: 14,
    marginTop: 2,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 16,
    zIndex: 100,
  },
  actionMenu: {
    flexDirection: 'row',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionDivider: {
    width: 1,
    marginVertical: 4,
  },
});


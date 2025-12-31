// 运动类型配置（对应原支出类别）
export const EXPENSE_CATEGORIES = [
  { name: '跑步', icon: 'footprints', color: '#F472B6' },
  { name: '力量训练', icon: 'dumbbell', color: '#60A5FA' },
  { name: '游泳', icon: 'waves', color: '#38BDF8' },
  { name: '瑜伽', icon: 'flower-2', color: '#34D399' },
  { name: '骑行', icon: 'bike', color: '#A78BFA' },
  { name: '篮球', icon: 'circle-dot', color: '#FB923C' },
  { name: '足球', icon: 'circle', color: '#4ADE80' },
  { name: '羽毛球', icon: 'wind', color: '#FBBF24' },
  { name: '登山', icon: 'mountain', color: '#F87171' },
  { name: '其他', icon: 'more-horizontal', color: '#9CA3AF' },
] as const;

// 身体部位/训练目标配置（对应原收入类别）
export const INCOME_CATEGORIES = [
  { name: '全身', icon: 'person-standing', color: '#4CAF50' },
  { name: '上肢', icon: 'hand', color: '#60A5FA' },
  { name: '下肢', icon: 'footprints', color: '#FBBF24' },
  { name: '核心', icon: 'target', color: '#A78BFA' },
  { name: '有氧', icon: 'heart-pulse', color: '#F472B6' },
  { name: '拉伸', icon: 'move', color: '#9CA3AF' },
] as const;

// 健身计划图标配置（对应原账户图标）
export const ACCOUNT_ICONS = [
  { name: 'target', icon: 'Target', label: '目标', color: '#60A5FA' },
  { name: 'trophy', icon: 'Trophy', label: '成就', color: '#FBBF24' },
  { name: 'flame', icon: 'Flame', label: '燃脂', color: '#F87171' },
  { name: 'dumbbell', icon: 'Dumbbell', label: '增肌', color: '#818CF8' },
  { name: 'heart', icon: 'Heart', label: '健康', color: '#F472B6' },
  { name: 'zap', icon: 'Zap', label: '能量', color: '#34D399' },
] as const;

// 根据类别名获取类别信息
export function getCategoryByName(name: string, type: 'income' | 'expense') {
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return categories.find(c => c.name === name) || categories[categories.length - 1];
}

// 根据图标名获取账户图标信息
export function getAccountIconByName(name: string) {
  return ACCOUNT_ICONS.find(i => i.name === name) || ACCOUNT_ICONS[0];
}

// 获取所有类别
export function getAllCategories(type: 'income' | 'expense') {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}


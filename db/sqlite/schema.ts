// 数据库表结构定义

export interface Account {
  id: number;
  name: string;
  balance: number;  // 用于存储目标运动时长/次数
  icon: string;
  color: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  type: 'income' | 'expense';  // expense=运动记录, income=身体部位/训练类型
  amount: number;  // 运动时长(分钟)或次数
  category: string;  // 运动类型
  category_icon: string;
  account_id: number;  // 关联的健身计划
  account_name?: string;
  date: string;
  description: string;  // 运动备注
  created_at: string;
}

// 创建表的SQL语句
export const CREATE_ACCOUNTS_TABLE = `
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    balance REAL DEFAULT 0,
    icon TEXT DEFAULT 'wallet',
    color TEXT DEFAULT '#60A5FA',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`;

export const CREATE_TRANSACTIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    category_icon TEXT DEFAULT 'circle',
    account_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    description TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
  );
`;

// 运动类型（对应原支出类别）
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
];

export const INCOME_CATEGORIES = [
  { name: '全身', icon: 'person-standing', color: '#4CAF50' },
  { name: '上肢', icon: 'hand', color: '#60A5FA' },
  { name: '下肢', icon: 'footprints', color: '#FBBF24' },
  { name: '核心', icon: 'target', color: '#A78BFA' },
  { name: '有氧', icon: 'heart-pulse', color: '#F472B6' },
  { name: '拉伸', icon: 'move', color: '#9CA3AF' },
];

// 健身计划图标选项
export const ACCOUNT_ICONS = [
  { name: 'target', label: '目标' },
  { name: 'trophy', label: '成就' },
  { name: 'flame', label: '燃脂' },
  { name: 'dumbbell', label: '增肌' },
  { name: 'heart', label: '健康' },
  { name: 'zap', label: '能量' },
];


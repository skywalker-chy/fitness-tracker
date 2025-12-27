// 账户类型定义
export interface Account {
  id: number;
  name: string;
  balance: number;
  icon: string;
  color: string;
  created_at: string;
}

// 交易记录类型定义
export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  category_icon: string;
  account_id: number;
  account_name?: string;
  date: string;
  description?: string;
  created_at: string;
}

// 预定义收支类别
export const INCOME_CATEGORIES = [
  { name: '工资', icon: 'briefcase' },
  { name: '奖金', icon: 'trophy' },
  { name: '理财收益', icon: 'bar-chart' },
  { name: '投资回报', icon: 'line-chart' },
  { name: '兼职收入', icon: 'work' },
  { name: '红包/礼金', icon: 'gift' },
  { name: '其他收入', icon: 'plus-circle' }
];

export const EXPENSE_CATEGORIES = [
  { name: '餐饮', icon: 'cutlery' },
  { name: '交通', icon: 'car' },
  { name: '购物', icon: 'shopping-cart' },
  { name: '娱乐', icon: 'film' },
  { name: '医疗', icon: 'stethoscope' },
  { name: '教育', icon: 'book' },
  { name: '房租', icon: 'home' },
  { name: '水电费', icon: 'flash' },
  { name: '通讯费', icon: 'message' },
  { name: '其他支出', icon: 'minus-circle' }
];

// 数据库表结构定义
export const ACCOUNTS_TABLE = {
  name: 'accounts',
  columns: {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar', notNull: true },
    balance: { type: 'numeric', notNull: true, default: 0 },
    icon: { type: 'varchar', notNull: true },
    color: { type: 'varchar', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: 'now()' }
  }
};

export const TRANSACTIONS_TABLE = {
  name: 'transactions',
  columns: {
    id: { type: 'serial', primaryKey: true },
    type: { type: 'varchar', notNull: true, check: "type IN ('income', 'expense')" },
    amount: { type: 'numeric', notNull: true, check: 'amount > 0' },
    category: { type: 'varchar', notNull: true },
    category_icon: { type: 'varchar', notNull: true },
    account_id: { type: 'integer', notNull: true, references: 'accounts(id)' },
    date: { type: 'date', notNull: true },
    description: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: 'now()' }
  }
};
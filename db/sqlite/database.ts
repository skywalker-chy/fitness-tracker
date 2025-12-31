import * as SQLite from 'expo-sqlite';
import { Account, CREATE_ACCOUNTS_TABLE, CREATE_TRANSACTIONS_TABLE, Transaction } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

// 初始化数据库
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  // 检查是否在客户端（浏览器）环境中
  const isClient = typeof window !== 'undefined' && typeof document !== 'undefined';
  
  // 在服务端渲染时，返回一个模拟数据库
  if (!isClient) {
    console.log('Running on server - skipping database initialization');
    // 返回一个Promise，但不实际初始化数据库
    return {} as SQLite.SQLiteDatabase;
  }
  
  if (db) return db;
  
  // 检查是否在Web平台上
  if (isClient) {
    console.log('Running on Web platform - using simulated database');
    // 使用模拟数据库实现
    db = await SQLite.openDatabaseAsync('billing.db');
  } else {
    // 在原生平台上正常初始化
    db = await SQLite.openDatabaseAsync('billing.db');
  }
  
  // 创建表
  await db.execAsync(CREATE_ACCOUNTS_TABLE);
  await db.execAsync(CREATE_TRANSACTIONS_TABLE);
  return db;
}

// 获取数据库实例
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    return initDatabase();
  }
  return db;
}

// ============ 账户操作 ============

export async function getAllAccounts(): Promise<Account[]> {
  const database = await getDatabase();
  const accounts = await database.getAllAsync<Account>('SELECT * FROM accounts ORDER BY created_at DESC');
  // 确保 balance 是数字类型
  return accounts.map(acc => ({
    ...acc,
    balance: typeof acc.balance === 'string' ? parseFloat(acc.balance) : (acc.balance || 0)
  }));
}

export async function getAccountById(id: number): Promise<Account | null> {
  const database = await getDatabase();
  const account = await database.getFirstAsync<Account>('SELECT * FROM accounts WHERE id = ?', [id]);
  if (account) {
    account.balance = typeof account.balance === 'string' ? parseFloat(account.balance) : (account.balance || 0);
  }
  return account;
}

export async function createAccount(account: Omit<Account, 'id' | 'created_at'>): Promise<number> {
  const database = await getDatabase();
  // 确保余额是数字类型
  const balance = typeof account.balance === 'string' ? parseFloat(account.balance) : (account.balance || 0);
  const result = await database.runAsync(
    'INSERT INTO accounts (name, balance, icon, color) VALUES (?, ?, ?, ?)',
    [account.name, balance, account.icon, account.color]
  );
  return result.lastInsertRowId;
}

export async function updateAccount(id: number, account: Partial<Account>): Promise<void> {
  const database = await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];
  
  if (account.name !== undefined) { fields.push('name = ?'); values.push(account.name); }
  if (account.balance !== undefined) { fields.push('balance = ?'); values.push(account.balance); }
  if (account.icon !== undefined) { fields.push('icon = ?'); values.push(account.icon); }
  if (account.color !== undefined) { fields.push('color = ?'); values.push(account.color); }
  
  if (fields.length > 0) {
    values.push(id);
    await database.runAsync(`UPDATE accounts SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

export async function deleteAccount(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM accounts WHERE id = ?', [id]);
}

export async function getTotalBalance(): Promise<number> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ total: number }>('SELECT COALESCE(SUM(balance), 0) as total FROM accounts');
  // 确保返回数字类型，处理 null、undefined、NaN 情况
  const total = result?.total;
  if (total === null || total === undefined || isNaN(total)) {
    return 0;
  }
  return typeof total === 'string' ? parseFloat(total) : total;
}

// ============ 交易操作 ============

// 辅助函数：确保交易金额是数字类型
function normalizeTransactionAmount(transactions: Transaction[]): Transaction[] {
  return transactions.map(t => ({
    ...t,
    amount: typeof t.amount === 'string' ? parseFloat(t.amount) : (t.amount || 0)
  }));
}

export async function getAllTransactions(limit?: number): Promise<Transaction[]> {
  const database = await getDatabase();
  const sql = `
    SELECT t.*, a.name as account_name 
    FROM transactions t 
    LEFT JOIN accounts a ON t.account_id = a.id 
    ORDER BY t.date DESC, t.created_at DESC
    ${limit ? `LIMIT ${limit}` : ''}
  `;
  const transactions = await database.getAllAsync<Transaction>(sql);
  console.log('[DB] getAllTransactions raw:', JSON.stringify(transactions));
  const normalized = normalizeTransactionAmount(transactions);
  console.log('[DB] getAllTransactions normalized:', JSON.stringify(normalized));
  return normalized;
}

export async function getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
  const database = await getDatabase();
  const transactions = await database.getAllAsync<Transaction>(
    `SELECT t.*, a.name as account_name 
     FROM transactions t 
     LEFT JOIN accounts a ON t.account_id = a.id 
     WHERE t.date BETWEEN ? AND ? 
     ORDER BY t.date DESC`,
    [startDate, endDate]
  );
  return normalizeTransactionAmount(transactions);
}

export async function createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'account_name'>): Promise<number> {
  const database = await getDatabase();
  
  // 确保金额是数字类型
  const amount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount;
  
  console.log('[DB] Creating transaction with amount:', amount, 'original:', transaction.amount);
  
  // 插入交易记录（运动记录）
  const result = await database.runAsync(
    'INSERT INTO transactions (type, amount, category, category_icon, account_id, date, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [transaction.type, amount, transaction.category, transaction.category_icon, transaction.account_id, transaction.date, transaction.description]
  );
  
  console.log('[DB] Transaction created, lastInsertRowId:', result.lastInsertRowId);
  
  // 注意：健身记录不修改训练计划的目标值
  // 目标值（balance）是固定的周目标，运动记录是完成情况
  
  return result.lastInsertRowId;
}

export async function getTransactionById(id: number): Promise<Transaction | null> {
  const database = await getDatabase();
  return database.getFirstAsync<Transaction>(
    `SELECT t.*, a.name as account_name
     FROM transactions t
     LEFT JOIN accounts a ON t.account_id = a.id
     WHERE t.id = ?`,
    [id]
  );
}

export async function updateTransaction(
  id: number,
  updates: Partial<Omit<Transaction, 'id' | 'created_at' | 'account_name'>>
): Promise<void> {
  const database = await getDatabase();

  // 获取原始交易信息
  const oldTransaction = await database.getFirstAsync<Transaction>(
    'SELECT * FROM transactions WHERE id = ?',
    [id]
  );

  if (!oldTransaction) {
    throw new Error('交易记录不存在');
  }

  // 构建更新字段
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.type !== undefined) { fields.push('type = ?'); values.push(updates.type); }
  if (updates.amount !== undefined) { fields.push('amount = ?'); values.push(updates.amount); }
  if (updates.category !== undefined) { fields.push('category = ?'); values.push(updates.category); }
  if (updates.category_icon !== undefined) { fields.push('category_icon = ?'); values.push(updates.category_icon); }
  if (updates.account_id !== undefined) { fields.push('account_id = ?'); values.push(updates.account_id); }
  if (updates.date !== undefined) { fields.push('date = ?'); values.push(updates.date); }
  if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }

  if (fields.length === 0) return;

  // 健身记录不修改训练计划目标值，直接更新交易记录
  values.push(id);
  await database.runAsync(`UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteTransaction(id: number): Promise<void> {
  const database = await getDatabase();
  // 健身记录不修改训练计划目标值，直接删除记录
  await database.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

export async function getIncomeExpenseSummary(startDate?: string, endDate?: string): Promise<{ income: number; expense: number }> {
  const database = await getDatabase();
  let sql = 'SELECT type, COALESCE(SUM(amount), 0) as total FROM transactions';
  const params: string[] = [];
  
  if (startDate && endDate) {
    sql += ' WHERE date BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }
  sql += ' GROUP BY type';
  
  const results = await database.getAllAsync<{ type: string; total: number }>(sql, params);
  const summary = { income: 0, expense: 0 };
  results.forEach(r => {
    // 确保转换为数字类型
    const total = typeof r.total === 'string' ? parseFloat(r.total) : (r.total || 0);
    if (r.type === 'income') summary.income = isNaN(total) ? 0 : total;
    if (r.type === 'expense') summary.expense = isNaN(total) ? 0 : total;
  });
  return summary;
}

export async function getCategorySummary(type: 'income' | 'expense', startDate?: string, endDate?: string) {
  const database = await getDatabase();
  let sql = 'SELECT category, category_icon, COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = ?';
  const params: any[] = [type];
  
  if (startDate && endDate) {
    sql += ' AND date BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }
  sql += ' GROUP BY category ORDER BY total DESC';
  
  const results = await database.getAllAsync<{ category: string; category_icon: string; total: number }>(sql, params);
  
  // 确保 total 是数字类型
  return results.map(r => ({
    ...r,
    total: typeof r.total === 'string' ? parseFloat(r.total) : (r.total || 0)
  }));
}
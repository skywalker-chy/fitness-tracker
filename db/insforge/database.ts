import { Account, Transaction } from '../sqlite/schema';
import database from '../../lib/insforge';

// 测试 InsForge API 连接
async function testInsForgeConnection(): Promise<boolean> {
  try {
    console.log('测试 InsForge API 连接...');
    
    // 获取 InsForge 配置
    const baseUrl = process.env.EXPO_PUBLIC_INSFORGE_BASE_URL;
    const apiKey = process.env.EXPO_PUBLIC_INSFORGE_API_KEY;
    
    if (!baseUrl || !apiKey) {
      console.error('InsForge 配置不完整:', { baseUrl, apiKey });
      return false;
    }
    
    // 测试基础连接
    console.log('测试基础连接到:', baseUrl);
    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      }
    });
    
    console.log('基础连接状态:', response.status);
    
    // 测试获取表列表
    console.log('测试获取表列表...');
    const tablesResponse = await fetch(`${baseUrl}/api/database/tables`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('获取表列表状态:', tablesResponse.status);
    
    if (tablesResponse.ok) {
      const tables = await tablesResponse.json();
      console.log('表列表:', tables);
      return true;
    } else {
      const errorText = await tablesResponse.text();
      console.error('获取表列表失败:', errorText);
      return false;
    }
    
  } catch (error) {
    console.error('InsForge API 连接测试失败:', error);
    return false;
  }
}

// 尝试初始化表（如果不存在）
async function initializeTables(): Promise<void> {
  try {
    console.log('检查并初始化表...');
    
    // 检查是否已连接
    const isConnected = await testInsForgeConnection();
    
    if (!isConnected) {
      console.error('无法连接到 InsForge，跳过表初始化');
      return;
    }
    
    // 尝试创建计划表
    try {
      await database.from('plan').insert({
        name: '临时测试计划',
        balance: 0,
        icon: '💸',
        color: '#000000',
        created_at: new Date().toISOString()
      });
      console.log('计划表已存在或创建成功');
    } catch (error) {
      console.error('检查计划表失败:', error);
    }
    
    // 尝试创建交易记录表
    try {
      await database.from('transactions').insert({
        type: 'expense',
        amount: 0,
        category: '测试',
        category_icon: '📝',
        account_id: 1,
        date: new Date().toISOString().split('T')[0],
        description: '测试交易记录',
        created_at: new Date().toISOString()
      });
      console.log('交易记录表已存在或创建成功');
    } catch (error) {
      console.error('检查交易记录表失败:', error);
    }
    
  } catch (error) {
    console.error('表初始化失败:', error);
  }
}

// 暂时跳过表初始化，等待进一步调整
// initializeTables();

// ============ 账户操作 ============

export async function getAllAccounts(): Promise<Account[]> {
  try {
    return await database.from('plan').select().order('created_at', 'desc').execute();
  } catch (error) {
    console.error('获取账户列表失败:', error);
    return [];
  }
}

export async function getAccountById(id: number): Promise<Account | null> {
  try {
    return await database.from('plan').select().where('id', '=', id).single();
  } catch (error) {
    console.error('获取账户失败:', error);
    return null;
  }
}

export async function createAccount(account: Omit<Account, 'id' | 'created_at'>): Promise<number> {
  try {
    const result = await database.from('plan').insert({
      name: account.name,
      balance: account.balance,
      icon: account.icon,
      color: account.color,
      created_at: new Date().toISOString()
    });
    return result[0].id;
  } catch (error) {
    console.error('创建账户失败:', error);
    throw error;
  }
}

export async function updateAccount(id: number, account: Partial<Account>): Promise<void> {
  try {
    await database.from('plan').where('id', '=', id).update(
      { ...account }
    );
  } catch (error) {
    console.error('更新账户失败:', error);
    throw error;
  }
}

export async function deleteAccount(id: number): Promise<void> {
  try {
    await database.from('plan').where('id', '=', id).delete();
  } catch (error) {
    console.error('删除账户失败:', error);
    throw error;
  }
}

export async function getTotalBalance(): Promise<number> {
  try {
    const accounts = await getAllAccounts();
    return accounts.reduce((total, account) => total + account.balance, 0);
  } catch (error) {
    console.error('获取总余额失败:', error);
    return 0;
  }
}

// ============ 交易操作 ============

export async function getAllTransactions(limit?: number): Promise<Transaction[]> {
  try {
    // 由于当前实现不支持join，我们先获取交易记录，再手动查询账户名称
    const query = database.from('transactions').select()
      .order('date', 'desc')
      .order('created_at', 'desc');
      
    if (limit) {
      query.limit(limit);
    }
    
    const transactions = await query.execute();
    
    // 手动查询账户名称
    const result = await Promise.all(transactions.map(async (transaction) => {
      const account = await getAccountById(transaction.account_id);
      return {
        ...transaction,
        account_name: account ? account.name : ''
      };
    }));
    
    return result;
  } catch (error) {
    console.error('获取交易记录失败:', error);
    return [];
  }
}

export async function getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
  try {
    // 由于当前实现不支持join，我们先获取交易记录，再手动查询账户名称
    const transactions = await database.from('transactions').select()
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .order('date', 'desc')
      .execute();
    
    // 手动查询账户名称
    const result = await Promise.all(transactions.map(async (transaction) => {
      const account = await getAccountById(transaction.account_id);
      return {
        ...transaction,
        account_name: account ? account.name : ''
      };
    }));
    
    return result;
  } catch (error) {
    console.error('按日期范围获取交易记录失败:', error);
    return [];
  }
}

export async function createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'account_name'>): Promise<number> {
  try {
    // 插入交易记录
    const result = await database.from('transactions').insert({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      category_icon: transaction.category_icon,
      account_id: transaction.account_id,
      date: transaction.date,
      description: transaction.description,
      created_at: new Date().toISOString()
    });
    
    // 更新账户余额
    const balanceChange = transaction.type === 'income' ? transaction.amount : -transaction.amount;
    const account = await getAccountById(transaction.account_id);
    
    if (account) {
      await updateAccount(transaction.account_id, {
        balance: account.balance + balanceChange
      });
    }
    
    return result[0].id;
  } catch (error) {
    console.error('创建交易记录失败:', error);
    throw error;
  }
}

export async function getTransactionById(id: number): Promise<Transaction | null> {
  try {
    // 由于当前实现不支持join，我们先获取交易记录，再手动查询账户名称
    const transaction = await database.from('transactions').select()
      .where('id', '=', id)
      .single();
    
    if (!transaction) {
      return null;
    }
    
    // 手动查询账户名称
    const account = await getAccountById(transaction.account_id);
    return {
      ...transaction,
      account_name: account ? account.name : ''
    };
  } catch (error) {
    console.error('获取交易记录失败:', error);
    return null;
  }
}

export async function updateTransaction(
  id: number,
  updates: Partial<Omit<Transaction, 'id' | 'created_at' | 'account_name'>>
): Promise<void> {
  try {
    // 获取原始交易信息
    const oldTransaction = await database.from('transactions').select().where('id', '=', id).single();
    
    if (!oldTransaction) {
      throw new Error('交易记录不存在');
    }
    
    // 更新交易记录
    await database.from('transactions').where('id', '=', id).update({
      ...updates
    });
    
    // 计算余额变化
    const newType = updates.type ?? oldTransaction.type;
    const newAmount = updates.amount ?? oldTransaction.amount;
    const newAccountId = updates.account_id ?? oldTransaction.account_id;
    
    // 还原旧账户余额
    const oldBalanceChange = oldTransaction.type === 'income' ? -oldTransaction.amount : oldTransaction.amount;
    const oldAccount = await getAccountById(oldTransaction.account_id);
    
    if (oldAccount) {
      await updateAccount(oldTransaction.account_id, {
        balance: oldAccount.balance + oldBalanceChange
      });
    }
    
    // 更新新账户余额
    const newBalanceChange = newType === 'income' ? newAmount : -newAmount;
    const newAccount = await getAccountById(newAccountId);
    
    if (newAccount) {
      await updateAccount(newAccountId, {
        balance: newAccount.balance + newBalanceChange
      });
    }
    
  } catch (error) {
    console.error('更新交易记录失败:', error);
    throw error;
  }
}

export async function deleteTransaction(id: number): Promise<void> {
  try {
    // 先获取交易信息以还原余额
    const transaction = await database.from('transactions').select().where('id', '=', id).single();
    
    if (transaction) {
      const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
      const account = await getAccountById(transaction.account_id);
      
      if (account) {
        await updateAccount(transaction.account_id, {
          balance: account.balance + balanceChange
        });
      }
    }
    
    // 删除交易记录
    await database.from('transactions').where('id', '=', id).delete();
  } catch (error) {
    console.error('删除交易记录失败:', error);
    throw error;
  }
}

export async function getIncomeExpenseSummary(startDate?: string, endDate?: string): Promise<{ income: number; expense: number }> {
  try {
    // 获取所有交易记录，然后在客户端过滤
    const transactions = await database.from('transactions').select().execute();
    const summary = { income: 0, expense: 0 };
    
    console.log('[getIncomeExpenseSummary] 获取到交易记录数:', transactions?.length || 0);
    console.log('[getIncomeExpenseSummary] 日期范围:', startDate, '-', endDate);
    
    if (!Array.isArray(transactions)) {
      console.log('[getIncomeExpenseSummary] 返回数据不是数组');
      return summary;
    }
    
    transactions.forEach((transaction: any) => {
      // 如果有日期范围，进行过滤
      if (startDate && endDate && transaction.date) {
        const txDate = transaction.date.substring(0, 10); // 取 YYYY-MM-DD 部分
        if (txDate < startDate || txDate > endDate) {
          return; // 跳过不在范围内的记录
        }
      }
      
      console.log('[getIncomeExpenseSummary] 处理交易:', transaction.type, transaction.amount);
      
      if (transaction.type === 'income') {
        summary.income += Number(transaction.amount) || 0;
      } else if (transaction.type === 'expense') {
        summary.expense += Number(transaction.amount) || 0;
      }
    });
    
    console.log('[getIncomeExpenseSummary] 计算结果:', summary);
    return summary;
  } catch (error) {
    console.error('获取收支汇总失败:', error);
    return { income: 0, expense: 0 };
  }
}

export async function getCategorySummary(type: 'income' | 'expense', startDate?: string, endDate?: string) {
  try {
    // 由于当前实现不支持group by，我们手动计算
    const query = database.from('transactions').select()
      .where('type', '=', type);
    
    if (startDate && endDate) {
      query.where('date', '>=', startDate).where('date', '<=', endDate);
    }
    
    const transactions = await query.execute();
    
    // 手动按分类分组
    const categoryMap = new Map();
    
    transactions.forEach(transaction => {
      const key = `${transaction.category}_${transaction.category_icon}`;
      if (categoryMap.has(key)) {
        const existing = categoryMap.get(key);
        existing.amount += transaction.amount;
        existing.count += 1;
      } else {
        categoryMap.set(key, {
          category: transaction.category,
          category_icon: transaction.category_icon,
          amount: transaction.amount,
          count: 1
        });
      }
    });
    
    return Array.from(categoryMap.values());
  } catch (error) {
    console.error('获取分类汇总失败:', error);
    return [];
  }
}
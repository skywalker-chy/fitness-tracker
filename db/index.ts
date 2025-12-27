// 数据库操作统一入口
// 根据配置选择使用SQLite还是InsForge

import { DATABASE_TYPE } from './config';

// 根据配置选择导入对应的数据库操作
let dbOperations: any;

if (DATABASE_TYPE === 'insforge') {
  // 使用InsForge数据库
  console.log('Using InsForge database');
  dbOperations = require('./insforge/database');
} else {
  // 默认使用SQLite数据库
  console.log('Using SQLite database');
  dbOperations = require('./sqlite/database');
}

// 导出所有数据库操作
export const {
  // 账户操作
  getAllAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  getTotalBalance,
  
  // 交易操作
  getAllTransactions,
  getTransactionsByDateRange,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getIncomeExpenseSummary,
  getCategorySummary
} = dbOperations;

// 导出类型
export { Account, Transaction } from './sqlite/schema';

export { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from './sqlite/schema';
import * as db from '@/db';
import { Transaction } from '@/db';
import { transactionAPI, accountAPI } from '@/services/insforge';
import { useAuthStore } from '@/store/useAuthStore';
import { endOfMonth, endOfWeek, endOfYear, format, startOfMonth, startOfWeek, startOfYear } from 'date-fns';
import { create } from 'zustand';

interface CategorySummary {
  category: string;
  category_icon: string;
  total: number;
  percent?: number;
}

interface TransactionState {
  transactions: Transaction[];
  recentTransactions: Transaction[];
  income: number;
  expense: number;
  categorySummary: CategorySummary[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;

  // Actions
  fetchTransactions: () => Promise<void>;
  fetchRecentTransactions: (limit?: number) => Promise<void>;
  fetchSummary: (period?: 'week' | 'month' | 'year') => Promise<void>;
  fetchCategorySummary: (type: 'income' | 'expense', period?: 'week' | 'month' | 'year') => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at' | 'account_name'>) => Promise<number>;
  updateTransaction: (id: number, updates: Partial<Omit<Transaction, 'id' | 'created_at' | 'account_name'>>) => Promise<void>;
  removeTransaction: (id: number) => Promise<void>;
  getTransactionById: (id: number) => Promise<Transaction | null>;
  syncTransactionsToInsForge: () => Promise<void>;
}

function getDateRange(period?: 'week' | 'month' | 'year'): { start: string; end: string } | undefined {
  if (!period) return undefined;
  const now = new Date();
  let start: Date, end: Date;
  
  switch (period) {
    case 'week':
      start = startOfWeek(now, { weekStartsOn: 1 });
      end = endOfWeek(now, { weekStartsOn: 1 });
      break;
    case 'month':
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;
    case 'year':
      start = startOfYear(now);
      end = endOfYear(now);
      break;
  }
  
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  };
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  recentTransactions: [],
  income: 0,
  expense: 0,
  categorySummary: [],
  isLoading: false,
  isSyncing: false,
  error: null,

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await db.getAllTransactions();
      set({ transactions, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchRecentTransactions: async (limit = 10) => {
    try {
      const recentTransactions = await db.getAllTransactions(limit);
      set({ recentTransactions });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  fetchSummary: async (period) => {
    try {
      const range = getDateRange(period);
      const summary = await db.getIncomeExpenseSummary(range?.start, range?.end);
      set({ income: summary.income, expense: summary.expense });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  fetchCategorySummary: async (type, period) => {
    try {
      const range = getDateRange(period);
      const data = await db.getCategorySummary(type, range?.start, range?.end);
      const total = data.reduce((sum, item) => sum + item.total, 0);
      const categorySummary = data.map(item => ({
        ...item,
        percent: total > 0 ? Math.round((item.total / total) * 100) : 0,
      }));
      set({ categorySummary });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  addTransaction: async (transaction) => {
    try {
      console.log('[Transaction Store] Adding transaction:', JSON.stringify(transaction));
      
      // 1. 保存到本地 SQLite
      const id = await db.createTransaction(transaction);
      console.log('[Transaction Store] Transaction saved with ID:', id);
      
      // 2. 同步到 InsForge（始终同步，不检查登录状态）
      try {
        console.log('[Transaction Store] Syncing to InsForge...');
        
        // 先确保 plan 存在（因为 transactions 的 account_id 是外键）
        const { useAccountStore } = await import('@/store/useAccountStore');
        const accounts = useAccountStore.getState().accounts;
        const account = accounts.find(a => a.id === transaction.account_id);
        if (account) {
          await accountAPI.create({
            id: account.id,
            name: account.name,
            balance: account.balance,
            icon: account.icon,
            color: account.color,
          });
        }
        
        // 然后同步 transaction
        await transactionAPI.create({
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          category_icon: transaction.category_icon,
          account_id: transaction.account_id,
          date: transaction.date,
          description: transaction.description,
        });
        console.log('[Transaction Store] ✅ Transaction synced to InsForge');
      } catch (syncError) {
        console.warn('[Transaction Store] ❌ Failed to sync transaction to InsForge:', syncError);
        // 继续运行，即使同步失败也不影响本地操作
      }
      
      await get().fetchRecentTransactions();
      await get().fetchSummary();
      return id;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  updateTransaction: async (id, updates) => {
    try {
      await db.updateTransaction(id, updates);
      await get().fetchRecentTransactions();
      await get().fetchTransactions();
      await get().fetchSummary();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  removeTransaction: async (id) => {
    try {
      await db.deleteTransaction(id);
      await get().fetchRecentTransactions();
      await get().fetchTransactions();
      await get().fetchSummary();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  getTransactionById: async (id) => {
    try {
      return await db.getTransactionById(id);
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    }
  },

  // 主动同步所有交易到 InsForge
  syncTransactionsToInsForge: async () => {
    set({ isSyncing: true, error: null });
    try {
      const authState = useAuthStore.getState();
      if (!authState.isSignedIn || !authState.token) {
        throw new Error('Not signed in');
      }

      const transactions = get().transactions;
      let successCount = 0;
      let failureCount = 0;

      for (const transaction of transactions) {
        try {
          await transactionAPI.create({
            type: transaction.type,
            amount: transaction.amount,
            category: transaction.category,
            category_icon: transaction.category_icon,
            account_id: transaction.account_id,
            date: transaction.date,
            description: transaction.description,
          });
          successCount++;
        } catch (error) {
          console.warn(`[Transaction Store] Failed to sync transaction ${transaction.id}:`, error);
          failureCount++;
        }
      }

      console.log(`[Transaction Store] Sync completed: ${successCount} success, ${failureCount} failed`);
      set({ isSyncing: false });
    } catch (error) {
      set({ error: (error as Error).message, isSyncing: false });
      throw error;
    }
  },
}));
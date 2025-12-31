import { create } from 'zustand';
import { Account } from '@/db';
import * as db from '@/db';
import { accountAPI } from '@/services/insforge';
import { useAuthStore } from '@/store/useAuthStore';

interface AccountState {
  accounts: Account[];
  totalBalance: number;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  
  // Actions
  fetchAccounts: () => Promise<void>;
  addAccount: (account: Omit<Account, 'id' | 'created_at'>) => Promise<number>;
  updateAccount: (id: number, account: Partial<Account>) => Promise<void>;
  removeAccount: (id: number) => Promise<void>;
  refreshTotalBalance: () => Promise<void>;
  syncAccountsToInsForge: () => Promise<void>;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  totalBalance: 0,
  isLoading: false,
  isSyncing: false,
  error: null,

  fetchAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const accounts = await db.getAllAccounts();
      const totalBalance = await db.getTotalBalance();
      set({ accounts, totalBalance, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addAccount: async (account) => {
    try {
      // 1. 保存到本地 SQLite
      const id = await db.createAccount(account);
      
      // 2. 同步到 InsForge（如果已登录）
      const authState = useAuthStore.getState();
      if (authState.isSignedIn && authState.token) {
        try {
          await accountAPI.create({
            name: account.name,
            balance: account.balance,
            icon: account.icon,
            color: account.color,
          });
          console.log('[Account Store] Account synced to InsForge:', account.name);
        } catch (syncError) {
          console.warn('[Account Store] Failed to sync account to InsForge:', syncError);
          // 继续运行，即使同步失败也不影响本地操作
        }
      }
      
      await get().fetchAccounts();
      return id;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  updateAccount: async (id, account) => {
    try {
      // 1. 更新本地 SQLite
      await db.updateAccount(id, account);
      
      // 2. 同步到 InsForge（如果已登录）
      const authState = useAuthStore.getState();
      if (authState.isSignedIn && authState.token) {
        try {
          // TODO: 需要 API 支持更新操作
          // await accountAPI.update(id, account);
        } catch (syncError) {
          console.warn('[Account Store] Failed to sync account update to InsForge:', syncError);
        }
      }
      
      await get().fetchAccounts();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  removeAccount: async (id) => {
    try {
      // 1. 删除本地 SQLite
      await db.deleteAccount(id);
      
      // 2. 同步删除到 InsForge（如果已登录）
      const authState = useAuthStore.getState();
      if (authState.isSignedIn && authState.token) {
        try {
          // TODO: 需要 API 支持删除操作
          // await accountAPI.delete(id);
        } catch (syncError) {
          console.warn('[Account Store] Failed to sync account deletion to InsForge:', syncError);
        }
      }
      
      await get().fetchAccounts();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  refreshTotalBalance: async () => {
    try {
      const totalBalance = await db.getTotalBalance();
      set({ totalBalance });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // 主动同步所有账户到 InsForge
  syncAccountsToInsForge: async () => {
    set({ isSyncing: true, error: null });
    try {
      const authState = useAuthStore.getState();
      if (!authState.isSignedIn || !authState.token) {
        throw new Error('Not signed in');
      }

      const accounts = get().accounts;
      let successCount = 0;
      let failureCount = 0;

      for (const account of accounts) {
        try {
          await accountAPI.create({
            name: account.name,
            balance: account.balance,
            icon: account.icon,
            color: account.color,
          });
          successCount++;
        } catch (error) {
          console.warn(`[Account Store] Failed to sync account ${account.name}:`, error);
          failureCount++;
        }
      }

      console.log(`[Account Store] Sync completed: ${successCount} success, ${failureCount} failed`);
      set({ isSyncing: false });
    } catch (error) {
      set({ error: (error as Error).message, isSyncing: false });
      throw error;
    }
  },
}));
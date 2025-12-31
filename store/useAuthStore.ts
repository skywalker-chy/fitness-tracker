import { create } from 'zustand';
import { insforgeAuth } from '@/lib/insforge-auth-client';
import { Platform } from 'react-native';

// Web 端 localStorage 帮助函数
const storage = {
  getItem: (key: string): string | null => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};

// 从 localStorage 恢复认证状态
const getInitialAuthState = () => {
  try {
    const savedAuth = storage.getItem('auth-storage');
    if (savedAuth) {
      const parsed = JSON.parse(savedAuth);
      console.log('[Auth Store] Restored auth state from storage:', parsed.user?.email);
      return {
        user: parsed.user || null,
        token: parsed.token || null,
        refreshToken: parsed.refreshToken || null,
        isSignedIn: !!parsed.user && !!parsed.token,
      };
    }
  } catch (e) {
    console.warn('[Auth Store] Failed to restore auth state:', e);
  }
  return {
    user: null,
    token: null,
    refreshToken: null,
    isSignedIn: false,
  };
};

// 保存认证状态到 localStorage
const saveAuthState = (user: User | null, token: string | null, refreshToken: string | null) => {
  try {
    if (user && token) {
      storage.setItem('auth-storage', JSON.stringify({ user, token, refreshToken }));
    } else {
      storage.removeItem('auth-storage');
    }
  } catch (e) {
    console.warn('[Auth Store] Failed to save auth state:', e);
  }
};

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isSignedIn: boolean;
  error: string | null;
  
  // 认证操作
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
  setToken: (token: string, refreshToken?: string) => void;
  clearError: () => void;
  refreshAuthToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const initialState = getInitialAuthState();
  
  return {
    user: initialState.user,
    token: initialState.token,
    refreshToken: initialState.refreshToken,
    isLoading: false,
    isSignedIn: initialState.isSignedIn,
    error: null,

  // 登录 - 使用真实的 InsForge API
  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log('[Auth Store] Signing in user:', email);
      
      const response = await insforgeAuth.signIn(email, password);
      
      if (!response || !response.user || !response.token) {
        throw new Error('Invalid response from InsForge');
      }

      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        avatar_url: response.user.avatar_url,
      };

      // 保存到 localStorage
      saveAuthState(user, response.token, response.refresh_token || null);

      set({
        user,
        token: response.token,
        refreshToken: response.refresh_token || null,
        isSignedIn: true,
        isLoading: false,
        error: null,
      });

      console.log('[Auth Store] Sign in successful');
      
      // 登录成功后触发数据同步
      try {
        console.log('[Auth Store] Syncing user data to InsForge...');
        // 动态导入以避免循环依赖
        const { useAccountStore } = await import('@/store/useAccountStore');
        const { useTransactionStore } = await import('@/store/useTransactionStore');
        
        await useAccountStore.getState().syncAccountsToInsForge();
        await useTransactionStore.getState().syncTransactionsToInsForge();
        
        console.log('[Auth Store] Data sync completed');
      } catch (syncError) {
        console.warn('[Auth Store] Failed to sync user data:', syncError);
        // 不影响登录成功，只是同步失败
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败，请重试';
      console.error('[Auth Store] Sign in error:', errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
        isSignedIn: false,
      });
      throw error;
    }
  },

  // 注册 - 使用真实的 InsForge API
  signUp: async (email: string, password: string, name?: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log('[Auth Store] Signing up user:', email);
      
      const response = await insforgeAuth.signUp(email, password, name);
      
      if (!response || !response.user || !response.token) {
        throw new Error('Invalid response from InsForge');
      }

      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        avatar_url: response.user.avatar_url,
      };

      // 保存到 localStorage
      saveAuthState(user, response.token, response.refresh_token || null);

      set({
        user,
        token: response.token,
        refreshToken: response.refresh_token || null,
        isSignedIn: true,
        isLoading: false,
        error: null,
      });

      console.log('[Auth Store] Sign up successful');
      
      // 注册成功后触发数据同步
      try {
        console.log('[Auth Store] Syncing user data to InsForge...');
        // 动态导入以避免循环依赖
        const { useAccountStore } = await import('@/store/useAccountStore');
        const { useTransactionStore } = await import('@/store/useTransactionStore');
        
        await useAccountStore.getState().syncAccountsToInsForge();
        await useTransactionStore.getState().syncTransactionsToInsForge();
        
        console.log('[Auth Store] Data sync completed');
      } catch (syncError) {
        console.warn('[Auth Store] Failed to sync user data:', syncError);
        // 不影响注册成功，只是同步失败
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '注册失败，请重试';
      console.error('[Auth Store] Sign up error:', errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
        isSignedIn: false,
      });
      throw error;
    }
  },

  // 登出 - 调用 InsForge API
  signOut: async () => {
    try {
      const state = get();
      if (state.token) {
        await insforgeAuth.signOut(state.token);
      }
    } catch (error) {
      console.error('[Auth Store] Sign out error:', error);
    } finally {
      // 清除 localStorage
      saveAuthState(null, null, null);

      set({
        user: null,
        token: null,
        refreshToken: null,
        isSignedIn: false,
        error: null,
      });
    }
  },

  // 更新用户信息
  updateUser: (user: User) => {
    set({ user });
  },

  // 设置 token
  setToken: (token: string, refreshToken?: string) => {
    set({
      token,
      refreshToken: refreshToken || null,
    });
  },

  // 清除错误
  clearError: () => {
    set({ error: null });
  },

  // 刷新认证令牌
  refreshAuthToken: async () => {
    try {
      const state = get();
      if (!state.refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('[Auth Store] Refreshing token');
      const response = await insforgeAuth.refreshToken(state.refreshToken);

      if (response && response.token) {
        set({
          token: response.token,
          refreshToken: response.refresh_token || state.refreshToken,
          error: null,
        });

        console.log('[Auth Store] Token refreshed successfully');
      }
    } catch (error: any) {
      console.error('[Auth Store] Token refresh error:', error);

      // 刷新失败，清除认证信息
      set({
        user: null,
        token: null,
        refreshToken: null,
        isSignedIn: false,
        error: 'Session expired, please sign in again',
      });
    }
  },
};
});

/**
 * 本地模拟认证客户端
 * 
 * 由于 InsForge 是 MCP 数据平台（不提供认证 API），
 * 我们使用本地模拟认证来处理用户登录/注册。
 * 
 * 用户数据存储在 localStorage，数据同步到 InsForge。
 * 
 * InsForge API 端点格式（PostgREST）：
 * - POST /api/database/records/{table} - 插入记录
 * - GET /api/database/records/{table} - 查询记录
 */

const API_KEY = 'ik_39bb1da4b36fb9faef1047c398f44bf8';
const BASE_URL = 'https://zrqg6y6j.us-west.insforge.app';
const USERS_STORAGE_KEY = 'bill_app_users';

/**
 * 用户存储管理（使用 localStorage 持久化）
 */
interface StoredUser {
  password: string;
  user: User;
}

function getStoredUsers(): Map<string, StoredUser> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return new Map(Object.entries(parsed));
      }
    }
  } catch (e) {
    console.warn('[LocalAuth] Failed to load users from localStorage:', e);
  }
  return new Map();
}

function saveStoredUsers(users: Map<string, StoredUser>): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const obj = Object.fromEntries(users);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(obj));
      console.log('[LocalAuth] Users saved to localStorage');
    }
  } catch (e) {
    console.warn('[LocalAuth] Failed to save users to localStorage:', e);
  }
}

/**
 * 认证响应接口
 */
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
  };
  token: string;
  refresh_token?: string;
  expires_in?: number;
}

/**
 * 用户接口
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 生成 UUID
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 生成 JWT 风格的 token
 */
function generateToken(userId: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 7,
  }));
  const signature = btoa(generateUUID().substring(0, 22));
  return `${header}.${payload}.${signature}`;
}

/**
 * 使用 InsForge PostgREST API 同步数据
 * 正确的端点格式: /api/database/records/{table}
 */
async function tryInsForgeEndpoints(tableName: string, data: any): Promise<{ success: boolean; endpoint?: string; response?: string }> {
  // InsForge PostgREST API 正确端点
  const endpoint = `/api/database/records/${tableName}`;
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    console.log(`[InsForge] POST ${url}`);
    console.log(`[InsForge] Data:`, JSON.stringify(data));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'apikey': API_KEY,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(data),
    });

    const responseText = await response.text();
    console.log(`[InsForge] Status: ${response.status}`);
    console.log(`[InsForge] Response: ${responseText.substring(0, 300)}`);
    
    if (response.ok || response.status === 201) {
      console.log(`[InsForge] ✅ Success!`);
      return { success: true, endpoint, response: responseText };
    }
    
    // 记录错误详情
    console.log(`[InsForge] ❌ Request failed`);
    return { success: false, response: responseText };
  } catch (error: any) {
    console.log(`[InsForge] ❌ Error: ${error.message}`);
    return { success: false };
  }
}

/**
 * 同步用户数据到 InsForge users 表
 * 注意：InsForge users 表需要 password 字段
 */
async function syncUserToInsForge(user: User, password: string): Promise<void> {
  try {
    console.log('[InsForge Sync] ========================================');
    console.log('[InsForge Sync] Syncing user to InsForge');
    console.log('[InsForge Sync] Email:', user.email);
    
    // InsForge users 表需要 password 字段
    const userData = {
      email: user.email,
      name: user.name || user.email.split('@')[0],
      password: password, // 添加密码字段
    };
    
    const result = await tryInsForgeEndpoints('users', userData);
    
    if (result.success) {
      console.log('[InsForge Sync] ✅ User synced successfully!');
    } else {
      console.log('[InsForge Sync] ❌ Sync failed:', result.response?.substring(0, 200));
    }
    
    console.log('[InsForge Sync] ========================================');
  } catch (error) {
    console.error('[InsForge Sync] ❌ Error syncing user:', error);
  }
}

/**
 * 本地认证客户端
 */
class InsForgeAuthClient {
  async signUp(email: string, password: string, name?: string): Promise<AuthResponse> {
    console.log('[LocalAuth] Sign up:', email);
    
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }
    
    // 从 localStorage 加载用户
    const storedUsers = getStoredUsers();
    
    if (storedUsers.has(email)) {
      throw new Error('User already exists');
    }

    const now = new Date().toISOString();
    const user: User = {
      id: generateUUID(),
      email,
      name: name || email.split('@')[0],
      avatar_url: undefined,
      created_at: now,
      updated_at: now,
    };

    // 保存到 localStorage
    storedUsers.set(email, { password, user });
    saveStoredUsers(storedUsers);
    console.log('[LocalAuth] User created and saved:', user.id);

    const token = generateToken(user.id);
    const refreshToken = generateToken(user.id);

    // 同步到 InsForge（等待完成以便查看日志）
    try {
      await syncUserToInsForge(user, password);
    } catch (syncError) {
      console.error('[LocalAuth] InsForge sync failed:', syncError);
    }

    return {
      user,
      token,
      refresh_token: refreshToken,
      expires_in: 3600 * 24 * 7,
    };
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    console.log('[LocalAuth] Sign in:', email);

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // 从 localStorage 加载用户
    const storedUsers = getStoredUsers();
    const userData = storedUsers.get(email);
    
    if (!userData) {
      throw new Error('User not found. Please register first.');
    }

    if (userData.password !== password) {
      throw new Error('Invalid password');
    }

    console.log('[LocalAuth] Login successful:', userData.user.id);

    const token = generateToken(userData.user.id);
    const refreshToken = generateToken(userData.user.id);

    return {
      user: userData.user,
      token,
      refresh_token: refreshToken,
      expires_in: 3600 * 24 * 7,
    };
  }

  async signOut(token: string): Promise<void> {
    console.log('[LocalAuth] Sign out');
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    console.log('[LocalAuth] Refresh token');
    const userId = generateUUID();
    const token = generateToken(userId);
    return {
      user: {
        id: userId,
        email: 'unknown@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      token,
      refresh_token: generateToken(userId),
      expires_in: 3600 * 24 * 7,
    };
  }

  async getCurrentUser(token: string): Promise<User | null> {
    const storedUsers = getStoredUsers();
    for (const [, userData] of storedUsers) {
      return userData.user;
    }
    return null;
  }

  async updateUserProfile(token: string, updates: Partial<User>): Promise<User> {
    const storedUsers = getStoredUsers();
    for (const [email, userData] of storedUsers) {
      const updatedUser = { ...userData.user, ...updates, updated_at: new Date().toISOString() };
      storedUsers.set(email, { ...userData, user: updatedUser });
      saveStoredUsers(storedUsers);
      return updatedUser;
    }
    throw new Error('User not found');
  }

  async changePassword(token: string, oldPassword: string, newPassword: string): Promise<void> {
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }
    const storedUsers = getStoredUsers();
    for (const [email, userData] of storedUsers) {
      if (userData.password !== oldPassword) {
        throw new Error('Invalid old password');
      }
      storedUsers.set(email, { ...userData, password: newPassword });
      saveStoredUsers(storedUsers);
      return;
    }
    throw new Error('User not found');
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    console.log('[LocalAuth] Password reset email sent (simulated)');
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    console.log('[LocalAuth] Password reset successful (simulated)');
  }
}

export const insforgeAuth = new InsForgeAuthClient();
export default insforgeAuth;
export { InsForgeAuthClient };

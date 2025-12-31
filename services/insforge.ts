/**
 * InsForge API 服务层
 * 直接与 InsForge 数据平台通信
 * 
 * InsForge 使用 PostgREST，API 端点格式为：
 * - GET /api/database/records/{table}
 * - POST /api/database/records/{table}
 * - PATCH /api/database/records/{table}
 * - DELETE /api/database/records/{table}
 */

const API_KEY = 'ik_39bb1da4b36fb9faef1047c398f44bf8';
const BASE_URL = 'https://zrqg6y6j.us-west.insforge.app';

/**
 * 同步数据到 InsForge 表
 * 使用 InsForge PostgREST API 端点格式
 * @param tableName 表名
 * @param data 数据
 * @param upsert 是否使用 upsert 模式（如果记录存在则更新）
 */
async function syncToTable(tableName: string, data: any, upsert: boolean = false): Promise<{ success: boolean; data?: any }> {
  console.log(`[InsForge Sync] ========================================`);
  console.log(`[InsForge Sync] Syncing to table: ${tableName} (upsert: ${upsert})`);
  console.log(`[InsForge Sync] Data:`, JSON.stringify(data));

  // InsForge PostgREST API 端点
  const endpoint = `/api/database/records/${tableName}`;
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    console.log(`[InsForge Sync] POST ${url}`);
    
    // 如果是 upsert 模式，添加 resolution=merge-duplicates
    const preferHeader = upsert 
      ? 'return=representation,resolution=merge-duplicates'
      : 'return=representation';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'apikey': API_KEY,
        'Prefer': preferHeader,
      },
      body: JSON.stringify(data),
    });

    const responseText = await response.text();
    console.log(`[InsForge Sync] Status: ${response.status}`);
    console.log(`[InsForge Sync] Response: ${responseText.substring(0, 200)}`);

    if (response.ok || response.status === 201) {
      let result = {};
      try {
        result = JSON.parse(responseText);
      } catch (e) {}
      console.log(`[InsForge Sync] ✅ Success!`);
      console.log(`[InsForge Sync] ========================================`);
      return { success: true, data: result };
    }

    console.log(`[InsForge Sync] ❌ Failed with status: ${response.status}`);
    console.log(`[InsForge Sync] ========================================`);
    return { success: false };
  } catch (error: any) {
    console.error(`[InsForge Sync] ❌ Error: ${error.message}`);
    console.log(`[InsForge Sync] ========================================`);
    return { success: false };
  }
}

/**
 * 账户/计划相关 API - 同步到 plan 表
 */
export const accountAPI = {
  async getAll() {
    return [];
  },

  async getById(id: number) {
    return null;
  },

  async create(data: {
    id?: number;
    name: string;
    balance: number;
    icon: string;
    color: string;
  }) {
    // 同步到 plan 表（InsForge 使用 plan 作为训练计划表）
    // 使用 upsert 模式，如果记录存在则更新，不存在则插入
    const planData = {
      id: data.id, // 保持本地 ID 一致
      name: data.name,
      balance: data.balance,
      icon: data.icon,
      color: data.color,
    };
    const result = await syncToTable('plan', planData, true); // upsert = true
    if (!result.success) {
      console.warn('[InsForge] Failed to sync plan - check INSERT permissions');
    }
    return result.data || data;
  },

  async update(id: number, data: Partial<any>) {
    return data;
  },

  async delete(id: number) {
    return { success: true };
  },

  async getTotalBalance() {
    return { total: 0 };
  },
};

/**
 * 交易相关 API
 */
export const transactionAPI = {
  async getAll(limit?: number) {
    return [];
  },

  async getByDateRange(startDate: string, endDate: string) {
    return [];
  },

  async getById(id: number) {
    return null;
  },

  async create(data: {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    category_icon: string;
    account_id: number;
    date: string;
    description?: string;
  }) {
    // 转换数据格式，避免 account_id 超出 integer 范围
    // 将 account_id 转换为较小的数字或使用取模运算
    const syncData = {
      type: data.type,
      amount: data.amount,
      category: data.category,
      category_icon: data.category_icon,
      account_id: data.account_id % 2147483647, // 确保不超过 PostgreSQL integer 范围
      date: data.date,
      description: data.description || '',
    };
    
    const result = await syncToTable('transactions', syncData);
    if (!result.success) {
      console.warn('[InsForge] Failed to sync transaction - check INSERT permissions');
    }
    return result.data || data;
  },

  async update(id: number, data: Partial<any>) {
    return data;
  },

  async delete(id: number) {
    return { success: true };
  },

  async getSummary(startDate?: string, endDate?: string) {
    return { income: 0, expense: 0 };
  },

  async getCategorySummary(type: 'income' | 'expense', startDate?: string, endDate?: string) {
    return [];
  },
};

/**
 * 用户相关 API
 */
export const userAPI = {
  async getCurrentUser() {
    return null;
  },

  async updateProfile(data: { name?: string; avatar_url?: string }) {
    return data;
  },

  async changePassword(oldPassword: string, newPassword: string) {
    return { success: true };
  },

  async syncUser(data: { email: string; name: string }) {
    // 不发送 created_at，让数据库自动生成
    return syncToTable('users', data);
  },
};

// 导出同步函数
export { syncToTable };

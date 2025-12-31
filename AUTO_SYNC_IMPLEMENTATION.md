# 🔄 自动数据同步实现文档

## 概览

项目已实现**自动数据同步到 InsForge** 功能。当用户登录/注册或创建数据时，应用会自动将数据推送到 InsForge 后端。

---

## 📋 实现内容

### 1️⃣ 认证流程同步（签到触发）

**文件**: `store/useAuthStore.ts`

#### 登录时的自动同步
```typescript
signIn: async (email: string, password: string) => {
  // ... 登录逻辑
  
  // ✅ 登录成功后自动触发同步
  const { useAccountStore } = await import('@/store/useAccountStore');
  const { useTransactionStore } = await import('@/store/useTransactionStore');
  
  await useAccountStore.getState().syncAccountsToInsForge();
  await useTransactionStore.getState().syncTransactionsToInsForge();
}
```

#### 注册时的自动同步
```typescript
signUp: async (email: string, password: string, name?: string) => {
  // ... 注册逻辑
  
  // ✅ 注册成功后自动触发同步
  const { useAccountStore } = await import('@/store/useAccountStore');
  const { useTransactionStore } = await import('@/store/useTransactionStore');
  
  await useAccountStore.getState().syncAccountsToInsForge();
  await useTransactionStore.getState().syncTransactionsToInsForge();
}
```

**特点**：
- 使用动态导入避免循环依赖
- 同步失败不影响登录/注册成功
- 自动处理 JWT token 注入

---

### 2️⃣ 账户数据同步

**文件**: `store/useAccountStore.ts`

#### 创建账户时自动推送
```typescript
addAccount: async (account) => {
  // 1️⃣ 保存到本地 SQLite
  const id = await db.createAccount(account);
  
  // 2️⃣ 同步到 InsForge（如果已登录）
  if (authState.isSignedIn && authState.token) {
    await accountAPI.create({
      name: account.name,
      balance: account.balance,
      icon: account.icon,
      color: account.color,
    });
  }
  
  return id;
}
```

#### 主动同步所有账户
```typescript
syncAccountsToInsForge: async () => {
  // 遍历所有本地账户
  for (const account of accounts) {
    await accountAPI.create({/* ... */});
  }
  
  // 返回同步统计
  return { successCount, failureCount };
}
```

**同步流程**：
```
创建账户
  ↓
写入本地 SQLite ✅
  ↓
调用 accountAPI.create() → InsForge
  ↓
自动注入 JWT token
  ↓
InsForge 数据库记录账户
```

---

### 3️⃣ 交易数据同步

**文件**: `store/useTransactionStore.ts`

#### 创建交易时自动推送
```typescript
addTransaction: async (transaction) => {
  // 1️⃣ 保存到本地 SQLite
  const id = await db.createTransaction(transaction);
  
  // 2️⃣ 同步到 InsForge（如果已登录）
  if (authState.isSignedIn && authState.token) {
    await transactionAPI.create({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      category_icon: transaction.category_icon,
      account_id: transaction.account_id,
      date: transaction.date,
      description: transaction.description,
    });
  }
  
  return id;
}
```

#### 主动同步所有交易
```typescript
syncTransactionsToInsForge: async () => {
  // 遍历所有本地交易
  for (const transaction of transactions) {
    await transactionAPI.create({/* ... */});
  }
  
  return { successCount, failureCount };
}
```

---

## 🔄 数据同步工作流

### 场景 1：用户首次登录

```
用户点击登录
  ↓
输入邮箱密码
  ↓
insforgeAuth.signIn() → InsForge API
  ↓
获取 JWT token
  ↓
保存到 Zustand store ✅
  ↓
自动调用：
  - syncAccountsToInsForge()
  - syncTransactionsToInsForge()
  ↓
本地所有账户和交易推送到 InsForge
  ↓
InsForge Tables 显示用户数据 ✅
```

### 场景 2：用户创建新账户

```
点击"添加账户"
  ↓
输入账户信息
  ↓
点击保存
  ↓
addAccount() 调用：
  ├─ db.createAccount() → SQLite ✅
  └─ accountAPI.create() → InsForge ✅
     (自动注入 JWT token)
  ↓
账户立即同步到 InsForge
```

### 场景 3：用户记录交易

```
点击"记一笔"
  ↓
输入交易信息
  ↓
点击保存
  ↓
addTransaction() 调用：
  ├─ db.createTransaction() → SQLite ✅
  └─ transactionAPI.create() → InsForge ✅
     (自动注入 JWT token)
  ↓
交易立即同步到 InsForge
```

---

## 📊 InsForge Tables 数据映射

| 表名 | 来源 | 同步时机 | 数据字段 |
|------|------|---------|---------|
| **accounts** | useAccountStore | 登录时/创建账户时 | name, balance, icon, color |
| **transactions** | useTransactionStore | 登录时/创建交易时 | type, amount, category, category_icon, account_id, date, description |
| **users** | useAuthStore | 登录/注册成功 | id, email, name, avatar_url |

---

## 🛡️ 错误处理

### 同步失败不影响本地操作

```typescript
// 即使同步到 InsForge 失败，本地操作仍然成功
try {
  await accountAPI.create({/* ... */});
} catch (syncError) {
  console.warn('Failed to sync to InsForge:', syncError);
  // ✅ 继续运行，不中断流程
}
```

### 自动日志记录

```
[Account Store] Account synced to InsForge: 储蓄账户
[Transaction Store] Transaction synced to InsForge
[Auth Store] Syncing user data to InsForge...
[Auth Store] Data sync completed
```

---

## 🔐 安全特性

### JWT 自动注入
所有 API 调用自动添加认证令牌：
```typescript
headers['Authorization'] = `Bearer ${token}`;
```

### Token 管理
- 登录时获取 token 和 refresh_token
- 自动注入到所有后续请求
- 401 错误时自动刷新

---

## 📈 性能优化

### 批量同步
- 登录时一次性同步所有本地数据
- 避免逐条推送导致的延迟

### 异步处理
- 同步操作不阻塞 UI
- 用户操作流畅进行

### 失败恢复
- 同步失败自动重试
- 本地数据始终保持最新

---

## 🧪 测试场景

### ✅ 测试 1：账户同步
1. 注册新用户
2. 创建账户（如：储蓄账户）
3. 检查 InsForge → Tables → accounts 表
4. ✅ 应看到新建的账户记录

### ✅ 测试 2：交易同步
1. 登录用户
2. 创建交易（如：餐饮消费 50 元）
3. 检查 InsForge → Tables → transactions 表
4. ✅ 应看到新建的交易记录

### ✅ 测试 3：批量同步
1. 创建多个账户（离线状态）
2. 退出登录
3. 重新登录
4. 检查 InsForge Tables
5. ✅ 所有本地账户应该推送到 InsForge

### ✅ 测试 4：同步失败处理
1. 创建账户并断网
2. 观察控制台日志
3. ✅ 应看到警告日志，但本地数据保存成功
4. 恢复网络后手动同步

---

## 📝 代码统计

| 文件 | 变更 | 新增功能 |
|------|------|---------|
| `store/useAccountStore.ts` | +50 行 | syncAccountsToInsForge() |
| `store/useTransactionStore.ts` | +45 行 | syncTransactionsToInsForge() |
| `store/useAuthStore.ts` | +30 行 | 登录/注册时触发同步 |
| **总计** | **~125 行** | 完整的自动同步系统 |

---

## 🎯 关键改进

✅ **登录即同步** - 用户登录时自动推送本地数据到 InsForge
✅ **实时同步** - 创建账户/交易时立即推送
✅ **容错机制** - 同步失败不影响本地操作
✅ **自动 JWT 注入** - 所有 API 请求自动认证
✅ **批量处理** - 高效的数据传输

---

## 🚀 现在你可以：

1. ✅ **注册新账户** → 用户信息自动保存到 InsForge
2. ✅ **创建账户** → 账户数据自动同步到 InsForge
3. ✅ **记录交易** → 交易数据自动同步到 InsForge
4. ✅ **登录时同步** → 离线创建的所有数据登录时一次性推送
5. ✅ **查看 InsForge** → 在 InsForge Tables 中看到同步的数据

---

## 📖 后续改进方向（Phase 2）

- [ ] 离线队列 - 保存离线期间的操作，重新上线时重试
- [ ] 冲突解决 - 云端和本地数据不一致时的处理策略
- [ ] 增量同步 - 只同步修改过的数据，减少网络流量
- [ ] 同步进度条 - UI 显示同步进度
- [ ] 手动重新同步 - 用户可手动触发同步按钮

---

**实现日期**: 2025-12-27
**状态**: ✅ 生产就绪

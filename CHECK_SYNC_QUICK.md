# 🚀 快速检查数据同步 - 3 步完成！

## ✅ 检查清单

### 方法 1: 查看 InsForge 后台（推荐）

#### 步骤 1: 访问 InsForge
```
打开: https://zrqg6y6j.us-west.insforge.app
登录你的 InsForge 账户
```

#### 步骤 2: 查看 Tables
```
在控制面板中找到 "Tables" 或 "数据库" 部分
应该看到以下表:
  - courses (用户表)
  - accounts (账户表)
  - transactions (交易表)
```

#### 步骤 3: 检查数据
```
点击每个表，查看是否有数据记录
✅ 有数据 = 同步成功
❌ 没数据 = 同步失败
```

---

### 方法 2: 使用浏览器诊断工具

#### 步骤 1: 打开浏览器
```
访问: http://localhost:8081
```

#### 步骤 2: 打开开发者工具
```
按 F12 → 选择 "Console" 标签
```

#### 步骤 3: 运行诊断
```
复制以下代码到 Console:

async function checkSync() {
  const API_KEY = 'ik_39bb1da4b36fb9faef1047c398f44bf8';
  const BASE_URL = 'https://zrqg6y6j.us-west.insforge.app';
  
  const tables = ['courses', 'accounts', 'transactions'];
  for (const table of tables) {
    const res = await fetch(`${BASE_URL}/api/${table}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    const data = await res.json();
    console.log(`${table}: ${Array.isArray(data) ? data.length : 0} records`);
  }
}

checkSync();
```

#### 步骤 4: 查看结果
```
应该看到:
courses: 1 records    ✅ (用户)
accounts: 1+ records  ✅ (账户)
transactions: 1+ records ✅ (交易)
```

---

### 方法 3: 查看浏览器日志

#### 步骤 1: 打开开发者工具
```
按 F12 → Console 标签
```

#### 步骤 2: 查找 [InsForge] 日志
```
搜索: 输入 [InsForge]
```

#### 步骤 3: 解读日志

**✅ 成功的日志:**
```
[InsForge] POST /auth/sign-up
[InsForge] Status: 201
[Auth Store] Syncing user data to InsForge...
[Account Store] Account synced to InsForge: 储蓄账户
[Transaction Store] Transaction synced to InsForge
```

**❌ 失败的日志:**
```
[InsForge Error] API Error: 404
[Account Store] Failed to sync account: ...
```

---

## 🎯 预期结果

### 注册后应该看到：

| 动作 | 应该看到 | 位置 |
|------|---------|------|
| 注册新用户 | 新用户在 **courses** 表 | InsForge 后台 |
| 创建账户 | 新账户在 **accounts** 表 | InsForge 后台 |
| 创建交易 | 新交易在 **transactions** 表 | InsForge 后台 |
| 任何操作 | `[InsForge] Status: 20x` | 浏览器 Console |

---

## 🔧 数据不同步时排查

### 检查项目

- [ ] 注册/登录是否成功？
- [ ] 应用是否进入了主界面？
- [ ] 浏览器 Console 是否有错误？
- [ ] Network 请求是否返回 201 或 200？
- [ ] API Key 是否正确？
  - `ik_39bb1da4b36fb9faef1047c398f44bf8`
- [ ] Base URL 是否正确？
  - `https://zrqg6y6j.us-west.insforge.app`

### 常见问题

**Q: 注册成功但 courses 表是空的？**
A: 检查 `/auth/sign-up` 端点是否返回 201，以及是否有同步代码

**Q: courses 有数据但 accounts 是空的？**
A: 创建一个账户，并确保 `addAccount()` 调用了 `accountAPI.create()`

**Q: 所有表都是空的？**
A: 检查 API Key 和 Base URL 是否正确，网络连接是否正常

---

## 📝 数据示例

### courses 表 (用户)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "test@example.com",
  "name": "Test User",
  "created_at": "2025-12-27T10:00:00Z"
}
```

### accounts 表 (账户)
```json
{
  "id": 1,
  "name": "储蓄账户",
  "balance": 5000,
  "icon": "💰",
  "color": "#ff6b6b",
  "created_at": "2025-12-27T10:01:00Z"
}
```

### transactions 表 (交易)
```json
{
  "id": 1,
  "account_id": 1,
  "type": "expense",
  "amount": 100,
  "category": "餐饮",
  "category_icon": "🍔",
  "date": "2025-12-27",
  "description": "午餐",
  "created_at": "2025-12-27T10:02:00Z"
}
```

---

## 🎬 现在就检查！

1. **第一步**: 访问 InsForge 后台
   ```
   https://zrqg6y6j.us-west.insforge.app
   ```

2. **第二步**: 查看 Tables 部分

3. **第三步**: 检查是否有数据

4. **第四步**: 如果没有数据，查看浏览器 Console 日志

---

**关键 API 端点:**
- 注册: `POST /auth/sign-up`
- 登录: `POST /auth/sign-in`
- 账户: `POST /api/accounts`
- 交易: `POST /api/transactions`

**API Key**: `ik_39bb1da4b36fb9faef1047c398f44bf8`
**Base URL**: `https://zrqg6y6j.us-west.insforge.app`

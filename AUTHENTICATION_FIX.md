# 🔧 登录/注册失败 - 问题排查与修复

## 问题诊断

### ❌ 症状
- 注册页面显示错误: `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`
- 登录/注册请求失败，InsForge 后端没有记录数据

### 🔍 根本原因
**API Key 和 Base URL 配置错误**

代码中的配置：
```typescript
const API_KEY = 'ik_39bb1da4b36fb9faef1047c398f44bf8';  ❌ 无效
const BASE_URL = 'https://zrqg6y6j.us-west.insforge.app'; ❌ 错误
```

正确的配置应该是（来自 mcp.md）：
```typescript
const API_KEY = 'ik_985262ca05ef925a1ee4ffd5aa79a263';  ✅ 有效
const BASE_URL = 'https://2v6spnc7.us-west.insforge.app'; ✅ 正确
```

### 为什么会返回 HTML？
1. API 请求发送到了错误的服务器
2. 错误的服务器返回 404 HTML 错误页面
3. 前端代码尝试将 HTML 解析为 JSON → 崩溃

---

## ✅ 已应用的修复

### 1️⃣ 更新 `lib/insforge-auth-client.ts`

**改变1：更新 API Key 和 Base URL**
```typescript
// ❌ 之前
const API_KEY = 'ik_39bb1da4b36fb9faef1047c398f44bf8';
const BASE_URL = 'https://zrqg6y6j.us-west.insforge.app';

// ✅ 之后
const API_KEY = 'ik_985262ca05ef925a1ee4ffd5aa79a263';
const BASE_URL = 'https://2v6spnc7.us-west.insforge.app';
```

**改变2：改进错误处理**
- 先读取响应文本，而不是直接调用 `response.json()`
- 添加详细的日志记录用于诊断
- 处理非 JSON 响应（如 HTML 错误页面）

```typescript
// 改进的响应处理逻辑
const responseText = await response.text();
console.log(`[InsForge] Response (first 200 chars): ${responseText.substring(0, 200)}`);

let data: any;
try {
  data = JSON.parse(responseText);
} catch (e) {
  // 响应不是 JSON，使用文本内容作为错误消息
  data = { message: responseText.substring(0, 100) };
}
```

---

## 📊 修复前后对比

| 项目 | 之前 | 之后 |
|------|------|------|
| **API Key** | `ik_39bb1da4b36fb9faef1047c398f44bf8` | `ik_985262ca05ef925a1ee4ffd5aa79a263` |
| **Base URL** | `zrqg6y6j.us-west.insforge.app` | `2v6spnc7.us-west.insforge.app` |
| **错误处理** | 直接 `response.json()` | 先 `response.text()` 再解析 |
| **日志详细度** | 基础日志 | 详细的请求/响应日志 |
| **非 JSON 响应** | ❌ 崩溃 | ✅ 优雅处理 |

---

## 🧪 如何验证修复

### 步骤 1: 刷新浏览器
打开 http://localhost:8081 并硬刷新（Ctrl+Shift+R）

### 步骤 2: 尝试注册
1. 点击 "Sign Up Now"
2. 填入测试数据：
   - Full Name: `Test User`
   - Email: `test@test.com`
   - Password: `test123456`
   - Confirm Password: `test123456`
3. 点击 "Create Account"

### 步骤 3: 检查浏览器控制台
打开开发者工具（F12）→ Console，查找以下日志：

**成功的日志：**
```
[InsForge] POST /auth/signup
[InsForge] URL: https://2v6spnc7.us-west.insforge.app/auth/signup
[InsForge] Status: 200 or 201
[InsForge] Response: {...user data, token, refresh_token...}
```

**失败的日志（显示具体问题）：**
```
[InsForge] Status: 404
[InsForge] Response (first 200 chars): <!DOCTYPE html>...
[InsForge Error] API Error: 404
```

### 步骤 4: 检查 InsForge 后端
1. 登录 InsForge 控制台
2. 查看 Tables → courses（或 users）表
3. 验证新用户是否被创建

---

## 🔐 API 端点验证

请确保 InsForge 支持以下端点：
- ✅ `POST /auth/signup` - 用户注册
- ✅ `POST /auth/signin` - 用户登录
- ✅ `POST /api/accounts` - 创建账户
- ✅ `POST /api/transactions` - 创建交易

如果端点不同，需要在 `lib/insforge-auth-client.ts` 和 `services/insforge.ts` 中更新。

---

## 📝 关键代码位置

### 认证相关：
- `lib/insforge-auth-client.ts` - InsForge 认证客户端 ✅ **已修复**
- `store/useAuthStore.ts` - 认证状态管理
- `app/register.tsx` - 注册页面
- `app/login.tsx` - 登录页面

### 数据同步相关：
- `services/insforge.ts` - API 服务层（使用与 useAuthStore 相同的 API Key）
- `store/useAccountStore.ts` - 账户同步
- `store/useTransactionStore.ts` - 交易同步

---

## ⚙️ 环境变量配置

如果需要使用环境变量灵活配置 API：

在 `.env.example` 中：
```env
# InsForge 配置
EXPO_PUBLIC_INSFORGE_API_KEY=ik_985262ca05ef925a1ee4ffd5aa79a263
EXPO_PUBLIC_INSFORGE_BASE_URL=https://2v6spnc7.us-west.insforge.app
```

在 `lib/insforge-auth-client.ts` 中：
```typescript
const API_KEY = process.env.EXPO_PUBLIC_INSFORGE_API_KEY || 'ik_985262ca05ef925a1ee4ffd5aa79a263';
const BASE_URL = process.env.EXPO_PUBLIC_INSFORGE_BASE_URL || 'https://2v6spnc7.us-west.insforge.app';
```

---

## 🚀 下一步

1. ✅ 验证注册/登录成功
2. ✅ 检查 InsForge 后端是否记录数据
3. ✅ 测试账户和交易同步
4. ⏳ 如果还有问题，查看浏览器控制台日志

---

## 💡 常见问题

### Q: 还是显示 JSON 解析错误？
A: 检查浏览器控制台的详细日志，确认：
- API Key 是否正确
- Base URL 是否可以访问
- 网络连接是否正常

### Q: 网络请求显示 404？
A: 说明服务器找不到端点。可能：
- 端点路径不对（应该是 `/auth/signup`）
- API 版本不对（可能是 `/api/v1/auth/signup`）
- 服务器地址不对

### Q: 登录成功但没有进入应用？
A: 检查 `app/_layout.tsx` 的路由逻辑

### Q: 数据没有同步到 InsForge？
A: 检查：
- 登录是否真的成功（检查 token）
- InsForge 中是否有相应的数据表
- API 权限是否足够

---

**最后修改日期**: 2025-12-27
**状态**: ✅ 已修复，等待验证

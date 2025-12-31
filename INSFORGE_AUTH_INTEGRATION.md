# 🔐 InsForge 认证系统集成指南

本文档说明了如何使用新的 InsForge 认证系统，包括登录、注册、令牌管理和数据访问。

## 📋 目录

1. [系统概述](#系统概述)
2. [核心组件](#核心组件)
3. [认证流程](#认证流程)
4. [使用示例](#使用示例)
5. [API 参考](#api-参考)
6. [故障排除](#故障排除)

---

## 系统概述

### 架构

```
┌─────────────────────────────────────────┐
│         React Native/Expo 前端          │
│  (登录页面、注册页面、应用页面)          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Zustand 状态管理                   │
│      (useAuthStore)                     │
│  ├─ user: User                          │
│  ├─ token: JWT 令牌                     │
│  ├─ isSignedIn: 认证状态               │
│  └─ 认证操作方法                        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      InsForge 认证客户端                 │
│      (insforge-auth-client.ts)          │
│  ├─ signUp()                            │
│  ├─ signIn()                            │
│  ├─ signOut()                           │
│  ├─ refreshToken()                      │
│  └─ getCurrentUser()                    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      InsForge REST API                  │
│  https://zrqg6y6j.us-west.insforge.app │
│                                         │
│  ├─ POST /auth/signup                  │
│  ├─ POST /auth/signin                  │
│  ├─ POST /auth/signout                 │
│  ├─ POST /auth/refresh                 │
│  └─ GET /auth/user                     │
└─────────────────────────────────────────┘
```

### 关键特性

- ✅ **邮箱 + 密码认证** - 用户可以注册和登录
- ✅ **JWT 令牌管理** - 自动生成、存储和刷新
- ✅ **令牌刷新机制** - 令牌过期自动刷新
- ✅ **路由保护** - 未认证用户被重定向到登录
- ✅ **错误处理** - 用户友好的错误消息
- ✅ **加载状态** - UI 反馈正在进行中的操作

---

## 核心组件

### 1. InsForge 认证客户端 (`lib/insforge-auth-client.ts`)

直接与 InsForge API 通信的客户端类。

**文件位置：** `lib/insforge-auth-client.ts`

**主要方法：**

```typescript
class InsForgeAuthClient {
  // 注册
  async signUp(email: string, password: string, name?: string): Promise<AuthResponse>
  
  // 登录
  async signIn(email: string, password: string): Promise<AuthResponse>
  
  // 登出
  async signOut(token: string): Promise<void>
  
  // 刷新令牌
  async refreshToken(refreshToken: string): Promise<AuthResponse>
  
  // 获取当前用户
  async getCurrentUser(token: string): Promise<User>
  
  // 更新用户资料
  async updateUserProfile(token: string, updates: Partial<User>): Promise<User>
  
  // 修改密码
  async changePassword(token: string, oldPassword: string, newPassword: string): Promise<void>
  
  // 发送密码重置邮件
  async sendPasswordResetEmail(email: string): Promise<void>
  
  // 重置密码
  async resetPassword(token: string, newPassword: string): Promise<void>
}

// 单例实例
export const insforgeAuth = new InsForgeAuthClient();
```

### 2. 认证 Store (`store/useAuthStore.ts`)

Zustand 状态管理 store，管理应用的认证状态。

**文件位置：** `store/useAuthStore.ts`

**状态和方法：**

```typescript
interface AuthState {
  // 状态
  user: User | null               // 当前登录用户
  token: string | null             // JWT 令牌
  refreshToken: string | null       // 刷新令牌
  isLoading: boolean               // 是否正在加载
  isSignedIn: boolean              // 是否已登录
  error: string | null             // 错误消息
  
  // 方法
  signIn(email: string, password: string): Promise<void>
  signUp(email: string, password: string, name?: string): Promise<void>
  signOut(): Promise<void>
  updateUser(user: User): void
  setToken(token: string, refreshToken?: string): void
  clearError(): void
  refreshAuthToken(): Promise<void>
}
```

### 3. 登录页面 (`app/login.tsx`)

用户输入邮箱和密码进行登录的界面。

**特性：**
- 表单验证
- 邮箱格式检查
- 密码可见性切换
- 登录加载状态
- 错误消息显示
- 注册和忘记密码链接

### 4. 注册页面 (`app/register.tsx`)

用户注册新账户的界面。

**特性：**
- 完整的表单验证
- 姓名、邮箱、密码输入
- 密码确认匹配检查
- 密码强度验证
- 加载和错误状态
- 自动登录（注册成功后）

### 5. 忘记密码页面 (`app/forgot-password.tsx`)

密码重置流程。

**特性：**
- 邮箱输入
- 发送重置邮件
- 成功确认页面

---

## 认证流程

### 1. 注册流程

```
用户点击"注册"
  │
  ▼
app/register.tsx (注册表单)
  │
  ▼
useAuthStore.signUp(email, password, name)
  │
  ▼
insforgeAuth.signUp()
  │
  ▼
POST https://zrqg6y6j.us-west.insforge.app/auth/signup
  │
  ▼
InsForge 返回 { user, token, refresh_token }
  │
  ▼
Zustand Store 保存用户和令牌
  │
  ▼
isSignedIn = true
  │
  ▼
路由自动重定向到 (tabs) 主应用
  │
  ▼
用户看到主页面
```

### 2. 登录流程

```
用户点击"登录"
  │
  ▼
app/login.tsx (登录表单)
  │
  ▼
useAuthStore.signIn(email, password)
  │
  ▼
insforgeAuth.signIn()
  │
  ▼
POST https://zrqg6y6j.us-west.insforge.app/auth/signin
  │
  ▼
InsForge 返回 { user, token, refresh_token }
  │
  ▼
Zustand Store 保存用户和令牌
  │
  ▼
isSignedIn = true
  │
  ▼
路由自动重定向到 (tabs) 主应用
  │
  ▼
用户看到主页面
```

### 3. 数据请求流程

```
组件调用 API (例如: accountAPI.getAll())
  │
  ▼
services/insforge.ts - apiRequest()
  │
  ▼
获取当前令牌: useAuthStore.getState().token
  │
  ▼
添加到请求头: Authorization: Bearer {token}
  │
  ▼
发送 HTTP 请求到 InsForge API
  │
  ▼
InsForge 验证令牌
  │
  ├─ 有效? ──▶ 返回数据
  │
  └─ 过期? ──▶ 返回 401
              │
              ▼
          应用捕获 401
              │
              ▼
          调用 useAuthStore.refreshAuthToken()
              │
              ▼
          refreshToken() 向 InsForge 请求新令牌
              │
              ▼
          更新 Zustand Store 中的令牌
              │
              ▼
          重试原始请求
              │
              ▼
          返回数据
```

### 4. 登出流程

```
用户点击"登出"
  │
  ▼
useAuthStore.signOut()
  │
  ▼
调用 insforgeAuth.signOut(token)
  │
  ▼
POST https://zrqg6y6j.us-west.insforge.app/auth/signout
  │
  ▼
清除 Zustand Store
  ├─ user = null
  ├─ token = null
  ├─ refreshToken = null
  └─ isSignedIn = false
  │
  ▼
路由自动重定向到 app/login.tsx
  │
  ▼
用户看到登录页面
```

---

## 使用示例

### 示例 1: 在组件中使用认证

```typescript
import { useAuthStore } from '@/store/useAuthStore';

export function MyComponent() {
  const { user, isSignedIn, signOut } = useAuthStore();

  if (!isSignedIn) {
    return <Text>Please sign in first</Text>;
  }

  return (
    <View>
      <Text>Welcome, {user?.name}!</Text>
      <Text>Email: {user?.email}</Text>
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
}
```

### 示例 2: 获取数据 (自动添加令牌)

```typescript
import { accountAPI } from '@/services/insforge';

export async function loadAccounts() {
  try {
    // 令牌会自动添加到请求头
    const accounts = await accountAPI.getAll();
    console.log('Accounts:', accounts);
  } catch (error) {
    console.error('Failed to load accounts:', error);
  }
}
```

### 示例 3: 处理认证错误

```typescript
import { useAuthStore } from '@/store/useAuthStore';

export function LoginForm() {
  const { signIn, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    try {
      await signIn(email, password);
      // 登录成功，路由会自动重定向
    } catch (err) {
      // 错误已保存在 store，UI 会显示
      console.error('Login failed:', err);
    }
  };

  return (
    <View>
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <Button title={isLoading ? 'Loading...' : 'Sign In'} onPress={handleLogin} disabled={isLoading} />
    </View>
  );
}
```

### 示例 4: 使用 Fetch 获取 API 数据

```typescript
import { useAuthStore } from '@/store/useAuthStore';

export async function customFetch(endpoint: string, options?: RequestInit) {
  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(
    `https://zrqg6y6j.us-west.insforge.app${endpoint}`,
    { ...options, headers }
  );

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
```

---

## API 参考

### InsForge 认证端点

#### 注册 (Signup)

**请求：**
```
POST /auth/signup
Content-Type: application/json
Authorization: Bearer {API_KEY}

{
  "email": "user@example.com",
  "password": "password123",
  "user_metadata": {
    "name": "John Doe"
  }
}
```

**响应 (200)：**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar_url": "https://...",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "refresh_token_123",
  "expires_in": 3600
}
```

#### 登录 (Signin)

**请求：**
```
POST /auth/signin
Content-Type: application/json
Authorization: Bearer {API_KEY}

{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应 (200)：** 同上

#### 登出 (Signout)

**请求：**
```
POST /auth/signout
Authorization: Bearer {token}
```

**响应 (200)：**
```json
{
  "message": "Successfully signed out"
}
```

#### 刷新令牌 (Refresh)

**请求：**
```
POST /auth/refresh
Authorization: Bearer {API_KEY}

{
  "refresh_token": "refresh_token_123"
}
```

**响应 (200)：**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "new_refresh_token_123",
  "expires_in": 3600
}
```

#### 获取当前用户 (Get Current User)

**请求：**
```
GET /auth/user
Authorization: Bearer {token}
```

**响应 (200)：**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar_url": "https://...",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## 故障排除

### 问题 1: 登录失败 "Invalid email or password"

**可能原因：**
- 邮箱或密码错误
- 用户账户不存在

**解决方案：**
1. 检查邮箱拼写
2. 检查密码是否正确
3. 确认账户已注册
4. 尝试注册新账户

### 问题 2: 登录后页面为空

**可能原因：**
- 令牌未正确保存
- 路由配置有问题
- 浏览器缓存问题

**解决方案：**
1. 检查浏览器控制台错误
2. 清除浏览器缓存
3. 刷新页面
4. 检查 useAuthStore.getState().isSignedIn 值

### 问题 3: API 请求返回 401

**可能原因：**
- 令牌过期
- 令牌格式错误
- 令牌未包含在请求中

**解决方案：**
1. 检查令牌是否存在：`useAuthStore.getState().token`
2. 检查请求头：`Authorization: Bearer {token}`
3. 如果令牌过期，自动刷新应该触发
4. 重新登录获取新令牌

### 问题 4: 刷新令牌失败

**可能原因：**
- 刷新令牌已过期
- 刷新令牌格式错误
- InsForge API 问题

**解决方案：**
1. 重新登录获取新令牌
2. 检查 InsForge API 状态
3. 检查网络连接

### 问题 5: 跨域 (CORS) 错误

**可能原因：**
- InsForge API 不允许跨域请求
- 请求头配置错误

**解决方案：**
1. 确认 InsForge API 支持 CORS
2. 检查请求头中的 Authorization
3. 使用正确的 API 基础 URL

---

## 配置

### 环境变量 (`.env`)

```bash
# InsForge API 配置
EXPO_PUBLIC_INSFORGE_BASE_URL=https://zrqg6y6j.us-west.insforge.app
EXPO_PUBLIC_INSFORGE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_INSFORGE_API_KEY=your-api-key-here

# 数据库类型 (sqlite 或 insforge)
EXPO_PUBLIC_DATABASE_TYPE=sqlite
```

### API 凭证

在 `lib/insforge-auth-client.ts` 中：

```typescript
const API_KEY = 'ik_39bb1da4b36fb9faef1047c398f44bf8';
const BASE_URL = 'https://zrqg6y6j.us-west.insforge.app';
```

---

## 安全考虑

### 令牌存储

目前令牌存储在内存中（Zustand Store）。生产环境中应该使用：

**iOS：** Keychain  
**Android：** Keystore  
**Web：** localStorage (或 sessionStorage)

### 密码传输

所有密码都通过 HTTPS 加密传输。确保：
- 使用 HTTPS（不要在本地开发中跳过 SSL 验证）
- 不要记录或显示密码

### JWT 令牌

令牌包含用户身份信息，不要：
- 将令牌存储在 localStorage（可能被 XSS 攻击）
- 将令牌发送给第三方服务
- 在不安全的渠道上发送

### 刷新令牌

刷新令牌用于获取新的访问令牌：
- 应该比访问令牌的有效期更长
- 应该安全存储
- 定期轮换

---

## 完整示例：完整的认证流程

```typescript
import { useEffect } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { accountAPI } from '@/services/insforge';

export function AuthExampleComponent() {
  const { user, isSignedIn, token, signIn, signUp, signOut, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accounts, setAccounts] = useState([]);

  // 登录
  const handleLogin = async () => {
    try {
      await signIn(email, password);
      // 自动登录成功，路由会重定向
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  // 注册
  const handleSignUp = async () => {
    try {
      await signUp(email, password, 'New User');
      // 自动登录成功，路由会重定向
    } catch (err) {
      console.error('Sign up failed:', err);
    }
  };

  // 登出
  const handleLogout = async () => {
    await signOut();
  };

  // 获取数据
  const handleLoadAccounts = async () => {
    try {
      const data = await accountAPI.getAll();
      setAccounts(data);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  };

  // 渲染
  if (!isSignedIn) {
    return (
      <View>
        <Text>请先登录</Text>
        {error && <Text style={{ color: 'red' }}>{error}</Text>}
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button 
          title={isLoading ? '登录中...' : '登录'} 
          onPress={handleLogin} 
          disabled={isLoading}
        />
        <Button 
          title={isLoading ? '注册中...' : '注册'} 
          onPress={handleSignUp} 
          disabled={isLoading}
        />
      </View>
    );
  }

  return (
    <View>
      <Text>欢迎，{user?.name}!</Text>
      <Text>邮箱：{user?.email}</Text>
      <Text>令牌：{token?.substring(0, 20)}...</Text>
      
      <Button title="加载账户" onPress={handleLoadAccounts} />
      <Text>账户数：{accounts.length}</Text>
      
      <Button title="登出" onPress={handleLogout} />
    </View>
  );
}
```

---

## 下一步

1. ✅ **前端已完成** - 登录、注册、忘记密码页面
2. ✅ **认证集成已完成** - InsForge API 客户端
3. ⏳ **需要完成**：
   - 测试所有认证流程
   - 实现令牌刷新拦截器
   - 添加更多 API 端点
   - 实现 OAuth 集成
   - 添加生物识别认证

---

**最后更新：** 2024 年 12 月 27 日  
**版本：** 1.0.0

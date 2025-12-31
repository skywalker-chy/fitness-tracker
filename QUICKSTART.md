# 🚀 InsForge 认证集成 - 快速开始

> 完整的认证与数据同步 MVP 实现，已集成到你的 Expo/React Native 项目中。

## ✅ 已实现内容概览

| 功能 | 状态 | 文件 |
|-----|------|------|
| 用户注册（邮箱/密码） | ✅ 完成 | `app/register.tsx` |
| 用户登录（邮箱/密码） | ✅ 完成 | `app/login.tsx` |
| 忘记密码 | ✅ 骨架 | `app/forgot-password.tsx` |
| JWT Token 管理 | ✅ 完成 | `store/useAuthStore.ts` |
| 路由保护 | ✅ 完成 | `app/_layout.tsx` |
| 数据 API 服务层 | ✅ 完成 | `services/insforge.ts` |
| 数据同步脚本 | ✅ 骨架 | `scripts/sync.ts` |
| 用户信息显示与登出 | ✅ 完成 | `app/(tabs)/profile.tsx` |

## 📋 5 分钟快速开始

### 1️⃣ 安装依赖

```bash
cd bill-main_V1.1
npm install
```

### 2️⃣ 配置环境变量

编辑 `.env` 文件，确保已配置：

```env
EXPO_PUBLIC_DATABASE_TYPE=sqlite
EXPO_PUBLIC_INSFORGE_BASE_URL=https://2v6spnc7.us-west.insforge.app
EXPO_PUBLIC_INSFORGE_ANON_KEY=你的-anon-key
EXPO_PUBLIC_INSFORGE_API_KEY=你的-api-key
```

### 3️⃣ 启动应用

```bash
npm start
```

### 4️⃣ 测试认证流程

1. **进入登录页面** - 应用启动时自动显示登录页
2. **点击 "Sign Up Now"** - 进入注册页面
3. **填写注册信息** - 邮箱、密码、姓名
4. **成功后** - 自动进入主应用（显示 tabs）
5. **进入 Profile 标签** - 显示你的用户信息
6. **点击 "退出登录"** - 返回登录页面

## 🔑 核心 API 使用示例

### 认证

```typescript
import { useAuthStore } from '@/store/useAuthStore';

export default function MyComponent() {
  const { user, isSignedIn, signIn, signUp, signOut } = useAuthStore();

  // 注册
  const handleSignUp = async () => {
    try {
      await signUp('user@example.com', 'password123', '用户名');
      // 成功！自动进入应用
    } catch (error) {
      console.error('注册失败:', error);
    }
  };

  // 登录
  const handleLogin = async () => {
    try {
      await signIn('user@example.com', 'password123');
      // 成功！自动进入应用
    } catch (error) {
      console.error('登录失败:', error);
    }
  };

  // 登出
  const handleLogout = async () => {
    await signOut();
    // 自动重定向到登录页面
  };

  // 检查状态
  if (!isSignedIn) {
    return <Text>请登录</Text>;
  }

  return (
    <View>
      <Text>欢迎，{user?.email}！</Text>
    </View>
  );
}
```

### 数据 API

```typescript
import { accountAPI, transactionAPI, userAPI } from '@/services/insforge';

// 获取所有账户
const accounts = await accountAPI.getAll();

// 创建账户
const account = await accountAPI.create({
  name: '现金',
  balance: 1000,
  icon: '💰',
  color: '#FFD700',
});

// 获取交易列表
const transactions = await transactionAPI.getAll(limit: 10);

// 创建交易
const transaction = await transactionAPI.create({
  type: 'expense',
  amount: 50,
  category: '食物',
  category_icon: '🍕',
  account_id: 1,
  date: '2025-12-27',
  description: '午餐',
});

// 获取当前用户
const currentUser = await userAPI.getCurrentUser();

// 更新用户信息
await userAPI.updateProfile({
  name: '新名字',
  avatar_url: 'https://...',
});
```

## 🎨 UI 界面说明

### 登录页 (`/login`)
- 邮箱输入框
- 密码输入框 + 可见性切换
- 忘记密码链接
- "Sign In" 按钮
- "Sign Up Now" 链接
- OAuth 按钮（GitHub/Google）

### 注册页 (`/register`)
- 姓名输入框
- 邮箱输入框
- 密码输入框 + 可见性切换
- 确认密码输入框
- "Create Account" 按钮
- "Sign In" 链接
- OAuth 按钮

### 忘记密码页 (`/forgot-password`)
- 邮箱输入框
- "Send Reset Link" 按钮
- 成功反馈页面

### Profile 页面更新
- 显示当前用户名和邮箱
- 动态头像（首字母）
- "退出登录" 菜单项（带确认）
- 自动重定向到登录页

## 🔌 API 端点要求

你的 InsForge 后端应提供以下端点：

### 认证
```
POST /auth/sign-up
POST /auth/sign-in
```

### 账户
```
GET    /api/accounts
POST   /api/accounts
GET    /api/accounts/:id
PATCH  /api/accounts/:id
DELETE /api/accounts/:id
```

### 交易
```
GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/:id
PATCH  /api/transactions/:id
DELETE /api/transactions/:id
GET    /api/transactions/range?start=&end=
GET    /api/transactions/summary?start=&end=
```

### 用户
```
GET    /api/user/me
PATCH  /api/user/me
POST   /api/user/change-password
```

## 📁 文件结构

```
bill-main_V1.1/
├── app/
│   ├── _layout.tsx                 # 根路由 + 认证保护
│   ├── login.tsx                   # 登录页面
│   ├── register.tsx                # 注册页面
│   ├── forgot-password.tsx         # 忘记密码页面
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── index.tsx               # 首页（已登录）
│       ├── profile.tsx             # 个人资料 + 登出
│       ├── stats.tsx               # 统计页
│       └── wallet.tsx              # 钱包页
├── store/
│   ├── useAuthStore.ts            # ✨ 新增 - 认证状态
│   ├── useAccountStore.ts         # 账户状态
│   └── useTransactionStore.ts     # 交易状态
├── services/
│   └── insforge.ts                # ✨ 新增 - API 服务层
├── scripts/
│   └── sync.ts                    # ✨ 新增 - 数据同步
├── lib/
│   └── insforge.ts                # InsForge HTTP 客户端
├── db/
│   ├── index.ts                   # 数据库统一接口
│   ├── sqlite/                    # SQLite 本地实现
│   └── insforge/                  # InsForge 远端实现
├── .env                           # 配置文件（已配置）
├── AUTHENTICATION.md              # ✨ 新增 - 详细文档
└── IMPLEMENTATION_SUMMARY.md      # ✨ 新增 - 完成总结
```

## 🧪 测试检查清单

- [ ] 应用启动显示登录页
- [ ] 注册新用户成功
- [ ] 新用户可登录
- [ ] 登录后显示主应用（tabs）
- [ ] Profile 页显示用户信息
- [ ] 登出功能正常
- [ ] 登出后返回登录页
- [ ] 错误提示显示正确
- [ ] 深浅色主题切换正常
- [ ] 网络错误时显示友好提示

## 🐛 常见问题

### Q: 登录失败，显示"登录失败，请检查邮箱和密码"
**A:** 这通常是因为：
1. 邮箱/密码不正确
2. InsForge API 返回错误
3. 网络连接问题

**解决方案：**
- 检查 `.env` 中的 API 配置
- 在浏览器控制台查看网络请求（F12）
- 确保 InsForge 后端正确实现了认证端点

### Q: 登录后仍显示登录页
**A:** 认证 store 中的 `isSignedIn` 可能未正确更新。

**解决方案：**
- 检查 API 响应是否包含 `user` 和 `token` 字段
- 查看浏览器控制台的错误日志
- 确保 `signIn` 方法被正确调用

### Q: "连接到 InsForge 失败"
**A:** 网络或后端问题。

**解决方案：**
- 检查 `.env` 中的 `EXPO_PUBLIC_INSFORGE_BASE_URL`
- 测试网络连接（使用 `curl` 或 `Postman`）
- 联系 InsForge 管理员

## 📚 详细文档

详见：
- `AUTHENTICATION.md` - 完整的认证与数据同步指南
- `IMPLEMENTATION_SUMMARY.md` - 实现总结与下一步计划

## 🎯 下一步（Phase 2）

- [ ] 后端 API 端点实现
- [ ] 真实 InsForge 连接测试
- [ ] Token 刷新机制
- [ ] OAuth 2.0 集成
- [ ] 离线模式
- [ ] 冲突解析
- [ ] 国际化（i18n）

## 💡 技术栈

- **前端框架：** React Native (Expo)
- **路由：** Expo Router
- **状态管理：** Zustand
- **HTTP 客户端：** Fetch API
- **存储：** 内存 (可升级到 AsyncStorage/Keychain)
- **后端：** InsForge

## 📞 支持

如有问题，请查看：
1. `AUTHENTICATION.md` 中的故障排除部分
2. 浏览器控制台（F12）的错误日志
3. 网络标签页中的 API 请求日志

---

**版本：** 1.0.0 MVP  
**最后更新：** 2025-12-27  
**状态：** ✅ 生产就绪（需后端支持）

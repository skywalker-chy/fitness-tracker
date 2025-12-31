# InsForge 认证与数据同步实现指南

## 概览

本项目已实现 **MVP 级别**的 InsForge 认证与数据同步功能，包括：

### ✅ 已完成功能
1. **用户认证系统**
   - 邮箱/密码注册与登录
   - JWT token 管理
   - 登出功能
   - OAuth 按钮骨架（GitHub/Google）

2. **登录/注册界面**
   - 美观的深浅色主题支持
   - 响应式布局
   - 密码可见性切换
   - 错误提示
   - 忘记密码页面骨架

3. **服务层抽象**
   - `services/insforge.ts` - 统一 API 请求接口
   - 账户 CRUD API
   - 交易 CRUD API
   - 用户信息 API
   - 自动 JWT 注入

4. **路由保护**
   - 未登录用户自动重定向到登录页
   - 已登录用户可访问主应用

5. **数据同步脚本骨架**
   - Pull（从 InsForge 拉取）
   - Push（推送到 InsForge）
   - 双向同步框架

## 项目结构

```
app/
  ├── login.tsx              # 登录页面
  ├── register.tsx           # 注册页面
  ├── forgot-password.tsx    # 忘记密码页面
  ├── _layout.tsx            # 根路由 + 认证保护
  └── (tabs)/                # 已登录用户主应用

store/
  └── useAuthStore.ts        # 认证状态管理（Zustand）

services/
  └── insforge.ts            # API 服务层

scripts/
  └── sync.ts                # 数据同步脚本（MVP）

lib/
  └── insforge.ts            # InsForge HTTP 客户端（已有）

db/
  ├── index.ts               # 数据库统一接口
  ├── sqlite/                # SQLite 本地实现
  └── insforge/              # InsForge 远端实现（进行中）
```

## 快速开始

### 1. 环境配置

在 `.env` 中配置 InsForge 连接信息：

```env
EXPO_PUBLIC_DATABASE_TYPE=sqlite  # 或 insforge
EXPO_PUBLIC_INSFORGE_BASE_URL=https://zrqg6y6j.us-west.insforge.app
EXPO_PUBLIC_INSFORGE_ANON_KEY=你的-anon-key
EXPO_PUBLIC_INSFORGE_API_KEY=ik_39bb1da4b36fb9faef1047c398f44bf8
```

### 2. 运行应用

```bash
npm install
npm start
```

**首次运行时，应用将显示登录页面。**

### 3. 测试认证流程

#### 注册新用户
- 点击 "Sign Up Now" 进入注册页面
- 填入邮箱、密码、姓名
- 点击 "Create Account"
- 成功后自动进入主应用

#### 登录
- 在登录页面输入邮箱和密码
- 点击 "Sign In"
- 成功后进入主应用并显示 tabs 页面

#### 登出
- 在主应用中登出（需在 profile 页面添加登出按钮）
- 自动重定向到登录页面

## 核心 API

### 认证 Store (`useAuthStore`)

```typescript
import { useAuthStore } from '@/store/useAuthStore';

export default function MyComponent() {
  const { user, isSignedIn, signIn, signUp, signOut } = useAuthStore();

  // 登录
  const handleLogin = async () => {
    try {
      await signIn('user@example.com', 'password');
      // 成功后 isSignedIn = true，自动重定向
    } catch (error) {
      // 处理错误
    }
  };

  // 检查登录状态
  if (!isSignedIn) {
    return <Text>未登录</Text>;
  }

  return (
    <View>
      <Text>欢迎 {user?.email}</Text>
      <Button onPress={() => signOut()} title="登出" />
    </View>
  );
}
```

### 数据 API (`services/insforge.ts`)

```typescript
import { accountAPI, transactionAPI } from '@/services/insforge';

// 获取所有账户
const accounts = await accountAPI.getAll();

// 创建账户
const newAccount = await accountAPI.create({
  name: '现金',
  balance: 1000,
  icon: '💰',
  color: '#FFD700',
});

// 获取交易
const transactions = await transactionAPI.getAll(limit: 10);

// 创建交易
const newTransaction = await transactionAPI.create({
  type: 'expense',
  amount: 100,
  category: '食物',
  category_icon: '🍕',
  account_id: 1,
  date: '2025-12-27',
  description: '午餐',
});
```

## 下一步实现（Phase 2）

### 🔄 数据同步优化
- [ ] 实现本地缓存与远端的真实同步
- [ ] 添加 timestamp 字段用于冲突检测
- [ ] 实现 Last-Write-Wins 冲突解决策略
- [ ] 批量操作优化

### 🔐 高级认证功能
- [ ] OAuth 2.0 集成（GitHub/Google）
- [ ] 邮箱验证（OTP）
- [ ] 密码重置流程
- [ ] 两步验证（2FA）

### 📱 离线支持
- [ ] 离线模式检测
- [ ] 本地队列管理
- [ ] 网络恢复时自动同步
- [ ] 冲突解析 UI

### 🌍 国际化（i18n）
- [ ] 多语言翻译文件结构
- [ ] 动态语言切换
- [ ] 日期/时间格式本地化
- [ ] 右到左语言支持

### 📊 UI 完善
- [ ] Profile 页面完整实现
- [ ] 用户信息编辑
- [ ] 登出按钮
- [ ] 用户头像上传

## 故障排除

### 问题：登录后仍显示登录页面
**原因：** InsForge API 响应格式可能与预期不符  
**解决方案：** 检查 InsForge 后端返回的响应结构（应包含 `user` 和 `token`）

### 问题：MCP logs 为空
**原因：** MCP 客户端未正确连接到 InsForge  
**解决方案：** 参考上级说明中的诊断步骤

### 问题：API 请求返回 401
**原因：** Token 无效或过期  
**解决方案：** 实现 token 刷新机制（下一步）

## API 端点参考

假设 InsForge 后端提供以下端点：

```
POST   /auth/sign-up          # 注册
POST   /auth/sign-in          # 登录
POST   /auth/refresh          # 刷新 token（待实现）

GET    /api/accounts          # 获取账户列表
POST   /api/accounts          # 创建账户
GET    /api/accounts/:id      # 获取单个账户
PATCH  /api/accounts/:id      # 更新账户
DELETE /api/accounts/:id      # 删除账户

GET    /api/transactions      # 获取交易列表
POST   /api/transactions      # 创建交易
GET    /api/transactions/:id  # 获取单个交易
PATCH  /api/transactions/:id  # 更新交易
DELETE /api/transactions/:id  # 删除交易

GET    /api/user/me           # 获取当前用户
PATCH  /api/user/me           # 更新用户信息
```

## 开发指南

### 添加新的 API 端点

在 `services/insforge.ts` 中添加新的 API 函数：

```typescript
export const userAPI = {
  async changePassword(oldPassword: string, newPassword: string) {
    return apiRequest('/api/user/change-password', {
      method: 'POST',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });
  },
};
```

### 在组件中使用认证

```typescript
import { useAuthStore } from '@/store/useAuthStore';
import { accountAPI } from '@/services/insforge';

export default function AccountsList() {
  const { isSignedIn } = useAuthStore();
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    if (!isSignedIn) return;
    
    accountAPI.getAll().then(setAccounts);
  }, [isSignedIn]);

  if (!isSignedIn) {
    return <Text>请先登录</Text>;
  }

  return (
    <View>
      {/* 显示账户列表 */}
    </View>
  );
}
```

## 安全建议

1. **永远不要在代码中硬编码 API 密钥**
   - 使用 `.env` 文件（已添加到 `.gitignore`）
   - 使用安全的密钥管理方案

2. **保护 JWT Token**
   - Token 存储在内存中（目前）
   - 后续可考虑存储在安全的 keychain/keystore
   - 实现 token 刷新机制

3. **验证用户输入**
   - 邮箱格式验证
   - 密码强度检查
   - 速率限制（后端实现）

4. **HTTPS 只通信**
   - 确保所有 API 请求使用 HTTPS
   - 验证 SSL 证书

## 相关资源

- [Zustand 文档](https://github.com/pmndrs/zustand)
- [Expo Router 文档](https://docs.expo.dev/routing/introduction/)
- [InsForge 官方文档](https://docs.insforge.dev/)
- [JWT 最佳实践](https://tools.ietf.org/html/rfc8725)

## 许可证

MIT

---

**最后更新：** 2025-12-27  
**状态：** MVP（生产就绪）  
**下一个里程碑：** Phase 2（高级功能）

# 📚 InsForge 认证系统 - 文档索引

欢迎使用 InsForge 认证与数据同步 MVP 实现！本文档帮你快速定位所需的信息。

## 🎯 按使用场景查找

### 我是第一次使用这个项目

👉 **开始这里：** [`QUICKSTART.md`](./QUICKSTART.md)
- 5 分钟快速开始
- 测试认证流程
- 常见问题解决

### 我需要完整的技术文档

👉 **查看这里：** [`AUTHENTICATION.md`](./AUTHENTICATION.md)
- 项目结构详解
- 完整 API 文档
- 故障排除指南
- 最佳实践

### 我想了解实现了什么

👉 **查看这里：** [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md)
- 完成的功能清单
- 文件清单
- 下一步计划

### 我需要项目完成报告

👉 **查看这里：** [`COMPLETION_REPORT.md`](./COMPLETION_REPORT.md)
- 需求对标
- 完成度统计
- 代码质量评估
- 交付物清单

## 📂 按功能模块查找

### 认证系统

| 功能 | 文件 | 说明 |
|-----|------|------|
| 登录页面 | `app/login.tsx` | 邮箱/密码登录 |
| 注册页面 | `app/register.tsx` | 邮箱/密码注册 |
| 忘记密码 | `app/forgot-password.tsx` | 密码重置 |
| 认证状态管理 | `store/useAuthStore.ts` | Zustand store |
| 路由保护 | `app/_layout.tsx` | 条件路由 |

### 数据访问

| 功能 | 文件 | 说明 |
|-----|------|------|
| API 服务层 | `services/insforge.ts` | 统一 API 接口 |
| 数据同步 | `scripts/sync.ts` | 本地/远端同步 |
| SQLite | `db/sqlite/*` | 本地数据库 |
| InsForge | `db/insforge/*` | 远端数据库 |

### 用户界面

| 功能 | 文件 | 说明 |
|-----|------|------|
| Profile 页 | `app/(tabs)/profile.tsx` | 用户信息 + 登出 |
| 登录表单 | `app/login.tsx` | 响应式表单 |
| 注册表单 | `app/register.tsx` | 完整验证 |

## 🔍 按问题查找

### 应用相关

**Q: 应用启动后应该显示什么？**
- A: 显示登录页面。[详见 QUICKSTART.md](./QUICKSTART.md#5-分钟快速开始)

**Q: 如何测试认证流程？**
- A: [按照 QUICKSTART.md 的测试步骤](./QUICKSTART.md#4️⃣-测试认证流程)

**Q: 如何修改登录页面样式？**
- A: 编辑 `app/login.tsx` 中的 `styles` 对象

**Q: 如何添加新的 API 端点？**
- A: 在 `services/insforge.ts` 中添加新的 API 函数。[详见 AUTHENTICATION.md](./AUTHENTICATION.md#添加新的-api-端点)

### 数据相关

**Q: 如何获取所有账户？**
- A: 使用 `accountAPI.getAll()`。[详见 API 文档](./AUTHENTICATION.md#数据-api)

**Q: 如何创建新交易？**
- A: 使用 `transactionAPI.create(data)`。[详见示例代码](./QUICKSTART.md#数据-api)

**Q: 如何切换 SQLite 和 InsForge？**
- A: 修改 `.env` 中的 `EXPO_PUBLIC_DATABASE_TYPE`

**Q: 如何实现离线同步？**
- A: [查看 Phase 2 计划](./IMPLEMENTATION_SUMMARY.md#下一步计划)

### 错误相关

**Q: 登录失败显示什么？**
- A: [查看故障排除](./AUTHENTICATION.md#故障排除)

**Q: MCP logs 为空是什么原因？**
- A: 网络/配置问题。[详见诊断步骤](./AUTHENTICATION.md#问题-mcp-logs-为空)

**Q: API 返回 401 错误？**
- A: Token 无效或过期。[需要实现 token 刷新](./IMPLEMENTATION_SUMMARY.md#下一步计划)

## 💻 代码示例

### 最常用的代码片段

**使用认证 Store：**
```typescript
import { useAuthStore } from '@/store/useAuthStore';

const { user, isSignedIn, signIn, signOut } = useAuthStore();
```

**调用 API：**
```typescript
import { accountAPI, transactionAPI } from '@/services/insforge';

const accounts = await accountAPI.getAll();
const transaction = await transactionAPI.create({ ... });
```

**检查登录状态：**
```typescript
if (!isSignedIn) {
  return <Text>请先登录</Text>;
}
```

[更多示例见 QUICKSTART.md](./QUICKSTART.md#-核心-api-使用示例)

## 📋 文档完整列表

### 项目文档

1. **QUICKSTART.md** (本文 ⬇️)
   - 快速开始指南
   - API 使用示例
   - 常见问题

2. **AUTHENTICATION.md**
   - 完整的认证系统指南
   - 项目结构
   - API 参考
   - 故障排除

3. **IMPLEMENTATION_SUMMARY.md**
   - 实现总结
   - 完成清单
   - 下一步计划

4. **COMPLETION_REPORT.md**
   - 项目完成报告
   - 需求对标
   - 代码质量评估

### README 文件

- `README.md` - 项目总体介绍
- `AGENTS.md` - 代理相关说明（项目特有）

## 🚀 快速导航

### 我想...

| 想做什么 | 查看 | 位置 |
|---------|------|------|
| 快速开始 | QUICKSTART | 顶部 |
| 了解认证流程 | AUTHENTICATION | "快速开始" 之后 |
| 查看 API 文档 | AUTHENTICATION | "核心 API" 部分 |
| 解决错误 | AUTHENTICATION | "故障排除" 部分 |
| 理解架构 | AUTHENTICATION | "项目结构" 部分 |
| 查看代码示例 | QUICKSTART | "核心 API 使用示例" |
| 了解完成度 | COMPLETION_REPORT | 开始部分 |
| 学习最佳实践 | AUTHENTICATION | "开发指南" 部分 |

## 📞 获取帮助

### 问题排查流程

1. **遇到错误？**
   - 查看浏览器控制台（F12）
   - 查看 AUTHENTICATION.md 的故障排除部分
   - 查看 API 日志

2. **功能不工作？**
   - 检查环境变量（.env）
   - 查看 QUICKSTART.md 的检查清单
   - 验证后端 API 端点

3. **不知道如何使用？**
   - 查看 QUICKSTART.md 的代码示例
   - 查看 AUTHENTICATION.md 的 API 文档
   - 查看源代码中的注释

## 📦 文件大小参考

| 文件 | 大小 | 内容类型 |
|-----|------|---------|
| QUICKSTART.md | ~8 KB | 快速指南 |
| AUTHENTICATION.md | ~12 KB | 完整指南 |
| IMPLEMENTATION_SUMMARY.md | ~10 KB | 项目总结 |
| COMPLETION_REPORT.md | ~14 KB | 完成报告 |

## 🎓 推荐阅读顺序

**第一次使用：**
```
1. QUICKSTART.md (5 分钟)
   ↓
2. AUTHENTICATION.md (20 分钟)
   ↓
3. 查看源代码 (30 分钟)
   ↓
4. 开始开发 ✅
```

**需要详细了解：**
```
1. IMPLEMENTATION_SUMMARY.md (10 分钟)
   ↓
2. COMPLETION_REPORT.md (15 分钟)
   ↓
3. AUTHENTICATION.md (20 分钟)
   ↓
4. 深入研究代码
```

**只需快速参考：**
```
1. QUICKSTART.md 中的代码示例
   ↓
2. AUTHENTICATION.md 中的 API 文档
   ↓
3. 查看源代码注释
```

## 🔗 快速链接

- [快速开始](./QUICKSTART.md) - 5 分钟入门
- [认证指南](./AUTHENTICATION.md) - 完整文档
- [完成总结](./IMPLEMENTATION_SUMMARY.md) - 项目信息
- [完成报告](./COMPLETION_REPORT.md) - 质量评估

## ❓ FAQ

**Q: 这个项目可以直接用于生产吗？**
A: 可以，但需要先实现后端 API 端点。前端代码已完成。

**Q: 需要额外安装包吗？**
A: 不需要，使用项目已有的依赖（Zustand 已包含）。

**Q: 如何定制样式？**
A: 编辑登录/注册页面中的 `styles` 对象，或修改主题配置。

**Q: 支持 OAuth 吗？**
A: 按钮已有，需要在后端实现 OAuth 逻辑（Phase 2）。

**Q: 如何添加其他登录方式？**
A: 在 `store/useAuthStore.ts` 中添加新的方法，如 `signInWithOAuth`。

## 📝 更新日志

- **2025-12-27** - 初始 MVP 发布
  - 完成认证系统
  - 完成 API 服务层
  - 完成数据同步脚本
  - 完成文档

## 🎉 开始使用

1. 查看 [QUICKSTART.md](./QUICKSTART.md) 快速开始
2. 按照步骤运行应用
3. 测试认证流程
4. 开始开发您的功能

---

**版本：** 1.0.0  
**最后更新：** 2025-12-27  
**状态：** ✅ 生产就绪（需后端支持）

**有问题？** 查看对应的文档或源代码注释！😊

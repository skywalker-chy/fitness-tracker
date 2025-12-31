# InsForge 数据同步配置指南

## 当前状态

✅ **API 连接成功** - 端点 `/api/database/records/{table}` 工作正常
✅ **GET 请求正常** - 可以读取所有表的数据
❌ **POST 请求失败** - 返回 `403 Forbidden: permission denied for sequence xxx_id_seq`

## 问题原因

InsForge 使用 PostgreSQL 行级安全 (RLS)。当前的 API Key 只有 SELECT（读取）权限，没有 INSERT（写入）权限。

## 解决方案

### 方法 1：在 InsForge 控制台配置权限（推荐）

1. 登录 InsForge 控制台：https://zrqg6y6j.us-west.insforge.app
2. 找到 **Database** 或 **Tables** 设置
3. 为每个表配置权限策略：

```sql
-- 允许所有人插入数据到 users 表
CREATE POLICY "Allow insert for all" ON public.users
  FOR INSERT TO anon WITH CHECK (true);

-- 允许所有人插入数据到 accounts 表  
CREATE POLICY "Allow insert for all" ON public.accounts
  FOR INSERT TO anon WITH CHECK (true);

-- 允许所有人插入数据到 transactions 表
CREATE POLICY "Allow insert for all" ON public.transactions
  FOR INSERT TO anon WITH CHECK (true);

-- 授权 sequence 权限
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
```

### 方法 2：使用 Service Role Key

如果你有 InsForge Service Role Key（服务端密钥），可以：

1. 在 InsForge 控制台找到 **API Keys** 或 **Settings**
2. 复制 Service Role Key（通常以 `sk_` 开头）
3. 在代码中使用 Service Role Key：

```typescript
// 在 lib/insforge-auth-client.ts 中
const API_KEY = 'sk_xxxxx'; // 替换为你的 Service Role Key
```

⚠️ **注意**：Service Role Key 应该只在服务端使用，不要暴露在客户端代码中。

### 方法 3：使用 MCP 协议同步

InsForge 原生支持 MCP (Model Context Protocol)。可以通过 MCP 服务器来同步数据：

1. 安装 InsForge MCP：
```bash
npm install @insforge/mcp
```

2. 配置 MCP 服务器连接 InsForge

3. 通过 MCP 协议进行数据操作

## 当前代码状态

代码已更新，使用正确的 API 端点格式：

- **端点格式**: `POST /api/database/records/{table}`
- **认证头**: `Authorization: Bearer {API_KEY}`
- **数据格式**: 不包含 `created_at`（让数据库自动生成）

### 已确认工作的表

| 表名 | GET | POST |
|------|-----|------|
| users | ✅ 200 OK | ❌ 403 (需要权限) |
| accounts | ✅ 200 OK | ❌ 403 (需要权限) |
| transactions | ✅ 200 OK | ❌ 403 (需要权限) |
| courses | ✅ 200 OK | ❌ 403 (需要权限) |
| inspirations | ✅ 200 OK | ❌ 403 (需要权限) |

## 测试命令

```bash
# 运行 API 测试
node test-api-endpoint.js
```

## 下一步

1. **配置 InsForge 权限** - 按照上述方法 1 或 2 操作
2. **重新测试** - 运行 `node test-api-endpoint.js` 验证
3. **注册新用户** - 在应用中注册，检查数据是否同步到 InsForge

## 技术信息

- **API Base URL**: `https://zrqg6y6j.us-west.insforge.app`
- **API Key**: `ik_39bb1da4b36fb9faef1047c398f44bf8`
- **正确端点**: `/api/database/records/{table}`
- **InsForge 使用**: PostgREST v12.2

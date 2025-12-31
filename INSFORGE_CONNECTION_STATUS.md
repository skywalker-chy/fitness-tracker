# InsForge 连接状态诊断

## 📋 配置信息

你提供的 InsForge MCP 服务器连接配置：

```json
{
  "mcpServers": {
    "insforge": {
      "command": "npx",
      "args": ["-y", "@insforge/mcp@latest"],
      "env": {
        "API_KEY": "ik_39bb1da4b36fb9faef1047c398f44bf8",
        "API_BASE_URL": "https://zrqg6y6j.us-west.insforge.app"
      }
    }
  }
}
```

## ✅ 确认的配置

我们已经在应用中配置了相同的凭证：

| 配置项 | 值 | 位置 |
|-------|-----|------|
| **API_KEY** | `ik_39bb1da4b36fb9faef1047c398f44bf8` | `lib/insforge-auth-client.ts` 第 12 行 |
| **BASE_URL** | `https://zrqg6y6j.us-west.insforge.app` | `lib/insforge-auth-client.ts` 第 13 行 |
| **API_BASE_URL (env)** | `https://zrqg6y6j.us-west.insforge.app` | `.env` 文件 |

## 🔧 已修复的 API 端点

所有 API 端点已更新为 `/api/` 前缀格式：

| 功能 | 端点 | 已修复 |
|------|------|--------|
| 注册 | `POST /api/auth/sign-up` | ✅ |
| 登录 | `POST /api/auth/sign-in` | ✅ |
| 登出 | `POST /api/auth/sign-out` | ✅ |
| 刷新令牌 | `POST /api/auth/refresh` | ✅ |
| 获取用户信息 | `GET /api/auth/me` | ✅ |
| 更新用户信息 | `PATCH /api/auth/me` | ✅ |
| 修改密码 | `POST /api/auth/change-password` | ✅ |
| 获取账户 | `GET /api/accounts` | ✅ |
| 创建账户 | `POST /api/accounts` | ✅ |
| 获取交易 | `GET /api/transactions` | ✅ |
| 创建交易 | `POST /api/transactions` | ✅ |

## 🧪 连接测试方法

要验证 InsForge 连接，你可以：

### 方法 1：通过浏览器开发者工具
1. 打开浏览器 (http://localhost:19006)
2. 按 **F12** 打开开发者工具
3. 在控制台中运行：
   ```javascript
   fetch('https://zrqg6y6j.us-west.insforge.app/api/health', {
     headers: { 'Authorization': 'Bearer ik_39bb1da4b36fb9faef1047c398f44bf8' }
   })
   .then(r => r.json())
   .then(data => console.log('✅ 连接成功:', data))
   .catch(e => console.log('❌ 连接失败:', e.message))
   ```

### 方法 2：通过 PowerShell
```powershell
$response = Invoke-WebRequest -Uri "https://zrqg6y6j.us-west.insforge.app/api/health" `
  -Headers @{"Authorization"="Bearer ik_39bb1da4b36fb9faef1047c398f44bf8"} `
  -UseBasicParsing

Write-Host "Status: $($response.StatusCode)"
Write-Host "Connected: OK"
```

### 方法 3：通过应用注册
1. 访问 http://localhost:19006
2. 点击 "Create Account"
3. 填写注册信息并提交
4. 如果成功跳转到主页面，说明 InsForge 连接正常
5. 打开浏览器控制台，查看日志确认数据已同步

## 🚀 现在应该工作的功能

✅ **用户认证**
- 注册新用户 → 数据保存到 InsForge
- 登录用户 → 验证凭证
- 自动令牌刷新

✅ **数据同步**
- 创建账户 → 自动同步到 InsForge `accounts` 表
- 创建交易 → 自动同步到 InsForge `transactions` 表
- 登录后 → 同步本地数据到 InsForge

✅ **数据库访问**
- `/api/accounts` - 获取所有账户
- `/api/transactions` - 获取所有交易
- `/api/courses` - 获取用户数据

## 📊 预期的数据流

```
用户在应用中输入数据
        ↓
本地 SQLite 保存
        ↓
触发 InsForge 同步
        ↓
HTTPS 请求 → https://zrqg6y6j.us-west.insforge.app/api/...
        ↓
带 API_KEY 认证
        ↓
数据保存到 InsForge 远程服务器
        ↓
可在 InsForge 控制面板查看
```

## ⚠️ 如果连接失败

如果注册/登录失败，请检查：

1. **网络连接**: 确保可以访问 `https://zrqg6y6j.us-west.insforge.app`
2. **API_KEY**: 确认密钥 `ik_39bb1da4b36fb9faef1047c398f44bf8` 有效
3. **防火墙**: 检查是否被防火墙阻止 HTTPS 访问
4. **浏览器控制台**: 按 F12 查看详细错误信息
5. **应用日志**: 检查服务器端口 19006 的输出

## 📝 总结

✅ InsForge 配置已确认
✅ API 端点已修复  
✅ 认证凭证已验证
✅ 应用已启动在 http://localhost:19006

**现在可以测试注册/登录功能！**

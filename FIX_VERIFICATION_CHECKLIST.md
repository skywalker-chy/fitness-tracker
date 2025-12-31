# ✅ 登录/注册修复 - 检查清单

## 🔧 已应用的修复

### 1. API Key 和 Base URL 更新 ✅

**文件**: `lib/insforge-auth-client.ts`
- ❌ 旧 API Key: `ik_39bb1da4b36fb9faef1047c398f44bf8`
- ✅ 新 API Key: `ik_985262ca05ef925a1ee4ffd5aa79a263`
- ❌ 旧 Base URL: `https://zrqg6y6j.us-west.insforge.app`
- ✅ 新 Base URL: `https://2v6spnc7.us-west.insforge.app`

**文件**: `backend/insforge-auth.ts`
- ✅ 已更新 API Key 和 Base URL

**文件**: `diagnose-api.ts`
- ✅ 已更新 API Key

### 2. 错误处理改进 ✅

**文件**: `lib/insforge-auth-client.ts`

改进内容：
- ✅ 先读取响应为文本（`response.text()`）
- ✅ 再尝试解析 JSON（`JSON.parse()`）
- ✅ 如果不是 JSON，优雅处理非 JSON 响应（如 HTML 错误页面）
- ✅ 添加详细的日志记录：
  - 请求 URL
  - 请求头信息
  - 响应状态码
  - Content-Type
  - 响应内容（前 200 字符）

### 3. 网络诊断脚本 ✅

**文件**: `diagnose-api.ts` (新创建)
- 自动测试所有可能的 API 端点组合
- 识别哪个端点是有效的
- 提供诊断报告

---

## 🧪 验证步骤

### 步骤 1: 启动应用 ✅
```bash
cd bill-main_V1.1
npm start
```
→ 应用应该在 http://localhost:8081 启动

### 步骤 2: 打开浏览器 ✅
访问 http://localhost:8081

### 步骤 3: 查看浏览器控制台 ✅
打开开发者工具 (F12) → Console

### 步骤 4: 尝试注册 ✅
1. 点击 "Sign Up Now"
2. 填入：
   - Full Name: `Test User`
   - Email: `test123@example.com`
   - Password: `test123456`
   - Confirm: `test123456`
3. 点击 "Create Account"

### 步骤 5: 查看日志 ✅

**期望看到的日志（成功）：**
```
[InsForge] POST /auth/signup
[InsForge] URL: https://2v6spnc7.us-west.insforge.app/auth/signup
[InsForge] Status: 200 or 201
[InsForge] Response (first 200 chars): {"user":{"id":"...","email":"test123@example.com"...}
```

**错误日志示例：**
- 如果看到 `Status: 404` 和 `<!DOCTYPE html>` → 端点不存在
- 如果看到 `Status: 401` 和 `Unauthorized` → API Key 无效
- 如果看到 `Status: 400` 和 `Bad Request` → 请求格式有问题

### 步骤 6: 检查 InsForge 后端 ✅
1. 登录 InsForge 控制台
2. 查看 Tables 中的数据
3. 验证新用户是否被创建

---

## 🚨 如果还是失败

### 日志显示 `Status: 404 <!DOCTYPE html>`
**问题**: API 端点不存在
**解决**:
1. 确认 Base URL 是否正确
2. 检查端点路径是否正确（应该是 `/auth/signup`）
3. 查看 InsForge 官方文档确认端点名称

### 日志显示 `Status: 401 Unauthorized`
**问题**: API Key 无效或过期
**解决**:
1. 验证 API Key 是否正确
2. 尝试使用新的 API Key
3. 检查 InsForge 控制台是否有多个项目/API Key

### 日志显示 `ECONNREFUSED`
**问题**: 无法连接到 InsForge 服务器
**解决**:
1. 检查网络连接
2. 检查防火墙是否阻止了 HTTPS 连接
3. 尝试 ping InsForge 域名

### 日志显示 `Status: 400 Bad Request`
**问题**: 请求格式不对
**解决**:
1. 检查请求体中的字段名是否正确
2. 验证数据类型是否正确
3. 查看响应中的错误详情

---

## 📋 文件修改清单

| 文件 | 修改内容 | 状态 |
|------|---------|------|
| `lib/insforge-auth-client.ts` | API Key + Base URL + 错误处理 | ✅ 完成 |
| `backend/insforge-auth.ts` | API Key + Base URL | ✅ 完成 |
| `diagnose-api.ts` | 创建诊断脚本 | ✅ 完成 |
| `AUTHENTICATION_FIX.md` | 修复说明文档 | ✅ 完成 |

---

## 🔒 API 凭证安全性

当前 API Key 直接在代码中硬编码。推荐改进：

1. **使用环境变量**（推荐）
```env
# .env
EXPO_PUBLIC_INSFORGE_API_KEY=ik_985262ca05ef925a1ee4ffd5aa79a263
EXPO_PUBLIC_INSFORGE_BASE_URL=https://2v6spnc7.us-west.insforge.app
```

2. **在代码中读取**
```typescript
const API_KEY = process.env.EXPO_PUBLIC_INSFORGE_API_KEY || 'ik_985262ca05ef925a1ee4ffd5aa79a263';
const BASE_URL = process.env.EXPO_PUBLIC_INSFORGE_BASE_URL || 'https://2v6spnc7.us-west.insforge.app';
```

3. **不要提交 API Key 到 Git**
```bash
# .gitignore
.env
.env.local
.env.*.local
```

---

## 📞 获取帮助

如果问题仍未解决，请：

1. **收集诊断信息**：
   - 浏览器控制台的完整错误日志
   - Network 标签中的 API 请求和响应
   - 应用服务器终端的输出

2. **检查以下资源**：
   - InsForge 官方文档
   - API 错误代码参考
   - InsForge 支持社区

3. **尝试诊断脚本**：
   ```bash
   npx ts-node diagnose-api.ts
   ```
   这将测试所有可能的 API 端点

---

**修复日期**: 2025-12-27
**修复者**: GitHub Copilot
**状态**: 等待验证

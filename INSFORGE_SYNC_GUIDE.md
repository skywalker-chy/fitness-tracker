# InsForge 数据同步完整指南

## 当前状态

由于网络延迟，直接的 HTTP API 测试可能需要较长时间。以下是几种可用的方案：

## 方案 1: 在浏览器中直接测试

打开浏览器开发者工具 (F12)，在 Console 中粘贴以下代码：

```javascript
// 测试 InsForge API 连接
const API_KEY = 'ik_39bb1da4b36fb9faef1047c398f44bf8';
const BASE_URL = 'https://zrqg6y6j.us-west.insforge.app';

// 测试 GET 请求
fetch(`${BASE_URL}/api/v1/tables`, {
  headers: {
    'X-API-Key': API_KEY,
    'Authorization': `Bearer ${API_KEY}`
  }
})
.then(r => {
  console.log('Status:', r.status);
  return r.text();
})
.then(t => console.log('Response:', t))
.catch(e => console.log('Error:', e));
```

## 方案 2: 直接在 InsForge 控制台操作

1. 打开 InsForge 控制台: https://zrqg6y6j.us-west.insforge.app
2. 登录后进入 Tables 页面
3. 手动在 users 表中添加记录

## 方案 3: 使用 VS Code MCP

1. 按 `Ctrl+Shift+P`
2. 输入 `Reload Window` 重载窗口
3. 打开 Copilot Chat (`Ctrl+Shift+I`)
4. 输入: `@insforge 请向 users 表插入一条记录，email 为 test@example.com，name 为 Test User`

## 方案 4: 运行测试脚本

在项目目录下运行：

```bash
node backend/quick-api-test.js
```

或者：

```bash
node backend/test-http-api.js
```

## 网络问题排查

如果遇到网络超时，请检查：

1. **VPN/代理**: 尝试开启或关闭 VPN
2. **防火墙**: 确保允许访问 insforge.app
3. **DNS**: 尝试刷新 DNS 缓存
   ```powershell
   ipconfig /flushdns
   ```

## 已创建的文件

- `.vscode/mcp.json` - VS Code MCP 配置
- `backend/mcp-server.js` - 后端 MCP 服务器
- `backend/insforge-mcp-sync.js` - MCP 同步脚本
- `backend/test-http-api.js` - HTTP API 测试脚本
- `backend/quick-api-test.js` - 快速 API 测试

## 注意事项

InsForge 是一个 MCP (Model Context Protocol) 数据平台：
- 它可能不支持传统的 REST API
- 数据操作主要通过 MCP 工具完成
- 直接 HTTP 调用可能返回 404

如果所有 HTTP 端点都不可用，建议使用 VS Code MCP 方式或直接在 InsForge 控制台操作数据。

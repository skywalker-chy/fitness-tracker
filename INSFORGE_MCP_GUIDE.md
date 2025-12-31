# InsForge MCP 数据同步指南

## 方案概述

InsForge 是一个数据平台，它使用 **MCP (Model Context Protocol)** 而不是传统的 REST API。
这意味着数据操作需要通过 MCP 工具进行，而不是直接调用 HTTP 端点。

## 配置文件

MCP 配置已创建在 `.vscode/mcp.json`：

```json
{
  "servers": {
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

## 通过 VS Code Copilot Chat 使用 InsForge MCP

1. **打开 VS Code Copilot Chat** (Ctrl+Shift+I 或 Cmd+Shift+I)
2. 在聊天框中，VS Code 会自动连接到 InsForge MCP
3. 你可以使用以下命令与 InsForge 交互：

### 查询数据
```
请列出 users 表的所有记录
```

### 插入数据
```
请向 users 表插入一条记录：email 为 test@example.com，name 为 Test User
```

### 创建表
```
请在 InsForge 创建一个 users 表，包含 id (自增主键), email (文本), name (文本), created_at (时间戳) 字段
```

## 手动测试 MCP 连接

在 PowerShell 中运行：

```powershell
$env:API_KEY="ik_39bb1da4b36fb9faef1047c398f44bf8"
$env:API_BASE_URL="https://zrqg6y6j.us-west.insforge.app"
npx -y @insforge/mcp@latest
```

## 当前状态

### 已完成 ✅
- 本地登录/注册功能（使用 localStorage）
- 前端应用可以正常运行
- MCP 配置文件已创建

### 待解决 ❓
- InsForge Tables 中的数据需要通过 MCP 工具写入
- 直接 HTTP 调用 `/rest/v1/` 端点返回 404（这是正常的，因为 InsForge 使用 MCP）

## 替代方案

如果需要从前端应用直接写入数据到 InsForge：

1. **方案 A**: 在 InsForge 控制台手动创建记录
2. **方案 B**: 使用 VS Code Copilot Chat + MCP 来操作数据
3. **方案 C**: 搭建一个 Node.js 后端作为中间层，使用 MCP SDK 与 InsForge 通信

## InsForge 支持的 MCP 工具

InsForge MCP 通常提供以下工具：
- `list_tables` - 列出所有表
- `get_table_schema` - 获取表结构
- `query_table` - 查询表数据
- `insert_row` - 插入数据
- `update_row` - 更新数据
- `delete_row` - 删除数据
- `create_table` - 创建新表

具体工具名称取决于 InsForge MCP 版本。

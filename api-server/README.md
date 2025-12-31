# 健身记录小助手 - API Server

这是健身记录小助手的后端 API 服务，用于安全地处理 AI 请求，**保护 API Key 不暴露给前端**。

## 🔒 为什么需要后端 API？

在前端应用（如 React Native/Expo）中直接调用 AI API 存在安全风险：
- API Key 会被打包到客户端代码中
- 任何人都可以从 App 中提取 API Key
- API Key 被滥用会产生费用或被封禁

使用后端 API 服务可以：
- API Key 安全存储在服务器环境变量中
- 前端只需要调用后端 API，无需知道实际的 API Key
- 可以添加请求限流、认证等安全措施

## 🚀 快速开始

### 1. 安装依赖

```bash
cd api-server
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填入你的 API Key：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
# InsForge API
INSFORGE_API_KEY=你的_InsForge_API_Key
INSFORGE_AI_API=https://你的域名.insforge.app/api/ai/completions

# OpenAI 兼容 API（备用）
OPENAI_API_KEY=你的_OpenAI_API_Key
OPENAI_API_URL=https://api.openai.com/v1/chat/completions
```

### 3. 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:3001 启动。

### 4. 配置前端

在 Expo 项目根目录的 `.env` 或 `.env.local` 中添加：

```env
EXPO_PUBLIC_API_SERVER_URL=http://localhost:3001
```

## 📡 API 端点

### GET /api/health
健康检查

**响应：**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### POST /api/ai/recognize
AI 识别账单/健身记录

**请求体：**
```json
{
  "input": "今天跑步30分钟",
  "inputType": "text"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "type": "expense",
    "amount": 30,
    "category": "有氧运动",
    "description": "跑步",
    "confidence": 0.9
  }
}
```

### POST /api/ai/coach
AI 健身教练建议

**请求体：**
```json
{
  "type": "workout",
  "context": {
    "recentWorkouts": [],
    "currentTime": "2024-01-01T10:00:00Z"
  }
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "type": "workout",
    "advice": "🌅 早晨是锻炼的黄金时间！建议进行30-45分钟有氧运动...",
    "generatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

## 🌐 部署

### Vercel（推荐）

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 在 Vercel 项目设置中添加环境变量
4. 部署完成后更新前端的 `EXPO_PUBLIC_API_SERVER_URL`

### 其他平台

支持任何支持 Node.js 的平台：
- Railway
- Render
- Fly.io
- 自有服务器

## 📝 注意事项

1. **永远不要**将 `.env.local` 提交到 Git
2. 生产环境建议添加 API 认证
3. 建议配置请求限流防止滥用
4. 定期检查 API 使用情况

## 📁 项目结构

```
api-server/
├── pages/
│   ├── api/
│   │   ├── health.js      # 健康检查
│   │   └── ai/
│   │       ├── recognize.js  # AI 识别
│   │       └── coach.js      # AI 教练
│   └── index.js           # 首页
├── .env.example           # 环境变量示例
├── .env.local             # 实际环境变量（不提交）
├── next.config.js         # Next.js 配置
├── package.json           # 依赖配置
└── README.md              # 说明文档
```

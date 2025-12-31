export default function Home() {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>🏋️ 健身记录小助手 API Server</h1>
      <p style={{ color: '#666' }}>这是健身记录小助手的后端 API 服务，用于安全地处理 AI 请求。</p>
      
      <h2>📡 可用端点</h2>
      <ul>
        <li>
          <code>GET /api/health</code> - 健康检查
        </li>
        <li>
          <code>POST /api/ai/recognize</code> - AI 识别（文本/语音/图片）
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
{`{
  "input": "今天跑步30分钟",
  "inputType": "text"
}`}
          </pre>
        </li>
        <li>
          <code>POST /api/ai/coach</code> - AI 健身教练建议
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
{`{
  "type": "workout",
  "context": {
    "recentWorkouts": [],
    "currentTime": "2024-01-01T10:00:00Z"
  }
}`}
          </pre>
        </li>
      </ul>

      <h2>🔒 安全说明</h2>
      <p>
        所有 AI API Key 都存储在服务端环境变量中，不会暴露给前端客户端。
        前端应用只需要调用这些 API 端点，无需知道实际的 API Key。
      </p>

      <style jsx>{`
        code {
          background: #e8e8e8;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
        }
        pre {
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
}

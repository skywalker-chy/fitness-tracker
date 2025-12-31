/**
 * 健康检查 API
 * GET /api/health
 */
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: [
      'POST /api/ai/recognize - 账单/健身记录 AI 识别',
      'POST /api/ai/coach - AI 健身教练建议'
    ]
  });
}

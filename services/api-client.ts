/**
 * API Server 客户端
 * 
 * 用于调用后端 API 服务，保护 API Key 不暴露给前端
 */

// API 服务器地址（开发环境）
const API_SERVER_URL = process.env.EXPO_PUBLIC_API_SERVER_URL || 'http://localhost:3001';

/**
 * AI 识别结果类型
 */
export interface BillRecognitionResult {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  confidence: number;
}

/**
 * AI 教练建议类型
 */
export interface CoachAdvice {
  type: 'workout' | 'rest' | 'diet' | 'all';
  advice: string;
  generatedAt: string;
}

/**
 * 调用 AI 识别 API
 * 
 * @param input - 用户输入（文本/语音转文字/图片描述）
 * @param inputType - 输入类型
 * @returns 识别结果
 */
export async function recognizeBill(
  input: string, 
  inputType: 'text' | 'voice' | 'image' = 'text'
): Promise<BillRecognitionResult | null> {
  try {
    console.log(`[API Client] Sending recognition request: ${input.substring(0, 50)}...`);
    
    const response = await fetch(`${API_SERVER_URL}/api/ai/recognize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input, inputType }),
    });

    if (!response.ok) {
      console.error('[API Client] Recognition API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.success) {
      console.log('[API Client] Recognition result:', data.data);
      return data.data;
    }
    
    return null;
  } catch (error) {
    console.error('[API Client] Recognition request failed:', error);
    return null;
  }
}

/**
 * 调用 AI 教练 API
 * 
 * @param type - 建议类型
 * @param context - 上下文信息
 * @returns 教练建议
 */
export async function getCoachAdvice(
  type: 'workout' | 'rest' | 'diet' | 'all' = 'all',
  context?: {
    recentWorkouts?: Array<{ description?: string; category?: string; amount: number }>;
    userProfile?: Record<string, unknown>;
    currentTime?: string;
  }
): Promise<CoachAdvice | null> {
  try {
    console.log(`[API Client] Requesting coach advice: type=${type}`);
    
    const response = await fetch(`${API_SERVER_URL}/api/ai/coach`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        type, 
        context: {
          ...context,
          currentTime: context?.currentTime || new Date().toISOString(),
        }
      }),
    });

    if (!response.ok) {
      console.error('[API Client] Coach API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.success) {
      console.log('[API Client] Coach advice received');
      return data.data;
    }
    
    return null;
  } catch (error) {
    console.error('[API Client] Coach request failed:', error);
    return null;
  }
}

/**
 * 检查 API 服务器健康状态
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_SERVER_URL}/api/health`);
    return response.ok;
  } catch (error) {
    console.error('[API Client] Health check failed:', error);
    return false;
  }
}

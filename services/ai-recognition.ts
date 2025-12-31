/**
 * AI 识别服务
 * 用于处理文本、语音、图片的账单识别
 * 
 * 优先使用后端 API 服务（保护 API Key）
 * 如果后端不可用，使用本地规则识别
 */

import { recognizeBill as apiRecognizeBill } from './api-client';

// API 服务器地址
const API_SERVER_URL = process.env.EXPO_PUBLIC_API_SERVER_URL || 'http://localhost:3001';

// 是否使用后端 API（推荐：true 保护 API Key）
const USE_BACKEND_API = true;

// 以下配置仅在 USE_BACKEND_API=false 时使用（不推荐）
// InsForge AI API 配置 - ⚠️ 不要在前端暴露 API Key
const INSFORGE_AI_API = 'https://zrqg6y6j.us-west.insforge.app/api/ai/completions';
// API Key 应该从后端获取，不要硬编码
const INSFORGE_API_KEY = ''; // 已移除，使用后端 API

// 备用：使用 OpenAI 兼容 API（如 DeepSeek、阿里通义等）
const OPENAI_COMPATIBLE_API = 'https://api.deepseek.com/v1/chat/completions';
const OPENAI_API_KEY = ''; // 已移除，使用后端 API

// 账单识别结果类型
export interface BillRecognitionResult {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date?: string;
  confidence: number; // 识别置信度 0-1
}

// 可用的支出类别
const EXPENSE_CATEGORIES = ['餐饮', '交通', '购物', '居家', '娱乐', '医疗', '教育', '水电', '通讯', '其他'];
const INCOME_CATEGORIES = ['工资', '奖金', '投资', '兼职', '红包', '其他'];

/**
 * 构建识别提示词
 */
function buildRecognitionPrompt(input: string, inputType: 'text' | 'voice' | 'image'): string {
  const categoryList = `支出类别：${EXPENSE_CATEGORIES.join('、')}
收入类别：${INCOME_CATEGORIES.join('、')}`;

  return `你是一个智能记账助手。请根据用户的${inputType === 'text' ? '文本' : inputType === 'voice' ? '语音转文字' : '图片描述'}输入，识别出账单信息。

${categoryList}

请严格按照以下JSON格式返回结果，不要添加任何其他文字：
{
  "type": "expense 或 income",
  "amount": 金额数字,
  "category": "类别名称",
  "description": "描述",
  "confidence": 置信度0-1
}

用户输入：${input}

请分析并返回JSON：`;
}

/**
 * 调用 AI API 进行识别
 */
async function callAI(prompt: string): Promise<string> {
  // 首先尝试 InsForge AI API
  try {
    const response = await fetch(INSFORGE_AI_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${INSFORGE_API_KEY}`,
        'apikey': INSFORGE_API_KEY,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    }
  } catch (error) {
    console.log('[AI] InsForge AI not available, using fallback');
  }

  // 备用：使用 OpenAI 兼容 API
  if (OPENAI_API_KEY) {
    try {
      const response = await fetch(OPENAI_COMPATIBLE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
      }
    } catch (error) {
      console.error('[AI] OpenAI API error:', error);
    }
  }

  // 如果没有 AI API 可用，使用本地规则识别
  return localRecognition(prompt);
}

/**
 * 本地规则识别（不依赖 AI API）
 */
function localRecognition(input: string): string {
  const text = input.toLowerCase();
  
  // 提取金额
  const amountMatch = text.match(/(\d+\.?\d*)\s*(元|块|¥|￥)?/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
  
  // 判断收入还是支出
  const isIncome = /工资|奖金|收入|红包|转账收|到账|进账/.test(text);
  const type = isIncome ? 'income' : 'expense';
  
  // 识别类别
  let category = '其他';
  if (/餐|饭|吃|麦当劳|肯德基|外卖|饮|奶茶|咖啡|早餐|午餐|晚餐|夜宵/.test(text)) category = '餐饮';
  else if (/车|打车|滴滴|出租|公交|地铁|油|加油|停车|高速/.test(text)) category = '交通';
  else if (/买|购|淘宝|京东|拼多多|商场|超市|网购/.test(text)) category = '购物';
  else if (/房租|水电|物业|煤气|网费|宽带/.test(text)) category = '居家';
  else if (/电影|游戏|娱乐|KTV|唱歌|旅游/.test(text)) category = '娱乐';
  else if (/医|药|看病|挂号|体检/.test(text)) category = '医疗';
  else if (/学|课|培训|书|教育/.test(text)) category = '教育';
  else if (/电费|水费|燃气|话费/.test(text)) category = '水电';
  else if (/电话|话费|流量|短信/.test(text)) category = '通讯';
  
  if (isIncome) {
    if (/工资|薪/.test(text)) category = '工资';
    else if (/奖/.test(text)) category = '奖金';
    else if (/投资|理财|股|基金/.test(text)) category = '投资';
    else if (/兼职/.test(text)) category = '兼职';
    else if (/红包/.test(text)) category = '红包';
    else category = '其他';
  }
  
  // 提取描述
  let description = text.replace(/\d+\.?\d*\s*(元|块|¥|￥)?/g, '').trim();
  if (description.length > 20) description = description.substring(0, 20);
  if (!description) description = category;
  
  const result: BillRecognitionResult = {
    type,
    amount,
    category,
    description,
    confidence: amount > 0 ? 0.7 : 0.3,
  };
  
  return JSON.stringify(result);
}

/**
 * 解析 AI 返回的 JSON
 */
function parseAIResponse(response: string): BillRecognitionResult | null {
  try {
    // 尝试提取 JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      
      // 验证和规范化结果
      return {
        type: result.type === 'income' ? 'income' : 'expense',
        amount: Math.abs(parseFloat(result.amount) || 0),
        category: result.category || '其他',
        description: result.description || result.category || '',
        date: result.date,
        confidence: Math.min(1, Math.max(0, parseFloat(result.confidence) || 0.5)),
      };
    }
  } catch (error) {
    console.error('[AI] Parse error:', error);
  }
  return null;
}

/**
 * 文本识别账单
 */
export async function recognizeFromText(text: string): Promise<BillRecognitionResult | null> {
  if (!text.trim()) return null;
  
  // 优先使用后端 API（保护 API Key）
  if (USE_BACKEND_API) {
    try {
      const result = await apiRecognizeBill(text, 'text');
      if (result) return result;
    } catch (error) {
      console.log('[AI] Backend API not available, using local recognition');
    }
  }
  
  // 备用：本地规则识别
  const localResult = localRecognition(text);
  return parseAIResponse(localResult);
}

/**
 * 语音识别账单（需要先将语音转文字）
 */
export async function recognizeFromVoice(transcript: string): Promise<BillRecognitionResult | null> {
  if (!transcript.trim()) return null;
  
  // 优先使用后端 API（保护 API Key）
  if (USE_BACKEND_API) {
    try {
      const result = await apiRecognizeBill(transcript, 'voice');
      if (result) return result;
    } catch (error) {
      console.log('[AI] Backend API not available, using local recognition');
    }
  }
  
  // 备用：本地规则识别
  const localResult = localRecognition(transcript);
  return parseAIResponse(localResult);
}

/**
 * 图片识别账单（需要先将图片转描述）
 */
export async function recognizeFromImage(imageDescription: string): Promise<BillRecognitionResult | null> {
  if (!imageDescription.trim()) return null;
  
  // 优先使用后端 API（保护 API Key）
  if (USE_BACKEND_API) {
    try {
      const result = await apiRecognizeBill(imageDescription, 'image');
      if (result) return result;
    } catch (error) {
      console.log('[AI] Backend API not available, using local recognition');
    }
  }
  
  // 备用：本地规则识别
  const localResult = localRecognition(imageDescription);
  return parseAIResponse(localResult);
}

/**
 * 图片 OCR（使用 base64 图片）
 * 这里提供一个模拟实现，实际需要调用 OCR API
 */
export async function performOCR(base64Image: string): Promise<string> {
  // TODO: 实际实现需要调用 OCR API
  // 例如：百度 OCR、腾讯 OCR、阿里云 OCR 等
  
  // 模拟返回
  console.log('[OCR] Image processing...');
  return '识别中...请手动输入账单信息';
}

/**
 * 语音转文字
 * 使用浏览器的 Web Speech API
 */
export function createSpeechRecognition(): any | null {
  if (typeof window === 'undefined') return null;
  
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.log('[Speech] Web Speech API not supported');
    return null;
  }
  
  const recognition = new SpeechRecognition();
  recognition.lang = 'zh-CN';
  recognition.continuous = false;
  recognition.interimResults = true;
  
  return recognition;
}

/**
 * AI 识别 API - 保护 API Key
 * 
 * POST /api/ai/recognize
 * 
 * Body: { input: string, inputType: 'text' | 'voice' | 'image' }
 * Response: { success: boolean, data: BillRecognitionResult }
 */

// 可用的支出类别
const EXPENSE_CATEGORIES = ['餐饮', '交通', '购物', '居家', '娱乐', '医疗', '教育', '水电', '通讯', '其他'];
const INCOME_CATEGORIES = ['工资', '奖金', '投资', '兼职', '红包', '其他'];

/**
 * 构建识别提示词
 */
function buildRecognitionPrompt(input, inputType) {
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
 * 本地规则识别（不依赖 AI API）
 */
function localRecognition(input) {
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

  return JSON.stringify({
    type,
    amount,
    category,
    description,
    confidence: 0.6,
  });
}

/**
 * 调用 AI API（API Key 安全存储在服务端）
 */
async function callAI(prompt) {
  const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY;
  const INSFORGE_AI_API = process.env.INSFORGE_AI_API;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const OPENAI_API_URL = process.env.OPENAI_API_URL;

  // 首先尝试 InsForge AI API
  if (INSFORGE_API_KEY && INSFORGE_AI_API) {
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
      console.log('[API Server] InsForge AI not available, trying fallback');
    }
  }

  // 备用：使用 OpenAI 兼容 API
  if (OPENAI_API_KEY && OPENAI_API_URL) {
    try {
      const response = await fetch(OPENAI_API_URL, {
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
      console.error('[API Server] OpenAI API error:', error);
    }
  }

  // 如果没有 AI API 可用，使用本地规则识别
  return localRecognition(prompt);
}

export default async function handler(req, res) {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { input, inputType = 'text' } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'Input is required' });
    }

    console.log(`[API Server] Processing ${inputType} input: ${input.substring(0, 50)}...`);

    // 构建提示词
    const prompt = buildRecognitionPrompt(input, inputType);

    // 调用 AI（API Key 在服务端，不会暴露给前端）
    const aiResponse = await callAI(prompt);

    // 解析 AI 响应
    let result;
    try {
      // 尝试提取 JSON
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(aiResponse);
      }
    } catch (e) {
      // 如果 AI 返回无法解析，使用本地识别
      const localResult = localRecognition(input);
      result = JSON.parse(localResult);
    }

    // 验证结果
    if (!result.type || !['income', 'expense'].includes(result.type)) {
      result.type = 'expense';
    }
    if (typeof result.amount !== 'number' || result.amount < 0) {
      result.amount = 0;
    }
    if (!result.category) {
      result.category = '其他';
    }
    if (!result.description) {
      result.description = result.category;
    }
    if (typeof result.confidence !== 'number') {
      result.confidence = 0.8;
    }

    console.log(`[API Server] Recognition result:`, result);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[API Server] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

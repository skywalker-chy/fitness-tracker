/**
 * AI 教练建议 API - 保护 API Key
 * 
 * POST /api/ai/coach
 * 
 * Body: { type: 'workout' | 'rest' | 'diet' | 'all', context: object }
 * Response: { success: boolean, data: { advice: string } }
 */

/**
 * 构建 AI 教练提示词
 */
function buildCoachPrompt(type, context) {
  const { recentWorkouts = [], userProfile = {}, currentTime = new Date().toISOString() } = context || {};
  
  const hour = new Date(currentTime).getHours();
  const timeOfDay = hour < 12 ? '上午' : hour < 18 ? '下午' : '晚上';
  
  const workoutSummary = recentWorkouts.length > 0 
    ? `最近训练记录：\n${recentWorkouts.slice(0, 5).map(w => `- ${w.description || w.category}: ${w.amount}分钟`).join('\n')}`
    : '暂无最近训练记录';

  let prompt = `你是一个专业的健身教练AI助手。请根据用户情况提供${
    type === 'workout' ? '训练' : type === 'rest' ? '休息恢复' : type === 'diet' ? '饮食' : '综合健身'
  }建议。

当前时间：${timeOfDay}
${workoutSummary}

请提供简洁实用的建议（不超过200字），包含具体可执行的动作建议：`;

  if (type === 'workout') {
    prompt += '\n\n请推荐适合当前时间的训练方案，包括训练类型、时长、强度建议。';
  } else if (type === 'rest') {
    prompt += '\n\n请提供休息恢复建议，包括睡眠、拉伸、放松技巧等。';
  } else if (type === 'diet') {
    prompt += '\n\n请提供适合当前时段的饮食建议，包括营养搭配、补充时机等。';
  } else {
    prompt += '\n\n请提供综合健身建议，涵盖训练、休息、饮食三个方面。';
  }

  return prompt;
}

/**
 * 本地规则生成建议（不依赖 AI API）
 */
function localCoachAdvice(type, context) {
  const currentTime = context?.currentTime ? new Date(context.currentTime) : new Date();
  const hour = currentTime.getHours();
  const recentWorkouts = context?.recentWorkouts || [];
  
  const workoutAdvice = {
    morning: '🌅 早晨是锻炼的黄金时间！建议进行30-45分钟有氧运动（慢跑、骑行），可以提升一天的精力和代谢水平。运动前先做5分钟动态拉伸热身。',
    afternoon: '☀️ 下午肌肉温度最高，适合力量训练。建议进行40-60分钟抗阻训练，重点锻炼大肌群（胸、背、腿）。组间休息60-90秒。',
    evening: '🌙 晚间适合中低强度运动。建议瑜伽、普拉提或轻松散步20-30分钟。避免剧烈运动影响睡眠，运动后2小时再入睡。'
  };

  const restAdvice = {
    morning: '😴 确保昨晚睡眠7-8小时。起床后进行5分钟轻柔拉伸，喝一杯温水唤醒身体。如果感到疲劳，可以安排10分钟冥想。',
    afternoon: '💆 午后可进行15-20分钟小憩恢复精力。工作间隙做颈部和肩部放松操，每小时起身活动5分钟防止久坐疲劳。',
    evening: '🛀 睡前1小时避免使用电子设备。可以进行10分钟泡沫轴放松或热水泡脚，帮助肌肉恢复和提升睡眠质量。'
  };

  const dietAdvice = {
    morning: '🥣 早餐应在起床后1小时内进食。推荐：燕麦粥+鸡蛋+牛奶+水果，提供优质蛋白和复合碳水，保持上午稳定能量。',
    afternoon: '🍽️ 午餐是一天能量的重要来源。推荐：糙米饭+鸡胸肉/鱼+蔬菜沙拉，蛋白质占30%、碳水50%、脂肪20%。',
    evening: '🥗 晚餐宜清淡，睡前3小时进食完毕。推荐：少量主食+豆制品+大量蔬菜，避免高脂肪食物影响睡眠质量。'
  };

  const timeKey = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  if (type === 'workout') {
    return workoutAdvice[timeKey];
  } else if (type === 'rest') {
    return restAdvice[timeKey];
  } else if (type === 'diet') {
    return dietAdvice[timeKey];
  } else {
    // 综合建议
    return `📋 今日综合建议：\n\n训练：${workoutAdvice[timeKey].substring(2)}\n\n休息：${restAdvice[timeKey].substring(2)}\n\n饮食：${dietAdvice[timeKey].substring(2)}`;
  }
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
          temperature: 0.7,
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
          temperature: 0.7,
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

  return null;
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
    const { type = 'all', context = {} } = req.body;

    console.log(`[API Server] Coach request: type=${type}`);

    // 构建提示词
    const prompt = buildCoachPrompt(type, context);

    // 尝试调用 AI
    const aiResponse = await callAI(prompt);

    let advice;
    if (aiResponse && aiResponse.trim()) {
      advice = aiResponse.trim();
    } else {
      // 使用本地规则
      advice = localCoachAdvice(type, context);
    }

    console.log(`[API Server] Coach advice generated for type: ${type}`);

    return res.status(200).json({
      success: true,
      data: {
        type,
        advice,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[API Server] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

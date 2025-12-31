/**
 * MCP 后端服务器
 * 用于连接 InsForge MCP 并处理数据同步
 */

const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// InsForge 配置
const INSFORGE_CONFIG = {
  API_KEY: 'ik_39bb1da4b36fb9faef1047c398f44bf8',
  API_BASE_URL: 'https://zrqg6y6j.us-west.insforge.app'
};

// 存储 MCP 进程
let mcpProcess = null;
let mcpReady = false;

/**
 * 启动 MCP 客户端
 */
function startMCPClient() {
  console.log('[MCP Server] Starting InsForge MCP client...');
  
  mcpProcess = spawn('npx', ['-y', '@insforge/mcp@latest'], {
    env: {
      ...process.env,
      API_KEY: INSFORGE_CONFIG.API_KEY,
      API_BASE_URL: INSFORGE_CONFIG.API_BASE_URL
    },
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  mcpProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('[MCP Client]', output);
    if (output.includes('Connected') || output.includes('ready')) {
      mcpReady = true;
      console.log('[MCP Server] MCP client is ready!');
    }
  });

  mcpProcess.stderr.on('data', (data) => {
    console.error('[MCP Client Error]', data.toString());
  });

  mcpProcess.on('close', (code) => {
    console.log(`[MCP Client] Process exited with code ${code}`);
    mcpReady = false;
    // 自动重启
    setTimeout(startMCPClient, 5000);
  });
}

/**
 * 通过 HTTP API 直接与 InsForge 交互
 * 使用 InsForge 的 API 端点
 */
async function insertToInsForge(tableName, data) {
  try {
    // 尝试使用 InsForge API 端点
    const url = `${INSFORGE_CONFIG.API_BASE_URL}/api/tables/${tableName}/rows`;
    
    console.log(`[InsForge API] POST ${url}`);
    console.log(`[InsForge API] Data:`, JSON.stringify(data));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${INSFORGE_CONFIG.API_KEY}`,
        'X-API-Key': INSFORGE_CONFIG.API_KEY
      },
      body: JSON.stringify(data)
    });

    const responseText = await response.text();
    console.log(`[InsForge API] Response status: ${response.status}`);
    console.log(`[InsForge API] Response body: ${responseText}`);

    if (response.ok) {
      return { success: true, data: JSON.parse(responseText) };
    } else {
      return { success: false, error: responseText, status: response.status };
    }
  } catch (error) {
    console.error('[InsForge API] Error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 尝试多种 API 端点格式
 */
async function tryInsertWithMultipleEndpoints(tableName, data) {
  const endpoints = [
    `/api/tables/${tableName}/rows`,
    `/api/v1/tables/${tableName}/rows`,
    `/tables/${tableName}/rows`,
    `/api/${tableName}`,
    `/${tableName}`
  ];

  for (const endpoint of endpoints) {
    try {
      const url = `${INSFORGE_CONFIG.API_BASE_URL}${endpoint}`;
      console.log(`[InsForge] Trying: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${INSFORGE_CONFIG.API_KEY}`,
          'X-API-Key': INSFORGE_CONFIG.API_KEY
        },
        body: JSON.stringify(data)
      });

      const responseText = await response.text();
      console.log(`[InsForge] ${endpoint} -> Status: ${response.status}`);
      
      if (response.ok) {
        console.log(`[InsForge] ✅ Success with endpoint: ${endpoint}`);
        return { success: true, data: responseText, endpoint };
      }
    } catch (error) {
      console.log(`[InsForge] ${endpoint} -> Error: ${error.message}`);
    }
  }

  return { success: false, error: 'All endpoints failed' };
}

// API 路由

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mcpReady,
    timestamp: new Date().toISOString()
  });
});

// 同步用户到 InsForge
app.post('/api/sync/users', async (req, res) => {
  try {
    const userData = req.body;
    console.log('[API] Sync user:', userData);

    const result = await tryInsertWithMultipleEndpoints('users', userData);
    
    if (result.success) {
      res.json({ success: true, message: 'User synced to InsForge', data: result });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('[API] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 同步账户到 InsForge
app.post('/api/sync/accounts', async (req, res) => {
  try {
    const accountData = req.body;
    console.log('[API] Sync account:', accountData);

    const result = await tryInsertWithMultipleEndpoints('accounts', accountData);
    
    if (result.success) {
      res.json({ success: true, message: 'Account synced to InsForge', data: result });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('[API] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 同步交易到 InsForge
app.post('/api/sync/transactions', async (req, res) => {
  try {
    const transactionData = req.body;
    console.log('[API] Sync transaction:', transactionData);

    const result = await tryInsertWithMultipleEndpoints('transactions', transactionData);
    
    if (result.success) {
      res.json({ success: true, message: 'Transaction synced to InsForge', data: result });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('[API] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 测试 InsForge 连接
app.get('/api/test-connection', async (req, res) => {
  try {
    console.log('[API] Testing InsForge connection...');
    
    // 测试各种端点
    const testEndpoints = [
      '/',
      '/api',
      '/api/tables',
      '/health',
      '/rest/v1'
    ];

    const results = [];
    for (const endpoint of testEndpoints) {
      try {
        const url = `${INSFORGE_CONFIG.API_BASE_URL}${endpoint}`;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${INSFORGE_CONFIG.API_KEY}`,
            'X-API-Key': INSFORGE_CONFIG.API_KEY
          }
        });
        results.push({
          endpoint,
          status: response.status,
          ok: response.ok
        });
      } catch (error) {
        results.push({
          endpoint,
          error: error.message
        });
      }
    }

    res.json({ 
      baseUrl: INSFORGE_CONFIG.API_BASE_URL,
      results 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`[MCP Server] Running on http://localhost:${PORT}`);
  console.log(`[MCP Server] InsForge API: ${INSFORGE_CONFIG.API_BASE_URL}`);
  console.log('[MCP Server] Available endpoints:');
  console.log('  GET  /health - Health check');
  console.log('  GET  /api/test-connection - Test InsForge connection');
  console.log('  POST /api/sync/users - Sync user data');
  console.log('  POST /api/sync/accounts - Sync account data');
  console.log('  POST /api/sync/transactions - Sync transaction data');
  
  // 启动 MCP 客户端 (可选)
  // startMCPClient();
});

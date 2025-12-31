/**
 * InsForge MCP 数据同步脚本
 * 使用 MCP SDK 直接与 InsForge 通信
 * 
 * 运行方式: node backend/insforge-mcp-sync.js
 */

const { spawn } = require('child_process');
const readline = require('readline');

const INSFORGE_CONFIG = {
  API_KEY: 'ik_39bb1da4b36fb9faef1047c398f44bf8',
  API_BASE_URL: 'https://zrqg6y6j.us-west.insforge.app'
};

class InsForgeClient {
  constructor() {
    this.process = null;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this.initialized = false;
    this.tools = [];
  }

  /**
   * 启动 MCP 进程
   */
  async start() {
    return new Promise((resolve, reject) => {
      console.log('[InsForge] 启动 MCP 客户端...');
      
      this.process = spawn('npx', ['-y', '@insforge/mcp@latest'], {
        env: {
          ...process.env,
          API_KEY: INSFORGE_CONFIG.API_KEY,
          API_BASE_URL: INSFORGE_CONFIG.API_BASE_URL
        },
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const rl = readline.createInterface({
        input: this.process.stdout,
        crlfDelay: Infinity
      });

      rl.on('line', (line) => {
        this.handleMessage(line);
      });

      this.process.stderr.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg) {
          console.log('[InsForge stderr]', msg);
        }
      });

      this.process.on('error', (err) => {
        console.error('[InsForge] 进程错误:', err);
        reject(err);
      });

      this.process.on('close', (code) => {
        console.log(`[InsForge] 进程退出，代码: ${code}`);
      });

      // 等待进程启动
      setTimeout(() => {
        this.initialize().then(resolve).catch(reject);
      }, 2000);
    });
  }

  /**
   * 处理来自 MCP 的消息
   */
  handleMessage(line) {
    try {
      const message = JSON.parse(line);
      console.log('[InsForge] 收到消息:', JSON.stringify(message).substring(0, 200));

      if (message.id && this.pendingRequests.has(message.id)) {
        const { resolve, reject } = this.pendingRequests.get(message.id);
        this.pendingRequests.delete(message.id);

        if (message.error) {
          reject(new Error(message.error.message || 'MCP Error'));
        } else {
          resolve(message.result);
        }
      }
    } catch (e) {
      // 不是 JSON，可能是普通输出
      console.log('[InsForge]', line);
    }
  }

  /**
   * 发送 JSON-RPC 请求
   */
  async sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;
      const request = {
        jsonrpc: '2.0',
        id,
        method,
        params
      };

      this.pendingRequests.set(id, { resolve, reject });

      console.log('[InsForge] 发送请求:', JSON.stringify(request));
      this.process.stdin.write(JSON.stringify(request) + '\n');

      // 超时处理
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  /**
   * 初始化 MCP 连接
   */
  async initialize() {
    try {
      console.log('[InsForge] 初始化连接...');
      
      // 发送 initialize 请求
      const initResult = await this.sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'bill-app',
          version: '1.0.0'
        }
      });

      console.log('[InsForge] 初始化结果:', initResult);
      this.initialized = true;

      // 获取可用工具列表
      const toolsResult = await this.sendRequest('tools/list');
      this.tools = toolsResult?.tools || [];
      console.log('[InsForge] 可用工具:', this.tools.map(t => t.name));

      return true;
    } catch (error) {
      console.error('[InsForge] 初始化失败:', error.message);
      return false;
    }
  }

  /**
   * 调用 MCP 工具
   */
  async callTool(name, args = {}) {
    try {
      console.log(`[InsForge] 调用工具: ${name}`, args);
      const result = await this.sendRequest('tools/call', {
        name,
        arguments: args
      });
      console.log('[InsForge] 工具结果:', result);
      return result;
    } catch (error) {
      console.error(`[InsForge] 工具调用失败: ${name}`, error.message);
      throw error;
    }
  }

  /**
   * 列出所有表
   */
  async listTables() {
    // 尝试不同的工具名称
    const possibleToolNames = ['list_tables', 'listTables', 'get_tables', 'tables'];
    
    for (const toolName of possibleToolNames) {
      try {
        return await this.callTool(toolName);
      } catch (e) {
        continue;
      }
    }
    throw new Error('无法找到列出表的工具');
  }

  /**
   * 插入数据到表
   */
  async insertRow(tableName, data) {
    // 尝试不同的工具名称
    const possibleToolNames = ['insert_row', 'insertRow', 'create_row', 'add_row'];
    
    for (const toolName of possibleToolNames) {
      try {
        return await this.callTool(toolName, {
          table: tableName,
          data: data
        });
      } catch (e) {
        continue;
      }
    }
    throw new Error('无法找到插入数据的工具');
  }

  /**
   * 关闭连接
   */
  close() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }
}

// 主函数
async function main() {
  console.log('='.repeat(60));
  console.log('InsForge MCP 数据同步脚本');
  console.log('='.repeat(60));
  console.log('API Base URL:', INSFORGE_CONFIG.API_BASE_URL);
  console.log('');

  const client = new InsForgeClient();

  try {
    // 启动客户端
    await client.start();

    if (!client.initialized) {
      console.log('\n[警告] MCP 客户端可能未完全初始化');
      console.log('可用工具:', client.tools);
    }

    // 尝试列出表
    console.log('\n[测试] 尝试列出所有表...');
    try {
      const tables = await client.listTables();
      console.log('表列表:', tables);
    } catch (e) {
      console.log('列出表失败:', e.message);
    }

    // 尝试插入测试用户
    console.log('\n[测试] 尝试插入测试用户...');
    try {
      const result = await client.insertRow('users', {
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date().toISOString()
      });
      console.log('插入结果:', result);
    } catch (e) {
      console.log('插入失败:', e.message);
    }

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    // 关闭客户端
    client.close();
  }

  console.log('\n' + '='.repeat(60));
  console.log('脚本执行完成');
  console.log('='.repeat(60));
}

// 运行
main().catch(console.error);

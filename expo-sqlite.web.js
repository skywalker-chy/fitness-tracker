// Web平台兼容的数据库模拟实现
// 由于expo-sqlite在Web平台上可能不兼容，我们提供一个模拟实现

// 定义模拟的数据库对象
class MockDatabase {
  constructor(name) {
    this.name = name;
    console.log(`Mock database initialized: ${name}`);
    // 在Web上使用localStorage模拟数据存储
    this.storageKey = `db_${name}`;
    
    // 初始化数据存储
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify({
        accounts: [],
        transactions: []
      }));
    }
  }

  async execAsync(sql) {
    console.log(`Executing SQL (mock): ${sql}`);
    // 模拟执行SQL
    return Promise.resolve({ rows: { _array: [], length: 0 } });
  }

  async runAsync(sql, params = []) {
    console.log(`Running SQL (mock): ${sql} with params:`, params);
    
    // 解析SQL语句来确定操作类型
    const sqlUpper = sql.toUpperCase();
    
    if (sqlUpper.includes('INSERT INTO')) {
      // 处理INSERT语句
      return this.handleInsert(sql, params);
    } else if (sqlUpper.includes('UPDATE')) {
      // 处理UPDATE语句
      return this.handleUpdate(sql, params);
    } else if (sqlUpper.includes('DELETE')) {
      // 处理DELETE语句
      return this.handleDelete(sql, params);
    }
    
    // 对于其他操作，返回默认值
    return Promise.resolve({ 
      lastInsertRowId: Date.now(), 
      rowsAffected: 1 
    });
  }

  async handleInsert(sql, params) {
    const stored = JSON.parse(localStorage.getItem(this.storageKey));
    
    if (sql.includes('accounts')) {
      const newAccount = {
        id: Date.now(), // 简单的ID生成
        name: params[0],
        balance: parseFloat(params[1]) || 0,
        icon: params[2] || 'wallet',
        color: params[3] || '#60A5FA',
        created_at: new Date().toISOString()
      };
      stored.accounts.push(newAccount);
    } else if (sql.includes('transactions')) {
      const newTransaction = {
        id: Date.now(), // 简单的ID生成
        type: params[0], // type
        amount: parseFloat(params[1]) || 0, // amount
        category: params[2], // category
        category_icon: params[3] || 'circle', // category_icon
        account_id: params[4], // account_id
        date: params[5], // date
        description: params[6] || '', // description
        created_at: new Date().toISOString()
      };
      stored.transactions.push(newTransaction);
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(stored));
    
    return Promise.resolve({ 
      lastInsertRowId: Date.now(), 
      rowsAffected: 1 
    });
  }

  async handleUpdate(sql, params) {
    const stored = JSON.parse(localStorage.getItem(this.storageKey));
    
    if (sql.includes('accounts')) {
      const id = params[params.length - 1]; // 假设ID是最后一个参数
      const accountIndex = stored.accounts.findIndex(acc => acc.id == id);
      if (accountIndex !== -1) {
        // 更新账户信息（这里简化处理）
        let updateIndex = 0;
        const account = stored.accounts[accountIndex];
        
        // 根据SQL语句更新相应字段
        if (sql.includes('name')) {
          account.name = params[updateIndex++];
        }
        if (sql.includes('balance')) {
          account.balance = parseFloat(params[updateIndex++]);
        }
        if (sql.includes('icon')) {
          account.icon = params[updateIndex++];
        }
        if (sql.includes('color')) {
          account.color = params[updateIndex++];
        }
        
        stored.accounts[accountIndex] = account;
      }
    } else if (sql.includes('transactions')) {
      const id = params[params.length - 1]; // 假设ID是最后一个参数
      const transactionIndex = stored.transactions.findIndex(trans => trans.id == id);
      if (transactionIndex !== -1) {
        // 更新交易信息（这里简化处理）
        let updateIndex = 0;
        const transaction = stored.transactions[transactionIndex];
        
        // 根据SQL语句更新相应字段
        if (sql.includes('account_id')) {
          transaction.account_id = params[updateIndex++];
        }
        if (sql.includes('type')) {
          transaction.type = params[updateIndex++];
        }
        if (sql.includes('category')) {
          transaction.category = params[updateIndex++];
        }
        if (sql.includes('category_icon')) {
          transaction.category_icon = params[updateIndex++];
        }
        if (sql.includes('amount')) {
          transaction.amount = parseFloat(params[updateIndex++]);
        }
        if (sql.includes('date')) {
          transaction.date = params[updateIndex++];
        }
        if (sql.includes('description')) {
          transaction.description = params[updateIndex++];
        }
        
        stored.transactions[transactionIndex] = transaction;
      }
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(stored));
    
    return Promise.resolve({ 
      lastInsertRowId: params[params.length - 1], // 返回更新的ID
      rowsAffected: 1 
    });
  }

  async handleDelete(sql, params) {
    const stored = JSON.parse(localStorage.getItem(this.storageKey));
    const id = params[0]; // 假设ID是第一个参数
    
    if (sql.includes('accounts')) {
      stored.accounts = stored.accounts.filter(acc => acc.id != id);
    } else if (sql.includes('transactions')) {
      stored.transactions = stored.transactions.filter(trans => trans.id != id);
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(stored));
    
    return Promise.resolve({ 
      lastInsertRowId: id,
      rowsAffected: 1 
    });
  }

  async getAllAsync(sql, params = []) {
    console.log(`Getting all (mock): ${sql} with params:`, params);
    // 从localStorage获取数据
    const stored = JSON.parse(localStorage.getItem(this.storageKey));
    
    // 简单的SQL解析来确定要返回的数据类型
    // 重要：先检查 transactions，因为 JOIN 查询会同时包含两个表名
    // 使用 FROM transactions 来准确判断主表
    const isTransactionsQuery = sql.includes('FROM transactions') || 
                                 (sql.includes('transactions') && !sql.includes('FROM accounts'));
    const isAccountsQuery = sql.includes('FROM accounts') || 
                            (sql.includes('accounts') && !sql.includes('transactions'));
    
    if (isTransactionsQuery) {
      // 处理 transactions 查询（包括 JOIN 查询）
      let results = [...stored.transactions];
      
      // 如果SQL包含LEFT JOIN，需要连接账户信息
      if (sql.includes('LEFT JOIN') || sql.includes('account_name')) {
        results = results.map(transaction => {
          const account = stored.accounts.find(acc => acc.id == transaction.account_id);
          return {
            ...transaction,
            account_name: account ? account.name : 'Unknown Account'
          };
        });
      }
      
      // 如果SQL包含WHERE子句，进行简单过滤
      if (sql.includes('WHERE')) {
        let whereClause = sql.split('WHERE')[1];
        
        // 处理日期范围查询
        if (whereClause.includes('BETWEEN')) {
          // 使用 params 中的日期参数
          if (params.length >= 2) {
            const startDate = new Date(params[0]);
            const endDate = new Date(params[1]);
            endDate.setHours(23, 59, 59, 999); // 设置为当天结束
            results = results.filter(t => {
              const transDate = new Date(t.date);
              return transDate >= startDate && transDate <= endDate;
            });
          }
        }
        
        // 处理ID查询
        if (whereClause.includes('t.id =') || whereClause.includes('id =')) {
          const id = params[0];
          if (id) {
            results = results.filter(t => t.id == id);
          }
        }
        
        // 处理类型过滤
        if (whereClause.includes('type =')) {
          const typeIndex = whereClause.includes('type = ?') ? 0 : -1;
          if (typeIndex >= 0 && params[typeIndex]) {
            const type = params[typeIndex];
            results = results.filter(t => t.type === type);
          }
        }
      }
      
      // 处理 GROUP BY（聚合查询）
      if (sql.includes('GROUP BY type')) {
        const grouped = {};
        results.forEach(t => {
          if (!grouped[t.type]) {
            grouped[t.type] = { type: t.type, total: 0 };
          }
          grouped[t.type].total += (t.amount || 0);
        });
        return Object.values(grouped);
      }
      
      // 处理分类汇总
      if (sql.includes('GROUP BY category')) {
        const grouped = {};
        results.forEach(t => {
          if (!grouped[t.category]) {
            grouped[t.category] = { 
              category: t.category, 
              category_icon: t.category_icon,
              total: 0 
            };
          }
          grouped[t.category].total += (t.amount || 0);
        });
        // 按 total 降序排序
        return Object.values(grouped).sort((a, b) => b.total - a.total);
      }
      
      // 排序处理
      if (sql.includes('ORDER BY')) {
        if (sql.includes('date DESC')) {
          results = results.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
      }
      
      // 处理LIMIT
      if (sql.includes('LIMIT')) {
        const limitMatch = sql.match(/LIMIT\s+(\d+)/);
        if (limitMatch) {
          const limit = parseInt(limitMatch[1]);
          results = results.slice(0, limit);
        }
      }
      
      return results;
    } else if (isAccountsQuery) {
      // 处理 accounts 查询
      let results = [...stored.accounts];
      
      // 如果SQL包含WHERE子句，进行简单过滤
      if (sql.includes('WHERE')) {
        const whereClause = sql.split('WHERE')[1];
        
        // 处理ID查询
        if (whereClause.includes('id =')) {
          const id = params[0];
          if (id) {
            results = results.filter(acc => acc.id == id);
          }
        }
      }
      
      // 处理 SUM 聚合查询
      if (sql.includes('SUM(balance)')) {
        const total = results.reduce((sum, acc) => sum + (acc.balance || 0), 0);
        return [{ total }];
      }
      
      // 排序处理
      if (sql.includes('ORDER BY')) {
        if (sql.includes('created_at')) {
          results = results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
      }
      
      return results;
    }
    
    return [];
  }

  async getFirstAsync(sql, params = []) {
    console.log(`Getting first (mock): ${sql} with params:`, params);
    const results = await this.getAllAsync(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  // 保存数据到localStorage
  saveData(data) {
    const existing = localStorage.getItem(this.storageKey);
    const stored = existing ? JSON.parse(existing) : {};
    const updated = { ...stored, ...data };
    localStorage.setItem(this.storageKey, JSON.stringify(updated));
  }
}

// 模拟expo-sqlite的openDatabaseAsync函数
export const openDatabaseAsync = async (name) => {
  console.log('Opening database (mock):', name);
  return new MockDatabase(name);
};

// 导出其他可能需要的模拟函数
export const SQLite = {
  openDatabaseAsync
};

export default SQLite;
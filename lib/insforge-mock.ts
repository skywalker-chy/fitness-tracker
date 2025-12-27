// 模拟的 InsForge 客户端，用于在SDK安装失败时使用

// 模拟数据存储
let mockAccounts: any[] = [];
let mockTransactions: any[] = [];
let accountIdCounter = 1;
let transactionIdCounter = 1;

// 创建模拟客户端
const createClient = () => {
  return {
    database: {
      table: (tableName: string) => {
        return {
          // 模拟 select 操作
          select: () => {
            let results: any[] = [];
            let limitNum: number | undefined;
            let orderBy: string | undefined;
            let orderDir: 'asc' | 'desc' | undefined;
            let whereConditions: any[] = [];
            let groupBy: string[] = [];
            let joins: any[] = [];

            const query = {
              // 模拟 limit 操作
              limit: (num: number) => {
                limitNum = num;
                return query;
              },
              
              // 模拟 order 操作
              order: (field: string, direction: 'asc' | 'desc') => {
                orderBy = field;
                orderDir = direction;
                return query;
              },
              
              // 模拟 where 操作
              where: (field: string, operator: string, value: any) => {
                whereConditions.push({ field, operator, value });
                return query;
              },
              
              // 模拟 group 操作
              group: (...fields: string[]) => {
                groupBy = [...groupBy, ...fields];
                return query;
              },
              
              // 模拟 join 操作
              join: (table: string, on1: string, operator: string, on2: string, selectFields?: any) => {
                joins.push({ table, on1, operator, on2, selectFields });
                return query;
              },
              
              // 模拟 single 操作（获取单个结果）
              single: async () => {
                const allResults = await query as any[];
                return allResults[0] || null;
              },
              
              // 模拟 delete 操作
              delete: () => {
                return {
                  where: async (field: string, operator: string, value: any) => {
                    if (tableName === 'accounts') {
                      mockAccounts = mockAccounts.filter(account => account[field] !== value);
                    } else if (tableName === 'transactions') {
                      mockTransactions = mockTransactions.filter(transaction => transaction[field] !== value);
                    }
                    return [];
                  }
                };
              }
            };

            // 模拟异步查询
            return new Promise((resolve) => {
              setTimeout(() => {
                // 根据表名获取数据
                if (tableName === 'accounts') {
                  results = [...mockAccounts];
                } else if (tableName === 'transactions') {
                  results = [...mockTransactions];
                  
                  // 处理 join
                  if (joins.length > 0) {
                    results = results.map(transaction => {
                      const account = mockAccounts.find(a => a.id === transaction.account_id);
                      return {
                        ...transaction,
                        account_name: account?.name
                      };
                    });
                  }
                }

                // 处理 where 条件
                whereConditions.forEach(condition => {
                  const { field, operator, value } = condition;
                  results = results.filter(item => {
                    switch (operator) {
                      case '=': return item[field] === value;
                      case '>=': return item[field] >= value;
                      case '<=': return item[field] <= value;
                      default: return true;
                    }
                  });
                });

                // 处理 order
                if (orderBy && orderDir) {
                  results.sort((a, b) => {
                    if (a[orderBy!] < b[orderBy!]) return orderDir === 'asc' ? -1 : 1;
                    if (a[orderBy!] > b[orderBy!]) return orderDir === 'asc' ? 1 : -1;
                    return 0;
                  });
                }

                // 处理 limit
                if (limitNum) {
                  results = results.slice(0, limitNum);
                }

                // 处理 group by
                if (groupBy.length > 0) {
                  const grouped: any = {};
                  results.forEach(item => {
                    const key = groupBy.map(field => item[field]).join('-');
                    if (!grouped[key]) {
                      grouped[key] = { ...item };
                    } else {
                      // 如果是金额字段，累加
                      if (grouped[key].amount !== undefined && item.amount !== undefined) {
                        grouped[key].amount += item.amount;
                      }
                    }
                  });
                  results = Object.values(grouped);
                }

                resolve(results);
              }, 100);
            });
          },
          
          // 模拟 insert 操作
          insert: async (data: any) => {
            let newId = 0;
            
            if (tableName === 'accounts') {
              newId = accountIdCounter++;
              const newAccount = {
                id: newId,
                ...data,
                created_at: data.created_at || new Date().toISOString()
              };
              mockAccounts.push(newAccount);
              return newAccount;
            } else if (tableName === 'transactions') {
              newId = transactionIdCounter++;
              const newTransaction = {
                id: newId,
                ...data,
                created_at: data.created_at || new Date().toISOString()
              };
              mockTransactions.push(newTransaction);
              return newTransaction;
            }
            
            return { id: newId };
          },
          
          // 模拟 update 操作
          update: async (where: any, data: any) => {
            if (tableName === 'accounts') {
              mockAccounts = mockAccounts.map(account => {
                if (account.id === where.id) {
                  return { ...account, ...data };
                }
                return account;
              });
            } else if (tableName === 'transactions') {
              mockTransactions = mockTransactions.map(transaction => {
                if (transaction.id === where.id) {
                  return { ...transaction, ...data };
                }
                return transaction;
              });
            }
            return { updated: true };
          },
          
          // 模拟 delete 操作
          delete: async (where: any) => {
            if (tableName === 'accounts') {
              mockAccounts = mockAccounts.filter(account => account.id !== where.id);
            } else if (tableName === 'transactions') {
              mockTransactions = mockTransactions.filter(transaction => transaction.id !== where.id);
            }
            return { deleted: true };
          }
        };
      }
    }
  };
};

export { createClient };
/**
 * 数据同步脚本（MVP）
 * 功能：同步本地 SQLite 与远端 InsForge 数据
 * 
 * 运行: npx ts-node scripts/sync.ts
 * 或在应用启动时定期调用
 */

import { accountAPI, transactionAPI } from '@/services/insforge';

interface SyncOptions {
  direction?: 'pull' | 'push' | 'bidirectional'; // 同步方向
  force?: boolean; // 强制同步（忽略时间戳）
  verbose?: boolean; // 详细日志
}

/**
 * 日志函数
 */
function log(message: string, verbose = true) {
  if (verbose) {
    console.log(`[SYNC] ${new Date().toISOString()} - ${message}`);
  }
}

/**
 * 从 InsForge 拉取账户数据（Pull）
 */
export async function syncAccountsFromInsForge() {
  try {
    log('开始从 InsForge 拉取账户数据...', true);
    
    const accounts = await accountAPI.getAll();
    
    log(`成功拉取 ${accounts.length} 条账户数据`, true);
    
    // TODO: 将数据存储到本地 SQLite
    // const { createAccount } = await import('@/db/sqlite/database');
    // for (const account of accounts) {
    //   await createAccount({
    //     name: account.name,
    //     balance: account.balance,
    //     icon: account.icon,
    //     color: account.color,
    //   });
    // }
    
    return accounts;
  } catch (error) {
    log(`拉取账户数据失败: ${error}`, true);
    throw error;
  }
}

/**
 * 推送账户数据到 InsForge（Push）
 */
export async function syncAccountsToInsForge(localAccounts: any[]) {
  try {
    log(`开始推送 ${localAccounts.length} 条账户数据到 InsForge...`, true);
    
    let successCount = 0;
    let errorCount = 0;

    for (const account of localAccounts) {
      try {
        await accountAPI.create({
          name: account.name,
          balance: account.balance,
          icon: account.icon,
          color: account.color,
        });
        successCount++;
      } catch (error) {
        log(`推送账户失败 (${account.name}): ${error}`, true);
        errorCount++;
      }
    }

    log(
      `推送完成: 成功 ${successCount} 条, 失败 ${errorCount} 条`,
      true
    );
    
    return { successCount, errorCount };
  } catch (error) {
    log(`推送账户数据失败: ${error}`, true);
    throw error;
  }
}

/**
 * 从 InsForge 拉取交易数据
 */
export async function syncTransactionsFromInsForge() {
  try {
    log('开始从 InsForge 拉取交易数据...', true);
    
    const transactions = await transactionAPI.getAll();
    
    log(`成功拉取 ${transactions.length} 条交易数据`, true);
    
    // TODO: 将数据存储到本地 SQLite
    // const { createTransaction } = await import('@/db/sqlite/database');
    // for (const transaction of transactions) {
    //   await createTransaction({
    //     type: transaction.type,
    //     amount: transaction.amount,
    //     category: transaction.category,
    //     category_icon: transaction.category_icon,
    //     account_id: transaction.account_id,
    //     date: transaction.date,
    //     description: transaction.description,
    //   });
    // }
    
    return transactions;
  } catch (error) {
    log(`拉取交易数据失败: ${error}`, true);
    throw error;
  }
}

/**
 * 推送交易数据到 InsForge
 */
export async function syncTransactionsToInsForge(localTransactions: any[]) {
  try {
    log(`开始推送 ${localTransactions.length} 条交易数据到 InsForge...`, true);
    
    let successCount = 0;
    let errorCount = 0;

    for (const transaction of localTransactions) {
      try {
        await transactionAPI.create({
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          category_icon: transaction.category_icon,
          account_id: transaction.account_id,
          date: transaction.date,
          description: transaction.description,
        });
        successCount++;
      } catch (error) {
        log(`推送交易失败: ${error}`, true);
        errorCount++;
      }
    }

    log(
      `推送完成: 成功 ${successCount} 条, 失败 ${errorCount} 条`,
      true
    );
    
    return { successCount, errorCount };
  } catch (error) {
    log(`推送交易数据失败: ${error}`, true);
    throw error;
  }
}

/**
 * 双向同步（简单 MVP 版本，后续添加冲突解析）
 */
export async function bidirectionalSync(options: SyncOptions = {}) {
  const { direction = 'bidirectional', verbose = true } = options;

  log('=== 开始数据同步 ===', verbose);
  log(`同步方向: ${direction}`, verbose);

  try {
    if (direction === 'pull' || direction === 'bidirectional') {
      // 拉取数据
      log('📥 拉取阶段...', verbose);
      await syncAccountsFromInsForge();
      await syncTransactionsFromInsForge();
    }

    if (direction === 'push' || direction === 'bidirectional') {
      // 推送数据（需要先从本地 SQLite 获取）
      log('📤 推送阶段...', verbose);
      // const localAccounts = await getAllAccounts();
      // const localTransactions = await getAllTransactions();
      // await syncAccountsToInsForge(localAccounts);
      // await syncTransactionsToInsForge(localTransactions);
    }

    log('=== 数据同步完成 ===', verbose);
    return { status: 'success' };
  } catch (error) {
    log(`=== 同步失败 ===`, verbose);
    log(`错误: ${error}`, verbose);
    return { status: 'error', error };
  }
}

/**
 * 冲突解析（将在 Phase 2 实现）
 * 策略：
 * - Last-Write-Wins (LWW): 基于 timestamp 取最新的版本
 * - Manual: 提示用户手动选择
 * - Merge: 自动合并（仅适用于某些字段）
 */
export async function resolveConflicts() {
  log('冲突解析功能将在 Phase 2 实现', true);
  // TODO: Implement conflict resolution logic
}

/**
 * 离线模式支持（将在 Phase 2 实现）
 */
export async function enableOfflineMode() {
  log('离线模式将在 Phase 2 实现', true);
  // TODO: Implement offline mode
}

/**
 * 主函数（如果直接运行此脚本）
 */
if (require.main === module) {
  (async () => {
    try {
      await bidirectionalSync({ direction: 'bidirectional', verbose: true });
    } catch (error) {
      console.error('同步脚本错误:', error);
      process.exit(1);
    }
  })();
}

import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 格式化货币金额（保留用于兼容，但显示为分钟）
 */
export function formatCurrency(amount: number, showSign = false): string {
  // 处理 undefined、null、NaN 的情况
  const safeAmount = (amount === undefined || amount === null || isNaN(amount)) ? 0 : amount;
  
  const formatted = Math.abs(safeAmount).toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  if (showSign) {
    return safeAmount >= 0 ? `+${formatted} 分钟` : `-${formatted} 分钟`;
  }
  return `${formatted} 分钟`;
}

/**
 * 格式化运动时长（带符号）
 */
export function formatTransactionAmount(amount: number, type: 'income' | 'expense'): string {
  // 处理 undefined、null、NaN 的情况
  const safeAmount = (amount === undefined || amount === null || isNaN(amount)) ? 0 : amount;
  
  const formatted = Math.abs(safeAmount).toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${formatted} 分钟`;
}

/**
 * 格式化日期
 */
export function formatDate(dateString: string, formatStr = 'MM月dd日'): string {
  try {
    const date = parseISO(dateString);
    return format(date, formatStr, { locale: zhCN });
  } catch {
    return dateString;
  }
}

/**
 * 格式化相对日期
 */
export function formatRelativeDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    if (isToday(date)) return '今天';
    if (isYesterday(date)) return '昨天';
    return format(date, 'MM月dd日', { locale: zhCN });
  } catch {
    return dateString;
  }
}

/**
 * 格式化距今时间
 */
export function formatTimeAgo(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: zhCN });
  } catch {
    return dateString;
  }
}

/**
 * 获取当前日期字符串
 */
export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * 格式化完整日期时间
 */
export function formatDateTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
  } catch {
    return dateString;
  }
}


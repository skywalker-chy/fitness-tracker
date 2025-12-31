// 数据库配置文件
// 使用 InsForge 云数据库

export const DATABASE_TYPE = 'insforge'; // 强制使用 insforge

// InsForge 配置参数
export const INSFORGE_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_INSFORGE_BASE_URL || 'https://zrqg6y6j.us-west.insforge.app',
  anonKey: process.env.EXPO_PUBLIC_INSFORGE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2Njc4NDZ9.uVjGPWXdBruie4yjltrdzy_xzAWu6gcu2Sf31EtPmTw'
};
/**
 * InsForge Authentication API Integration
 * 
 * 这个文件实现了与 InsForge MCP 服务器的认证集成
 * 使用 InsForge 提供的用户管理和 JWT 令牌生成能力
 * 
 * MCP 配置:
 * - API_KEY: ik_39bb1da4b36fb9faef1047c398f44bf8
 * - API_BASE_URL: https://zrqg6y6j.us-west.insforge.app
 */

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// 初始化 InsForge 客户端
// ============================================================================

const INSFORGE_API_KEY = process.env.API_KEY || 'ik_39bb1da4b36fb9faef1047c398f44bf8';
const INSFORGE_BASE_URL = process.env.API_BASE_URL || 'https://zrqg6y6j.us-west.insforge.app';
const INSFORGE_JWT_SECRET = process.env.INSFORGE_JWT_SECRET || 'your-jwt-secret-key';

// 创建 InsForge 客户端 (兼容 Supabase 接口)
const insforgeClient = createClient(INSFORGE_BASE_URL, INSFORGE_API_KEY);

// ============================================================================
// 类型定义
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  name?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
  code: string;
  statusCode: number;
}

// ============================================================================
// JWT 令牌管理
// ============================================================================

import jwt from 'jsonwebtoken';

/**
 * 生成 JWT 令牌
 */
export function generateJWT(userId: string, email: string): string {
  const token = jwt.sign(
    {
      sub: userId,
      email: email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 天过期
    },
    INSFORGE_JWT_SECRET,
    { algorithm: 'HS256' }
  );
  return token;
}

/**
 * 验证 JWT 令牌
 */
export function verifyJWT(token: string): any {
  try {
    const decoded = jwt.verify(token, INSFORGE_JWT_SECRET, {
      algorithms: ['HS256'],
    });
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * 解析 JWT 令牌（不验证签名，用于获取基本信息）
 */
export function decodeJWT(token: string): any {
  try {
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    return null;
  }
}

// ============================================================================
// 用户注册
// ============================================================================

/**
 * 用户注册
 * 
 * @param email - 用户邮箱
 * @param password - 用户密码
 * @param name - 用户名称（可选）
 * @returns 注册结果（包含用户信息和 JWT 令牌）
 */
export async function signUp(
  email: string,
  password: string,
  name?: string
): Promise<AuthResponse> {
  try {
    // 验证输入
    if (!email || !password) {
      throw createAuthError('Email and password are required', 'INVALID_INPUT', 400);
    }

    if (password.length < 6) {
      throw createAuthError('Password must be at least 6 characters', 'WEAK_PASSWORD', 400);
    }

    // 使用 InsForge 的用户管理接口进行注册
    const { data, error } = await insforgeClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
          createdAt: new Date().toISOString(),
        },
      },
    });

    if (error) {
      throw createAuthError(error.message, 'SIGNUP_FAILED', 400);
    }

    if (!data.user) {
      throw createAuthError('Failed to create user', 'SIGNUP_FAILED', 400);
    }

    // 生成 JWT 令牌
    const token = generateJWT(data.user.id, data.user.email!);

    // 构建响应
    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email!,
      name: name || email.split('@')[0],
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      user: authUser,
      token,
      refreshToken: data.session?.refresh_token,
    };
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      throw error;
    }
    throw createAuthError('Registration failed', 'SIGNUP_FAILED', 500);
  }
}

// ============================================================================
// 用户登录
// ============================================================================

/**
 * 用户登录
 * 
 * @param email - 用户邮箱
 * @param password - 用户密码
 * @returns 登录结果（包含用户信息和 JWT 令牌）
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    // 验证输入
    if (!email || !password) {
      throw createAuthError('Email and password are required', 'INVALID_INPUT', 400);
    }

    // 使用 InsForge 的认证接口进行登录
    const { data, error } = await insforgeClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw createAuthError('Invalid email or password', 'SIGNIN_FAILED', 401);
    }

    if (!data.user || !data.session) {
      throw createAuthError('Authentication failed', 'SIGNIN_FAILED', 401);
    }

    // 生成 JWT 令牌
    const token = generateJWT(data.user.id, data.user.email!);

    // 获取用户额外信息
    const userData = data.user.user_metadata || {};

    // 构建响应
    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email!,
      name: userData.name || email.split('@')[0],
      avatarUrl: userData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      createdAt: data.user.created_at,
      updatedAt: data.user.updated_at,
    };

    return {
      user: authUser,
      token,
      refreshToken: data.session.refresh_token,
    };
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      throw error;
    }
    throw createAuthError('Login failed', 'SIGNIN_FAILED', 500);
  }
}

// ============================================================================
// 用户登出
// ============================================================================

/**
 * 用户登出
 * 
 * @param token - JWT 令牌
 */
export async function signOut(token: string): Promise<void> {
  try {
    // 验证令牌
    verifyJWT(token);

    // 调用 InsForge 登出接口
    const { error } = await insforgeClient.auth.signOut();

    if (error) {
      throw createAuthError('Failed to sign out', 'SIGNOUT_FAILED', 400);
    }
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      throw error;
    }
    throw createAuthError('Sign out failed', 'SIGNOUT_FAILED', 500);
  }
}

// ============================================================================
// 刷新令牌
// ============================================================================

/**
 * 刷新 JWT 令牌
 * 
 * @param refreshToken - 刷新令牌
 * @returns 新的 JWT 令牌
 */
export async function refreshToken(refreshToken: string): Promise<string> {
  try {
    if (!refreshToken) {
      throw createAuthError('Refresh token is required', 'INVALID_TOKEN', 400);
    }

    // 使用 InsForge 的刷新令牌接口
    const { data, error } = await insforgeClient.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw createAuthError('Failed to refresh token', 'REFRESH_FAILED', 401);
    }

    // 生成新的 JWT 令牌
    const newToken = generateJWT(data.user.id, data.user.email!);
    return newToken;
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      throw error;
    }
    throw createAuthError('Token refresh failed', 'REFRESH_FAILED', 500);
  }
}

// ============================================================================
// 获取当前用户
// ============================================================================

/**
 * 获取当前用户信息
 * 
 * @param token - JWT 令牌
 * @returns 用户信息
 */
export async function getCurrentUser(token: string): Promise<AuthUser> {
  try {
    // 验证令牌
    const decoded = verifyJWT(token);

    // 从 InsForge 获取用户信息
    const { data, error } = await insforgeClient.auth.getUser(token);

    if (error || !data.user) {
      throw createAuthError('Failed to fetch user', 'USER_FETCH_FAILED', 401);
    }

    const userData = data.user.user_metadata || {};

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email!,
      name: userData.name || data.user.email!.split('@')[0],
      avatarUrl: userData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`,
      createdAt: data.user.created_at,
      updatedAt: data.user.updated_at,
    };

    return authUser;
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      throw error;
    }
    throw createAuthError('Failed to get user', 'USER_FETCH_FAILED', 500);
  }
}

// ============================================================================
// 更新用户资料
// ============================================================================

/**
 * 更新用户资料
 * 
 * @param token - JWT 令牌
 * @param updates - 要更新的字段
 * @returns 更新后的用户信息
 */
export async function updateUserProfile(
  token: string,
  updates: Partial<{ name: string; avatarUrl: string }>
): Promise<AuthUser> {
  try {
    // 验证令牌
    verifyJWT(token);

    // 更新用户信息
    const { data, error } = await insforgeClient.auth.updateUser(
      {
        data: updates,
      },
      token
    );

    if (error || !data.user) {
      throw createAuthError('Failed to update user', 'UPDATE_FAILED', 400);
    }

    const userData = data.user.user_metadata || {};

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email!,
      name: userData.name || data.user.email!.split('@')[0],
      avatarUrl: userData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`,
      createdAt: data.user.created_at,
      updatedAt: data.user.updated_at,
    };

    return authUser;
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      throw error;
    }
    throw createAuthError('Failed to update profile', 'UPDATE_FAILED', 500);
  }
}

// ============================================================================
// 修改密码
// ============================================================================

/**
 * 修改用户密码
 * 
 * @param token - JWT 令牌
 * @param oldPassword - 旧密码
 * @param newPassword - 新密码
 */
export async function changePassword(
  token: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  try {
    // 验证令牌
    verifyJWT(token);

    if (newPassword.length < 6) {
      throw createAuthError('New password must be at least 6 characters', 'WEAK_PASSWORD', 400);
    }

    // 修改密码
    const { error } = await insforgeClient.auth.updateUser(
      { password: newPassword },
      token
    );

    if (error) {
      throw createAuthError('Failed to change password', 'PASSWORD_CHANGE_FAILED', 400);
    }
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      throw error;
    }
    throw createAuthError('Failed to change password', 'PASSWORD_CHANGE_FAILED', 500);
  }
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 创建认证错误
 */
function createAuthError(message: string, code: string, statusCode: number): AuthError {
  const error = new Error(message) as any;
  error.code = code;
  error.statusCode = statusCode;
  return error as AuthError;
}

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证密码强度
 */
export function isValidPassword(password: string): boolean {
  return password && password.length >= 6;
}

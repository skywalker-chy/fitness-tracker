/**
 * 认证 API 路由
 * 
 * 提供以下端点:
 * - POST /api/auth/sign-up - 用户注册
 * - POST /api/auth/sign-in - 用户登录
 * - POST /api/auth/sign-out - 用户登出
 * - POST /api/auth/refresh - 刷新令牌
 * - GET /api/auth/me - 获取当前用户
 * - PATCH /api/auth/me - 更新用户资料
 * - POST /api/auth/change-password - 修改密码
 */

import type { Request, Response } from 'express';
import {
  signUp,
  signIn,
  signOut,
  refreshToken,
  getCurrentUser,
  updateUserProfile,
  changePassword,
  isValidEmail,
  isValidPassword,
  decodeJWT,
} from './insforge-auth';

// ============================================================================
// 中间件
// ============================================================================

/**
 * 认证中间件 - 验证 JWT 令牌
 */
export function authMiddleware(req: Request, res: Response, next: Function) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Missing or invalid authorization header',
        code: 'MISSING_TOKEN',
      });
    }

    const token = authHeader.slice(7);
    const decoded = decodeJWT(token);

    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    // 将用户信息附加到请求对象
    (req as any).user = decoded;
    (req as any).token = token;

    next();
  } catch (error) {
    res.status(401).json({
      error: 'Authentication failed',
      code: 'AUTH_FAILED',
    });
  }
}

// ============================================================================
// API 路由处理器
// ============================================================================

/**
 * POST /api/auth/sign-up
 * 用户注册
 */
export async function handleSignUp(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;

    // 验证输入
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        code: 'MISSING_FIELDS',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        code: 'INVALID_EMAIL',
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters',
        code: 'WEAK_PASSWORD',
      });
    }

    // 调用认证函数
    const result = await signUp(email, password, name);

    res.status(201).json({
      user: result.user,
      token: result.token,
      refreshToken: result.refreshToken,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      code: error.code || 'SIGNUP_ERROR',
    });
  }
}

/**
 * POST /api/auth/sign-in
 * 用户登录
 */
export async function handleSignIn(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    // 验证输入
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        code: 'MISSING_FIELDS',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        code: 'INVALID_EMAIL',
      });
    }

    // 调用认证函数
    const result = await signIn(email, password);

    res.status(200).json({
      user: result.user,
      token: result.token,
      refreshToken: result.refreshToken,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      code: error.code || 'SIGNIN_ERROR',
    });
  }
}

/**
 * POST /api/auth/sign-out
 * 用户登出
 */
export async function handleSignOut(req: Request, res: Response) {
  try {
    const token = (req as any).token;

    if (!token) {
      return res.status(401).json({
        error: 'Missing token',
        code: 'MISSING_TOKEN',
      });
    }

    // 调用登出函数
    await signOut(token);

    res.status(200).json({
      message: 'Signed out successfully',
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      code: error.code || 'SIGNOUT_ERROR',
    });
  }
}

/**
 * POST /api/auth/refresh
 * 刷新 JWT 令牌
 */
export async function handleRefreshToken(req: Request, res: Response) {
  try {
    const { refreshToken: rToken } = req.body;

    if (!rToken) {
      return res.status(400).json({
        error: 'Refresh token is required',
        code: 'MISSING_REFRESH_TOKEN',
      });
    }

    // 刷新令牌
    const newToken = await refreshToken(rToken);

    res.status(200).json({
      token: newToken,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      code: error.code || 'REFRESH_ERROR',
    });
  }
}

/**
 * GET /api/auth/me
 * 获取当前用户信息
 */
export async function handleGetCurrentUser(req: Request, res: Response) {
  try {
    const token = (req as any).token;

    if (!token) {
      return res.status(401).json({
        error: 'Missing token',
        code: 'MISSING_TOKEN',
      });
    }

    // 获取用户信息
    const user = await getCurrentUser(token);

    res.status(200).json({
      user,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      code: error.code || 'USER_FETCH_ERROR',
    });
  }
}

/**
 * PATCH /api/auth/me
 * 更新用户资料
 */
export async function handleUpdateUserProfile(req: Request, res: Response) {
  try {
    const token = (req as any).token;
    const { name, avatarUrl } = req.body;

    if (!token) {
      return res.status(401).json({
        error: 'Missing token',
        code: 'MISSING_TOKEN',
      });
    }

    if (!name && !avatarUrl) {
      return res.status(400).json({
        error: 'At least one field (name or avatarUrl) is required',
        code: 'MISSING_FIELDS',
      });
    }

    // 更新用户资料
    const updates: any = {};
    if (name) updates.name = name;
    if (avatarUrl) updates.avatarUrl = avatarUrl;

    const user = await updateUserProfile(token, updates);

    res.status(200).json({
      user,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      code: error.code || 'UPDATE_ERROR',
    });
  }
}

/**
 * POST /api/auth/change-password
 * 修改密码
 */
export async function handleChangePassword(req: Request, res: Response) {
  try {
    const token = (req as any).token;
    const { oldPassword, newPassword } = req.body;

    if (!token) {
      return res.status(401).json({
        error: 'Missing token',
        code: 'MISSING_TOKEN',
      });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        error: 'Old password and new password are required',
        code: 'MISSING_FIELDS',
      });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        error: 'New password must be at least 6 characters',
        code: 'WEAK_PASSWORD',
      });
    }

    // 修改密码
    await changePassword(token, oldPassword, newPassword);

    res.status(200).json({
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      code: error.code || 'PASSWORD_CHANGE_ERROR',
    });
  }
}

// ============================================================================
// 注册路由
// ============================================================================

/**
 * 在 Express 应用中注册认证路由
 * 
 * 使用示例:
 * ```typescript
 * import express from 'express';
 * import { registerAuthRoutes, authMiddleware } from './auth-routes';
 * 
 * const app = express();
 * app.use(express.json());
 * 
 * registerAuthRoutes(app);
 * 
 * app.listen(3000, () => {
 *   console.log('Server running on port 3000');
 * });
 * ```
 */
export function registerAuthRoutes(app: any) {
  // 公开路由 (不需要认证)
  app.post('/api/auth/sign-up', handleSignUp);
  app.post('/api/auth/sign-in', handleSignIn);
  app.post('/api/auth/refresh', handleRefreshToken);

  // 受保护的路由 (需要认证)
  app.post('/api/auth/sign-out', authMiddleware, handleSignOut);
  app.get('/api/auth/me', authMiddleware, handleGetCurrentUser);
  app.patch('/api/auth/me', authMiddleware, handleUpdateUserProfile);
  app.post('/api/auth/change-password', authMiddleware, handleChangePassword);

  console.log('✅ Auth routes registered');
}

// ============================================================================
// 导出所有处理器和中间件
// ============================================================================

export {
  handleSignUp,
  handleSignIn,
  handleSignOut,
  handleRefreshToken,
  handleGetCurrentUser,
  handleUpdateUserProfile,
  handleChangePassword,
  authMiddleware,
};

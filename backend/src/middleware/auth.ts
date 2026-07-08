// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../app';
import { verifyAccessToken } from '../services/token';
import { User } from '../models/User';

export interface IRequestIdentity extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticate = async (req: IRequestIdentity, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies?.accessToken;
    
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Authentication signature missing from payload.', 401));
    }

    const payload = verifyAccessToken(token);
    
    const dbUser = await User.findById(payload.userId);
    if (!dbUser) {
      return next(new AppError('User profile not found. Access revoked.', 401));
    }

    if (dbUser.status === 'Suspended') {
      return next(new AppError('Your account has been temporarily suspended. Please contact support.', 403));
    }

    if (dbUser.status === 'Banned') {
      return next(new AppError('Your account has been permanently banned.', 403));
    }

    req.user = { id: payload.userId, role: dbUser.role };
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired access token. Please re-authenticate.', 401));
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: IRequestIdentity, res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Identity context not detected.', 401));
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Privileged access tier constraint violation.', 403));
    }
    next();
  };
};
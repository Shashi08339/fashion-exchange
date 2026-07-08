// backend/src/middleware/rbac.ts
import { Response, NextFunction } from 'express';
import { AppError } from '../app';
import { User } from '../models/User';
import { IRequestIdentity } from './auth';

export const authorizeRoles = (...allowedRoles: string[]) => {
  return async (req: IRequestIdentity, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Identity context not detected.', 401));
    }

    try {
      const dbUser = await User.findById(req.user.id);
      if (!dbUser) {
        return next(new AppError('User profile not found in database.', 404));
      }

      if (dbUser.status === 'Suspended') {
        return next(new AppError('Your account has been temporarily suspended. Please contact support.', 403));
      }

      if (dbUser.status === 'Banned') {
        return next(new AppError('Your account has been permanently banned.', 403));
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(dbUser.role)) {
        return next(new AppError('Privileged access tier constraint violation.', 403));
      }

      // Sync role into req.user
      req.user.role = dbUser.role;
      next();
    } catch (err) {
      next(err);
    }
  };
};

// backend/src/middleware/rateLimiter.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../app';

interface ILimitRecord {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, ILimitRecord>();

export const rateLimiter = (windowMs: number = 60000, maxRequests: number = 100) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';
    const key = `${ip}:${req.originalUrl || req.path}`;
    const now = Date.now();

    let record = memoryStore.get(key);

    if (!record) {
      record = { count: 1, resetTime: now + windowMs };
      memoryStore.set(key, record);
      return next();
    }

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }

    record.count += 1;
    if (record.count > maxRequests) {
      res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));
      return next(new AppError('Too many requests. Please throttle execution rates.', 429));
    }

    next();
  };
};

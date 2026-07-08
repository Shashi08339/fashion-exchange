// backend/src/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import listingRouter from './routes/listing';
import aiRouter from './routes/ai';
import authRouter from './routes/auth';
import profileRouter from './routes/profile';
import paymentRouter from './routes/payment';
import socialRouter from './routes/social';
import adminRouter from './routes/admin';

// Global error classes
export class AppError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

const app: Application = express();

// Absolute security hardening layers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin" }
}));

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      'http://localhost:5175',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:5176'
    ].filter(Boolean) as string[];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(mongoSanitize());

// Standard health checking endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/listings', listingRouter);
app.use('/api/ai', aiRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/social', socialRouter);
app.use('/api/admin', adminRouter);

// Global Error Handling Middleware
app.use((err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Defect';
  
  console.error(`[Global Error Interceptor] [${req.method}] ${req.path} -> Status ${statusCode} : ${message}\nStack: ${err.stack}`);
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

export default app;
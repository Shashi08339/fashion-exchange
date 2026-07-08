// backend/src/services/token.ts
import jwt from 'jsonwebtoken';

interface ITokenPayload {
  userId: string;
  role: string;
}

export const generateAccessToken = (payload: ITokenPayload): string => {
  const secret = process.env.JWT_ACCESS_SECRET ?? 'access_secret_fallback';
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_ACCESS_EXPIRATION ?? '15m'
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: ITokenPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET ?? 'refresh_secret_fallback';
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRATION ?? '7d'
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): ITokenPayload => {
  const secret = process.env.JWT_ACCESS_SECRET ?? 'access_secret_fallback';
  return jwt.verify(token, secret) as ITokenPayload;
};

export const verifyRefreshToken = (token: string): ITokenPayload => {
  const secret = process.env.JWT_REFRESH_SECRET ?? 'refresh_secret_fallback';
  return jwt.verify(token, secret) as ITokenPayload;
};
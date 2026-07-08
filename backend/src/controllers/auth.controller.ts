// backend/src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Profile } from '../models/Profile';
import { AppError } from '../app';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../services/token';
import { sendOTPEmail } from '../services/mail';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days matching maximum bounds
};

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, name, username, address, city, state, country, coordinates } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return next(new AppError('Identity profile already exists for this email.', 400));

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    const newUser = await User.create({
      email,
      password,
      verificationOTP: otp,
      verificationOTPExpires: otpExpiry
    });

    await Profile.create({
      user: newUser._id,
      name,
      username,
      location: {
        address, city, state, country,
        geo: { type: 'Point', coordinates }
      }
    });

    await sendOTPEmail(email, otp, 'Email Identity Verification');

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please verify your email via the OTP sent to your inbox.'
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError('Invalid authentication credentials.', 401));
    }

    if (!user.isVerified) {
      return next(new AppError('Account registration incomplete. Email verification required.', 403));
    }

    const accessToken = generateAccessToken({ userId: user._id.toString(), role: user.role });
    const refreshToken = generateRefreshToken({ userId: user._id.toString(), role: user.role });

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(200).json({ success: true, message: 'Authentication successful.' });
  } catch (err) {
    next(err);
  }
};

export const verifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, verificationOTP: otp, verificationOTPExpires: { $gt: new Date() } });

    if (!user) return next(new AppError('Invalid or expired verification code.', 400));

    user.isVerified = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Identity confirmed successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
};

export const refreshSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return next(new AppError('Session refresh token signature missing.', 401));

    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.userId).select('+refreshTokenHash');

    if (!user || !user.refreshTokenHash || !(await bcrypt.compare(token, user.refreshTokenHash))) {
      return next(new AppError('Session validation failed.', 401));
    }

    const nextAccess = generateAccessToken({ userId: user._id.toString(), role: user.role });
    res.cookie('accessToken', nextAccess, { ...cookieOptions, maxAge: 15 * 60 * 1000 });

    res.status(200).json({ success: true, message: 'Session extension granted.' });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const payload = verifyRefreshToken(token);
      await User.findByIdAndUpdate(payload.userId, { $unset: { refreshTokenHash: 1 } });
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: 'Session clean-up complete.' });
  } catch (err) {
    next(err);
  }
};
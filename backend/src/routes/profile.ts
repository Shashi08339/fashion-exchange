import { Router } from 'express';
import { IRequestIdentity, authenticate } from '../middleware/auth';
import { Profile } from '../models/Profile';
import { AppError } from '../app';

const router = Router();

router.get('/me', authenticate, async (req: IRequestIdentity, res, next) => {
  try {
    if (!req.user) return next(new AppError('User context missing.', 401));

    const profile = await Profile.findOne({ user: req.user.id }).populate('user', 'email role');
    if (!profile) return next(new AppError('Profile not found.', 404));

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

export default router;

// backend/src/controllers/social.controller.ts
import { Response, NextFunction } from 'express';
import { IRequestIdentity } from '../middleware/auth';
import { Profile } from '../models/Profile';
import { Wallet } from '../models/Wallet';
import { Listing } from '../models/Listing';
import { AppError } from '../app';

export const toggleFollow = async (req: IRequestIdentity, res: Response, next: NextFunction): Promise<void> => {
  try {
    const activeUserId = req.user?.id;
    const { targetUserId } = req.params;

    if (activeUserId === targetUserId) {
      return next(new AppError('You cannot follow your own profile.', 400));
    }

    const activeProfile = await Profile.findOne({ user: activeUserId });
    const targetProfile = await Profile.findOne({ user: targetUserId });

    if (!activeProfile || !targetProfile) {
      return next(new AppError('Profile not found.', 404));
    }

    const followingIndex = activeProfile.following.indexOf(targetUserId as any);
    const followersIndex = targetProfile.followers.indexOf(activeUserId as any);

    let isFollowingNow = false;

    if (followingIndex === -1) {
      activeProfile.following.push(targetUserId as any);
      targetProfile.followers.push(activeUserId as any);
      isFollowingNow = true;
    } else {
      activeProfile.following.splice(followingIndex, 1);
      targetProfile.followers.splice(followersIndex, 1);
    }

    await activeProfile.save();
    await targetProfile.save();

    res.status(200).json({ success: true, isFollowing: isFollowingNow });
  } catch (err) {
    next(err);
  }
};

export const toggleWishlist = async (req: IRequestIdentity, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { listingId } = req.params;

    const listingExists = await Listing.findById(listingId);
    if (!listingExists) return next(new AppError('Listing not found.', 404));

    const profile = await Profile.findOne({ user: userId });
    if (!profile) return next(new AppError('Profile not found.', 404));

    const wishlistIndex = profile.wishlist.indexOf(listingId as any);
    let isWishlistedNow = false;

    if (wishlistIndex === -1) {
      profile.wishlist.push(listingId as any);
      isWishlistedNow = true;
    } else {
      profile.wishlist.splice(wishlistIndex, 1);
    }

    await profile.save();

    res.status(200).json({ success: true, isWishlisted: isWishlistedNow });
  } catch (err) {
    next(err);
  }
};

export const claimDailyStreak = async (req: IRequestIdentity, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const profile = await Profile.findOne({ user: userId });
    const wallet = await Wallet.findOne({ user: userId });

    if (!profile || !wallet) {
      return next(new AppError('Profile or Wallet context not found.', 404));
    }

    const now = new Date();
    const lastActive = new Date(profile.lastActiveDate);

    // Calculate difference in hours
    const diffTime = Math.abs(now.getTime() - lastActive.getTime());
    const diffHours = diffTime / (1000 * 60 * 60);

    if (diffHours >= 24 && diffHours < 48) {
      profile.streakCount += 1;
    } else if (diffHours >= 48) {
      profile.streakCount = 1; // Streak broken, restart
    } else if (profile.streakCount === 0) {
      profile.streakCount = 1; // Initial claim
    } else {
      // Less than 24 hours, already active today
      return next(new AppError('Daily streak already updated within last 24 hours.', 400));
    }

    profile.lastActiveDate = now;
    
    // Reward coins based on streak
    const bonusCoins = Math.min(10 + profile.streakCount, 50); // Cap bonus coins per day at 50
    wallet.coinBalance += bonusCoins;

    await profile.save();
    await wallet.save();

    res.status(200).json({
      success: true,
      streakCount: profile.streakCount,
      bonusCoinsEarned: bonusCoins,
      coinBalance: wallet.coinBalance
    });
  } catch (err) {
    next(err);
  }
};

export const getLeaderboard = async (req: IRequestIdentity, res: Response, next: NextFunction): Promise<void> => {
  try {
    const topPerformers = await Profile.find({})
      .populate('user', 'email')
      .sort({ ecoImpactMetric: -1 })
      .limit(10)
      .select('name username avatar ecoImpactMetric completedSwapsCount badges');

    res.status(200).json({ success: true, leaderboard: topPerformers });
  } catch (err) {
    next(err);
  }
};

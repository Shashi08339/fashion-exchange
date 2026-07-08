// backend/src/routes/social.ts
import { Router } from 'express';
import * as SocialController from '../controllers/social.controller';
import { authenticate } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/follow/:targetUserId', authenticate, SocialController.toggleFollow);
router.post('/wishlist/:listingId', authenticate, SocialController.toggleWishlist);
router.post('/streak/claim', authenticate, rateLimiter(60000, 3), SocialController.claimDailyStreak);
router.get('/leaderboard', SocialController.getLeaderboard);

export default router;

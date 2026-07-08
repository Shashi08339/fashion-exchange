// backend/src/routes/ai.ts
import { Router } from 'express';
import * as AIController from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.post('/evaluate-value', authenticate, AIController.calculateMarketFairness);

export default router;
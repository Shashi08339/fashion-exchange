// backend/src/routes/payment.ts
import { Router } from 'express';
import * as PaymentController from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/wallet/balance', authenticate, PaymentController.getWalletBalance);
router.post('/wallet/deposit', authenticate, rateLimiter(60000, 10), PaymentController.depositFunds);
router.post('/checkout', authenticate, rateLimiter(60000, 5), PaymentController.processCheckout);

export default router;

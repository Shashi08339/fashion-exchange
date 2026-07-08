// backend/src/routes/admin.ts
import { Router } from 'express';
import * as AdminController from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Restrict all paths in this file to Admin / SuperAdmin roles
router.use(authenticate);
router.use(authorize('Admin', 'SuperAdmin'));

router.get('/metrics', AdminController.getAdminDashboardMetrics);
router.get('/listings/queue', AdminController.getListingsApprovalQueue);
router.post('/listings/approve/:listingId', AdminController.approveRejectListing);
router.post('/users/status/:userId', AdminController.updateUserStatus);
router.get('/system/health', AdminController.getSystemHealth);

export default router;

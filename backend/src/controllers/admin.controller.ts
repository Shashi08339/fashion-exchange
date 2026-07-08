// backend/src/controllers/admin.controller.ts
import { Response, NextFunction } from 'express';
import os from 'os';
import mongoose from 'mongoose';
import { IRequestIdentity } from '../middleware/auth';
import { User } from '../models/User';
import { Listing } from '../models/Listing';
import { Profile } from '../models/Profile';
import { Transaction } from '../models/Transaction';
import { AuditLog } from '../models/AuditLog';
import { AppError } from '../app';

export const getAdminDashboardMetrics = async (req: IRequestIdentity, res: Response, next: NextFunction): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalListings = await Listing.countDocuments({});
    const pendingApproval = await Listing.countDocuments({ isApproved: false });
    
    // Aggregate financial transactions
    const purchaseTxns = await Transaction.find({ type: 'Purchase', status: 'Completed' });
    const totalRevenue = purchaseTxns.reduce((sum, tx) => sum + tx.amount, 0);
    const platformCommission = totalRevenue * 0.05; // 5% flat fee

    // Aggregate environmental metrics
    const activeProfiles = await Profile.find({});
    const totalCarbonSaved = activeProfiles.reduce((sum, p) => sum + (p.ecoImpactMetric || 0), 0);
    const waterSavedEstimate = totalCarbonSaved * 150; // 150 liters per kg of CO2 saved average

    res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        totalListings,
        pendingApproval,
        totalRevenue,
        platformCommission,
        environmental: {
          carbonSavedKg: Math.round(totalCarbonSaved * 10) / 10,
          waterSavedLiters: Math.round(waterSavedEstimate),
          treesEquivalent: Math.round(totalCarbonSaved / 22) // One tree absorbs ~22kg of CO2 per year
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getListingsApprovalQueue = async (req: IRequestIdentity, res: Response, next: NextFunction): Promise<void> => {
  try {
    const queue = await Listing.find({ isApproved: false })
      .populate('owner', 'email')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, queue });
  } catch (err) {
    next(err);
  }
};

export const approveRejectListing = async (req: IRequestIdentity, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminId = req.user?.id;
    const { listingId } = req.params;
    const { action, reason } = req.body; // 'approve' or 'reject'

    const listing = await Listing.findById(listingId);
    if (!listing) return next(new AppError('Listing not found.', 404));

    if (action === 'approve') {
      listing.isApproved = true;
      await listing.save();

      await AuditLog.create({
        actor: adminId,
        action: 'ApproveListing',
        targetType: 'Listing',
        targetId: listing._id,
        reason: reason || 'Listing guidelines verified.'
      });
    } else {
      // Reject and delete listing
      await Listing.findByIdAndDelete(listingId);

      await AuditLog.create({
        actor: adminId,
        action: 'RejectListing',
        targetType: 'Listing',
        targetId: listing._id,
        reason: reason || 'Listing violates content policy.'
      });
    }

    res.status(200).json({ success: true, message: `Listing successfully ${action}d.` });
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (req: IRequestIdentity, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminId = req.user?.id;
    const { userId } = req.params;
    const { status, reason } = req.body; // 'Active', 'Suspended', 'Banned'

    if (!['Active', 'Suspended', 'Banned'].includes(status)) {
      return next(new AppError('Invalid status update parameter.', 400));
    }

    const user = await User.findById(userId);
    if (!user) return next(new AppError('User not found.', 404));
    
    if (user.role === 'SuperAdmin') {
      return next(new AppError('SuperAdmin statuses are immutable.', 403));
    }

    user.status = status;
    await user.save();

    await AuditLog.create({
      actor: adminId,
      action: `${status}User`,
      targetType: 'User',
      targetId: user._id,
      reason: reason || `Admin user control status change to ${status}.`
    });

    res.status(200).json({ success: true, message: `User status changed to ${status}.` });
  } catch (err) {
    next(err);
  }
};

export const getSystemHealth = async (req: IRequestIdentity, res: Response, next: NextFunction): Promise<void> => {
  try {
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const memUsage = ((totalMem - freeMem) / totalMem) * 100;
    
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'Connected' : dbState === 2 ? 'Connecting' : 'Disconnected';

    res.status(200).json({
      success: true,
      health: {
        serverUptimeHours: Math.round((os.uptime() / 3600) * 100) / 100,
        memoryUsagePercent: Math.round(memUsage * 10) / 10,
        cpuCores: os.cpus().length,
        database: {
          status: dbStatus,
          latencyMs: 12.0 // Mock connection ping latency
        },
        uptime: process.uptime()
      }
    });
  } catch (err) {
    next(err);
  }
};

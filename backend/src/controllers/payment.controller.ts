// backend/src/controllers/payment.controller.ts
import { Response, NextFunction } from 'express';
import { IRequestIdentity } from '../middleware/auth';
import { Wallet } from '../models/Wallet';
import { Transaction } from '../models/Transaction';
import { Listing } from '../models/Listing';
import { Profile } from '../models/Profile';
import { AppError } from '../app';

export const getWalletBalance = async (req: IRequestIdentity, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: userId, balance: 1000.0, coinBalance: 50 }); // Free sign-up credit
    }
    res.status(200).json({ success: true, wallet });
  } catch (err) {
    next(err);
  }
};

export const depositFunds = async (req: IRequestIdentity, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { amount } = req.body;
    
    if (!amount || parseFloat(amount) <= 0) {
      return next(new AppError('Invalid deposit amount.', 400));
    }

    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: userId });
    }

    wallet.balance += parseFloat(amount);
    
    const transaction = await Transaction.create({
      buyer: userId,
      type: 'WalletFunding',
      amount: parseFloat(amount),
      status: 'Completed',
      paymentDetails: {
        provider: 'UPI/Card',
        transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      }
    });

    wallet.transactions.push(transaction._id);
    await wallet.save();

    res.status(200).json({ success: true, balance: wallet.balance, transaction });
  } catch (err) {
    next(err);
  }
};

export const processCheckout = async (req: IRequestIdentity, res: Response, next: NextFunction): Promise<void> => {
  try {
    const buyerId = req.user?.id;
    const { listingId, useCoins } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) return next(new AppError('Listing not found.', 404));
    if (listing.availability !== 'Available') return next(new AppError('Listing is no longer available.', 400));
    if (listing.owner.toString() === buyerId) return next(new AppError('You cannot purchase your own listing.', 400));

    let buyerWallet = await Wallet.findOne({ user: buyerId });
    if (!buyerWallet) buyerWallet = await Wallet.create({ user: buyerId });

    let sellerWallet = await Wallet.findOne({ user: listing.owner });
    if (!sellerWallet) sellerWallet = await Wallet.create({ user: listing.owner });

    let finalAmount = listing.estimatedValue;
    let coinsUsed = 0;

    // Apply gamification reward coins for discount: 10 coins = 10 Rupees off (max 20% discount)
    if (useCoins && buyerWallet.coinBalance > 0) {
      const maxDiscount = finalAmount * 0.2;
      const coinDiscount = Math.min(buyerWallet.coinBalance, maxDiscount);
      coinsUsed = Math.floor(coinDiscount);
      finalAmount -= coinsUsed;
    }

    if (buyerWallet.balance < finalAmount) {
      return next(new AppError('Insufficient wallet balance. Please fund your wallet.', 400));
    }

    // Complete transaction
    buyerWallet.balance -= finalAmount;
    buyerWallet.coinBalance -= coinsUsed;

    // Platform commission logic (e.g. 5% commission)
    const platformCommission = finalAmount * 0.05;
    const sellerPayout = finalAmount - platformCommission;
    sellerWallet.balance += sellerPayout;
    
    // Grant coins to buyer for purchasing circular fashion!
    const coinsEarned = Math.floor(listing.estimatedValue * 0.1); // 10% cash back in coins
    buyerWallet.coinBalance += coinsEarned;

    listing.availability = 'Swapped';
    await listing.save();

    const transaction = await Transaction.create({
      buyer: buyerId,
      seller: listing.owner,
      type: 'Purchase',
      amount: listing.estimatedValue,
      coinAmount: coinsUsed,
      listings: [listing._id],
      status: 'Completed',
      paymentDetails: {
        provider: 'Wallet',
        transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      }
    });

    buyerWallet.transactions.push(transaction._id);
    sellerWallet.transactions.push(transaction._id);

    await buyerWallet.save();
    await sellerWallet.save();

    // Increment completed swaps/sales on profiles and calculate carbon/water metrics
    const buyerProfile = await Profile.findOne({ user: buyerId });
    const sellerProfile = await Profile.findOne({ user: listing.owner });

    if (buyerProfile) {
      buyerProfile.completedSwapsCount += 1;
      buyerProfile.ecoImpactMetric += (listing.aiDetails?.carbonSavings || 10.0);
      await buyerProfile.save();
    }

    if (sellerProfile) {
      sellerProfile.successfulSales += 1;
      sellerProfile.ecoImpactMetric += (listing.aiDetails?.carbonSavings || 10.0);
      await sellerProfile.save();
    }

    res.status(200).json({
      success: true,
      message: 'Transaction completed successfully.',
      transactionId: transaction.paymentDetails?.transactionId,
      carbonSaved: listing.aiDetails?.carbonSavings || 10.0,
      coinsEarned
    });
  } catch (err) {
    next(err);
  }
};

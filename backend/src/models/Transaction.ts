// backend/src/models/Transaction.ts
import { Schema, model } from 'mongoose';

const transactionSchema = new Schema({
  buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  seller: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  type: { 
    type: String, 
    enum: ['Purchase', 'Swap', 'Donation', 'EscrowHold', 'EscrowRelease', 'Refund', 'WalletFunding'], 
    required: true 
  },
  amount: { type: Number, required: true, min: 0 },
  coinAmount: { type: Number, default: 0 },
  listings: [{ type: Schema.Types.ObjectId, ref: 'Listing' }],
  swapRequest: { type: Schema.Types.ObjectId, ref: 'SwapRequest' },
  status: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'], default: 'Pending', index: true },
  paymentDetails: {
    provider: { type: String, default: 'Wallet' }, // 'Wallet', 'UPI', 'Stripe' etc.
    transactionId: { type: String, unique: true, sparse: true },
    invoiceId: { type: String }
  }
}, { timestamps: true });

export const Transaction = model('Transaction', transactionSchema);

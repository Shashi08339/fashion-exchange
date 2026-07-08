// backend/src/models/Wallet.ts
import { Schema, model } from 'mongoose';

const walletSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  balance: { type: Number, default: 0.0, min: 0.0 },
  coinBalance: { type: Number, default: 0, min: 0 },
  escrowBalance: { type: Number, default: 0.0, min: 0.0 },
  transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }]
}, { timestamps: true });

export const Wallet = model('Wallet', walletSchema);

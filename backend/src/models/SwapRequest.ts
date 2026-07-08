// backend/src/models/SwapRequest.ts
import { Schema, model } from 'mongoose';

const swapRequestSchema = new Schema({
  initiator: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  initiatorItems: [{ type: Schema.Types.ObjectId, ref: 'Listing', required: true }],
  receiverItems: [{ type: Schema.Types.ObjectId, ref: 'Listing', required: true }],
  status: { type: String, enum: ['Pending', 'Countered', 'Accepted', 'Rejected', 'Cancelled', 'Expired', 'Completed'], default: 'Pending', index: true },
  fairnessScore: { type: Number, default: 100 },
  qrVerificationCode: { type: String, unique: true, sparse: true },
  timeline: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    notes: { type: String }
  }]
}, { timestamps: true });

export const SwapRequest = model('SwapRequest', swapRequestSchema);
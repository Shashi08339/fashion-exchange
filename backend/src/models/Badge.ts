// backend/src/models/Badge.ts
import { Schema, model } from 'mongoose';

const badgeSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String, default: '' },
  category: { type: String, enum: ['Eco', 'Swap', 'Referral', 'Loyalty'], default: 'Loyalty' },
  criteriaValue: { type: Number, required: true } // Minimum required count (e.g. 5 swaps, 50kg carbon saved)
}, { timestamps: true });

export const Badge = model('Badge', badgeSchema);

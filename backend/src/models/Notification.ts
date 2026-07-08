// backend/src/models/Notification.ts
import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['SWAP_REQUEST', 'SWAP_ACCEPTED', 'SWAP_REJECTED', 'MESSAGE', 'REVIEW', 'ADMIN_ALERT'], required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  referenceId: { type: Schema.Types.ObjectId }, // Flexible polymorphic tracking link
  isRead: { type: Boolean, default: false, index: true }
}, { timestamps: true });

export const Notification = model('Notification', notificationSchema);
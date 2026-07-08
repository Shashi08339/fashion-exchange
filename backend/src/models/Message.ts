// backend/src/models/Message.ts
import { Schema, model } from 'mongoose';

const messageSchema = new Schema({
  chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  mediaUrls: [{ type: String }],
  readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

messageSchema.index({ chat: 1, createdAt: 1 });

export const Message = model('Message', messageSchema);
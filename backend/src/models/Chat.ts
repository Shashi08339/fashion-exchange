// backend/src/models/Chat.ts
import { Schema, model } from 'mongoose';

const chatSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }],
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' }
}, { timestamps: true });

// Ensure participant uniqueness per chat
chatSchema.index({ participants: 1 });

export const Chat = model('Chat', chatSchema);
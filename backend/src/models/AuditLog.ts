// backend/src/models/AuditLog.ts
import { Schema, model } from 'mongoose';

const auditLogSchema = new Schema({
  actor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { type: String, required: true, index: true },
  targetType: { type: String, enum: ['User', 'Listing', 'System', 'Transaction'], required: true },
  targetId: { type: Schema.Types.ObjectId, required: true, index: true },
  reason: { type: String, default: '' },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

export const AuditLog = model('AuditLog', auditLogSchema);

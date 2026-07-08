// backend/src/models/SystemMetric.ts
import { Schema, model } from 'mongoose';

const systemMetricSchema = new Schema({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: Number, required: true, default: 0 },
  unit: { type: String, default: '' },
  history: [{
    timestamp: { type: Date, default: Date.now },
    value: { type: Number, required: true }
  }]
}, { timestamps: true });

export const SystemMetric = model('SystemMetric', systemMetricSchema);

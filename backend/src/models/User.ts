// backend/src/models/User.ts
import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['User', 'Support', 'Moderator', 'Admin', 'SuperAdmin'], default: 'User' },
  status: { type: String, enum: ['Active', 'Suspended', 'Banned'], default: 'Active', index: true },
  trustScore: { type: Number, default: 100, min: 0, max: 100 },
  referredBy: { type: Schema.Types.ObjectId, ref: 'User' },
  referralCode: { type: String, unique: true, sparse: true },
  isVerified: { type: Boolean, default: false },
  verificationOTP: { type: String, select: false },
  verificationOTPExpires: { type: Date, select: false },
  passwordResetOTP: { type: String, select: false },
  passwordResetOTPExpires: { type: Date, select: false },
  refreshTokenHash: { type: String, select: false }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = model('User', userSchema);
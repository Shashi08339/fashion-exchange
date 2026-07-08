// backend/src/models/Profile.ts
import { Schema, model } from 'mongoose';

const profileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  avatar: { type: String, default: 'https://res.cloudinary.com/demo/image/upload/v1600000000/sample.jpg' },
  bio: { type: String, default: '', maxLength: 500 },
  gender: { type: String, enum: ['Male', 'Female', 'Unisex', 'Other'], default: 'Unisex' },
  preferredSizes: {
    tops: [{ type: String, enum: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] }],
    bottoms: [{ type: Schema.Types.Mixed }],
    shoes: [{ type: Number }]
  },
  favoriteBrands: [{ type: String, trim: true }],
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    geo: {
      type: { type: String, enum: ['Point'], default: 'Point', required: true },
      coordinates: { type: [Number], required: true } // [longitude, latitude]
    }
  },
  phone: { type: String, default: '' },
  ratings: {
    average: { type: Number, default: 5.0, min: 1.0, max: 5.0 },
    count: { type: Number, default: 0 }
  },
  completedSwapsCount: { type: Number, default: 0 },
  successfulSales: { type: Number, default: 0 },
  averageDeliveryTimeDays: { type: Number, default: 0 },
  responseTimeMinutes: { type: Number, default: 0 },
  ecoImpactMetric: { type: Number, default: 0.0 },
  coins: { type: Number, default: 100 }, // Welcome bonus reward coins
  streakCount: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: Date.now },
  verifiedSeller: { type: Boolean, default: false, index: true },
  verifiedNGO: { type: Boolean, default: false, index: true },
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Listing' }],
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  badges: [{ type: String }]
}, { timestamps: true });

// Geo-spatial compilation matrix configuration
profileSchema.index({ "location.geo": "2dsphere" });

export const Profile = model('Profile', profileSchema);
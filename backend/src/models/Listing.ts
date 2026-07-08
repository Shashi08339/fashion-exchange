// backend/src/models/Listing.ts
import { Schema, model } from 'mongoose';

const listingSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxLength: 100 },
  description: { type: String, required: true, maxLength: 2000 },
  category: { type: String, required: true, index: true },
  gender: { type: String, enum: ['Male', 'Female', 'Unisex'], default: 'Unisex' },
  brand: { type: String, required: true, trim: true, index: true },
  size: { type: String, required: true, index: true },
  color: { type: String, required: true },
  material: { type: String, required: true },
  condition: { type: String, enum: ['New with tags', 'Like new', 'Very good', 'Good', 'Fair'], required: true, index: true },
  ageYears: { type: Number, required: true },
  tags: [{ type: String, lowercase: true, trim: true }],
  estimatedValue: { type: Number, required: true },
  aiValueScore: { type: Number, default: 0 },
  availability: { type: String, enum: ['Available', 'Pending', 'Swapped', 'Archived'], default: 'Available', index: true },
  images: [{ type: String, required: true }],
  videos: [{ type: String }],
  images360: [{ type: String }],
  seoUrl: { type: String, index: true },
  isApproved: { type: Boolean, default: true, index: true },
  aiDetails: {
    subCategory: { type: String },
    occasion: { type: String },
    season: { type: String },
    sleeveType: { type: String },
    fit: { type: String },
    pattern: { type: String },
    style: { type: String },
    ageGroup: { type: String },
    confidenceScore: { type: Number, default: 100 },
    carbonSavings: { type: Number, default: 0 },
    waterSavings: { type: Number, default: 0 },
    sustainabilityRating: { type: Number, default: 3 },
    trendScore: { type: Number, default: 50 }
  },
  aiVision: {
    colorPalette: [{ type: String }],
    logosDetected: [{ type: String }],
    damageDetected: {
      hasDamage: { type: Boolean, default: false },
      details: { type: String, default: '' },
      score: { type: Number, default: 0 }
    },
    isAuthentic: { type: Boolean, default: true }
  },
  location: {
    address: { type: String, required: true },
    geo: {
      type: { type: String, enum: ['Point'], default: 'Point', required: true },
      coordinates: { type: [Number], required: true } // [longitude, latitude]
    }
  }
}, { timestamps: true });

listingSchema.index({ "location.geo": "2dsphere" });
listingSchema.index({ title: 'text', description: 'text', brand: 'text', tags: 'text' });
listingSchema.index({ availability: 1, createdAt: -1 });

export const Listing = model('Listing', listingSchema);
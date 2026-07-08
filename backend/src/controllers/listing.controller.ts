// backend/src/controllers/listing.controller.ts
import { Response, NextFunction } from 'express';
import { IRequestIdentity } from '../middleware/auth';
import { Listing } from '../models/Listing';
import { Profile } from '../models/Profile';
import { AppError } from '../app';

export const createListing = async (req: IRequestIdentity, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) return next(new AppError('Context unavailable.', 401));
    
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return next(new AppError('User profile details not found.', 404));
    if (!profile.location) return next(new AppError('User profile location details not found.', 404));

    const newListing = await Listing.create({
      ...req.body,
      owner: req.user.id,
      location: {
        address: profile.location.address,
        geo: profile.location.geo
      }
    });

    res.status(201).json({ success: true, data: newListing });
  } catch (err) {
    next(err);
  }
};

export const searchListings = async (req: IRequestIdentity, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q, category, brand, size, condition, lat, lng, radiusKm, sort } = req.query;
    const queryFilter: any = { availability: 'Available' };

    if (q) queryFilter.$text = { $search: String(q) };
    if (category) queryFilter.category = String(category);
    if (brand) queryFilter.brand = String(brand);
    if (size) queryFilter.size = String(size);
    if (condition) queryFilter.condition = String(condition);

    if (lat && lng) {
      const radiusMeters = (parseFloat(String(radiusKm)) || 10) * 1000;
      queryFilter['location.geo'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(String(lng)), parseFloat(String(lat))]
          },
          $maxDistance: radiusMeters
        }
      };
    }

    let queryExec = Listing.find(queryFilter).populate('owner', 'email');
    
    if (sort === 'newest') queryExec = queryExec.sort({ createdAt: -1 });
    else if (sort === 'value_desc') queryExec = queryExec.sort({ estimatedValue: -1 });

    const results = await queryExec;
    res.status(200).json({ success: true, resultsCount: results.length, data: results });
  } catch (err) {
    next(err);
  }
};
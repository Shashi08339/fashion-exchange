// backend/src/routes/listing.ts
import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as ListingController from '../controllers/listing.controller';

const router = Router();

const createListingSchema = z.object({
  body: z.object({
    title: z.string().min(5),
    description: z.string().min(10),
    category: z.string(),
    gender: z.enum(['Male', 'Female', 'Unisex']),
    brand: z.string(),
    size: z.string(),
    color: z.string(),
    material: z.string(),
    condition: z.enum(['New with tags', 'Like new', 'Very good', 'Good', 'Fair']),
    ageYears: z.number(),
    estimatedValue: z.number().positive(),
    images: z.array(z.string()).min(1, 'At least one visual proof required.')
  })
});

router.route('/')
  .post(authenticate, validate(createListingSchema), ListingController.createListing)
  .get(ListingController.searchListings);

export default router;
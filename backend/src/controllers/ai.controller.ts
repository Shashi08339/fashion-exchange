// backend/src/controllers/ai.controller.ts
import { Request, Response, NextFunction } from 'express';

// Deep baseline analytical metrics mapping asset depreciation curves
const BRAND_MULTIPLIER_MATRIX: Record<string, number> = {
  'Patagonia': 1.2, 'Nike': 1.0, 'Adidas': 0.9, 'Zara': 0.6, 'Gucci': 2.1, 'Levi\'s': 1.1
};

const CONDITION_DEPRECIATION_MATRIX: Record<string, number> = {
  'New with tags': 0.95, 'Like new': 0.85, 'Very good': 0.70, 'Good': 0.55, 'Fair': 0.35
};

export const calculateMarketFairness = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { brand, condition, originalPrice, ageYears } = req.body;

    const parsedOriginalPrice = parseFloat(originalPrice) || 100;
    const parsedAge = parseFloat(ageYears) || 1;

    const brandFactor = BRAND_MULTIPLIER_MATRIX[brand] || 0.8;
    const conditionFactor = CONDITION_DEPRECIATION_MATRIX[condition] || 0.6;
    
    // Standard exponential decay compounding model for secondary fashion assets
    const ageDecayMultiplier = Math.exp(-0.15 * parsedAge);
    
    let computedScore = parsedOriginalPrice * brandFactor * conditionFactor * ageDecayMultiplier;
    if (computedScore < 5) computedScore = 5; // Enforce a floor value

    const recommendation = computedScore > parsedOriginalPrice * 0.5 
      ? 'High liquidation quality asset. Excellent swap flexibility leverage.' 
      : 'Standard secondary asset utility tier.';

    res.status(200).json({
      success: true,
      metrics: {
        estimatedValueScore: Math.round(computedScore * 100) / 100,
        fairnessPercentage: Math.round((computedScore / parsedOriginalPrice) * 100),
        recommendation
      }
    });
  } catch (err) {
    next(err);
  }
};
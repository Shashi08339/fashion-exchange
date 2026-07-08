// backend/src/services/imageProcessor.service.ts
import { v2 as cloudinary } from 'cloudinary';

interface IUploadResult {
  url: string;
  publicId: string;
  qualityPassed: boolean;
  warnings: string[];
}

export const processAndUploadMedia = async (
  base64Data: string,
  options: {
    removeBackground?: boolean;
    crop?: boolean;
    rotateAngle?: number;
  } = {}
): Promise<IUploadResult> => {
  const warnings: string[] = [];
  let qualityPassed = true;

  // Basic client-side/server-side validations
  // 1. Size check
  const approximateSizeBytes = (base64Data.length * 3) / 4;
  if (approximateSizeBytes < 10240) { // < 10KB
    qualityPassed = false;
    warnings.push('Low quality check: Image resolution or file size is extremely low.');
  }

  // 2. Duplicate or placeholder check
  if (base64Data.length > 5000000) { // > 5MB
    warnings.push('Image is very large. Compressing automatically on upload.');
  }

  try {
    // Standard Cloudinary transformation layers
    const uploadOptions: any = {
      folder: 'fashion_exchange_listings',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' } // Auto compression and WebP conversion
      ]
    };

    if (options.removeBackground) {
      // Note: background removal in Cloudinary requires the cloudinary_ai_background_removal add-on.
      // We will add it as an effect transformation so it is CDN-driven.
      uploadOptions.transformation.push({ effect: 'background_removal' });
    }

    if (options.crop) {
      uploadOptions.transformation.push({ width: 800, height: 800, crop: 'fill', gravity: 'auto' });
    }

    if (options.rotateAngle) {
      uploadOptions.transformation.push({ angle: options.rotateAngle });
    }

    const uploadResponse = await cloudinary.uploader.upload(base64Data, uploadOptions);

    return {
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      qualityPassed,
      warnings
    };
  } catch (err: any) {
    console.error('[Media Service] Cloudinary Upload Error:', err.message);
    throw new Error(`Media processor upload failure: ${err.message}`);
  }
};

// shared/types/index.ts

export type UserRole = 'User' | 'Moderator' | 'Admin';

export interface IGeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IClothingSizes {
  tops: ('XXS' | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL')[];
  bottoms: (number | string)[];
  shoes: number[];
}

export type ListingCondition = 'New with tags' | 'Like new' | 'Very good' | 'Good' | 'Fair';
export type ListingAvailability = 'Available' | 'Pending' | 'Swapped' | 'Archived';
export type SwapStatus = 'Pending' | 'Countered' | 'Accepted' | 'Rejected' | 'Cancelled' | 'Expired' | 'Completed';
export type NotificationType = 'SWAP_REQUEST' | 'SWAP_ACCEPTED' | 'SWAP_REJECTED' | 'MESSAGE' | 'REVIEW' | 'ADMIN_ALERT';
export interface Property {
  id: string;
  address: string;
  price: number;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  location: string; // JSON string of coordinates
}

export type NumberRange = [number, number]
export interface PropertyFilters {
  priceRange: NumberRange;
  sqftRange: NumberRange;
  beds: number;
  baths: number;
  walkScore: number;
}

export interface PropertyCluster {
  id: string;
  properties: Property[];
  metrics: {
    averagePrice: number;
    averageSqft: number;
    propertyCount: number;
  };
  geography: {
    centroid: string;
    radiusKm: number;
  };
}

export interface WalkScore {
  score: number;
  description: string;
  amenities?: Array<{
    type: string;
    count: number;
  }>;
}

export interface MapCenter {
  lat: number;
  lng: number;
  zoom: number;
}

export interface PropertySimilarity {
  property: Property;
  similarityScore: number;
  factors: {
    priceScore: number;
    sizeScore: number;
    locationScore: number;
    amenityScore: number;
  };
}
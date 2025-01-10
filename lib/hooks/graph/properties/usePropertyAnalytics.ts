// hooks/usePropertyAnalytics.ts
import { useQuery } from "@tanstack/react-query";

interface SimilarityFactors {
  priceScore: number;
  sizeScore: number;
  locationScore: number;
  amenityScore: number;
}

interface Property {
  id: string;
  address: string;
  price: number;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
}

interface PropertyCluster {
  cluster_id: string;
  properties: Property[];
  similarityScores: {
    averagePriceScore: number;
    averageSizeScore: number;
    averageLocationScore: number;
    averageAmenityScore: number;
  };
  geography: {
    centroid: string;
    radiusKm: number;
  };
  metrics: {
    averagePrice: number;
    averageSqft: number;
    propertyCount: number;
  };
}

export function usePropertyClusters(
  minSimilarityScore = 0.7,
  maxRadius = 0.5,
  enabled = true
) {
  return useQuery<PropertyCluster[]>({
    queryKey: ["propertyClusters", minSimilarityScore, maxRadius],
    queryFn: async () => {
      const response = await fetch(
        `/api/properties/clusters?minSimilarity=${minSimilarityScore}&maxRadius=${maxRadius}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch property clusters");
      }
      return response.json();
    },
    enabled,
  });
}

export function useSimilarProperties(propertyId: string) {
  return useQuery({
    queryKey: ["similarProperties", propertyId],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${propertyId}/similar`);
      if (!response.ok) {
        throw new Error("Failed to fetch similar properties");
      }
      return response.json();
    },
    enabled: !!propertyId,
  });
}

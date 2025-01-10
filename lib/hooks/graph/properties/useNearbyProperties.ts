import { useQuery } from "@tanstack/react-query";

export function useNearbyProperties(
  lat: number,
  lng: number,
  radiusInKm: number
) {
  return useQuery({
    queryKey: ["nearby-properties", lat, lng, radiusInKm],
    queryFn: async () => {
      const response = await fetch(
        `/api/properties/nearby?lat=${lat}&lng=${lng}&radius=${radiusInKm}`
      );
      if (!response.ok) throw new Error("Failed to fetch nearby properties");
      return response.json();
    },
  });
}

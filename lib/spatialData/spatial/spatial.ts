// lib/spatial.ts
import { prisma } from "../../prisma/prisma";

interface AmenityWeight {
  type: string;
  weight: number;
  maxDistance: number; // in meters
}

export class SpatialService {
  // Weights for different amenity types in walkability calculation
  private amenityWeights: AmenityWeight[] = [
    { type: "grocery", weight: 3, maxDistance: 1000 },
    { type: "transit_station", weight: 2, maxDistance: 800 },
    { type: "school", weight: 2, maxDistance: 1200 },
    { type: "restaurant", weight: 1.5, maxDistance: 1000 },
    { type: "park", weight: 1.5, maxDistance: 1000 },
    { type: "retail", weight: 1, maxDistance: 800 },
  ];

  async findPropertiesInRadius(lat: number, lng: number, radiusInKm: number) {
    return await prisma.$queryRaw`
      SELECT 
        p.*,
        ST_Distance(
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
          location::geometry
        ) as distance,
        (
          SELECT json_agg(a.*)
          FROM "Amenity" a
          WHERE ST_DWithin(
            a.location::geometry,
            p.location::geometry,
            1000  -- 1km radius for amenities
          )
        ) as nearby_amenities
      FROM "Property" p
      WHERE ST_DWithin(
        location::geometry,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
        ${radiusInKm * 1000}
      )
      ORDER BY distance
    `;
  }

  async calculateWalkScore(propertyId: string): Promise<number> {
    const walkScoreData = await prisma.$queryRaw`
      WITH property AS (
        SELECT location::geometry as geom
        FROM "Property"
        WHERE id = ${propertyId}
      ),
      amenity_scores AS (
        SELECT 
          a.type,
          COUNT(*) as count,
          MIN(ST_Distance(property.geom, a.location::geometry)) as min_distance
        FROM property, "Amenity" a
        WHERE ST_DWithin(
          property.geom,
          a.location::geometry,
          1500  -- Look up to 1.5km
        )
        GROUP BY a.type
      )
      SELECT 
        type,
        count,
        min_distance
      FROM amenity_scores
    `;

    // Calculate score based on amenity proximity and weights
    let totalScore = 0;
    let maxPossibleScore = 0;

    for (const amenityData of walkScoreData as any[]) {
      const weight = this.amenityWeights.find(
        (w) => w.type === amenityData.type
      );
      if (!weight) continue;

      maxPossibleScore += weight.weight * 100;

      // Score decreases linearly with distance up to maxDistance
      const distanceScore = Math.max(
        0,
        (1 - amenityData.min_distance / weight.maxDistance) * 100
      );

      // Apply weight to distance score
      totalScore += distanceScore * weight.weight;
    }

    // Normalize score to 0-100 range
    return Math.round((totalScore / maxPossibleScore) * 100);
  }

  async getPropertyDemographics(propertyId: string) {
    return await prisma.$queryRaw`
      WITH property AS (
        SELECT location::geometry as geom
        FROM "Property"
        WHERE id = ${propertyId}
      ),
      buffer AS (
        SELECT ST_Buffer(property.geom, 1000) as geom
        FROM property
      )
      SELECT 
        COUNT(*) as total_properties,
        AVG(price) as avg_price,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price) as median_price,
        AVG(sqft) as avg_sqft
      FROM "Property" p, buffer
      WHERE ST_Within(p.location::geometry, buffer.geom)
    `;
  }
}

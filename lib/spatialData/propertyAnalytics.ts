// lib/PropertyAnalyticsService.ts
import { PrismaClient, Property } from "@prisma/client";

interface PropertySimilarityResult {
  propertyId1: string;
  propertyId2: string;
  score: number;
  factors: {
    priceScore: number;
    sizeScore: number;
    locationScore: number;
    amenityScore: number;
  };
}

export class PropertyAnalyticsService {
  constructor(private prisma: PrismaClient) {}

  async calculatePropertySimilarity(
    property1: Property,
    property2: Property,
    options: {
      maxGeographicRadius?: number;
      weights?: {
        price?: number;
        size?: number;
        location?: number;
        amenities?: number;
      };
    } = {}
  ): Promise<PropertySimilarityResult> {
    const {
      maxGeographicRadius = 2.0,
      weights = { price: 0.3, size: 0.2, location: 0.3, amenities: 0.2 },
    } = options;

    // Validate weights sum to 1
    const totalWeight = Object.values(weights).reduce(
      (sum, weight) => sum + weight,
      0
    );
    if (totalWeight !== 1) {
      throw new Error("Similarity weights must sum to 1");
    }

    // Calculate price similarity
    const priceDiffPercent =
      Math.abs(Number(property1.price) - Number(property2.price)) /
      Math.max(Number(property1.price), Number(property2.price));
    const priceScore = 1 - Math.min(priceDiffPercent, 1);

    // Calculate size similarity
    const sizeDiffPercent =
      Math.abs(property1.sqft - property2.sqft) /
      Math.max(property1.sqft, property2.sqft);
    const sizeScore = 1 - Math.min(sizeDiffPercent, 1);

    // Calculate location similarity using PostGIS
    const maxDistance = Math.trunc(maxGeographicRadius) * 1000;
    const locationScore = await this.prisma.$queryRaw<[{ score: number }]>`
      SELECT 
        GREATEST(
          0,
          1 - (
            ST_Distance(
              ST_Transform(ST_SetSRID(${property1.location}::geometry, 4326), 3857),
              ST_Transform(ST_SetSRID(${property2.location}::geometry, 4326), 3857)
            ) / ${maxDistance}
          )
        ) AS score
    `;

    // Calculate amenity similarity
    const amenityScore = await this.calculateAmenitySimiliarity(
      property1.id,
      property2.id,
      maxGeographicRadius
    );

    // Calculate total score
    const totalScore =
      priceScore * weights.price +
      sizeScore * weights.size +
      locationScore[0].score * weights.location +
      amenityScore * weights.amenities;

    return {
      propertyId1: property1.id,
      propertyId2: property2.id,
      score: totalScore,
      factors: {
        priceScore,
        sizeScore,
        locationScore: locationScore[0].score,
        amenityScore,
      },
    };
  }

  private async calculateAmenitySimiliarity(
    propertyId1: string,
    propertyId2: string,
    maxGeographicRadius: number = 2.0
  ): Promise<number> {
    const maxDistance = Math.trunc(maxGeographicRadius) * 1000;

    const amenityCounts = await this.prisma.$queryRaw<
      [
        {
          p1_count: number;
          p2_count: number;
          common_count: number;
        }
      ]
    >/* sql */ `
      WITH 
        p1_amenities AS (
          SELECT a.type, COUNT(*) as count  
          FROM "Property" p
          JOIN "Amenity" a ON ST_DWithin(
            ST_SetSRID(p.location::geometry, 4326),
            ST_SetSRID(a.location::geometry, 4326),
            ${maxDistance}  
          )
          WHERE p.id = ${propertyId1}
          GROUP BY a.type
        ),
        p2_amenities AS (
          SELECT a.type, COUNT(*) as count
          FROM "Property" p
          JOIN "Amenity" a ON ST_DWithin(
            ST_SetSRID(p.location::geometry, 4326),
            ST_SetSRID(a.location::geometry, 4326),
            ${maxDistance}
          )  
          WHERE p.id = ${propertyId2}
          GROUP BY a.type
        )
      SELECT
        COALESCE(SUM(p1_amenities.count), 0) as p1_count,
        COALESCE(SUM(p2_amenities.count), 0) as p2_count,  
        COALESCE(
          SUM(LEAST(p1_amenities.count, p2_amenities.count)),
          0  
        ) as common_count
      FROM p1_amenities
      FULL OUTER JOIN p2_amenities USING (type)
    `;

    const { p1_count, p2_count, common_count } = amenityCounts[0];
    return common_count / Math.max(p1_count, p2_count);
  }

  async updateSimilarities(maxGeographicRadius: number = 5.0) {
    const maxDistance = Math.trunc(maxGeographicRadius) * 1000;

    // Calculate similarities in a single SQL query
    const similarities = await this.prisma.$queryRaw<
      Array<{
        property1_id: string;
        property2_id: string;
        price_score: number;
        size_score: number;
        location_score: number;
        amenity_score: number;
        total_score: number;
      }>
    >`
      WITH PropertyPairs AS (
        SELECT 
          p1.id as property1_id,
          p2.id as property2_id,
          p1.price as price1,
          p2.price as price2,
          p1.sqft as sqft1,
          p2.sqft as sqft2,
          p1.location as location1,
          p2.location as location2
        FROM "Property" p1
        CROSS JOIN "Property" p2
        WHERE p1.id < p2.id  -- Only compare each pair once
        AND ST_DWithin(
          ST_Transform(ST_SetSRID(p1.location::geometry, 4326), 3857),
          ST_Transform(ST_SetSRID(p2.location::geometry, 4326), 3857),
          ${maxDistance}
        )
      ),
      PriceScores AS (
        SELECT 
          property1_id,
          property2_id,
          1 - LEAST(
            ABS(price1::numeric - price2::numeric) / GREATEST(price1::numeric, price2::numeric),
            1
          ) as price_score
        FROM PropertyPairs
      ),
      SizeScores AS (
        SELECT 
          property1_id,
          property2_id,
          1 - LEAST(
            ABS(sqft1::numeric - sqft2::numeric) / GREATEST(sqft1::numeric, sqft2::numeric),
            1
          ) as size_score
        FROM PropertyPairs
      ),
      LocationScores AS (
        SELECT 
          property1_id,
          property2_id,
          GREATEST(
            0,
            1 - (
              ST_Distance(
                ST_Transform(ST_SetSRID(location1::geometry, 4326), 3857),
                ST_Transform(ST_SetSRID(location2::geometry, 4326), 3857)
              ) / ${maxDistance}
            )
          ) as location_score
        FROM PropertyPairs
      ),
      AmenityScores AS (
        SELECT 
          pp.property1_id,
          pp.property2_id,
          COALESCE(
            CAST(common_count AS float) / GREATEST(p1_count, p2_count),
            0
          ) as amenity_score
        FROM PropertyPairs pp
        CROSS JOIN LATERAL (
          SELECT 
            COUNT(DISTINCT a1.type) as p1_count
          FROM "Amenity" a1
          WHERE ST_DWithin(
            ST_SetSRID(pp.location1::geometry, 4326),
            ST_SetSRID(a1.location::geometry, 4326),
            ${maxDistance}
          )
        ) p1
        CROSS JOIN LATERAL (
          SELECT 
            COUNT(DISTINCT a2.type) as p2_count
          FROM "Amenity" a2
          WHERE ST_DWithin(
            ST_SetSRID(pp.location2::geometry, 4326),
            ST_SetSRID(a2.location::geometry, 4326),
            ${maxDistance}
          )
        ) p2
        CROSS JOIN LATERAL (
          SELECT 
            COUNT(DISTINCT a1.type) as common_count
          FROM "Amenity" a1
          JOIN "Amenity" a2 ON a1.type = a2.type
          WHERE ST_DWithin(
            ST_SetSRID(pp.location1::geometry, 4326),
            ST_SetSRID(a1.location::geometry, 4326),
            ${maxDistance}
          )
          AND ST_DWithin(
            ST_SetSRID(pp.location2::geometry, 4326),
            ST_SetSRID(a2.location::geometry, 4326),
            ${maxDistance}
          )
        ) common
      )
      SELECT 
        ps.property1_id,
        ps.property2_id,
        ps.price_score,
        ss.size_score,
        ls.location_score,
        ams.amenity_score,
        (
          ps.price_score * 0.3 + 
          ss.size_score * 0.2 + 
          ls.location_score * 0.3 + 
          ams.amenity_score * 0.2
        ) as total_score
      FROM PriceScores ps
      JOIN SizeScores ss ON ps.property1_id = ss.property1_id AND ps.property2_id = ss.property2_id
      JOIN LocationScores ls ON ps.property1_id = ls.property1_id AND ps.property2_id = ls.property2_id
      JOIN AmenityScores ams ON ps.property1_id = ams.property1_id AND ps.property2_id = ams.property2_id
      WHERE (
        ps.price_score * 0.3 + 
        ss.size_score * 0.2 + 
        ls.location_score * 0.3 + 
        ams.amenity_score * 0.2
      ) > 0.7
    `;

    // Use a transaction for the batch update
    await this.prisma.$transaction(async (tx) => {
      // Delete existing similarities
      await tx.propertySimilarity.deleteMany();

      // Batch insert new similarities
      if (similarities.length > 0) {
        await tx.propertySimilarity.createMany({
          data: similarities.map((sim) => ({
            propertyId: sim.property1_id,
            similarPropertyId: sim.property2_id,
            similarity_score: sim.total_score,
            priceScore: sim.price_score,
            sizeScore: sim.size_score,
            locationScore: sim.location_score,
            amenityScore: sim.amenity_score,
          })),
        });
      }
    });

    return similarities;
  }

  async findPropertyClusters(
    minSimilarityScore: number = 0.7, // Keep default of 0.7 as requested
  ) {
    // First phase: Find clusters based on similarity scores
    const similarityClusters = await this.prisma.$queryRaw<
      Array<{
        cluster_id: number;
        property_ids: string[];
        avg_similarity: number;
      }>
    >/* sql */ `
      WITH RECURSIVE
      similar_pairs AS (
          SELECT 
              "propertyId" as p1_id,
              "similarPropertyId" as p2_id,
              "similarity_score"
          FROM "PropertySimilarity"
          WHERE "similarity_score" >= ${minSimilarityScore}
      ),
      similarity_clusters AS (
          SELECT 
              p1_id as property_id,
              p1_id as cluster_id,
              ARRAY[p1_id] as cluster_members
          FROM similar_pairs

          UNION ALL

          SELECT 
              sp.p2_id as property_id,
              sc.cluster_id,
              array_append(sc.cluster_members, sp.p2_id)
          FROM similarity_clusters sc
          JOIN similar_pairs sp ON 
              sp.p1_id = sc.property_id
              AND sp.p2_id NOT IN (SELECT UNNEST(sc.cluster_members))
      )
      SELECT 
        cluster_id,
        ARRAY_AGG(DISTINCT property_id) as property_ids, 
        AVG(similarity_score) as avg_similarity,
        ST_AsText(ST_Centroid(ST_Collect(ST_SetSRID(p.location::geometry, 4326)))) as center_point,
        ST_MaxDistance(
          ST_Centroid(ST_Collect(ST_SetSRID(p.location::geometry, 4326))), 
          ST_Collect(ST_SetSRID(p.location::geometry, 4326))
        ) as radius    
      FROM similarity_clusters sc
      LEFT JOIN similar_pairs sp ON 
          sp.p1_id = ANY(sc.cluster_members)
          AND sp.p2_id = ANY(sc.cluster_members)
      LEFT JOIN "Property" p ON p.id = ANY(sc.cluster_members)
      GROUP BY cluster_id;
    `;

    // Enrich clusters with property details and geographic information
    const enrichedClusters = await Promise.all(
      similarityClusters.map(async (cluster) => {
        const properties = await this.prisma.property.findMany({
          where: { id: { in: cluster.property_ids } },
          select: {
            id: true,
            address: true,
            price: true,
            sqft: true,
            location: true,
            bedrooms: true,
            bathrooms: true,
          },
        });

        // Calculate geographic centroid and cluster radius using PostGIS
        const centroid = await this.prisma.$queryRaw<
          [{ center_point: string; radius: number }]
        >/* sql */ `
          SELECT 
            ST_AsText(ST_Centroid(ST_Collect(ST_SetSRID(location::geometry, 4326)))) as center_point,
            ST_MaxDistance(
              ST_Centroid(ST_Collect(ST_SetSRID(location::geometry, 4326))),
              ST_Collect(ST_SetSRID(location::geometry, 4326))
            ) as radius
          FROM "Property"
          WHERE id = ANY(${cluster.property_ids}::text[])
        `;

        return {
          ...cluster,
          properties,
          geography: {
            centroid: centroid[0].center_point,
            radiusKm: centroid[0].radius * 111.32, // Convert degrees to kilometers
          },
          metrics: {
            averagePrice:
              properties.reduce((sum, p) => sum + Number(p.price), 0) /
              properties.length,
            averageSqft:
              properties.reduce((sum, p) => sum + p.sqft, 0) /
              properties.length,
            propertyCount: properties.length,
          },
        };
      })
    );

    return this.deduplicateClusters(enrichedClusters);
  }

  deduplicateClusters(enrichedClusters) {
    // Create a map to track which cluster each property belongs to
    const propertyToClusterIndex = new Map();
    const finalClusters = [];

    for (const cluster of enrichedClusters) {
      // Create a set of unique property IDs for this cluster
      const uniquePropertyIds = new Set(cluster.properties.map((p) => p.id));

      // Find if any property in this cluster is already assigned to another cluster
      let existingClusterIndex = -1;
      for (const propertyId of uniquePropertyIds) {
        if (propertyToClusterIndex.has(propertyId)) {
          existingClusterIndex = propertyToClusterIndex.get(propertyId);
          break;
        }
      }

      if (existingClusterIndex === -1) {
        // This is a new cluster
        const clusterIndex = finalClusters.length;
        // Only include unique properties
        const uniqueProperties = Array.from(
          new Set(cluster.properties.map((p) => JSON.stringify(p)))
        ).map((p: any) => JSON.parse(p));

        finalClusters.push({
          ...cluster,
          properties: uniqueProperties,
          property_ids: Array.from(uniquePropertyIds),
        });

        // Register all properties to this cluster
        for (const propertyId of uniquePropertyIds) {
          propertyToClusterIndex.set(propertyId, clusterIndex);
        }
      } else {
        // Merge with existing cluster
        const existingCluster = finalClusters[existingClusterIndex];

        // Combine property IDs and remove duplicates
        const mergedPropertyIds = new Set([
          ...existingCluster.property_ids,
          ...Array.from(uniquePropertyIds),
        ]);

        // Combine properties and remove duplicates
        const mergedProperties = Array.from(
          new Set(
            [...existingCluster.properties, ...cluster.properties].map((p) =>
              JSON.stringify(p)
            )
          )
        ).map((p) => JSON.parse(p));

        // Update the existing cluster
        finalClusters[existingClusterIndex] = {
          ...existingCluster,
          properties: mergedProperties,
          property_ids: Array.from(mergedPropertyIds),
          // Recalculate metrics
          metrics: {
            averagePrice:
              mergedProperties.reduce((sum, p) => sum + Number(p.price), 0) /
              mergedProperties.length,
            averageSqft:
              mergedProperties.reduce((sum, p) => sum + p.sqft, 0) /
              mergedProperties.length,
            propertyCount: mergedProperties.length,
          },
        };

        // Update property to cluster mappings
        for (const propertyId of mergedPropertyIds) {
          propertyToClusterIndex.set(propertyId, existingClusterIndex);
        }
      }
    }

    return finalClusters;
  }
}

// app/api/properties/clusters/route.ts
import { NextResponse } from "next/server";
import { PropertyAnalyticsService } from "@/lib/spatialData/propertyAnalytics";
import { prisma } from "@/lib/prisma/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  console.log("SEARCH_PARAMS: ", searchParams.values());
  const minSimilarity = Number(searchParams.get("minSimilarity"));
  console.log("MIN_SIMILARITY: ", searchParams.get("minSimilarity"));
  console.log("MAX_GEO_NUMBER: ", searchParams.get("maxRadius"));
  const maxGeographicRadius = Number(searchParams.get("maxRadius"));

  console.log("Raw maxRadius:", searchParams.get("maxRadius"));
  console.log("Parsed maxRadius:", Number(searchParams.get("maxRadius")));
  console.log("Type:", typeof searchParams.get("maxRadius"));

  if (!minSimilarity) throw new Error("MIN NULL");
  if (!maxGeographicRadius) throw new Error("GEO NUMBER NULL");

  try {
    const analyticsService = new PropertyAnalyticsService(prisma);
    // Update Similarities
    await analyticsService.updateSimilarities(maxGeographicRadius);
    // Redetect clusters based on those new similarities
    const clusters = await analyticsService.findPropertyClusters(minSimilarity);

    // Enhance clusters with similarity scores
    const enhancedClusters = await Promise.all(
      clusters.map(async (cluster) => {
        // Get all similarity scores between properties in this cluster
        const similarityScores = await prisma.propertySimilarity.findMany({
          where: {
            propertyId: { in: cluster.property_ids },
            similarPropertyId: { in: cluster.property_ids },
          },
          select: {
            priceScore: true,
            sizeScore: true,
            locationScore: true,
            amenityScore: true,
          },
        });

        // Calculate average scores for the cluster
        const averageScores = {
          averagePriceScore:
            similarityScores.reduce((sum, score) => sum + score.priceScore, 0) /
            similarityScores.length,
          averageSizeScore:
            similarityScores.reduce((sum, score) => sum + score.sizeScore, 0) /
            similarityScores.length,
          averageLocationScore:
            similarityScores.reduce(
              (sum, score) => sum + score.locationScore,
              0
            ) / similarityScores.length,
          averageAmenityScore:
            similarityScores.reduce(
              (sum, score) => sum + score.amenityScore,
              0
            ) / similarityScores.length,
        };

        return {
          ...cluster,
          similarityScores: averageScores,
        };
      })
    );

    return NextResponse.json(enhancedClusters);
  } catch (error) {
    console.error("Error fetching property clusters:", error);
    return NextResponse.json(
      { error: "Failed to fetch property clusters" },
      { status: 500 }
    );
  }
}

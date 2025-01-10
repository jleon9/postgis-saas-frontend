// app/api/properties/[id]/similar/route.ts
import { NextResponse } from "next/server";
import { PropertyAnalyticsService } from "@/lib/spatialData/propertyAnalytics";
import { prisma } from "@/lib/prisma/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Initialize our analytics service with the Prisma client
    const propertyService = new PropertyAnalyticsService(prisma);

    // Get the property ID from the route parameters
    const propertyId = params.id;

    // First, verify that the property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      // Return a 404 response if the property doesn't exist
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Find similar properties from our PropertySimilarity table
    const similarProperties = await prisma.propertySimilarity.findMany({
      where: {
        OR: [{ propertyId: propertyId }, { similarPropertyId: propertyId }],
      },
      // Include the related property data
      include: {
        property: {
          select: {
            id: true,
            address: true,
            price: true,
            sqft: true,
            bedrooms: true,
            bathrooms: true,
            location: true,
          },
        },
        similarProperty: {
          select: {
            id: true,
            address: true,
            price: true,
            sqft: true,
            bedrooms: true,
            bathrooms: true,
            location: true,
          },
        },
      },
      // Order by similarity score, highest first
      orderBy: {
        similarity_score: "desc",
      },
      // Limit to top 5 most similar properties
      take: 5,
    });

    // Transform the results to a cleaner format
    const formattedResults = similarProperties.map((similarity) => {
      // Determine which property to return (the one that isn't the queried property)
      const similarProperty =
        similarity.propertyId === propertyId
          ? similarity.similarProperty
          : similarity.property;

      return {
        property: similarProperty,
        similarityScore: similarity.similarity_score,
        factors: {
          priceScore: similarity.priceScore,
          sizeScore: similarity.sizeScore,
          locationScore: similarity.locationScore,
          amenityScore: similarity.amenityScore,
        },
      };
    });

    // Return the formatted results
    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error("Error finding similar properties:", error);

    // Return a 500 response with error details
    return NextResponse.json(
      { error: "Failed to find similar properties" },
      { status: 500 }
    );
  }
}

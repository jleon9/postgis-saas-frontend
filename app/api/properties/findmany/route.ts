// app/api/properties/route.ts
import { prisma } from "@/lib/prisma/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch properties from the database using Prisma
    const properties = await prisma.property.findMany();
    const formattedProperties = properties.map((property) => {
      const [longitude, latitude] = property.location
        .match(/-?\d+\.?\d*/g)
        ?.map(Number) ?? [0, 0];

      return {
        id: property.id,
        title: property.address,
        latitude,
        longitude,
      };
    });
    return NextResponse.json(formattedProperties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}

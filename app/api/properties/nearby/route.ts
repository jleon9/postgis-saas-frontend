// app/api/properties/nearby/route.ts
import { prisma } from "@/lib/prisma/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radius = parseFloat(searchParams.get("radius") || "2"); // in kilometers

    const properties = await prisma.$queryRaw`
      WITH user_point AS (
        SELECT ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326) as geom
      )
      SELECT
        p.*,
        ST_Distance(
          (SELECT geom FROM user_point),
          ST_SetSRID(p.location::geometry, 4326)
        ) as distance,
        (
          SELECT json_agg(a.*)
          FROM "Amenity" a
          WHERE ST_DWithin(
            ST_SetSRID(a.location::geometry, 4326),
            ST_SetSRID(p.location::geometry, 4326),
            ${radius * 1000}  -- Convert km to meters
          )
        ) as nearby_amenities
      FROM "Property" p
      WHERE ST_DWithin(
        ST_SetSRID(p.location::geometry, 4326),
        (SELECT geom FROM user_point),
        ${radius * 1000}  -- Convert km to meters
      )
      ORDER BY distance
    `;

    return NextResponse.json(properties);
  } catch (error) {
    console.error("Error fetching nearby properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch nearby properties" },
      { status: 500 }
    );
  }
}

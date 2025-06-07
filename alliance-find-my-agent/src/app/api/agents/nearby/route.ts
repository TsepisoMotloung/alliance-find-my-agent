import { NextRequest, NextResponse } from "next/server";
import { findNearbyAgents, validateCoordinates } from "@/lib/location";

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const latString = searchParams.get("latitude");
    const lngString = searchParams.get("longitude");
    const radiusString = searchParams.get("radius");
    const limitString = searchParams.get("limit");

    // Validate latitude and longitude
    if (!latString || !lngString) {
      return NextResponse.json(
        { message: "Latitude and longitude are required" },
        { status: 400 },
      );
    }

    const latitude = parseFloat(latString);
    const longitude = parseFloat(lngString);

    // Validate coordinates
    const coordinates = validateCoordinates({ latitude, longitude });

    if (!coordinates) {
      return NextResponse.json(
        { message: "Invalid coordinates" },
        { status: 400 },
      );
    }

    // Parse optional parameters
    const radius = radiusString ? parseFloat(radiusString) : 10; // Default 10km
    const limit = limitString ? parseInt(limitString) : 20; // Default 20 agents

    // Find nearby agents
    const agents = await findNearbyAgents(coordinates, radius, limit);

    return NextResponse.json({
      agents,
      meta: {
        latitude,
        longitude,
        radius,
        count: agents.length,
      },
    });
  } catch (error) {
    console.error("Error finding nearby agents:", error);
    return NextResponse.json(
      { message: "An error occurred while finding nearby agents" },
      { status: 500 },
    );
  }
}

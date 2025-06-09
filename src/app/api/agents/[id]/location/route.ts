import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Agent, User } from "@/models";
import { UserRole } from "@/types/models";
import { updateAgentLocation, validateCoordinates } from "@/lib/location";

// Update agent location
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get agent
    const agent = await Agent.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
        },
      ],
    });

    if (!agent) {
      return NextResponse.json({ message: "Agent not found" }, { status: 404 });
    }

    // Check authorization (only the agent or admin can update location)
    if (
      session.user.role !== UserRole.ADMIN &&
      agent.user.id !== session.user.id
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Validate location coordinates
    const { latitude, longitude } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { message: "Latitude and longitude are required" },
        { status: 400 },
      );
    }

    const coordinates = validateCoordinates({ latitude, longitude });

    if (!coordinates) {
      return NextResponse.json(
        { message: "Invalid coordinates" },
        { status: 400 },
      );
    }

    // Update agent location
    await updateAgentLocation(id, coordinates);

    // Fetch updated agent
    const updatedAgent = await Agent.findByPk(id);

    return NextResponse.json({
      message: "Location updated successfully",
      agent: updatedAgent,
    });
  } catch (error) {
    console.error("Error updating agent location:", error);
    return NextResponse.json(
      { message: "An error occurred while updating location" },
      { status: 500 },
    );
  }
}

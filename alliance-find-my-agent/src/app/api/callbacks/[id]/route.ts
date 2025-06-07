import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Callback, Agent, User } from "@/models";
import { UserRole } from "@/types/models";

// Get a single callback request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only staff can access callbacks
    if (
      ![UserRole.ADMIN, UserRole.AGENT].includes(session.user.role as UserRole)
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Find callback
    const callback = await Callback.findByPk(id, {
      include: [
        {
          model: Agent,
          as: "agent",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "firstName", "lastName", "email", "phone"],
            },
          ],
        },
      ],
    });

    if (!callback) {
      return NextResponse.json(
        { message: "Callback request not found" },
        { status: 404 },
      );
    }

    // If not admin, check if agent owns this callback
    if (session.user.role === UserRole.AGENT) {
      const agent = await Agent.findOne({
        where: { userId: session.user.id },
      });

      if (!agent || agent.id !== callback.agentId) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(callback);
  } catch (error) {
    console.error("Error fetching callback:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching callback request" },
      { status: 500 },
    );
  }
}

// Update a callback request
export async function PATCH(
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

    // Only staff can update callbacks
    if (
      ![UserRole.ADMIN, UserRole.AGENT].includes(session.user.role as UserRole)
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Find callback
    const callback = await Callback.findByPk(id, {
      include: [
        {
          model: Agent,
          as: "agent",
        },
      ],
    });

    if (!callback) {
      return NextResponse.json(
        { message: "Callback request not found" },
        { status: 404 },
      );
    }

    // If not admin, check if agent owns this callback
    if (session.user.role === UserRole.AGENT) {
      const agent = await Agent.findOne({
        where: { userId: session.user.id },
      });

      if (!agent || agent.id !== callback.agentId) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    }

    // Extract updateable fields
    const { status, notes, scheduledAt } = body;

    // Update callback based on action
    if (status === "scheduled" && scheduledAt) {
      await callback.schedule(new Date(scheduledAt), notes);
    } else if (status === "completed") {
      await callback.complete(notes);
    } else if (status === "cancelled") {
      await callback.cancel(notes);
    } else if (notes !== undefined) {
      callback.notes = notes;
      await callback.save();
    }

    // Fetch updated callback
    const updatedCallback = await Callback.findByPk(id, {
      include: [
        {
          model: Agent,
          as: "agent",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "firstName", "lastName", "email", "phone"],
            },
          ],
        },
      ],
    });

    return NextResponse.json({
      message: "Callback request updated successfully",
      callback: updatedCallback,
    });
  } catch (error) {
    console.error("Error updating callback:", error);
    return NextResponse.json(
      { message: "An error occurred while updating callback request" },
      { status: 500 },
    );
  }
}

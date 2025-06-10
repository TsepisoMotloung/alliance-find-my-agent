import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Callback, Agent, User } from "@/models";
import { UserRole } from "@/types/models";

// Get specific callback
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
      { message: "An error occurred while fetching callback" },
      { status: 500 }
    );
  }
}

// Update callback
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admin and agents can update callbacks
    if (![UserRole.ADMIN, UserRole.AGENT].includes(session.user.role as UserRole)) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      clientName,
      clientEmail,
      clientPhone,
      purpose,
      status,
      notes,
      scheduledAt,
    } = body;

    // Find the callback
    const callback = await Callback.findByPk(id);

    if (!callback) {
      return NextResponse.json(
        { message: 'Callback not found' },
        { status: 404 }
      );
    }

    // If user is an agent, they can only update their own callbacks
    if (session.user.role === UserRole.AGENT) {
      const agent = await Agent.findOne({
        where: { userId: session.user.id },
      });

      if (!agent || callback.agentId !== agent.id) {
        return NextResponse.json(
          { message: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    // Update callback
    const updateData: any = {
      clientName,
      clientEmail,
      clientPhone,
      purpose,
      status,
      notes,
    };

    // Handle status-specific updates
    if (status === 'scheduled' && scheduledAt) {
      updateData.scheduledAt = new Date(scheduledAt);
    } else if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    await callback.update(updateData);

    // Return updated callback with relations
    const updatedCallback = await Callback.findByPk(id, {
      include: [
        {
          model: Agent,
          as: 'agent',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
            },
          ],
        },
      ],
    });

    return NextResponse.json({
      message: 'Callback updated successfully',
      callback: updatedCallback,
    });
  } catch (error) {
    console.error('Error updating callback:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating callback' },
      { status: 500 }
    );
  }
}

// Delete callback
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admin can delete callbacks
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    // Find and delete the callback
    const callback = await Callback.findByPk(id);

    if (!callback) {
      return NextResponse.json(
        { message: 'Callback not found' },
        { status: 404 }
      );
    }

    await callback.destroy();

    return NextResponse.json({
      message: 'Callback deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting callback:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting callback' },
      { status: 500 }
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
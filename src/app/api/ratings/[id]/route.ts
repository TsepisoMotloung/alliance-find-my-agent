
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Rating, User } from "@/models";
import { UserRole } from "@/types/models";

// Get a specific rating
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const rating = await Rating.findByPk(id, {
      include: [
        {
          model: User,
          as: "target",
          attributes: ["firstName", "lastName", "email"]
        },
        {
          model: User,
          as: "rater",
          attributes: ["firstName", "lastName", "email"],
          required: false
        }
      ],
    });

    if (!rating) {
      return NextResponse.json(
        { message: "Rating not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ rating });
  } catch (error) {
    console.error("Error fetching rating:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching rating" },
      { status: 500 }
    );
  }
}

// Update a rating (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { score, comment, raterName, raterEmail } = body;

    // Validate score
    if (score && (score < 1 || score > 5)) {
      return NextResponse.json(
        { message: "Score must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Find the rating
    const rating = await Rating.findByPk(id);
    if (!rating) {
      return NextResponse.json(
        { message: "Rating not found" },
        { status: 404 }
      );
    }

    // Update the rating
    await rating.update({
      ...(score && { score }),
      ...(comment !== undefined && { comment }),
      ...(raterName !== undefined && { raterName }),
      ...(raterEmail !== undefined && { raterEmail }),
    });

    // Get updated rating with associations
    const updatedRating = await Rating.findByPk(id, {
      include: [
        {
          model: User,
          as: "target",
          attributes: ["firstName", "lastName", "email"]
        },
        {
          model: User,
          as: "rater",
          attributes: ["firstName", "lastName", "email"],
          required: false
        }
      ],
    });

    return NextResponse.json({
      message: "Rating updated successfully",
      rating: updatedRating,
    });
  } catch (error) {
    console.error("Error updating rating:", error);
    return NextResponse.json(
      { message: "An error occurred while updating rating" },
      { status: 500 }
    );
  }
}

// Delete a rating (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Find the rating
    const rating = await Rating.findByPk(id);
    if (!rating) {
      return NextResponse.json(
        { message: "Rating not found" },
        { status: 404 }
      );
    }

    // Delete the rating (this will trigger the hook to update average rating)
    await rating.destroy();

    return NextResponse.json({
      message: "Rating deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting rating:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting rating" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Rating, User, Agent, Employee } from "@/models";
import { v4 as uuidv4 } from "uuid";

// Create a new rating
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract rating data
    const { targetId, targetRole, raterName, raterEmail, score, comment } =
      body;

    // Validate required fields
    if (!targetId || !targetRole || !score) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate score
    const numericScore = Number(score);
    if (isNaN(numericScore) || numericScore < 1 || numericScore > 5) {
      return NextResponse.json(
        { message: "Score must be a number between 1 and 5" },
        { status: 400 },
      );
    }

    // Validate target role
    if (targetRole !== "agent" && targetRole !== "employee") {
      return NextResponse.json(
        { message: "Invalid target role" },
        { status: 400 },
      );
    }

    // Check if target exists
    const target = await User.findByPk(targetId, {
      include: [
        targetRole === "agent"
          ? { model: Agent, as: "agent" }
          : { model: Employee, as: "employee" },
      ],
    });

    if (!target) {
      return NextResponse.json(
        {
          message: `${targetRole === "agent" ? "Agent" : "Employee"} not found`,
        },
        { status: 404 },
      );
    }

    // Get authenticated user if available
    const session = await getServerSession(authOptions);
    let raterId = null;

    if (session) {
      raterId = session.user.id;
    } else if (!raterName || !raterEmail) {
      // If not authenticated, require name and email
      return NextResponse.json(
        { message: "Name and email are required for anonymous ratings" },
        { status: 400 },
      );
    }

    // Create rating
    const rating = await Rating.create({
      id: uuidv4(),
      targetId,
      targetRole,
      raterId,
      raterName: raterId ? null : raterName,
      raterEmail: raterId ? null : raterEmail,
      score: numericScore,
      comment,
    });

    // Return success response
    return NextResponse.json(
      {
        message: "Rating submitted successfully",
        rating,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating rating:", error);
    return NextResponse.json(
      { message: "An error occurred while submitting rating" },
      { status: 500 },
    );
  }
}

// Get ratings for a target or by a rater
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const targetId = searchParams.get("targetId");
    const targetRole = searchParams.get("targetRole");
    const raterId = searchParams.get("raterId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};

    if (targetId) {
      whereClause.targetId = targetId;

      // If targetId is provided, targetRole is required
      if (!targetRole) {
        return NextResponse.json(
          { message: "Target role is required when target ID is provided" },
          { status: 400 },
        );
      }

      whereClause.targetRole = targetRole;
    }

    if (raterId) {
      whereClause.raterId = raterId;
    }

    // Ensure at least one filter is provided
    if (Object.keys(whereClause).length === 0) {
      return NextResponse.json(
        { message: "At least one filter (targetId or raterId) is required" },
        { status: 400 },
      );
    }

    // Get ratings with pagination
    const { count, rows: ratings } = await Rating.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);

    return NextResponse.json({
      ratings,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching ratings" },
      { status: 500 },
    );
  }
}

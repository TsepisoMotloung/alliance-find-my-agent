import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { User, Agent, Employee } from "@/models";
import { UserRole, ApprovalStatus } from "@/types/models";
import { Op } from "sequelize";

// Get users (for admin)
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only admin can access user list
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role");
    const approvalStatus = searchParams.get("approvalStatus");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    if (role) {
      whereClause.role = role;
    }
    if (approvalStatus) {
      whereClause.approvalStatus = approvalStatus;
    }
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    // Get users with pagination
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Agent,
          as: "agent",
          required: false,
        },
        {
          model: Employee,
          as: "employee",
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      attributes: { exclude: ["password"] },
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);

    return NextResponse.json({
      users,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching users" },
      { status: 500 },
    );
  }
}

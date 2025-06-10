
import { NextRequest, NextResponse } from "next/server";
import { Complaint } from "@/models";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      targetId,
      targetRole,
      complainantId,
      complainantName,
      complainantEmail,
      subject,
      description,
    } = body;

    // Validate required fields
    if (!targetId || !targetRole || !subject || !description) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate targetRole
    if (!["agent", "employee"].includes(targetRole)) {
      return NextResponse.json(
        { message: "Invalid target role" },
        { status: 400 }
      );
    }

    // Create complaint
    const complaint = await Complaint.create({
      id: uuidv4(),
      targetId,
      targetRole,
      complainantId: complainantId || null,
      complainantName: complainantName || null,
      complainantEmail: complainantEmail || null,
      subject,
      description,
      status: "open",
    });

    return NextResponse.json(
      {
        message: "Complaint submitted successfully",
        complaint: {
          id: complaint.id,
          status: complaint.status,
          createdAt: complaint.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating complaint:", error);
    return NextResponse.json(
      { message: "Failed to submit complaint" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;
    const status = url.searchParams.get("status");
    const targetRole = url.searchParams.get("targetRole");

    const whereClause: any = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (targetRole) {
      whereClause.targetRole = targetRole;
    }

    const { count, rows: complaints } = await Complaint.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return NextResponse.json({
      complaints,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return NextResponse.json(
      { message: "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}

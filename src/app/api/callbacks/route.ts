import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Callback, Agent, User } from '@/models';
import { UserRole } from '@/types/models';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

// Create a new callback request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract callback data
    const {
      agentId,
      clientName,
      clientEmail,
      clientPhone,
      purpose,
    } = body;

    // Validate required fields
    if (!agentId || !clientName || !clientPhone || !purpose) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if agent exists
    const agent = await Agent.findByPk(agentId, {
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    });

    if (!agent) {
      return NextResponse.json(
        { message: 'Agent not found' },
        { status: 404 }
      );
    }

    // Check if agent is available
    if (!agent.isAvailable) {
      return NextResponse.json(
        { message: 'Agent is currently unavailable' },
        { status: 400 }
      );
    }

    // Create callback request
    const callback = await Callback.create({
      id: uuidv4(),
      agentId,
      clientName,
      clientEmail,
      clientPhone,
      purpose,
      status: 'pending',
    });

    // Return success response
    return NextResponse.json({
      message: 'Callback request submitted successfully',
      callback,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating callback request:', error);
    return NextResponse.json(
      { message: 'An error occurred while submitting callback request' },
      { status: 500 }
    );
  }
}

// Get callback requests (for agents or admin)
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only staff can access callbacks
    if (![UserRole.ADMIN, UserRole.AGENT].includes(session.user.role as UserRole)) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};

    // If not admin, filter by agent ID from user's profile
    if (session.user.role === UserRole.AGENT) {
      const agent = await Agent.findOne({
        where: { userId: session.user.id },
      });

      if (!agent) {
        return NextResponse.json(
          { message: 'Agent profile not found' },
          { status: 404 }
        );
      }

      whereClause.agentId = agent.id;
    } else if (agentId) {
      // Admin can filter by agent ID if provided
      whereClause.agentId = agentId;
    }

    if (status) {
      whereClause.status = status;
    }

    // Get callbacks with pagination
    const { count, rows: callbacks } = await Callback.findAndCountAll({
      where: whereClause,
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
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);

    return NextResponse.json({
      callbacks,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error('Error fetching callbacks:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching callbacks' },
      { status: 500 }
    );
  }
}
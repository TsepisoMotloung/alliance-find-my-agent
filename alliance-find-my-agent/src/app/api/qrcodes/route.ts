import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { User, Agent, Employee } from '@/models';
import { UserRole } from '@/types/models';
import { generateRatingQRCode } from '@/lib/qrcode';

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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || session.user.id;

    // Only admin can generate QR codes for other users
    if (userId !== session.user.id && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    // Find user
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Agent,
          as: 'agent',
          required: false,
        },
        {
          model: Employee,
          as: 'employee',
          required: false,
        },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is agent or employee
    if (![UserRole.AGENT, UserRole.EMPLOYEE].includes(user.role as UserRole)) {
      return NextResponse.json(
        { message: 'QR codes are only available for agents and employees' },
        { status: 400 }
      );
    }

    // Generate QR code
    const role = user.role === UserRole.AGENT ? 'agent' : 'employee';
    const qrCode = await generateRatingQRCode(userId, role);

    return NextResponse.json({
      qrCode,
      userId,
      role,
      fullName: `${user.firstName} ${user.lastName}`,
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { message: 'An error occurred while generating QR code' },
      { status: 500 }
    );
  }
}
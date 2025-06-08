import { NextRequest, NextResponse } from 'next/server';
import { User, Agent, Employee } from '@/models';
import { UserRole, ApprovalStatus } from '@/types/models';
import { Op } from 'sequelize';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { message: 'Search query must be at least 2 characters', results: [] },
        { status: 400 }
      );
    }
    
    // Search for approved and active agents and employees
    const users = await User.findAll({
      where: {
        [Op.and]: [
          // Only approved and active users
          { approvalStatus: ApprovalStatus.APPROVED },
          { isActive: true },
          // Only agents and employees
          { role: { [Op.in]: [UserRole.AGENT, UserRole.EMPLOYEE] } },
          // Search in name, email, or profile-specific fields
          {
            [Op.or]: [
              { firstName: { [Op.like]: `%${query}%` } },
              { lastName: { [Op.like]: `%${query}%` } },
              { email: { [Op.like]: `%${query}%` } },
            ],
          },
        ],
      },
      include: [
        {
          model: Agent,
          as: 'agent',
          required: false,
          where: {
            [Op.or]: [
              { licenseNumber: { [Op.like]: `%${query}%` } },
              { specialization: { [Op.like]: `%${query}%` } },
            ],
          },
        },
        {
          model: Employee,
          as: 'employee',
          required: false,
          where: {
            [Op.or]: [
              { employeeId: { [Op.like]: `%${query}%` } },
              { department: { [Op.like]: `%${query}%` } },
              { position: { [Op.like]: `%${query}%` } },
            ],
          },
        },
      ],
      limit: 10, // Limit results to avoid overwhelming response
    });
    
    // Format the results
    const results = users.map(user => {
      const role = user.role.toLowerCase() as 'agent' | 'employee';
      const profile = role === 'agent' ? user.agent : user.employee;
      
      // Base result object
      const result: any = {
        id: user.id,
        role,
        firstName: user.firstName,
        lastName: user.lastName,
      };
      
      // Add profile-specific details
      if (role === 'agent' && profile) {
        result.licenseNumber = profile.licenseNumber;
        result.specialization = profile.specialization;
        result.averageRating = profile.averageRating;
      } else if (role === 'employee' && profile) {
        result.employeeId = profile.employeeId;
        result.department = profile.department;
        result.position = profile.position;
        result.averageRating = profile.averageRating;
      }
      
      return result;
    });
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { message: 'An error occurred while searching', results: [] },
      { status: 500 }
    );
  }
}
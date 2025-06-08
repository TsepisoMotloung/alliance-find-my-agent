import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MainLayout from '@/components/layouts/MainLayout';
import { Employee, User } from '@/models';
import { UserRole } from '@/types/models';
import ProfileForm from './ProfileForm';

export default async function EmployeeProfilePage() {
  // Get the user's session
  const session = await getServerSession(authOptions);
  
  // Redirect if not logged in as employee
  if (!session || session.user.role !== UserRole.EMPLOYEE) {
    redirect('/login');
  }
  
  try {
    // Fetch employee data
    const userId = session.user.id;
    const employee = await Employee.findOne({
      where: { userId },
      include: [{ model: User, as: 'user' }],
    });
    
    if (!employee) {
      redirect('/login');
    }
    
    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-alliance-gray-900 sm:text-3xl sm:truncate">
                  My Profile
                </h1>
                <p className="mt-1 text-alliance-gray-500">
                  View and update your profile information
                </p>
              </div>
            </div>
            
            <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-alliance-gray-200">
                <h3 className="text-lg leading-6 font-medium text-alliance-gray-900">
                  Employee Information
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-alliance-gray-500">
                  Personal details and profile information
                </p>
              </div>
              
              <div className="px-4 py-5 sm:p-6">
                <ProfileForm 
                  userData={{
                    id: employee.user.id,
                    firstName: employee.user.firstName,
                    lastName: employee.user.lastName,
                    email: employee.user.email,
                    phone: employee.user.phone || '',
                  }}
                  employeeData={{
                    id: employee.id,
                    employeeId: employee.employeeId,
                    department: employee.department,
                    position: employee.position,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-alliance-gray-900">
                Error Loading Profile
              </h1>
              <p className="mt-2 text-alliance-gray-600">
                An error occurred while loading your profile. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
}
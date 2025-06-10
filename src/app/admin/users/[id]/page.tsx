
import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import MainLayout from '@/components/layouts/MainLayout';
import { User, Agent, Employee } from '@/models';
import { UserRole } from '@/types/models';
import Button from '@/components/ui/Button';
import Link from 'next/link';

interface UserDetailPageProps {
  params: {
    id: string;
  };
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // Check authentication and authorization
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== UserRole.ADMIN) {
    redirect('/');
  }

  // Fetch user details
  const user = await User.findByPk(id, {
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
    notFound();
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'agent':
        return 'Insurance Agent';
      case 'employee':
        return 'Alliance Employee';
      case 'user':
        return 'Regular User';
      default:
        return role;
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <MainLayout>
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-alliance-gray-900">
                  User Details
                </h1>
                <p className="mt-2 text-alliance-gray-600">
                  View and manage user information
                </p>
              </div>
              <div className="flex space-x-3">
                <Link href={`/admin/users/${user.id}/edit`}>
                  <Button variant="primary">Edit User</Button>
                </Link>
                <Link href="/admin/users">
                  <Button variant="secondary">Back to Users</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-alliance-gray-900">
                User Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-alliance-gray-500">
                Personal details and account information.
              </p>
            </div>
            <div className="border-t border-alliance-gray-200">
              <dl>
                <div className="bg-alliance-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-alliance-gray-500">Full Name</dt>
                  <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                    {user.firstName} {user.lastName}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-alliance-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                    {user.email}
                  </dd>
                </div>
                <div className="bg-alliance-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-alliance-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                    {user.phone || 'Not provided'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-alliance-gray-500">Role</dt>
                  <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                    {getRoleDisplay(user.role)}
                  </dd>
                </div>
                <div className="bg-alliance-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-alliance-gray-500">Status</dt>
                  <dd className={`mt-1 text-sm sm:mt-0 sm:col-span-2 ${getStatusColor(user.approvalStatus)}`}>
                    {getStatusDisplay(user.approvalStatus)}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-alliance-gray-500">Account Status</dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </dd>
                </div>
                <div className="bg-alliance-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-alliance-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Profile-specific Information */}
          {user.agent && (
            <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-alliance-gray-900">
                  Agent Information
                </h3>
              </div>
              <div className="border-t border-alliance-gray-200">
                <dl>
                  <div className="bg-alliance-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-alliance-gray-500">License Number</dt>
                    <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                      {user.agent.licenseNumber}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-alliance-gray-500">Specialization</dt>
                    <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                      {user.agent.specialization || 'Not specified'}
                    </dd>
                  </div>
                  <div className="bg-alliance-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-alliance-gray-500">Availability</dt>
                    <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.agent.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.agent.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-alliance-gray-500">Average Rating</dt>
                    <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                      {user.agent.averageRating ? `${user.agent.averageRating.toFixed(1)}/5` : 'No ratings yet'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {user.employee && (
            <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-alliance-gray-900">
                  Employee Information
                </h3>
              </div>
              <div className="border-t border-alliance-gray-200">
                <dl>
                  <div className="bg-alliance-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-alliance-gray-500">Employee ID</dt>
                    <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                      {user.employee.employeeId}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-alliance-gray-500">Department</dt>
                    <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                      {user.employee.department}
                    </dd>
                  </div>
                  <div className="bg-alliance-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-alliance-gray-500">Position</dt>
                    <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                      {user.employee.position}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-alliance-gray-500">Average Rating</dt>
                    <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                      {user.employee.averageRating ? `${user.employee.averageRating.toFixed(1)}/5` : 'No ratings yet'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

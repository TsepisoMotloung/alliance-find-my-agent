
import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import MainLayout from '@/components/layouts/MainLayout';
import { User, Agent, Employee } from '@/models';
import { UserRole } from '@/types/models';
import EditUserForm from '@/components/forms/EditUserForm';

interface EditUserPageProps {
  params: {
    id: string;
  };
}

export default async function EditUserPage({ params }: EditUserPageProps) {
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

  return (
    <MainLayout>
      <div className="py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-alliance-gray-900">
              Edit User
            </h1>
            <p className="mt-2 text-alliance-gray-600">
              Update user information and settings
            </p>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <EditUserForm user={user} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

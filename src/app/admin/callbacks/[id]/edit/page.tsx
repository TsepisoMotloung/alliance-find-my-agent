
import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import MainLayout from '@/components/layouts/MainLayout';
import { Callback, Agent, User } from '@/models';
import { UserRole } from '@/types/models';
import EditCallbackForm from '@/components/forms/EditCallbackForm';

interface EditCallbackPageProps {
  params: {
    id: string;
  };
}

export default async function EditCallbackPage({ params }: EditCallbackPageProps) {
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

  // Fetch callback details
  const callback = await Callback.findByPk(id, {
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
  });

  if (!callback) {
    notFound();
  }

  return (
    <MainLayout>
      <div className="py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-alliance-gray-900">
              Edit Callback
            </h1>
            <p className="mt-2 text-alliance-gray-600">
              Update callback request information
            </p>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <EditCallbackForm callback={callback} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

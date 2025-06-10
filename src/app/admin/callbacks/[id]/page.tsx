
import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import MainLayout from '@/components/layouts/MainLayout';
import { Callback, Agent, User } from '@/models';
import { UserRole } from '@/types/models';
import Button from '@/components/ui/Button';
import Link from 'next/link';

interface CallbackDetailPageProps {
  params: {
    id: string;
  };
}

export default async function CallbackDetailPage({ params }: CallbackDetailPageProps) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
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
                  Callback Details
                </h1>
                <p className="mt-2 text-alliance-gray-600">
                  View callback request information
                </p>
              </div>
              <div className="flex space-x-3">
                <Link href={`/admin/callbacks/${callback.id}/edit`}>
                  <Button variant="primary">Edit Callback</Button>
                </Link>
                <Link href="/admin/callbacks">
                  <Button variant="secondary">Back to Callbacks</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Callback Information */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-alliance-gray-900">
                Callback Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-alliance-gray-500">
                Details about the callback request.
              </p>
            </div>
            <div className="border-t border-alliance-gray-200">
              <dl>
                <div className="bg-alliance-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-alliance-gray-500">Status</dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(callback.status)}`}>
                      {getStatusDisplay(callback.status)}
                    </span>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-alliance-gray-500">Client Name</dt>
                  <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                    {callback.clientName}
                  </dd>
                </div>
                <div className="bg-alliance-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-alliance-gray-500">Client Email</dt>
                  <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                    {callback.clientEmail || 'Not provided'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-alliance-gray-500">Client Phone</dt>
                  <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                    {callback.clientPhone}
                  </dd>
                </div>
                <div className="bg-alliance-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-alliance-gray-500">Purpose</dt>
                  <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                    {callback.purpose}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-alliance-gray-500">Agent</dt>
                  <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                    {callback.agent?.user ? `${callback.agent.user.firstName} ${callback.agent.user.lastName}` : 'Unknown'}
                  </dd>
                </div>
                {callback.scheduledAt && (
                  <div className="bg-alliance-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-alliance-gray-500">Scheduled At</dt>
                    <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                      {new Date(callback.scheduledAt).toLocaleString()}
                    </dd>
                  </div>
                )}
                {callback.completedAt && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-alliance-gray-500">Completed At</dt>
                    <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                      {new Date(callback.completedAt).toLocaleString()}
                    </dd>
                  </div>
                )}
                {callback.notes && (
                  <div className="bg-alliance-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-alliance-gray-500">Notes</dt>
                    <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                      {callback.notes}
                    </dd>
                  </div>
                )}
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-alliance-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-alliance-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(callback.createdAt).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

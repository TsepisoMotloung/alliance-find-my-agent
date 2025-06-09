import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MainLayout from '@/components/layouts/MainLayout';
import { Agent, User, Callback } from '@/models';
import { UserRole } from '@/types/models';
import CallbackItem from './CallbackItem';
import StatusFilterSelect from './StatusFilterSelect'; // Import the new component

export default async function AgentCallbacksPage({ 
  searchParams 
}: { 
  searchParams: { status?: string } 
}) {
  // Get the user's session
  const session = await getServerSession(authOptions);
  
  // Redirect if not logged in as agent
  if (!session || session.user.role !== UserRole.AGENT) {
    redirect('/login');
  }
  
  try {
    // Get status filter from query params
    const statusFilter = searchParams.status || 'all';
    
    // Fetch agent data
    const userId = session.user.id;
    const agent = await Agent.findOne({
      where: { userId },
      include: [{ model: User, as: 'user' }],
    });
    
    if (!agent) {
      redirect('/login');
    }
    
    // Prepare where clause for callbacks query
    const whereClause: any = {
      agentId: agent.id,
    };
    
    // Add status filter if not 'all'
    if (statusFilter !== 'all' && ['pending', 'scheduled', 'completed', 'cancelled'].includes(statusFilter)) {
      whereClause.status = statusFilter;
    }
    
    // Fetch callbacks
    const callbacks = await Callback.findAll({
      where: whereClause,
      order: [
        ['status', 'ASC'], // Pending first, then scheduled, then others
        ['createdAt', 'DESC'], // Newest first within each status
      ],
    });
    
    // Count callbacks by status
    const pendingCount = callbacks.filter(cb => cb.status === 'pending').length;
    const scheduledCount = callbacks.filter(cb => cb.status === 'scheduled').length;
    const completedCount = callbacks.filter(cb => cb.status === 'completed').length;
    const cancelledCount = callbacks.filter(cb => cb.status === 'cancelled').length;
    
    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-alliance-gray-900 sm:text-3xl sm:truncate">
                  Callback Requests
                </h1>
                <p className="mt-1 text-alliance-gray-500">
                  Manage callback requests from clients
                </p>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="mt-6">
              <div className="sm:hidden">
                <label htmlFor="tabs" className="sr-only">
                  Select a tab
                </label>
                <StatusFilterSelect
                  currentStatus={statusFilter}
                  pendingCount={pendingCount}
                  scheduledCount={scheduledCount}
                  completedCount={completedCount}
                  cancelledCount={cancelledCount}
                />
              </div>
              <div className="hidden sm:block">
                <div className="border-b border-alliance-gray-200">
                  <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <a
                      href="/agent/callbacks"
                      className={`${
                        statusFilter === 'all'
                          ? 'border-alliance-red-500 text-alliance-red-600'
                          : 'border-transparent text-alliance-gray-500 hover:text-alliance-gray-700 hover:border-alliance-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      All ({callbacks.length})
                    </a>
                    <a
                      href="/agent/callbacks?status=pending"
                      className={`${
                        statusFilter === 'pending'
                          ? 'border-alliance-red-500 text-alliance-red-600'
                          : 'border-transparent text-alliance-gray-500 hover:text-alliance-gray-700 hover:border-alliance-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      Pending ({pendingCount})
                    </a>
                    <a
                      href="/agent/callbacks?status=scheduled"
                      className={`${
                        statusFilter === 'scheduled'
                          ? 'border-alliance-red-500 text-alliance-red-600'
                          : 'border-transparent text-alliance-gray-500 hover:text-alliance-gray-700 hover:border-alliance-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      Scheduled ({scheduledCount})
                    </a>
                    <a
                      href="/agent/callbacks?status=completed"
                      className={`${
                        statusFilter === 'completed'
                          ? 'border-alliance-red-500 text-alliance-red-600'
                          : 'border-transparent text-alliance-gray-500 hover:text-alliance-gray-700 hover:border-alliance-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      Completed ({completedCount})
                    </a>
                    <a
                      href="/agent/callbacks?status=cancelled"
                      className={`${
                        statusFilter === 'cancelled'
                          ? 'border-alliance-red-500 text-alliance-red-600'
                          : 'border-transparent text-alliance-gray-500 hover:text-alliance-gray-700 hover:border-alliance-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      Cancelled ({cancelledCount})
                    </a>
                  </nav>
                </div>
              </div>
            </div>

            {/* Callbacks List */}
            <div className="mt-6">
              {callbacks.length > 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg divide-y divide-alliance-gray-200">
                  {callbacks.map((callback) => (
                    <CallbackItem 
                      key={callback.id} 
                      callback={callback} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white shadow rounded-lg">
                  <svg
                    className="mx-auto h-12 w-12 text-alliance-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-alliance-gray-900">No callback requests</h3>
                  <p className="mt-1 text-sm text-alliance-gray-500">
                    {statusFilter === 'all'
                      ? 'You have no callback requests yet.'
                      : `You have no ${statusFilter} callback requests.`}
                  </p>
                  <div className="mt-6">
                    {statusFilter !== 'all' && (
                      <a
                        href="/agent/callbacks"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-alliance-red-600 hover:bg-alliance-red-700"
                      >
                        View all callbacks
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  } catch (error) {
    console.error('Error fetching callbacks:', error);
    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-alliance-gray-900">
                Error Loading Callbacks
              </h1>
              <p className="mt-2 text-alliance-gray-600">
                An error occurred while loading your callback requests. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
}
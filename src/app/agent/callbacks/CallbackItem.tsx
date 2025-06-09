'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { ICallback } from '@/types/models';

interface CallbackItemProps {
  callback: ICallback;
}

const CallbackItem: React.FC<CallbackItemProps> = ({ callback }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState(callback.notes || '');
  const [scheduledDate, setScheduledDate] = useState<string>(
    callback.scheduledAt 
      ? new Date(callback.scheduledAt).toISOString().slice(0, 16) 
      : ''
  );
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Format dates
  const requestDate = new Date(callback.createdAt).toLocaleDateString();
  const requestTime = new Date(callback.createdAt).toLocaleTimeString();
  
  // Get status badge color
  const getStatusBadgeColor = () => {
    switch (callback.status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-alliance-gray-100 text-alliance-gray-800';
      default:
        return 'bg-alliance-gray-100 text-alliance-gray-800';
    }
  };

  // Handle update callback
  const handleUpdateCallback = async (status: 'scheduled' | 'completed' | 'cancelled') => {
    setIsUpdating(true);
    setUpdateSuccess(false);
    setUpdateError('');

    try {
      // Validate required fields
      if (status === 'scheduled' && !scheduledDate) {
        setUpdateError('Please select a scheduled date and time');
        setIsUpdating(false);
        return;
      }

      // Prepare update data
      const updateData: any = {
        status,
        notes,
      };

      // Add scheduled date if status is scheduled
      if (status === 'scheduled') {
        updateData.scheduledAt = new Date(scheduledDate).toISOString();
      }

      // Send update request
      const response = await fetch(`/api/callbacks/${callback.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update callback');
      }

      // Update success
      setUpdateSuccess(true);
      
      // Refresh the page after a short delay to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error updating callback:', error);
      setUpdateError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="px-4 py-5 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <h3 className="text-lg leading-6 font-medium text-alliance-gray-900">
              {callback.clientName}
            </h3>
            <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor()}`}>
              {callback.status.charAt(0).toUpperCase() + callback.status.slice(1)}
            </span>
          </div>
          <div className="mt-1 max-w-2xl text-sm text-alliance-gray-500">
            <div className="flex flex-col sm:flex-row sm:space-x-6">
              <div>
                <span className="font-medium">Requested:</span> {requestDate} at {requestTime}
              </div>
              {callback.scheduledAt && (
                <div>
                  <span className="font-medium">Scheduled:</span> {new Date(callback.scheduledAt).toLocaleDateString()} at {new Date(callback.scheduledAt).toLocaleTimeString()}
                </div>
              )}
              {callback.completedAt && (
                <div>
                  <span className="font-medium">Completed:</span> {new Date(callback.completedAt).toLocaleDateString()} at {new Date(callback.completedAt).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide Details' : 'View Details'}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 border-t border-alliance-gray-200 pt-4">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-alliance-gray-500">Contact Details</dt>
              <dd className="mt-1 text-sm text-alliance-gray-900">
                <div>{callback.clientPhone}</div>
                {callback.clientEmail && <div>{callback.clientEmail}</div>}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-alliance-gray-500">Purpose</dt>
              <dd className="mt-1 text-sm text-alliance-gray-900">{callback.purpose}</dd>
            </div>
            
            {callback.notes && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-alliance-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-alliance-gray-900 bg-alliance-gray-50 p-3 rounded-md">
                  {callback.notes}
                </dd>
              </div>
            )}

            {/* Actions based on current status */}
            {callback.status === 'pending' && (
              <div className="sm:col-span-2 border-t border-alliance-gray-200 pt-4">
                <dt className="text-sm font-medium text-alliance-gray-500 mb-2">Schedule Callback</dt>
                <dd className="mt-1">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="scheduledDate" className="block text-sm font-medium text-alliance-gray-700">
                        Date and Time
                      </label>
                      <input
                        type="datetime-local"
                        id="scheduledDate"
                        name="scheduledDate"
                        className="mt-1 block w-full border border-alliance-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-alliance-red-500 focus:border-alliance-red-500 sm:text-sm"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-alliance-gray-700">
                        Notes
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        className="mt-1 block w-full border border-alliance-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-alliance-red-500 focus:border-alliance-red-500 sm:text-sm"
                        placeholder="Add any notes about this callback..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleUpdateCallback('scheduled')}
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Scheduling...' : 'Schedule Callback'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleUpdateCallback('cancelled')}
                        disabled={isUpdating}
                      >
                        Cancel Request
                      </Button>
                    </div>
                  </div>
                </dd>
              </div>
            )}

            {callback.status === 'scheduled' && (
              <div className="sm:col-span-2 border-t border-alliance-gray-200 pt-4">
                <dt className="text-sm font-medium text-alliance-gray-500 mb-2">Complete Callback</dt>
                <dd className="mt-1">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-alliance-gray-700">
                        Notes
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        className="mt-1 block w-full border border-alliance-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-alliance-red-500 focus:border-alliance-red-500 sm:text-sm"
                        placeholder="Add notes about the callback..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleUpdateCallback('completed')}
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Completing...' : 'Mark as Completed'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleUpdateCallback('cancelled')}
                        disabled={isUpdating}
                      >
                        Cancel Callback
                      </Button>
                    </div>
                  </div>
                </dd>
              </div>
            )}

            {/* Status messages */}
            {updateSuccess && (
              <div className="sm:col-span-2 mt-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Successfully updated callback status
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {updateError && (
              <div className="sm:col-span-2 mt-4">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {updateError}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
};

export default CallbackItem;
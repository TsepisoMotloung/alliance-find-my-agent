
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

interface DeleteUserFormProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

const DeleteUserForm: React.FC<DeleteUserFormProps> = ({ user }) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone and will delete all related data.`)) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete user');
      }

      router.push('/admin/users');
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Delete User Account
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                You are about to permanently delete <strong>{user.firstName} {user.lastName}</strong> ({user.email}).
              </p>
              <p className="mt-2">
                This will also delete:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>All ratings given by or for this user</li>
                <li>All complaints involving this user</li>
                <li>Agent/Employee profile and related data</li>
                <li>All callbacks (if agent)</li>
                <li>All associated records</li>
              </ul>
              <p className="mt-2 font-semibold">
                This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-alliance-gray-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-alliance-gray-900 mb-2">
          User Details
        </h4>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-alliance-gray-500">Name</dt>
            <dd className="text-sm text-alliance-gray-900">{user.firstName} {user.lastName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-alliance-gray-500">Email</dt>
            <dd className="text-sm text-alliance-gray-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-alliance-gray-500">Role</dt>
            <dd className="text-sm text-alliance-gray-900">{user.role}</dd>
          </div>
        </dl>
      </div>

      {deleteError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {deleteError}
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/users')}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {isDeleting ? 'Deleting...' : 'Delete User'}
        </Button>
      </div>
    </div>
  );
};

export default DeleteUserForm;

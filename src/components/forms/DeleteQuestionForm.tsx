
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

interface DeleteQuestionFormProps {
  question: {
    id: string;
    question: string;
    targetRole: 'agent' | 'employee';
    order: number;
    isActive: boolean;
  };
}

const DeleteQuestionForm: React.FC<DeleteQuestionFormProps> = ({ question }) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/questions/${question.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete question');
      }

      router.push(`/admin/questions?targetRole=${question.targetRole}`);
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
              Warning: This action cannot be undone
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                You are about to permanently delete this rating question. This will remove it from all future rating forms.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-alliance-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-alliance-gray-900 mb-2">
          Question Details
        </h3>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm font-medium text-alliance-gray-500">Target Role:</dt>
            <dd className="text-sm text-alliance-gray-900">
              {question.targetRole === 'agent' ? 'Insurance Agent' : 'Alliance Employee'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-alliance-gray-500">Question:</dt>
            <dd className="text-sm text-alliance-gray-900">{question.question}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-alliance-gray-500">Order:</dt>
            <dd className="text-sm text-alliance-gray-900">{question.order}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-alliance-gray-500">Status:</dt>
            <dd className="text-sm text-alliance-gray-900">
              {question.isActive ? 'Active' : 'Inactive'}
            </dd>
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
          onClick={() => router.push(`/admin/questions?targetRole=${question.targetRole}`)}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-600 hover:bg-red-700"
        >
          {isDeleting ? 'Deleting...' : 'Delete Question'}
        </Button>
      </div>
    </div>
  );
};

export default DeleteQuestionForm;

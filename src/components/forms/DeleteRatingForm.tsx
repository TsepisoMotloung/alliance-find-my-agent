
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';

interface DeleteRatingFormProps {
  rating: {
    id: string;
    score: number;
    comment?: string;
    raterName?: string;
    raterEmail?: string;
    createdAt: Date;
    target?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

const DeleteRatingForm: React.FC<DeleteRatingFormProps> = ({ rating }) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/ratings/${rating.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to delete rating');
      }

      router.push('/admin/ratings');
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning */}
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
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
            <p className="mt-2 text-sm text-red-700">
              Deleting this rating will permanently remove it from the system and update 
              the target's average rating accordingly.
            </p>
          </div>
        </div>
      </div>

      {/* Rating Details */}
      <div className="bg-alliance-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-alliance-gray-900 mb-4">
          Rating to be deleted:
        </h3>
        
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-alliance-gray-700">Target: </span>
            <span className="text-sm text-alliance-gray-900">
              {rating.target?.firstName} {rating.target?.lastName} ({rating.target?.email})
            </span>
          </div>
          
          <div>
            <span className="text-sm font-medium text-alliance-gray-700">Rated by: </span>
            <span className="text-sm text-alliance-gray-900">
              {rating.raterName || 'Anonymous'} 
              {rating.raterEmail && ` (${rating.raterEmail})`}
            </span>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm font-medium text-alliance-gray-700 mr-2">Score: </span>
            <StarRating value={rating.score} readonly size="sm" />
            <span className="ml-2 text-sm text-alliance-gray-900">{rating.score}/5</span>
          </div>
          
          <div>
            <span className="text-sm font-medium text-alliance-gray-700">Date: </span>
            <span className="text-sm text-alliance-gray-900">
              {new Date(rating.createdAt).toLocaleDateString()} at{' '}
              {new Date(rating.createdAt).toLocaleTimeString()}
            </span>
          </div>
          
          {rating.comment && (
            <div>
              <span className="text-sm font-medium text-alliance-gray-700">Comment: </span>
              <div className="mt-1 text-sm text-alliance-gray-900 whitespace-pre-wrap">
                {rating.comment.length > 200 
                  ? `${rating.comment.substring(0, 200)}...`
                  : rating.comment
                }
              </div>
            </div>
          )}
        </div>
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
          onClick={() => router.push(`/admin/ratings/${rating.id}`)}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete Rating'}
        </Button>
      </div>
    </div>
  );
};

export default DeleteRatingForm;

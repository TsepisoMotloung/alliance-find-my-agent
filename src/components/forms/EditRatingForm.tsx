
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';

interface EditRatingFormProps {
  rating: {
    id: string;
    score: number;
    comment?: string;
    raterName?: string;
    raterEmail?: string;
    target?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

interface FormValues {
  score: number;
  comment: string;
  raterName: string;
  raterEmail: string;
}

const EditRatingForm: React.FC<EditRatingFormProps> = ({ rating }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedScore, setSelectedScore] = useState(rating.score);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      score: rating.score,
      comment: rating.comment || '',
      raterName: rating.raterName || '',
      raterEmail: rating.raterEmail || '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`/api/ratings/${rating.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          score: selectedScore,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update rating');
      }

      router.push(`/admin/ratings/${rating.id}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScoreChange = (score: number) => {
    setSelectedScore(score);
    setValue('score', score);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Target Info */}
      <div className="bg-alliance-gray-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-alliance-gray-900 mb-2">Rating Target</h3>
        <p className="text-sm text-alliance-gray-600">
          {rating.target?.firstName} {rating.target?.lastName} ({rating.target?.email})
        </p>
      </div>

      {/* Score */}
      <div>
        <label className="block text-sm font-medium text-alliance-gray-700 mb-2">
          Rating Score
        </label>
        <div className="flex items-center space-x-4">
          <StarRating
            value={selectedScore}
            onChange={handleScoreChange}
            size="lg"
          />
          <span className="text-lg font-medium text-alliance-gray-900">
            {selectedScore}/5
          </span>
        </div>
        <input
          type="hidden"
          {...register('score', {
            required: 'Rating score is required',
            min: { value: 1, message: 'Rating must be at least 1' },
            max: { value: 5, message: 'Rating cannot exceed 5' },
          })}
        />
        {errors.score && (
          <p className="mt-1 text-sm text-red-600">{errors.score.message}</p>
        )}
      </div>

      {/* Rater Name */}
      <Input
        label="Rater Name"
        {...register('raterName')}
        error={errors.raterName?.message}
        placeholder="Enter rater name (optional)"
      />

      {/* Rater Email */}
      <Input
        label="Rater Email"
        type="email"
        {...register('raterEmail', {
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
        })}
        error={errors.raterEmail?.message}
        placeholder="Enter rater email (optional)"
      />

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-alliance-gray-700 mb-2">
          Comment
        </label>
        <textarea
          className="w-full px-4 py-2 bg-white border border-alliance-gray-300 rounded-md text-alliance-gray-900 placeholder-alliance-gray-400 focus:outline-none focus:ring-2 focus:border-alliance-red-300 focus:ring-alliance-red-500 transition duration-150"
          rows={6}
          placeholder="Edit the rating comment..."
          {...register('comment')}
        ></textarea>
        {errors.comment && (
          <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
        )}
      </div>

      {submitError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {submitError}
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Rating'}
        </Button>
      </div>
    </form>
  );
};

export default EditRatingForm;

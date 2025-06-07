'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';

interface RatingFormProps {
  targetId: string;
  targetRole: 'agent' | 'employee';
  targetName: string;
  onSuccess?: () => void;
}

interface FormValues {
  raterName: string;
  raterEmail: string;
  comment: string;
}

const RatingForm: React.FC<RatingFormProps> = ({
  targetId,
  targetRole,
  targetName,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    // Validate rating
    if (rating === 0) {
      setSubmitError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare rating data
      const ratingData = {
        targetId,
        targetRole,
        raterName: data.raterName,
        raterEmail: data.raterEmail,
        score: rating,
        comment: data.comment,
      };

      // Submit rating
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit rating');
      }

      // Set submitted state to true
      setSubmitted(true);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Thank You!</h3>
        <p className="text-green-700">
          Your rating for {targetName} has been submitted successfully.
        </p>
        <div className="mt-4">
          <Button onClick={() => window.location.href = '/'}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-alliance-gray-50 p-4 rounded-md text-center">
        <h3 className="text-lg font-semibold mb-2">Rate {targetName}</h3>
        <p className="text-alliance-gray-600 text-sm mb-4">
          {targetRole === 'agent' ? 'Insurance Agent' : 'Alliance Employee'}
        </p>
        <div className="flex justify-center mt-2">
          <StarRating
            value={rating}
            onChange={setRating}
            size="lg"
          />
        </div>
        {rating > 0 && (
          <p className="text-alliance-gray-700 mt-2">
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </p>
        )}
      </div>

      <Input
        label="Your Name"
        {...register('raterName', {
          required: 'Your name is required',
        })}
        error={errors.raterName?.message}
      />

      <Input
        label="Your Email"
        type="email"
        {...register('raterEmail', {
          required: 'Your email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
        })}
        error={errors.raterEmail?.message}
      />

      <div>
        <label className="block mb-1 text-sm font-medium text-alliance-gray-700">
          Comments (optional)
        </label>
        <textarea
          className="w-full px-4 py-2 bg-white border border-alliance-gray-300 rounded-md text-alliance-gray-900 placeholder-alliance-gray-400 focus:outline-none focus:ring-2 focus:border-alliance-red-300 focus:ring-alliance-red-500 transition duration-150"
          rows={4}
          {...register('comment')}
        ></textarea>
      </div>

      {submitError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {submitError}
        </div>
      )}

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Rating'}
      </Button>
    </form>
  );
};

export default RatingForm;

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface QuestionFormProps {
  targetRole: 'agent' | 'employee';
  question?: {
    id: string;
    question: string;
    order: number;
    isActive: boolean;
  };
}

interface FormValues {
  question: string;
  order: number;
  isActive: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ targetRole, question }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      question: question?.question || '',
      order: question?.order || 0,
      isActive: question?.isActive ?? true,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const url = question ? `/api/questions/${question.id}` : '/api/questions';
      const method = question ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          targetRole,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save question');
      }

      router.push(`/admin/questions?targetRole=${targetRole}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-alliance-gray-700 mb-2">
          Target Role
        </label>
        <div className="px-3 py-2 bg-alliance-gray-50 border border-alliance-gray-300 rounded-md text-sm text-alliance-gray-500">
          {targetRole === 'agent' ? 'Insurance Agent' : 'Alliance Employee'}
        </div>
      </div>

      <Input
        label="Question"
        {...register('question', {
          required: 'Question is required',
          minLength: {
            value: 10,
            message: 'Question must be at least 10 characters long',
          },
        })}
        error={errors.question?.message}
        placeholder="Enter the rating question..."
      />

      <Input
        label="Order"
        type="number"
        {...register('order', {
          required: 'Order is required',
          min: {
            value: 0,
            message: 'Order must be 0 or greater',
          },
        })}
        error={errors.order?.message}
        placeholder="0"
      />

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            {...register('isActive')}
            className="h-4 w-4 text-alliance-red-600 focus:ring-alliance-red-500 border-alliance-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-alliance-gray-700">Active</span>
        </label>
        <p className="mt-1 text-sm text-alliance-gray-500">
          Only active questions will appear on rating forms
        </p>
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
          onClick={() => router.push(`/admin/questions?targetRole=${targetRole}`)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : question ? 'Update Question' : 'Create Question'}
        </Button>
      </div>
    </form>
  );
};

export default QuestionForm;


'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface EditCallbackFormProps {
  callback: {
    id: string;
    clientName: string;
    clientEmail?: string;
    clientPhone: string;
    purpose: string;
    status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
    notes?: string;
    scheduledAt?: Date;
    completedAt?: Date;
    agent?: {
      user?: {
        firstName: string;
        lastName: string;
      };
    };
  };
}

interface FormValues {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  purpose: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  notes: string;
  scheduledAt: string;
}

const EditCallbackForm: React.FC<EditCallbackFormProps> = ({ callback }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      clientName: callback.clientName,
      clientEmail: callback.clientEmail || '',
      clientPhone: callback.clientPhone,
      purpose: callback.purpose,
      status: callback.status,
      notes: callback.notes || '',
      scheduledAt: callback.scheduledAt 
        ? new Date(callback.scheduledAt).toISOString().slice(0, 16)
        : '',
    },
  });

  const watchStatus = watch('status');

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`/api/callbacks/${callback.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update callback');
      }

      router.push(`/admin/callbacks/${callback.id}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Agent Information (Read-only) */}
      <div>
        <h3 className="text-lg font-medium text-alliance-gray-900 mb-4">
          Agent Information
        </h3>
        <div className="px-3 py-2 bg-alliance-gray-50 border border-alliance-gray-300 rounded-md text-sm text-alliance-gray-700">
          {callback.agent?.user 
            ? `${callback.agent.user.firstName} ${callback.agent.user.lastName}`
            : 'Unknown Agent'
          }
        </div>
      </div>

      {/* Client Information */}
      <div>
        <h3 className="text-lg font-medium text-alliance-gray-900 mb-4">
          Client Information
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Input
            label="Client Name"
            {...register('clientName', {
              required: 'Client name is required',
            })}
            error={errors.clientName?.message}
          />

          <Input
            label="Client Phone"
            {...register('clientPhone', {
              required: 'Client phone is required',
            })}
            error={errors.clientPhone?.message}
          />

          <div className="col-span-2">
            <Input
              label="Client Email"
              type="email"
              {...register('clientEmail', {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              error={errors.clientEmail?.message}
            />
          </div>
        </div>
      </div>

      {/* Callback Details */}
      <div>
        <h3 className="text-lg font-medium text-alliance-gray-900 mb-4">
          Callback Details
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-alliance-gray-700 mb-2">
              Purpose
            </label>
            <textarea
              className="w-full px-3 py-2 border border-alliance-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-alliance-red-500 focus:border-alliance-red-500"
              rows={3}
              {...register('purpose', {
                required: 'Purpose is required',
              })}
            />
            {errors.purpose && (
              <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-alliance-gray-700 mb-2">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-alliance-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-alliance-red-500 focus:border-alliance-red-500"
              >
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {(watchStatus === 'scheduled' || watchStatus === 'completed') && (
              <div>
                <label className="block text-sm font-medium text-alliance-gray-700 mb-2">
                  {watchStatus === 'scheduled' ? 'Scheduled At' : 'Completed At'}
                </label>
                <input
                  type="datetime-local"
                  {...register('scheduledAt')}
                  className="w-full px-3 py-2 border border-alliance-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-alliance-red-500 focus:border-alliance-red-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-alliance-gray-700 mb-2">
              Notes
            </label>
            <textarea
              className="w-full px-3 py-2 border border-alliance-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-alliance-red-500 focus:border-alliance-red-500"
              rows={3}
              placeholder="Add any additional notes..."
              {...register('notes')}
            />
          </div>
        </div>
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
          onClick={() => router.push(`/admin/callbacks/${callback.id}`)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Callback'}
        </Button>
      </div>
    </form>
  );
};

export default EditCallbackForm;

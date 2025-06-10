
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { UserRole, ApprovalStatus } from '@/types/models';

interface EditUserFormProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: UserRole;
    approvalStatus: ApprovalStatus;
    isActive: boolean;
    agent?: {
      licenseNumber: string;
      specialization?: string;
      isAvailable: boolean;
    };
    employee?: {
      employeeId: string;
      department: string;
      position: string;
    };
  };
}

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  approvalStatus: ApprovalStatus;
  isActive: boolean;
  // Agent fields
  licenseNumber?: string;
  specialization?: string;
  isAvailable?: boolean;
  // Employee fields
  employeeId?: string;
  department?: string;
  position?: string;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ user }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      approvalStatus: user.approvalStatus,
      isActive: user.isActive,
      licenseNumber: user.agent?.licenseNumber || '',
      specialization: user.agent?.specialization || '',
      isAvailable: user.agent?.isAvailable ?? true,
      employeeId: user.employee?.employeeId || '',
      department: user.employee?.department || '',
      position: user.employee?.position || '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update user');
      }

      router.push(`/admin/users/${user.id}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium text-alliance-gray-900 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Input
            label="First Name"
            {...register('firstName', {
              required: 'First name is required',
            })}
            error={errors.firstName?.message}
          />

          <Input
            label="Last Name"
            {...register('lastName', {
              required: 'Last name is required',
            })}
            error={errors.lastName?.message}
          />

          <Input
            label="Email"
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            error={errors.email?.message}
          />

          <Input
            label="Phone"
            {...register('phone')}
            error={errors.phone?.message}
          />
        </div>
      </div>

      {/* Account Settings */}
      <div>
        <h3 className="text-lg font-medium text-alliance-gray-900 mb-4">
          Account Settings
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-alliance-gray-700 mb-2">
              Approval Status
            </label>
            <select
              {...register('approvalStatus')}
              className="w-full px-3 py-2 border border-alliance-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-alliance-red-500 focus:border-alliance-red-500"
            >
              <option value={ApprovalStatus.PENDING}>Pending</option>
              <option value={ApprovalStatus.APPROVED}>Approved</option>
              <option value={ApprovalStatus.REJECTED}>Rejected</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('isActive')}
                className="h-4 w-4 text-alliance-red-600 focus:ring-alliance-red-500 border-alliance-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-alliance-gray-700">Active Account</span>
            </label>
          </div>
        </div>
      </div>

      {/* Agent-specific fields */}
      {user.agent && (
        <div>
          <h3 className="text-lg font-medium text-alliance-gray-900 mb-4">
            Agent Information
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input
              label="License Number"
              {...register('licenseNumber', {
                required: user.role === UserRole.AGENT ? 'License number is required' : false,
              })}
              error={errors.licenseNumber?.message}
            />

            <Input
              label="Specialization"
              {...register('specialization')}
              error={errors.specialization?.message}
            />

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isAvailable')}
                  className="h-4 w-4 text-alliance-red-600 focus:ring-alliance-red-500 border-alliance-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-alliance-gray-700">Available for callbacks</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Employee-specific fields */}
      {user.employee && (
        <div>
          <h3 className="text-lg font-medium text-alliance-gray-900 mb-4">
            Employee Information
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input
              label="Employee ID"
              {...register('employeeId', {
                required: user.role === UserRole.EMPLOYEE ? 'Employee ID is required' : false,
              })}
              error={errors.employeeId?.message}
            />

            <Input
              label="Department"
              {...register('department', {
                required: user.role === UserRole.EMPLOYEE ? 'Department is required' : false,
              })}
              error={errors.department?.message}
            />

            <Input
              label="Position"
              {...register('position', {
                required: user.role === UserRole.EMPLOYEE ? 'Position is required' : false,
              })}
              error={errors.position?.message}
            />
          </div>
        </div>
      )}

      {submitError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {submitError}
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(`/admin/users/${user.id}`)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update User'}
        </Button>
      </div>
    </form>
  );
};

export default EditUserForm;

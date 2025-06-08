'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface EmployeeData {
  id: string;
  employeeId: string;
  department: string;
  position: string;
}

interface ProfileFormProps {
  userData: UserData;
  employeeData: EmployeeData;
}

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ userData, employeeData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Prepare update data
      const updateData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      };

      // Include password update if in password mode
      if (passwordMode) {
        if (!data.currentPassword) {
          throw new Error('Current password is required to update password');
        }
        updateData.currentPassword = data.currentPassword;
        updateData.password = data.newPassword;
      }

      // Make API request to update profile
      const response = await fetch(`/api/users/${userData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      // Reset form and show success message
      if (passwordMode) {
        reset({
          ...data,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setPasswordMode(false);
      }
      
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <Input
              label="First Name"
              {...register('firstName', { required: 'First name is required' })}
              error={errors.firstName?.message}
            />
          </div>

          <div className="sm:col-span-3">
            <Input
              label="Last Name"
              {...register('lastName', { required: 'Last name is required' })}
              error={errors.lastName?.message}
            />
          </div>

          <div className="sm:col-span-3">
            <Input
              label="Email"
              type="email"
              disabled
              {...register('email')}
              helper="Email cannot be changed"
            />
          </div>

          <div className="sm:col-span-3">
            <Input
              label="Phone"
              {...register('phone', {
                pattern: {
                  value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
                  message: 'Invalid phone number format',
                },
              })}
              error={errors.phone?.message}
            />
          </div>

          <div className="sm:col-span-3">
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium text-alliance-gray-700">Employee ID</label>
              <input
                type="text"
                value={employeeData.employeeId}
                disabled
                className="px-4 py-2 bg-alliance-gray-100 border border-alliance-gray-300 rounded-md text-alliance-gray-700 focus:outline-none focus:ring-2 focus:border-alliance-gray-300 focus:ring-alliance-gray-500 transition duration-150"
              />
              <p className="text-xs text-alliance-gray-500">This field cannot be changed</p>
            </div>
          </div>

          <div className="sm:col-span-3">
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium text-alliance-gray-700">Department</label>
              <input
                type="text"
                value={employeeData.department}
                disabled
                className="px-4 py-2 bg-alliance-gray-100 border border-alliance-gray-300 rounded-md text-alliance-gray-700 focus:outline-none focus:ring-2 focus:border-alliance-gray-300 focus:ring-alliance-gray-500 transition duration-150"
              />
              <p className="text-xs text-alliance-gray-500">Contact admin to update department</p>
            </div>
          </div>

          <div className="sm:col-span-6">
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium text-alliance-gray-700">Position</label>
              <input
                type="text"
                value={employeeData.position}
                disabled
                className="px-4 py-2 bg-alliance-gray-100 border border-alliance-gray-300 rounded-md text-alliance-gray-700 focus:outline-none focus:ring-2 focus:border-alliance-gray-300 focus:ring-alliance-gray-500 transition duration-150"
              />
              <p className="text-xs text-alliance-gray-500">Contact admin to update position</p>
            </div>
          </div>
        </div>

        {passwordMode && (
          <div className="mt-6 space-y-6 border-t border-alliance-gray-200 pt-6">
            <h3 className="text-lg font-medium text-alliance-gray-900">Change Password</h3>
            
            <Input
              label="Current Password"
              type="password"
              {...register('currentPassword', {
                required: 'Current password is required',
              })}
              error={errors.currentPassword?.message}
            />

            <Input
              label="New Password"
              type="password"
              {...register('newPassword', {
                required: 'New password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              error={errors.newPassword?.message}
            />

            <Input
              label="Confirm New Password"
              type="password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === newPassword || 'Passwords do not match',
              })}
              error={errors.confirmPassword?.message}
            />
          </div>
        )}

        {submitError && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {submitError}
          </div>
        )}

        {submitSuccess && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            Profile updated successfully!
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:justify-between space-y-3 sm:space-y-0">
          <div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
            {!passwordMode && (
              <button
                type="button"
                className="ml-3 text-alliance-red-600 hover:text-alliance-red-500 font-medium"
                onClick={() => setPasswordMode(true)}
              >
                Change Password
              </button>
            )}
            {passwordMode && (
              <button
                type="button"
                className="ml-3 text-alliance-gray-600 hover:text-alliance-gray-500 font-medium"
                onClick={() => setPasswordMode(false)}
              >
                Cancel Password Change
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { UserRole } from "@/types/models";

interface RegistrationFormProps {
  userType: "agent" | "employee";
}

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  // Agent specific fields
  licenseNumber?: string;
  specialization?: string;
  // Employee specific fields
  employeeId?: string;
  department?: string;
  position?: string;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ userType }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>();

  const password = watch("password");

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare registration data based on user type
      const registerData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: userType === "agent" ? UserRole.AGENT : UserRole.EMPLOYEE,
        // Add specific fields based on user type
        ...(userType === "agent"
          ? {
              licenseNumber: data.licenseNumber,
              specialization: data.specialization,
            }
          : {
              employeeId: data.employeeId,
              department: data.department,
              position: data.position,
            }),
      };

      // Make API request to register user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      // Registration successful - redirect to approval page
      router.push("/approval");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "An error occurred during registration",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          {...register("firstName", { required: "First name is required" })}
          error={errors.firstName?.message}
        />
        <Input
          label="Last Name"
          {...register("lastName", { required: "Last name is required" })}
          error={errors.lastName?.message}
        />
      </div>

      <Input
        label="Email"
        type="email"
        {...register("email", {
          required: "Email is required",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Invalid email address",
          },
        })}
        error={errors.email?.message}
      />

      <Input
        label="Phone Number"
        {...register("phone", {
          required: "Phone number is required",
          pattern: {
            value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
            message: "Invalid phone number format",
          },
        })}
        error={errors.phone?.message}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Password"
          type="password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must contain at least 6 characters",
            },
            pattern: {
              value: /^.{6,}$/,
              message: "Password must contain at least 6 characters",
            },
          })}
          error={errors.password?.message}
        />
        <Input
          label="Confirm Password"
          type="password"
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === password || "Passwords do not match",
          })}
          error={errors.confirmPassword?.message}
        />
      </div>

      {/* Conditional fields based on user type */}
      {userType === "agent" ? (
        <>
          <Input
            label="License Number"
            {...register("licenseNumber", {
              required: "License number is required",
            })}
            error={errors.licenseNumber?.message}
          />
          <Input
            label="Specialization (optional)"
            {...register("specialization")}
          />
        </>
      ) : (
        <>
          <Input
            label="Employee ID"
            {...register("employeeId", {
              required: "Employee ID is required",
            })}
            error={errors.employeeId?.message}
          />
          <Input
            label="Department"
            {...register("department", {
              required: "Department is required",
            })}
            error={errors.department?.message}
          />
          <Input
            label="Position"
            {...register("position", {
              required: "Position is required",
            })}
            error={errors.position?.message}
          />
        </>
      )}

      {submitError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {submitError}
        </div>
      )}

      <div className="flex flex-col space-y-4">
        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register"}
        </Button>
        <div className="text-center text-sm text-alliance-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-alliance-red-600 hover:underline">
            Log in
          </a>
        </div>
      </div>
    </form>
  );
};

export default RegistrationForm;
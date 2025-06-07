"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface CallbackFormProps {
  agentId: string;
  agentName: string;
  onSuccess?: () => void;
}

interface FormValues {
  clientName: string;
  clientEmail?: string;
  clientPhone: string;
  purpose: string;
}

const CallbackForm: React.FC<CallbackFormProps> = ({
  agentId,
  agentName,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare callback request data
      const callbackData = {
        agentId,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        purpose: data.purpose,
      };

      // Submit callback request
      const response = await fetch("/api/callbacks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(callbackData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit callback request");
      }

      // Set submitted state to true
      setSubmitted(true);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "An error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Request Submitted!
        </h3>
        <p className="text-green-700">
          Your callback request has been sent to {agentName}. They will contact
          you soon.
        </p>
        <div className="mt-4">
          <Button onClick={() => (window.location.href = "/")}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-alliance-gray-50 p-4 rounded-md text-center">
        <h3 className="text-lg font-semibold mb-2">Request a Callback</h3>
        <p className="text-alliance-gray-600 text-sm">
          Complete this form to request a callback from {agentName}
        </p>
      </div>

      <Input
        label="Your Name"
        {...register("clientName", {
          required: "Your name is required",
        })}
        error={errors.clientName?.message}
      />

      <Input
        label="Your Email (optional)"
        type="email"
        {...register("clientEmail", {
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Invalid email address",
          },
        })}
        error={errors.clientEmail?.message}
      />

      <Input
        label="Your Phone Number"
        {...register("clientPhone", {
          required: "Phone number is required",
          pattern: {
            value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
            message: "Invalid phone number format",
          },
        })}
        error={errors.clientPhone?.message}
      />

      <div>
        <label className="block mb-1 text-sm font-medium text-alliance-gray-700">
          Purpose of Callback
        </label>
        <select
          className="w-full px-4 py-2 bg-white border border-alliance-gray-300 rounded-md text-alliance-gray-900 focus:outline-none focus:ring-2 focus:border-alliance-red-300 focus:ring-alliance-red-500 transition duration-150"
          {...register("purpose", {
            required: "Please select a purpose",
          })}
        >
          <option value="">Select a purpose</option>
          <option value="New Policy">New Policy</option>
          <option value="Policy Renewal">Policy Renewal</option>
          <option value="Policy Update">Policy Update</option>
          <option value="Claim Assistance">Claim Assistance</option>
          <option value="General Inquiry">General Inquiry</option>
          <option value="Other">Other</option>
        </select>
        {errors.purpose && (
          <p className="mt-1 text-sm text-red-500">{errors.purpose.message}</p>
        )}
      </div>

      {submitError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {submitError}
        </div>
      )}

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Request Callback"}
      </Button>
    </form>
  );
};

export default CallbackForm;

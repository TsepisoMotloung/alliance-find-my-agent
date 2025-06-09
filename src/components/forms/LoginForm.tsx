"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface FormValues {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setLoginError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        console.log(result.error);
        return;
      }
      console.log("Submitting login form");
      // Redirect based on user role (will be handled by middleware)
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      console.log("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
        label="Password"
        type="password"
        {...register("password", {
          required: "Password is required",
        })}
        error={errors.password?.message}
      />

      {loginError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {loginError}
        </div>
      )}

      <div className="flex items-center justify-end">
        <a
          href="/forgot-password"
          className="text-sm text-alliance-red-600 hover:underline"
        >
          Forgot password?
        </a>
      </div>

      <div className="flex flex-col space-y-4">
        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
        <div className="text-center text-sm text-alliance-gray-600">
          Don't have an account?{" "}
          <a href="/register" className="text-alliance-red-600 hover:underline">
            Register
          </a>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;

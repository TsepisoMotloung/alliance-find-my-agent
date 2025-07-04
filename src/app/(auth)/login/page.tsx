import React from "react";
import Link from "next/link";
import MainLayout from "@/components/layouts/MainLayout";
import LoginForm from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <MainLayout>
      <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-md flex items-center justify-center overflow-hidden">
              <img
                src="/images/logo.png"
                alt="Logo"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-alliance-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-alliance-gray-600">
            Or{" "}
            <Link
              href="/register"
              className="font-medium text-alliance-red-600 hover:text-alliance-red-500"
            >
              register for a new account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-alliance-gray-200">
            <LoginForm />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

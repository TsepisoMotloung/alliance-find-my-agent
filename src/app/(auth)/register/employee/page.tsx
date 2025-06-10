import React from "react";
import Link from "next/link";
import MainLayout from "@/components/layouts/MainLayout";
import RegistrationForm from "@/components/forms/RegistrationForm";

export default function EmployeeRegistrationPage() {
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
            Register as an Employee
          </h2>
          <p className="mt-2 text-center text-sm text-alliance-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-alliance-red-600 hover:text-alliance-red-500"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-alliance-gray-200">
            <RegistrationForm userType="employee" />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

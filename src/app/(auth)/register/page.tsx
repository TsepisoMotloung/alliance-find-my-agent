import React from "react";
import Link from "next/link";
import MainLayout from "@/components/layouts/MainLayout";

export default function RegisterPage() {
  return (
    <MainLayout>
      <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-md flex items-center justify-center overflow-hidden">
              <img 
                src="/images/Mappattern.jpg" 
                alt="Logo" 
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-alliance-gray-900">
            Choose Registration Type
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Agent Registration Card */}
            <div className="bg-white shadow-sm rounded-lg p-6 border border-alliance-gray-200 hover:border-alliance-red-300 hover:shadow-md transition-all">
              <div className="h-12 w-12 bg-alliance-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-alliance-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-alliance-gray-900 mb-2">
                Insurance Agent
              </h3>
              <p className="text-alliance-gray-600 mb-4">
                Register as an insurance agent to be listed on our platform and
                connect with potential clients.
              </p>
              <Link
                href="/register/agent"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-alliance-red-600 hover:bg-alliance-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-alliance-red-500 w-full"
              >
                Register as Agent
              </Link>
            </div>

            {/* Employee Registration Card */}
            <div className="bg-white shadow-sm rounded-lg p-6 border border-alliance-gray-200 hover:border-alliance-red-300 hover:shadow-md transition-all">
              <div className="h-12 w-12 bg-alliance-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-alliance-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-alliance-gray-900 mb-2">
                Alliance Employee
              </h3>
              <p className="text-alliance-gray-600 mb-4">
                Register as an Alliance Insurance employee to access the
                platform and manage your profile.
              </p>
              <Link
                href="/register/employee"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-alliance-red-600 hover:bg-alliance-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-alliance-red-500 w-full"
              >
                Register as Employee
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-alliance-gray-500">
              Note: All registrations require approval from Alliance Insurance
              administrators before access is granted.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

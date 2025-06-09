import React from "react";
import Link from "next/link";
import MainLayout from "@/components/layouts/MainLayout";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <MainLayout>
      <div className="min-h-[70vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-alliance-red-100 rounded-full flex items-center justify-center">
              <svg
                className="h-12 w-12 text-alliance-red-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-alliance-gray-900">
            404 - Page Not Found
          </h2>
          <p className="mt-2 text-center text-xl text-alliance-gray-600">
            We couldn&apos;t find the page you&apos;re looking for
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <p className="text-alliance-gray-600 mb-6">
              The page you are looking for might have been removed, had its name
              changed, or is temporarily unavailable.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button href="/" variant="primary">
                Go Back Home
              </Button>
              <Button href="/map" variant="outline">
                Find an Agent
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

import React from "react";
import Link from "next/link";
import MainLayout from "@/components/layouts/MainLayout";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import AgentMapPlaceholder from "@/components/ui/AgentMapPlaceholder";

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-alliance-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="md:w-1/2 md:pr-8">
              <h1 className="text-4xl md:text-5xl font-bold text-alliance-gray-900 tracking-tight">
                Find Your Alliance Insurance Agent
              </h1>
              <p className="mt-4 text-xl text-alliance-gray-600 max-w-lg">
                Connect with nearby insurance agents, get personalized service,
                and manage your insurance needs with ease.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button href="/map" size="lg">
                  Find Nearby Agents
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-alliance-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-alliance-gray-500 mx-auto">
              Our platform makes it easy to connect with insurance professionals
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-alliance-gray-100">
                <div className="w-12 h-12 bg-alliance-red-100 rounded-lg flex items-center justify-center mb-4">
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-alliance-gray-900 mb-2">
                  Find Nearby Agents
                </h3>
                <p className="text-alliance-gray-600">
                  Use our interactive map to locate insurance agents near you.
                  Filter by distance and specialization to find the perfect
                  match.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-alliance-gray-100">
                <div className="w-12 h-12 bg-alliance-red-100 rounded-lg flex items-center justify-center mb-4">
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-alliance-gray-900 mb-2">
                  Request Callbacks
                </h3>
                <p className="text-alliance-gray-600">
                  Schedule a callback with your chosen agent at a time that
                  works for you. No more waiting on hold or playing phone tag.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-alliance-gray-100">
                <div className="w-12 h-12 bg-alliance-red-100 rounded-lg flex items-center justify-center mb-4">
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
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-alliance-gray-900 mb-2">
                  Rate and Review
                </h3>
                <p className="text-alliance-gray-600">
                  Share your experience by rating and reviewing our agents. Help
                  others find the best insurance professionals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-alliance-red-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-alliance-red-100">
              Find your agent today.
            </span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/map"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-alliance-red-600 bg-white hover:bg-alliance-red-50"
              >
                Find Agents
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

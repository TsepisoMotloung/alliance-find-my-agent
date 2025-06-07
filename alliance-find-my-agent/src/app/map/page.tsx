import React from "react";
import MainLayout from "@/components/layouts/MainLayout";
import MapClient from "./MapClient";

export default function MapPage() {
  return (
    <MainLayout>
      <div className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-alliance-gray-900 sm:text-4xl">
              Find Nearby Alliance Insurance Agents
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-alliance-gray-500">
              Locate insurance agents near you and connect with them instantly
            </p>
          </div>

          <MapClient />
        </div>
      </div>
    </MainLayout>
  );
}

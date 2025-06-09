import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import { Agent } from "@/models";
import LocationClient from "./LocationClient";

export default async function AgentLocationPage() {
  // Get the user's session
  const session = await getServerSession(authOptions);

  // Redirect if not logged in as agent
  if (!session || session.user.role !== "agent") {
    redirect("/login");
  }

  try {
    // Fetch agent data
    const userId = session.user.id;
    const agent = await Agent.findOne({
      where: { userId },
    });

    if (!agent) {
      redirect("/login");
    }

    // Helper function to safely convert to ISO string
    const toISOStringSafe = (date: string | number | Date | undefined) => {
      if (!date) return undefined;
      if (date instanceof Date) return date.toISOString();
      if (typeof date === 'string') return date;
      return new Date(date).toISOString();
    };

    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-alliance-gray-900 sm:text-4xl">
                Update Your Location
              </h1>
              <p className="mt-3 text-xl text-alliance-gray-500">
                Keep your location updated so clients can find you easily
              </p>
            </div>

            <LocationClient
              agentId={agent.id}
              currentLatitude={agent.latitude}
              currentLongitude={agent.longitude}
              locationUpdatedAt={toISOStringSafe(agent.locationUpdatedAt)}
              isAvailable={agent.isAvailable}
            />
          </div>
        </div>
      </MainLayout>
    );
  } catch (error) {
    console.error("Error loading agent location page:", error);
    return (
      <MainLayout>
        <div className="py-8 sm:py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-alliance-gray-900">
                Error Loading Location Page
              </h1>
              <p className="mt-2 text-alliance-gray-600">
                An error occurred while loading your location page. Please try
                again later.
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
}
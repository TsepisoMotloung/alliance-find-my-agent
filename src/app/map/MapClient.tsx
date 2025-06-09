"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// Dynamically import the AgentMap component to avoid SSR issues with Leaflet
const AgentMap = dynamic(() => import("@/components/maps/AgentMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-alliance-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-alliance-gray-500">Loading map...</div>
    </div>
  ),
});

interface Agent {
  id: string;
  userId: string;
  licenseNumber: string;
  specialization?: string;
  latitude: number;
  longitude: number;
  isAvailable: boolean;
  averageRating?: number;
  distance: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profileImage?: string;
  };
}

const MapClient: React.FC = () => {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(10); // Default 10km
  const [isLocationLoaded, setIsLocationLoaded] = useState(false);

  // Fetch nearby agents
  const fetchNearbyAgents = useCallback(async (
    latitude: number,
    longitude: number,
    radius: number,
  ) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/agents/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
      );
      console.log("Response: ", response);

      if (!response.ok) {
        throw new Error("Failed to fetch nearby agents");
      }

      const data = await response.json();
      
      setAgents(data.agents || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching agents:", error);
      setError("Failed to load nearby agents. Please try again later.");
      setLoading(false);
    }
  }, []);

  // Request user's geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setIsLocationLoaded(true);
          fetchNearbyAgents(latitude, longitude, radius);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError(
            "Unable to access your location. Please enable location services and refresh the page.",
          );
          setLoading(false);
        },
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  }, []); // Remove radius dependency to avoid re-fetching location

  // Fetch agents when radius changes (but only if location is already loaded)
  useEffect(() => {
    if (isLocationLoaded && userLocation) {
      fetchNearbyAgents(userLocation[0], userLocation[1], radius);
    }
  }, [radius, isLocationLoaded, userLocation, fetchNearbyAgents]);

  // Handle radius change
  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRadius = parseInt(e.target.value);
    if (newRadius >= 1 && newRadius <= 50) {
      setRadius(newRadius);
    }
  };

  // Handle callback request
  const handleRequestCallback = (agentId: string) => {
    router.push(`/callback/${agentId}`);
  };

  // Handle view ratings
  const handleViewRatings = (agentId: string) => {
    router.push(`/rate/agent/${agentId}`);
  };

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-alliance-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-alliance-gray-900">
                Available Agents Near You
              </h2>
              <p className="text-alliance-gray-500 text-sm">
                {loading
                  ? "Locating agents near you..."
                  : agents.length > 0
                    ? `Found ${agents.length} agents within ${radius}km of your location`
                    : "No agents found nearby. Try increasing the search radius."}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-alliance-gray-700">
                Search radius:
              </span>
              <Input
                type="number"
                min="1"
                max="50"
                value={radius}
                onChange={handleRadiusChange}
                className="w-20"
                fullWidth={false}
              />
              <span className="text-sm text-alliance-gray-700">km</span>
            </div>
          </div>
        </div>

        <div className="p-4">
          {userLocation && isLocationLoaded ? (
            <AgentMap
              agents={agents}
              userLocation={userLocation}
              onRequestCallback={handleRequestCallback}
              onViewRatings={handleViewRatings}
            />
          ) : (
            <div className="w-full h-[600px] bg-alliance-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-alliance-gray-500">
                {loading ? "Getting your location..." : "Unable to load map"}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-alliance-gray-900 mb-4">
          Looking for a specific agent?
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button href="/rate/search" variant="outline">
            Search Agents by Name
          </Button>
          <Button href="/rate/scan">Scan Agent QR Code</Button>
        </div>
      </div>
    </div>
  );
};

export default MapClient;
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Button from "@/components/ui/Button";

// Dynamically import the Leaflet map to avoid SSR issues
const LocationMap = dynamic(() => import("./LocationMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-alliance-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-alliance-gray-500">Loading map...</div>
    </div>
  ),
});

interface LocationClientProps {
  agentId: string;
  currentLatitude?: number;
  currentLongitude?: number;
  locationUpdatedAt?: string;
  isAvailable: boolean;
}

const LocationClient: React.FC<LocationClientProps> = ({
  agentId,
  currentLatitude,
  currentLongitude,
  locationUpdatedAt,
  isAvailable,
}) => {
  const [newPosition, setNewPosition] = useState<[number, number] | null>(
    currentLatitude && currentLongitude
      ? [currentLatitude, currentLongitude]
      : null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [currentAvailability, setCurrentAvailability] = useState(isAvailable);

  // Format the last updated date
  const formattedLastUpdated = locationUpdatedAt
    ? new Date(locationUpdatedAt).toLocaleString()
    : "Never updated";

  // Check if location was updated recently (within the last hour)
  const isLocationRecent = locationUpdatedAt
    ? new Date().getTime() - new Date(locationUpdatedAt).getTime() <
      60 * 60 * 1000
    : false;

  // Update location using current geolocation
  const updateLocationWithCurrent = () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setNewPosition([latitude, longitude]);

          try {
            const response = await fetch(`/api/agents/${agentId}/location`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ latitude, longitude }),
            });

            if (!response.ok) {
              throw new Error("Failed to update location");
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 5000);
          } catch (err) {
            setError("Failed to update location. Please try again.");
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError(
            "Unable to access your location. Please check your browser settings and try again.",
          );
          setLoading(false);
        },
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  };

  // Update location using map position
  const updateLocationWithMap = async () => {
    if (!newPosition) {
      setError("Please select a location on the map first.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const [latitude, longitude] = newPosition;

      const response = await fetch(`/api/agents/${agentId}/location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ latitude, longitude }),
      });

      if (!response.ok) {
        throw new Error("Failed to update location");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError("Failed to update location. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle availability status
  const toggleAvailability = async () => {
    setUpdatingAvailability(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${agentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isAvailable: !currentAvailability,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update availability");
      }

      const data = await response.json();
      setCurrentAvailability(!currentAvailability);
    } catch (err) {
      setError("Failed to update availability. Please try again.");
    } finally {
      setUpdatingAvailability(false);
    }
  };

  return (
    <div>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-alliance-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-medium text-alliance-gray-900">
                Your Location
              </h2>
              <p className="mt-1 text-sm text-alliance-gray-500">
                Last updated: {formattedLastUpdated}
                {isLocationRecent && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Recent
                  </span>
                )}
              </p>
            </div>
            <div className="mt-3 sm:mt-0">
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                  currentAvailability
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${currentAvailability ? "bg-green-600" : "bg-red-600"} mr-1.5`}
                />
                {currentAvailability ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <LocationMap
              position={newPosition}
              setPosition={setNewPosition}
              zoom={15}
            />
          </div>

          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Button
              onClick={updateLocationWithCurrent}
              disabled={loading}
              fullWidth
            >
              {loading ? "Updating..." : "Use Current Location"}
            </Button>
            <Button
              onClick={updateLocationWithMap}
              disabled={loading || !newPosition}
              variant="outline"
              fullWidth
            >
              Update with Map Location
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
              Location updated successfully!
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-alliance-gray-200">
          <h2 className="text-lg font-medium text-alliance-gray-900">
            Availability Settings
          </h2>
          <p className="mt-1 text-sm text-alliance-gray-500">
            Control whether you appear as available to clients
          </p>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-alliance-gray-900">
                Availability Status
              </p>
              <p className="text-sm text-alliance-gray-500">
                {currentAvailability
                  ? "You are currently visible to clients on the map"
                  : "You are currently hidden from clients on the map"}
              </p>
            </div>
            <Button
              onClick={toggleAvailability}
              disabled={updatingAvailability}
              variant={currentAvailability ? "outline" : "primary"}
              size="sm"
            >
              {updatingAvailability
                ? "Updating..."
                : currentAvailability
                  ? "Set as Unavailable"
                  : "Set as Available"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationClient;

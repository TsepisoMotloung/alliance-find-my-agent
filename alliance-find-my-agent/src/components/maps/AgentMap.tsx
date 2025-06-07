"use client";

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Button from "@/components/ui/Button";
import StarRating from "@/components/ui/StarRating";

// Define agent type
interface AgentData {
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

// Fix for Leaflet icons
const fixLeafletIcon = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/images/marker-icon-2x.png",
    iconUrl: "/images/marker-icon.png",
    shadowUrl: "/images/marker-shadow.png",
  });
};

// Create custom agent icon
const agentIcon = new L.Icon({
  iconUrl: "/images/agent-marker.png",
  iconRetinaUrl: "/images/agent-marker-2x.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "/images/marker-shadow.png",
  shadowSize: [41, 41],
});

// Component to recenter map when user location changes
interface RecenterMapProps {
  position: [number, number];
}

function RecenterMap({ position }: RecenterMapProps) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);

  return null;
}

interface AgentMapProps {
  agents: AgentData[];
  userLocation: [number, number];
  onRequestCallback?: (agentId: string) => void;
  onViewRatings?: (agentId: string) => void;
}

const AgentMap: React.FC<AgentMapProps> = ({
  agents,
  userLocation,
  onRequestCallback,
  onViewRatings,
}) => {
  const [map, setMap] = useState<L.Map | null>(null);

  // Fix Leaflet icon issue on component mount
  useEffect(() => {
    fixLeafletIcon();
  }, []);

  // Show user's location and available agents on the map
  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-md">
      <MapContainer
        center={userLocation}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        whenCreated={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        <Marker position={userLocation}>
          <Popup>Your location</Popup>
        </Marker>

        {/* Agent markers */}
        {agents.map((agent) => (
          <Marker
            key={agent.id}
            position={[agent.latitude, agent.longitude]}
            icon={agentIcon}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-alliance-red-600">
                  {agent.user.firstName} {agent.user.lastName}
                </h3>

                {agent.specialization && (
                  <p className="text-sm text-alliance-gray-600">
                    {agent.specialization}
                  </p>
                )}

                {agent.averageRating && (
                  <div className="mt-1">
                    <StarRating
                      value={agent.averageRating}
                      readonly
                      size="sm"
                    />
                  </div>
                )}

                <p className="text-sm mt-2">
                  <span className="font-semibold">Distance:</span>{" "}
                  {agent.distance.toFixed(1)} km
                </p>

                <div className="mt-3 flex flex-col gap-2">
                  {onRequestCallback && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onRequestCallback(agent.id)}
                      fullWidth
                    >
                      Request Callback
                    </Button>
                  )}

                  {onViewRatings && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewRatings(agent.id)}
                      fullWidth
                    >
                      View Ratings
                    </Button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        <RecenterMap position={userLocation} />
      </MapContainer>
    </div>
  );
};

export default AgentMap;

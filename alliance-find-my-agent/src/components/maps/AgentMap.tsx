"use client";

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, User, Star } from "lucide-react";
import "leaflet/dist/leaflet.css";

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

// Create custom icon from Lucide React icon
const createCustomIcon = (IconComponent: React.ComponentType<any>, color: string = "#3b82f6") => {
  const iconHtml = `
    <div style="
      background-color: ${color};
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${IconComponent === MapPin ? '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>' : 
          IconComponent === User ? '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' : ''}
      </svg>
    </div>
  `;

  return new L.DivIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

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

// Star Rating Component
interface StarRatingProps {
  value: number;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({ value, readonly = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">({value.toFixed(1)})</span>
    </div>
  );
};

// Button Component
interface ButtonProps {
  variant?: 'primary' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  onClick, 
  children 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

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
  const [mapKey, setMapKey] = useState(0);

  // Create icons
  const userIcon = createCustomIcon(MapPin, "#3b82f6"); // Blue for user
  const agentIcon = createCustomIcon(User, "#dc2626"); // Red for agents

  // Reset map key when userLocation changes to force remount
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [userLocation]);

  // Fix for default Leaflet marker icons
  useEffect(() => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjUgMEMyMC4xIDAgMjYuNCA2LjMgMjYuNCAxNEMyNi40IDIxLjcgMTIuNSA0MSAxMi41IDQxUzEuNCAyMS43IDEuNCAxNEMxLjQgNi4zIDQuNyAwIDEyLjUgMFoiIGZpbGw9IiMzMzc0ZmYiLz4KPGNpcmNsZSBjeD0iMTIuNSIgY3k9IjE0IiByPSI1IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
      iconRetinaUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjUgMEMyMC4xIDAgMjYuNCA2LjMgMjYuNCAxNEMyNi40IDIxLjcgMTIuNSA0MSAxMi41IDQxUzEuNCAyMS43IDEuNCAxNEMxLjQgNi4zIDQuNyAwIDEyLjUgMFoiIGZpbGw9IiMzMzc0ZmYiLz4KPGNpcmNsZSBjeD0iMTIuNSIgY3k9IjE0IiByPSI1IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
      shadowUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDEiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCA0MSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGVsbGlwc2UgY3g9IjIwLjUiIGN5PSIzNyIgcng9IjE2IiByeT0iNCIgZmlsbD0iIzAwMDAwMDMwIi8+Cjwvc3ZnPgo=',
    });
  }, []);

  // Sample data for demonstration
  const sampleAgents: AgentData[] = [
    {
      id: "1",
      userId: "user1",
      licenseNumber: "RE123456",
      specialization: "Residential Sales",
      latitude: userLocation[0] + 0.01,
      longitude: userLocation[1] + 0.01,
      isAvailable: true,
      averageRating: 4.5,
      distance: 1.2,
      user: {
        id: "user1",
        firstName: "John",
        lastName: "Smith",
        email: "john@example.com",
        phone: "+1234567890"
      }
    },
    {
      id: "2",
      userId: "user2",
      licenseNumber: "RE789012",
      specialization: "Commercial Properties",
      latitude: userLocation[0] - 0.005,
      longitude: userLocation[1] + 0.015,
      isAvailable: true,
      averageRating: 4.8,
      distance: 0.8,
      user: {
        id: "user2",
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah@example.com",
        phone: "+1234567891"
      }
    }
  ];

  const agentsToShow = agents.length > 0 ? agents : sampleAgents;

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-md">
      <MapContainer
        key={mapKey}
        center={userLocation}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        <Marker position={userLocation} icon={userIcon}>
          <Popup>
            <div className="text-center">
              <MapPin className="w-5 h-5 mx-auto mb-2 text-blue-600" />
              <strong>Your Location</strong>
            </div>
          </Popup>
        </Marker>

        {/* Agent markers */}
        {agentsToShow.map((agent) => (
          <Marker
            key={agent.id}
            position={[agent.latitude, agent.longitude]}
            icon={agentIcon}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-red-600" />
                  <h3 className="font-bold text-red-600">
                    {agent.user.firstName} {agent.user.lastName}
                  </h3>
                </div>

                {agent.specialization && (
                  <p className="text-sm text-gray-600 mb-2">
                    {agent.specialization}
                  </p>
                )}

                {agent.averageRating && (
                  <div className="mb-2">
                    <StarRating
                      value={agent.averageRating}
                      readonly
                      size="sm"
                    />
                  </div>
                )}

                <p className="text-sm mb-3">
                  <span className="font-semibold">Distance:</span>{" "}
                  {agent.distance.toFixed(1)} km
                </p>

                <div className="flex flex-col gap-2">
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
                      onClick={() => onViewRatings(agent.user.id)}
                      fullWidth
                    >
                      Rate Agent
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
"use client";

import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

interface MapClickHandlerProps {
  setPosition: (position: [number, number]) => void;
}

// Component to handle map clicks
const MapClickHandler: React.FC<MapClickHandlerProps> = ({ setPosition }) => {
  useMapEvents({
    click: (e) => {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return null;
};

interface RecenterMapProps {
  position: [number, number] | null;
}

// Component to recenter map when position changes
const RecenterMap: React.FC<RecenterMapProps> = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  return null;
};

interface LocationMapProps {
  position: [number, number] | null;
  setPosition: (position: [number, number]) => void;
  zoom?: number;
}

const LocationMap: React.FC<LocationMapProps> = ({
  position,
  setPosition,
  zoom = 13,
}) => {
  const [defaultPosition, setDefaultPosition] = useState<[number, number]>([
    51.505, -0.09,
  ]);

  // Fix Leaflet icon issue on component mount
  useEffect(() => {
    fixLeafletIcon();

    // Try to get user's location if no position is provided
    if (!position) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (location) => {
            const { latitude, longitude } = location.coords;
            setPosition([latitude, longitude]);
            setDefaultPosition([latitude, longitude]);
          },
          (error) => {
            console.error("Error getting location:", error);
          },
        );
      }
    }
  }, [position, setPosition]);

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-inner">
      <MapContainer
        center={position || defaultPosition}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {position && <Marker position={position} />}

        <MapClickHandler setPosition={setPosition} />
        {position && <RecenterMap position={position} />}
      </MapContainer>

      <div className="mt-2 text-xs text-alliance-gray-500">
        Click on the map to set your location, or use the &quot;Use Current
        Location&quot; button.
      </div>
    </div>
  );
};

export default LocationMap;

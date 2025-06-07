"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Button from "@/components/ui/Button";

// Dynamically import the QRScanner component to avoid SSR issues
const QRScanner = dynamic(() => import("@/components/ui/QRScanner"), {
  ssr: false,
});

const ScanClient: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleScanSuccess = (result: string) => {
    try {
      // Check if the result is a valid URL
      const url = new URL(result);

      // Check if it's a rating URL
      if (url.pathname.startsWith("/rate/")) {
        // Extract path segments
        const segments = url.pathname
          .split("/")
          .filter((segment) => segment.length > 0);

        if (
          segments.length === 3 &&
          (segments[1] === "agent" || segments[1] === "employee")
        ) {
          // Valid QR code, redirect to the rating page
          router.push(url.pathname);
        } else {
          setError(
            "Invalid QR code format. Please try again with a valid Alliance Insurance QR code.",
          );
        }
      } else {
        setError(
          "This QR code does not appear to be an Alliance Insurance QR code.",
        );
      }
    } catch (e) {
      setError(
        "Invalid QR code. Please try again with a valid Alliance Insurance QR code.",
      );
    }
  };

  const handleScanError = (errorMessage: string) => {
    setError(`Scanning error: ${errorMessage}`);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6 border-b border-alliance-gray-200">
        <h2 className="text-lg font-medium text-alliance-gray-900">
          Scan a QR Code
        </h2>
        <p className="text-alliance-gray-500 text-sm mt-1">
          Point your camera at the agent's or employee's QR code to rate their
          service
        </p>
      </div>

      <div className="p-6">
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onScanError={handleScanError}
          width="100%"
          height="400px"
        />

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col space-y-4">
          <p className="text-alliance-gray-600 text-sm">
            Don't have a QR code to scan? You can also search for an agent by
            name:
          </p>
          <Button href="/rate/search" variant="outline">
            Search Agent by Name
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScanClient;

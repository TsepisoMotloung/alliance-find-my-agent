"use client";

import React, { useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";

interface QRCodeDisplayProps {
  qrCode: string;
  name: string;
  title: string;
  agentId: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  qrCode,
  name,
  title,
  agentId,
}) => {
  const [downloadType, setDownloadType] = useState<"qr" | "card">("qr");

  // Function to handle QR code download
  const handleDownload = () => {
    const link = document.createElement("a");

    if (downloadType === "qr") {
      // Download just the QR code
      link.href = qrCode;
      link.download = `${name.replace(/\s+/g, "_")}_QRCode.png`;
    } else {
      // Download the full business card with QR code
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        alert(
          "Unable to create canvas context. Please try another download option.",
        );
        return;
      }

      // Create a new image from the QR code
      const qrImage = new Image();
      qrImage.src = qrCode;

      qrImage.onload = () => {
        // Set canvas size for business card (standard size ratio)
        canvas.width = 1050;
        canvas.height = 600;

        // Fill background
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add red accent on left side
        ctx.fillStyle = "#f44336";
        ctx.fillRect(0, 0, 40, canvas.height);

        // Add Alliance Insurance logo/text
        ctx.fillStyle = "#f44336";
        ctx.font = "bold 40px Arial";
        ctx.fillText("ALLIANCE", 80, 80);
        ctx.fillStyle = "#424242";
        ctx.font = "30px Arial";
        ctx.fillText("INSURANCE", 270, 80);

        // Add agent name
        ctx.fillStyle = "#212121";
        ctx.font = "bold 48px Arial";
        ctx.fillText(name, 80, 180);

        // Add agent title
        ctx.fillStyle = "#616161";
        ctx.font = "32px Arial";
        ctx.fillText(title, 80, 230);

        // Draw QR code
        const qrSize = 250;
        ctx.drawImage(
          qrImage,
          canvas.width - qrSize - 80,
          (canvas.height - qrSize) / 2,
          qrSize,
          qrSize,
        );

        // Add "Scan to rate me" text
        ctx.fillStyle = "#616161";
        ctx.font = "24px Arial";
        ctx.fillText(
          "Scan to rate me",
          canvas.width - qrSize - 80,
          (canvas.height + qrSize) / 2 + 40,
        );

        // Add website and contact info
        ctx.fillStyle = "#616161";
        ctx.font = "24px Arial";
        ctx.fillText("alliance-insurance.com", 80, canvas.height - 120);
        ctx.fillText("Find My Agent Platform", 80, canvas.height - 80);

        // Convert canvas to image and trigger download
        link.href = canvas.toDataURL("image/png");
        link.download = `${name.replace(/\s+/g, "_")}_BusinessCard.png`;
        link.click();
      };

      // Handle potential errors
      qrImage.onerror = () => {
        alert("Error loading QR code image. Please try again.");
      };

      // Start loading the image
      return;
    }

    // Trigger download for QR-only option
    link.click();
  };

  const shareQRCode = async () => {
    try {
      if (navigator.share) {
        const blob = await fetch(qrCode).then((r) => r.blob());
        const file = new File(
          [blob],
          `${name.replace(/\s+/g, "_")}_QRCode.png`,
          { type: "image/png" },
        );

        await navigator.share({
          title: `${name} - Alliance Insurance Agent QR Code`,
          text: "Scan this QR code to rate my service at Alliance Insurance.",
          files: [file],
        });
      } else {
        // Fallback for browsers that don't support sharing
        alert(
          "Sharing is not supported on your browser. Please use the download option instead.",
        );
      }
    } catch (error) {
      console.error("Error sharing QR code:", error);
      alert("Failed to share QR code. Please try downloading instead.");
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6 border-b border-alliance-gray-200">
        <h2 className="text-lg font-medium text-alliance-gray-900">
          Your Rating QR Code
        </h2>
        <p className="mt-1 text-sm text-alliance-gray-500">
          When scanned, this QR code will direct clients to your rating page
        </p>
      </div>

      <div className="p-6 flex flex-col items-center">
        <div className="w-64 h-64 relative mb-4">
          {qrCode && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrCode}
              alt="Agent QR Code"
              className="w-full h-full object-contain"
            />
          )}
        </div>

        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-alliance-gray-900">
            {name}
          </h3>
          <p className="text-alliance-gray-600">{title}</p>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-4">
            <label className="block text-sm font-medium text-alliance-gray-700 mb-2">
              Download Options
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="downloadType"
                  value="qr"
                  checked={downloadType === "qr"}
                  onChange={() => setDownloadType("qr")}
                  className="h-4 w-4 text-alliance-red-600 border-alliance-gray-300 focus:ring-alliance-red-500"
                />
                <span className="ml-2 text-sm text-alliance-gray-700">
                  QR Code Only
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="downloadType"
                  value="card"
                  checked={downloadType === "card"}
                  onChange={() => setDownloadType("card")}
                  className="h-4 w-4 text-alliance-red-600 border-alliance-gray-300 focus:ring-alliance-red-500"
                />
                <span className="ml-2 text-sm text-alliance-gray-700">
                  Business Card with QR
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Button onClick={handleDownload} variant="primary" fullWidth>
              Download
            </Button>
            {navigator.share && (
              <Button onClick={shareQRCode} variant="outline" fullWidth>
                Share
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplay;

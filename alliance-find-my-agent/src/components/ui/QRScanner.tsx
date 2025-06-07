'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Button from './Button';

interface QRScannerProps {
  onScanSuccess: (result: string) => void;
  onScanError?: (error: string) => void;
  width?: string;
  height?: string;
}

const QRScanner: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onScanError,
  width = '100%',
  height = '300px',
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanner = async () => {
    if (!containerRef.current) return;

    const containerId = 'qr-scanner-container';
    try {
      // Initialize scanner
      scannerRef.current = new Html5Qrcode(containerId);

      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setHasCamera(true);
        setIsScanning(true);

        // Start scanning with the first camera
        await scannerRef.current.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScanSuccess(decodedText);
            if (scannerRef.current) {
              scannerRef.current.stop().catch(console.error);
              setIsScanning(false);
            }
          },
          (errorMessage) => {
            // QR code not detected yet - we can ignore this
          }
        );
      } else {
        setHasCamera(false);
        setError('No camera devices found');
        if (onScanError) onScanError('No camera devices found');
      }
    } catch (err) {
      setError('Error accessing camera: ' + (err instanceof Error ? err.message : String(err)));
      if (onScanError) onScanError('Error accessing camera');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isScanning]);

  return (
    <div className="flex flex-col items-center">
      <div
        id="qr-scanner-container"
        ref={containerRef}
        style={{ width, height }}
        className={`bg-alliance-gray-100 rounded-lg overflow-hidden relative flex items-center justify-center ${
          isScanning ? 'border-2 border-alliance-red-500' : 'border border-alliance-gray-300'
        }`}
      >
        {!isScanning && !error && (
          <div className="text-center p-4">
            <p className="text-alliance-gray-600 mb-4">
              {hasCamera
                ? 'Camera access required to scan QR codes'
                : 'No camera found on your device'}
            </p>
          </div>
        )}

        {error && (
          <div className="text-center p-4 text-red-500">
            <p>{error}</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex space-x-4">
        {!isScanning ? (
          <Button onClick={startScanner} disabled={!hasCamera || !!error}>
            Start Scanning
          </Button>
        ) : (
          <Button onClick={stopScanner} variant="secondary">
            Stop Scanning
          </Button>
        )}
      </div>

      <div className="mt-4 text-alliance-gray-600 text-sm text-center max-w-md">
        <p>Position the QR code in the center of the camera view to scan.</p>
      </div>
    </div>
  );
};

export default QRScanner;
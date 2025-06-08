'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  const [isInitialized, setIsInitialized] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupInProgressRef = useRef(false);
  const mountedRef = useRef(true);

  // Create a portal container that's completely outside React's control
  const portalContainerRef = useRef<HTMLDivElement | null>(null);
  const scannerId = useRef(`qr-scanner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Force cleanup function that bypasses React
  const forceCleanup = useCallback(() => {
    if (cleanupInProgressRef.current) return;
    cleanupInProgressRef.current = true;

    try {
      // Clear scanner reference immediately
      const scanner = scannerRef.current;
      scannerRef.current = null;

      if (scanner) {
        // Try to stop scanner without awaiting
        scanner.stop().catch(() => {
          // If normal stop fails, try to clear the scanner's internal state
          try {
            // Access internal elements directly and clear them
            const element = document.getElementById(scannerId.current);
            if (element) {
              element.innerHTML = '';
            }
          } catch (e) {
            console.warn('Force cleanup had issues:', e);
          }
        });
      }

      // Clear the portal container
      if (portalContainerRef.current) {
        try {
          portalContainerRef.current.innerHTML = '';
        } catch (e) {
          console.warn('Error clearing portal container:', e);
        }
      }

      if (mountedRef.current) {
        setIsScanning(false);
        setIsInitialized(false);
      }
    } catch (error) {
      console.warn('Error during force cleanup:', error);
    } finally {
      cleanupInProgressRef.current = false;
    }
  }, []);

  // Create portal container on mount
  useEffect(() => {
    if (!containerRef.current) return;

    // Create a div that will hold the scanner, completely managed outside React
    const portalDiv = document.createElement('div');
    portalDiv.id = scannerId.current;
    portalDiv.style.width = '100%';
    portalDiv.style.height = '100%';
    
    portalContainerRef.current = portalDiv;
    containerRef.current.appendChild(portalDiv);

    return () => {
      forceCleanup();
      if (portalContainerRef.current && containerRef.current) {
        try {
          containerRef.current.removeChild(portalContainerRef.current);
        } catch (e) {
          // Element may already be removed
        }
      }
      portalContainerRef.current = null;
    };
  }, [forceCleanup]);

  const initializeScanner = useCallback(async () => {
    if (!mountedRef.current || isInitialized || cleanupInProgressRef.current || !portalContainerRef.current) {
      return;
    }

    try {
      setError(null);
      
      // Create new scanner instance
      const scanner = new Html5Qrcode(scannerId.current);
      scannerRef.current = scanner;

      // Check for cameras
      const devices = await Html5Qrcode.getCameras();
      
      if (!mountedRef.current) return;

      if (devices && devices.length > 0) {
        setHasCamera(true);
        setIsInitialized(true);
      } else {
        setHasCamera(false);
        setError('No camera devices found');
        if (onScanError) onScanError('No camera devices found');
      }
    } catch (err) {
      if (!mountedRef.current) return;
      
      console.error('Error initializing scanner:', err);
      setError('Error initializing camera: ' + (err instanceof Error ? err.message : String(err)));
      if (onScanError) onScanError('Error initializing camera');
      setIsInitialized(false);
    }
  }, [isInitialized, onScanError]);

  const startScanner = useCallback(async () => {
    if (!mountedRef.current || !scannerRef.current || isScanning || !hasCamera || cleanupInProgressRef.current) {
      return;
    }

    try {
      setIsScanning(true);
      setError(null);

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          if (mountedRef.current) {
            onScanSuccess(decodedText);
          }
        },
        (errorMessage) => {
          // QR code not detected - normal operation
        }
      );
    } catch (err) {
      if (!mountedRef.current) return;
      
      console.error('Error starting scanner:', err);
      setError('Error accessing camera: ' + (err instanceof Error ? err.message : String(err)));
      if (onScanError) onScanError('Error accessing camera');
      setIsScanning(false);
    }
  }, [isScanning, hasCamera, onScanSuccess, onScanError]);

  const stopScanner = useCallback(async () => {
    if (!scannerRef.current || !isScanning || cleanupInProgressRef.current) {
      return;
    }

    try {
      await scannerRef.current.stop();
      if (mountedRef.current) {
        setIsScanning(false);
      }
    } catch (err) {
      console.error('Error stopping scanner:', err);
      // Force stop anyway
      if (mountedRef.current) {
        setIsScanning(false);
      }
    }
  }, [isScanning]);

  // Initialize scanner when portal is ready
  useEffect(() => {
    if (portalContainerRef.current && !isInitialized) {
      // Small delay to ensure DOM is stable
      const timer = setTimeout(() => {
        initializeScanner();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [initializeScanner, isInitialized]);

  // Track mounted state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isScanning) {
        stopScanner();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isScanning, stopScanner]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      forceCleanup();
    };
  }, [forceCleanup]);

  return (
    <div className="flex flex-col items-center">
      <div
        ref={containerRef}
        style={{ width, height }}
        className={`bg-alliance-gray-100 rounded-lg overflow-hidden relative flex items-center justify-center ${
          isScanning ? 'border-2 border-alliance-red-500' : 'border border-alliance-gray-300'
        }`}
      >
        {/* Show loading/status messages only when scanner is not active */}
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-alliance-gray-100 z-10">
            {error ? (
              <div className="text-center p-4 text-red-500">
                <p>{error}</p>
              </div>
            ) : !isInitialized ? (
              <div className="text-center p-4">
                <p className="text-alliance-gray-600">Initializing camera...</p>
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-alliance-gray-600 mb-4">
                  {hasCamera
                    ? 'Camera ready. Click start to begin scanning.'
                    : 'No camera found on your device'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex space-x-4">
        {!isScanning ? (
          <Button 
            onClick={startScanner} 
            disabled={!hasCamera || !!error || !isInitialized}
          >
            {isInitialized ? 'Start Scanning' : 'Initializing...'}
          </Button>
        ) : (
          <Button onClick={stopScanner} variant="secondary">
            Stop Scanning
          </Button>
        )}
        
        {error && (
          <Button 
            onClick={() => {
              forceCleanup();
              setTimeout(initializeScanner, 200);
            }} 
            variant="outline"
          >
            Retry
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
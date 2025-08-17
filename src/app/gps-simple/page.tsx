"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SimpleGPSTest() {
  const [location, setLocation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
    console.log(`[GPS Test] ${message}`);
  };

  useEffect(() => {
    addLog('Component mounted');
    addLog(`Geolocation supported: ${!!navigator.geolocation}`);
    addLog(`User agent: ${navigator.userAgent}`);
    addLog(`Protocol: ${window.location.protocol}`);
    addLog(`Host: ${window.location.host}`);
  }, []);

  const testLocation = async () => {
    addLog('Starting location test...');
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by this browser';
      setError(errorMsg);
      addLog(`ERROR: ${errorMsg}`);
      setLoading(false);
      return;
    }

    addLog('Geolocation API available');

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    addLog(`Options: ${JSON.stringify(options)}`);

    try {
      addLog('Calling getCurrentPosition...');
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            addLog('SUCCESS: Position obtained');
            resolve(pos);
          },
          (err) => {
            addLog(`ERROR: ${err.message} (code: ${err.code})`);
            reject(err);
          },
          options
        );
      });

      const locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: new Date(position.timestamp).toISOString()
      };

      setLocation(locationData);
      addLog(`Location: ${locationData.latitude}, ${locationData.longitude}`);
      addLog(`Accuracy: ±${Math.round(locationData.accuracy)}m`);

    } catch (err: any) {
      let errorMessage = 'Unknown error';
      
      if (err.code) {
        switch (err.code) {
          case 1:
            errorMessage = 'Permission denied - user refused location access';
            break;
          case 2:
            errorMessage = 'Position unavailable - location information not available';
            break;
          case 3:
            errorMessage = 'Timeout - location request timed out';
            break;
          default:
            errorMessage = `Geolocation error code ${err.code}: ${err.message}`;
        }
      } else {
        errorMessage = err.message || 'Unknown location error';
      }

      setError(errorMessage);
      addLog(`FINAL ERROR: ${errorMessage}`);
    } finally {
      setLoading(false);
      addLog('Location test completed');
    }
  };

  const testPermissions = async () => {
    addLog('Testing permissions...');
    
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        addLog(`Permission state: ${result.state}`);
        
        result.addEventListener('change', () => {
          addLog(`Permission changed to: ${result.state}`);
        });
      } catch (err) {
        addLog(`Permission query failed: ${err}`);
      }
    } else {
      addLog('Permissions API not supported');
    }
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('Logs cleared');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Simple GPS Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={testLocation} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Getting Location...' : 'Test GPS'}
              </Button>
              <Button 
                onClick={testPermissions} 
                variant="outline"
              >
                Check Permissions
              </Button>
              <Button 
                onClick={clearLogs} 
                variant="outline"
                size="sm"
              >
                Clear Logs
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <h3 className="font-medium text-red-900">Error:</h3>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {location && (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <h3 className="font-medium text-green-900 mb-2">Location Found:</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Latitude:</strong> {location.latitude}</p>
                  <p><strong>Longitude:</strong> {location.longitude}</p>
                  <p><strong>Accuracy:</strong> ±{Math.round(location.accuracy)}m</p>
                  {location.altitude && <p><strong>Altitude:</strong> {Math.round(location.altitude)}m</p>}
                  <p><strong>Timestamp:</strong> {location.timestamp}</p>
                </div>
                <div className="mt-2">
                  <a 
                    href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View on Google Maps →
                  </a>
                </div>
              </div>
            )}

            <div className="bg-gray-50 border rounded p-3">
              <h3 className="font-medium text-gray-900 mb-2">Debug Logs:</h3>
              <div className="text-xs font-mono space-y-1 max-h-60 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="text-gray-700">{log}</div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

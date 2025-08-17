"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Navigation,
  RefreshCw
} from 'lucide-react';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

export default function GPSTest() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [watchId, setWatchId] = useState<number | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);

  // Check geolocation support
  const isGeolocationSupported = 'geolocation' in navigator;

  // Check permission status
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionStatus(result.state);
        
        result.addEventListener('change', () => {
          setPermissionStatus(result.state);
        });
      });
    }
  }, []);

  // Get current location once
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError(null);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0 // Always get fresh location
    };

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude || undefined,
        altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined,
        timestamp: new Date().toISOString()
      };

      setLocation(locationData);
      setLocationHistory(prev => [locationData, ...prev.slice(0, 4)]); // Keep last 5
      
    } catch (err: any) {
      let errorMessage = 'Unknown location error';
      
      if (err.code) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }
      } else {
        errorMessage = err.message || 'Failed to get location';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Start watching location
  const startWatching = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000 // 5 seconds
    };

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: new Date().toISOString()
        };

        setLocation(locationData);
        setLocationHistory(prev => [locationData, ...prev.slice(0, 9)]); // Keep last 10
        setError(null);
      },
      (err) => {
        console.error('Watch position error:', err);
        setError(`Watch error: ${err.message}`);
      },
      options
    );

    setWatchId(id);
  };

  // Stop watching location
  const stopWatching = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  // Test API call
  const testAPICall = async () => {
    if (!location) {
      alert('No location available to test');
      return;
    }

    try {
      const response = await fetch('/api/crew/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crew_member_id: 1, // Test crew member
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            timestamp: location.timestamp
          },
          activity_type: 'location_update'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('API test successful!');
      } else {
        alert(`API test failed: ${result.error}`);
      }
    } catch (error) {
      alert(`API test error: ${error}`);
    }
  };

  const formatCoordinate = (coord: number, decimals: number = 6) => {
    return coord.toFixed(decimals);
  };

  const getPermissionBadge = () => {
    switch (permissionStatus) {
      case 'granted':
        return <Badge className="bg-green-100 text-green-800">Granted</Badge>;
      case 'denied':
        return <Badge className="bg-red-100 text-red-800">Denied</Badge>;
      case 'prompt':
        return <Badge className="bg-yellow-100 text-yellow-800">Prompt</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              GPS Location Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Browser Support */}
            <div className="flex items-center justify-between">
              <span className="font-medium">Geolocation Support:</span>
              {isGeolocationSupported ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Supported
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Not Supported
                </Badge>
              )}
            </div>

            {/* Permission Status */}
            <div className="flex items-center justify-between">
              <span className="font-medium">Permission Status:</span>
              {getPermissionBadge()}
            </div>

            {/* Controls */}
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={getCurrentLocation}
                disabled={loading || !isGeolocationSupported}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    Get Location
                  </>
                )}
              </Button>

              {watchId === null ? (
                <Button
                  onClick={startWatching}
                  disabled={!isGeolocationSupported}
                  variant="outline"
                >
                  Start Watching
                </Button>
              ) : (
                <Button
                  onClick={stopWatching}
                  variant="outline"
                >
                  Stop Watching
                </Button>
              )}

              <Button
                onClick={testAPICall}
                disabled={!location}
                variant="secondary"
              >
                Test API
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-900 text-sm">Location Error</p>
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Current Location */}
            {location && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Current Location
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium">Latitude:</span>
                    <p className="font-mono">{formatCoordinate(location.latitude)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Longitude:</span>
                    <p className="font-mono">{formatCoordinate(location.longitude)}</p>
                  </div>
                  {location.accuracy && (
                    <div>
                      <span className="font-medium">Accuracy:</span>
                      <p>±{Math.round(location.accuracy)}m</p>
                    </div>
                  )}
                  {location.altitude && (
                    <div>
                      <span className="font-medium">Altitude:</span>
                      <p>{Math.round(location.altitude)}m</p>
                    </div>
                  )}
                  {location.speed !== undefined && (
                    <div>
                      <span className="font-medium">Speed:</span>
                      <p>{location.speed ? `${(location.speed * 3.6).toFixed(1)} km/h` : '0 km/h'}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="font-medium">Timestamp:</span>
                    <p className="font-mono text-xs">{new Date(location.timestamp).toLocaleString()}</p>
                  </div>
                </div>

                {/* Google Maps Link */}
                <div className="mt-3">
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

            {/* Location History */}
            {locationHistory.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Location History ({locationHistory.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {locationHistory.map((loc, index) => (
                    <div key={index} className="bg-gray-50 rounded p-2 text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono">
                            {formatCoordinate(loc.latitude, 4)}, {formatCoordinate(loc.longitude, 4)}
                          </span>
                          {loc.accuracy && (
                            <span className="text-gray-600 ml-2">±{Math.round(loc.accuracy)}m</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(loc.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p><strong>1.</strong> Make sure you're using HTTPS (required for geolocation)</p>
            <p><strong>2.</strong> Allow location permissions when prompted</p>
            <p><strong>3.</strong> Test "Get Location" for one-time location</p>
            <p><strong>4.</strong> Test "Start Watching" for continuous location updates</p>
            <p><strong>5.</strong> Test "Test API" to verify backend integration</p>
            <p><strong>6.</strong> Check accuracy - should be under 50m for good GPS</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

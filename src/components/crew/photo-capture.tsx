"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Upload, 
  X, 
  RotateCcw, 
  Check,
  AlertCircle,
  ImageIcon
} from 'lucide-react';

interface PhotoCaptureProps {
  jobId?: number;
  onPhotosCapture: (photos: CapturedPhoto[]) => void;
  onClose: () => void;
  maxPhotos?: number;
  photoType?: 'before' | 'after' | 'general';
}

interface CapturedPhoto {
  id: string;
  file: File;
  dataUrl: string;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  type: 'before' | 'after' | 'general';
}

export default function PhotoCapture({ 
  jobId, 
  onPhotosCapture, 
  onClose, 
  maxPhotos = 10,
  photoType = 'general'
}: PhotoCaptureProps) {
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get current location for GPS metadata
  const getCurrentLocation = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation(position);
          resolve(position);
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }, []);

  // Start camera for live capture
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsCapturing(true);

      // Get location first
      try {
        await getCurrentLocation();
      } catch (locError) {
        console.warn('Location not available:', locError);
      }

      // Start camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err: any) {
      setError(`Camera access failed: ${err.message}`);
      setIsCapturing(false);
    }
  }, [getCurrentLocation]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  }, []);

  // Capture photo from video stream
  const captureFromCamera = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

      const photo: CapturedPhoto = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        dataUrl,
        timestamp: new Date().toISOString(),
        location: currentLocation ? {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          accuracy: currentLocation.coords.accuracy
        } : undefined,
        type: photoType
      };

      setPhotos(prev => [...prev, photo]);
      stopCamera();
    }, 'image/jpeg', 0.8);
  }, [currentLocation, photoType, stopCamera]);

  // Handle file input (for upload from gallery)
  const handleFileInput = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Get location for uploaded photos too
    let location: GeolocationPosition | null = null;
    try {
      location = await getCurrentLocation();
    } catch (err) {
      console.warn('Location not available for uploaded photo');
    }

    Array.from(files).forEach((file) => {
      if (photos.length >= maxPhotos) {
        setError(`Maximum ${maxPhotos} photos allowed`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        const photo: CapturedPhoto = {
          id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          dataUrl,
          timestamp: new Date().toISOString(),
          location: location ? {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy
          } : undefined,
          type: photoType
        };

        setPhotos(prev => [...prev, photo]);
      };
      reader.readAsDataURL(file);
    });

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [photos.length, maxPhotos, getCurrentLocation, photoType]);

  // Remove photo
  const removePhoto = useCallback((photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  }, []);

  // Submit photos
  const handleSubmit = useCallback(() => {
    if (photos.length === 0) {
      setError('Please capture at least one photo');
      return;
    }

    onPhotosCapture(photos);
    onClose();
  }, [photos, onPhotosCapture, onClose]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const getPhotoTypeColor = (type: string) => {
    switch (type) {
      case 'before': return 'bg-blue-100 text-blue-800';
      case 'after': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Photo Capture
              <Badge className={getPhotoTypeColor(photoType)}>
                {photoType}
              </Badge>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          {jobId && (
            <p className="text-sm text-gray-600">Job #{jobId}</p>
          )}
        </CardHeader>

        <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          )}

          {/* Camera View */}
          {isCapturing && (
            <div className="space-y-3">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg bg-gray-900"
                style={{ aspectRatio: '16/9' }}
              />
              <div className="flex gap-2">
                <Button
                  onClick={captureFromCamera}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture
                </Button>
                <Button
                  variant="outline"
                  onClick={stopCamera}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isCapturing && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={startCamera}
                variant="outline"
                className="flex flex-col items-center gap-2 h-20"
              >
                <Camera className="w-6 h-6" />
                <span className="text-sm">Take Photo</span>
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex flex-col items-center gap-2 h-20"
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm">Upload</span>
              </Button>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />

          {/* Canvas for photo capture (hidden) */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Photo Gallery */}
          {photos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  Captured Photos ({photos.length}/{maxPhotos})
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.dataUrl}
                      alt="Captured"
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <div className="absolute bottom-1 left-1">
                      <Badge className="text-xs bg-black bg-opacity-50 text-white">
                        {photo.location ? '📍' : '📷'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={photos.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Save Photos ({photos.length})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

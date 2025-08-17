"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Navigation,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Camera,
  Phone,
  MessageSquare,
  RefreshCw,
  ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';
import PhotoCapture from './photo-capture';

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  timestamp: string;
}

interface CrewMember {
  id: number;
  name: string;
  email: string;
  status: 'available' | 'on_job' | 'break' | 'off_duty' | 'unavailable';
  latest_location?: Location;
  active_time_entry?: any;
  is_clocked_in: boolean;
}

interface Job {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  service_type: string;
  cleaning_type: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  status: string;
  special_instructions?: string;
  ai_briefing?: string;
  home_size: number;
  bedrooms: number;
  bathrooms: number;
  add_ons: string[];
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

export default function MobileCrewDashboard() {
  const [currentUser, setCurrentUser] = useState<CrewMember | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [checkingIn, setCheckingIn] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [serviceNotes, setServiceNotes] = useState('');
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [photoJobId, setPhotoJobId] = useState<number | null>(null);
  const [photoType, setPhotoType] = useState<'before' | 'after' | 'general'>('general');
  const [jobPhotos, setJobPhotos] = useState<Record<number, CapturedPhoto[]>>({});

  // Mock current user - in production, get from authentication
  const CURRENT_USER_ID = 1;

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get current location
  const getCurrentLocation = useCallback((): Promise<Location> => {
    return new Promise((resolve, reject) => {
      console.log('🌍 [GPS] getCurrentLocation called');
      
      if (!navigator.geolocation) {
        console.error('🌍 [GPS] Geolocation not supported');
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout
        maximumAge: 0 // Always get fresh location
      };

      console.log('🌍 [GPS] Calling navigator.geolocation.getCurrentPosition with options:', options);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('🌍 [GPS] Position received:', position);
          
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };
          
          console.log('🌍 [GPS] Location object created:', location);
          resolve(location);
        },
        (error) => {
          console.error('🌍 [GPS] Geolocation error:', error);
          console.error('🌍 [GPS] Error code:', error.code);
          console.error('🌍 [GPS] Error message:', error.message);
          
          let errorMessage = 'Unknown location error';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user. Please enable location permissions.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please check your GPS settings.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = `Geolocation error (${error.code}): ${error.message}`;
          }
          
          console.error('🌍 [GPS] Final error message:', errorMessage);
          reject(new Error(errorMessage));
        },
        options
      );
    });
  }, []);

  // Fetch crew member status
  const fetchCrewStatus = useCallback(async () => {
    try {
      console.log('👤 [CREW] Fetching crew status for ID:', CURRENT_USER_ID);
      const response = await fetch(`/api/crew/checkin?crew_member_id=${CURRENT_USER_ID}`);
      const data = await response.json();
      
      console.log('👤 [CREW] Crew status response:', data);
      
      if (data.success) {
        const userData = {
          ...data.crew_member,
          latest_location: data.latest_location,
          active_time_entry: data.active_time_entry,
          is_clocked_in: !data.can_clock_in
        };
        
        console.log('👤 [CREW] Setting current user:', userData);
        setCurrentUser(userData);
      } else {
        console.error('👤 [CREW] Failed to fetch crew status:', data.error);
      }
    } catch (error) {
      console.error('👤 [CREW] Error fetching crew status:', error);
    }
  }, []);

  // Fetch today's jobs
  const fetchTodaysJobs = useCallback(async () => {
    try {
      const response = await fetch('/api/crew/jobs');
      const data = await response.json();
      
      if (data.success) {
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchCrewStatus(),
          fetchTodaysJobs()
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchCrewStatus, fetchTodaysJobs]);

  // Get location on component mount
  useEffect(() => {
    const initLocation = async () => {
      try {
        console.log('🌍 [GPS] Requesting location permission...');
        console.log('🌍 [GPS] Geolocation supported:', !!navigator.geolocation);
        console.log('🌍 [GPS] Protocol:', window.location.protocol);
        
        if (!navigator.geolocation) {
          throw new Error('Geolocation is not supported by this browser');
        }

        const loc = await getCurrentLocation();
        console.log('🌍 [GPS] Location obtained successfully:', loc);
        setLocation(loc);
        setLocationError(null);
      } catch (error: any) {
        console.error('🌍 [GPS] Location error:', error);
        setLocationError(error.message);
        
        // Show user-friendly error message
        if (error.message.includes('denied')) {
          alert('Location access denied. Please enable location permissions in your browser settings and refresh the page.');
        } else if (error.message.includes('timeout')) {
          alert('Location request timed out. Please ensure GPS is enabled and try again.');
        }
      }
    };

    // Add a small delay to ensure component is fully mounted
    const timer = setTimeout(initLocation, 100);
    return () => clearTimeout(timer);
  }, [getCurrentLocation]);

  // Handle check-in/out
  const handleCheckInOut = async (activityType: 'clock_in' | 'clock_out', bookingId?: number) => {
    console.log(`Attempting ${activityType} for crew member ${CURRENT_USER_ID}`);
    
    if (!location && activityType === 'clock_in') {
      alert('Location is required for check-in. Please enable location services.');
      return;
    }

    setCheckingIn(true);
    try {
      // Get fresh location for accuracy
      console.log('Getting fresh location...');
      const currentLocation = await getCurrentLocation();
      console.log('Fresh location obtained:', currentLocation);
      
      const requestBody = {
        crew_member_id: CURRENT_USER_ID,
        booking_id: bookingId,
        location: currentLocation,
        activity_type: activityType,
        notes: activityType === 'clock_out' ? serviceNotes : undefined
      };
      
      console.log('Sending check-in request:', requestBody);
      
      const response = await fetch('/api/crew/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log('Check-in response:', result);
      
      if (result.success) {
        // Update local location
        setLocation(currentLocation);
        
        // Refresh crew status
        await fetchCrewStatus();
        
        // Show success message
        alert(result.message);
        
        // Clear notes if clocking out
        if (activityType === 'clock_out') {
          setServiceNotes('');
          setSelectedJob(null);
        }
      } else {
        console.error('Check-in failed:', result);
        alert(result.error || 'Check-in/out failed');
      }
    } catch (error) {
      console.error('Check-in/out error:', error);
      alert(`Network error: ${error}. Please try again.`);
    } finally {
      setCheckingIn(false);
    }
  };

  // Handle photo capture
  const handlePhotoCapture = useCallback((jobId: number, type: 'before' | 'after' | 'general') => {
    setPhotoJobId(jobId);
    setPhotoType(type);
    setShowPhotoCapture(true);
  }, []);

  // Handle photos captured
  const handlePhotosCapture = useCallback((photos: CapturedPhoto[]) => {
    if (photoJobId) {
      setJobPhotos(prev => ({
        ...prev,
        [photoJobId]: [...(prev[photoJobId] || []), ...photos]
      }));
    }
    setShowPhotoCapture(false);
    setPhotoJobId(null);
  }, [photoJobId]);

  // Upload photos to server
  const uploadPhotos = useCallback(async (jobId: number, photos: CapturedPhoto[]) => {
    try {
      const formData = new FormData();
      
      photos.forEach((photo, index) => {
        formData.append(`photos`, photo.file);
        formData.append(`metadata_${index}`, JSON.stringify({
          id: photo.id,
          timestamp: photo.timestamp,
          location: photo.location,
          type: photo.type
        }));
      });

      const response = await fetch(`/api/bookings/${jobId}/photos`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload photos');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Photo upload error:', error);
      throw error;
    }
  }, []);

  // Handle job status updates
  const updateJobStatus = async (jobId: number, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setJobs(jobs.map(job => 
          job.id === jobId ? { ...job, status } : job
        ));
        
        // Record location for job activities
        if (location) {
          await fetch('/api/crew/checkin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              crew_member_id: CURRENT_USER_ID,
              booking_id: jobId,
              location,
              activity_type: status === 'in_progress' ? 'job_arrival' : 'job_departure'
            }),
          });
        }
      }
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'on_job': return 'bg-blue-100 text-blue-800';
      case 'break': return 'bg-yellow-100 text-yellow-800';
      case 'off_duty': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-4">
        {/* Status Bar */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${currentUser ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium">{currentUser?.name || 'Loading...'}</span>
              </div>
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-600" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-600" />
                )}
                <Signal className="w-4 h-4 text-gray-600" />
                <Battery className="w-4 h-4 text-gray-600" />
              </div>
            </div>
            
            {/* Debug Info */}
            <div className="mb-3 text-xs text-gray-500 space-y-1">
              <div>Protocol: {typeof window !== 'undefined' ? window.location.protocol : 'unknown'}</div>
              <div>GPS Support: {typeof navigator !== 'undefined' && navigator.geolocation ? '✅' : '❌'}</div>
              <div>User ID: {CURRENT_USER_ID}</div>
              <div>User Loaded: {currentUser ? '✅' : '❌'}</div>
              <div>Location: {location ? '✅' : locationError ? '❌' : '⏳'}</div>
            </div>
            
            <div className="flex items-center justify-between">
              <Badge className={getStatusColor(currentUser?.status || 'off_duty')}>
                {currentUser?.status?.replace('_', ' ') || 'Off Duty'}
              </Badge>
              <div className="text-sm text-gray-600">
                {format(new Date(), 'MMM d, h:mm a')}
              </div>
            </div>

            {location && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>
                    Location: {location.accuracy ? `±${Math.round(location.accuracy)}m` : 'Available'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      const newLocation = await getCurrentLocation();
                      setLocation(newLocation);
                      setLocationError(null);
                    } catch (error: any) {
                      setLocationError(error.message);
                    }
                  }}
                  className="text-xs h-6"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Refresh
                </Button>
              </div>
            )}

            {locationError && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{locationError}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Check-in/out Controls */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex gap-3">
              {!currentUser?.is_clocked_in ? (
                <Button
                  onClick={() => handleCheckInOut('clock_in')}
                  disabled={checkingIn || !location}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {checkingIn ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Checking In...
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Clock In
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => setSelectedJob({ id: 0 } as Job)} // Open clock-out modal
                  disabled={checkingIn}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Clock Out
                </Button>
              )}
            </div>

            {currentUser?.active_time_entry && (
              <div className="mt-3 text-sm text-gray-600 text-center">
                Clocked in at {format(new Date(currentUser.active_time_entry.clock_in_time), 'h:mm a')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Jobs */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Today's Jobs ({jobs.length})
          </h2>

          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onStatusUpdate={updateJobStatus}
              onSelect={setSelectedJob}
              onPhotoCapture={handlePhotoCapture}
              jobPhotos={jobPhotos[job.id] || []}
            />
          ))}

          {jobs.length === 0 && (
            <Card className="text-center py-8">
              <CardContent>
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No jobs scheduled
                </h3>
                <p className="text-gray-600">
                  Enjoy your day! Check back later for new assignments.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Clock Out Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Clock Out</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedJob(null)}
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="serviceNotes">End of Day Notes</Label>
                  <Textarea
                    id="serviceNotes"
                    value={serviceNotes}
                    onChange={(e) => setServiceNotes(e.target.value)}
                    placeholder="Any observations, issues, or notes for today..."
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleCheckInOut('clock_out')}
                    disabled={checkingIn}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {checkingIn ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Clocking Out...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Clock Out
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedJob(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Photo Capture Modal */}
        {showPhotoCapture && photoJobId && (
          <PhotoCapture
            jobId={photoJobId}
            photoType={photoType}
            onPhotosCapture={handlePhotosCapture}
            onClose={() => setShowPhotoCapture(false)}
          />
        )}
      </div>
    </div>
  );
}

function JobCard({ 
  job, 
  onStatusUpdate, 
  onSelect,
  onPhotoCapture,
  jobPhotos
}: { 
  job: Job; 
  onStatusUpdate: (id: number, status: string) => void;
  onSelect: (job: Job) => void;
  onPhotoCapture: (jobId: number, type: 'before' | 'after' | 'general') => void;
  jobPhotos: CapturedPhoto[];
}) {
  const [showBriefing, setShowBriefing] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{job.customer_name}</CardTitle>
            <p className="text-sm text-gray-600">
              {job.scheduled_time} • {job.duration_minutes} min
            </p>
          </div>
          <Badge className={getStatusColor(job.status)}>
            {job.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Address */}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p>{job.address}</p>
            <p className="text-gray-600">{job.city}, {job.state} {job.zip_code}</p>
          </div>
        </div>

        {/* Contact */}
        {job.customer_phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <a 
              href={`tel:${job.customer_phone}`}
              className="text-sm text-blue-600 hover:underline"
            >
              {job.customer_phone}
            </a>
          </div>
        )}

        {/* Service Details */}
        <div className="text-sm">
          <span className="font-medium capitalize">{job.service_type.replace('_', ' ')}</span>
          <span className="text-gray-600"> • </span>
          <span className="capitalize">{job.cleaning_type.replace('_', ' ')}</span>
        </div>

        <div className="text-sm text-gray-600">
          {job.home_size} sq ft • {job.bedrooms} bed • {job.bathrooms} bath
        </div>

        {/* Add-ons */}
        {job.add_ons.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.add_ons.map((addon) => (
              <Badge key={addon} variant="secondary" className="text-xs">
                {addon}
              </Badge>
            ))}
          </div>
        )}

        {/* AI Briefing */}
        {job.ai_briefing && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBriefing(!showBriefing)}
              className="w-full justify-start p-0 h-auto font-medium text-blue-900"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              AI Crew Briefing
            </Button>
            {showBriefing && (
              <div className="mt-2 text-sm text-blue-800 whitespace-pre-wrap">
                {job.ai_briefing}
              </div>
            )}
          </div>
        )}

        {/* Special Instructions */}
        {job.special_instructions && (
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-900 text-sm mb-1">
                  Special Instructions
                </p>
                <p className="text-sm text-yellow-800">
                  {job.special_instructions}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Photo Gallery */}
        {jobPhotos.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">
              Photos ({jobPhotos.length})
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {jobPhotos.slice(0, 4).map((photo) => (
                <div key={photo.id} className="relative">
                  <img
                    src={photo.dataUrl}
                    alt="Job photo"
                    className="w-full h-16 object-cover rounded border"
                  />
                  <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded-tl">
                    {photo.type === 'before' ? '📷' : photo.type === 'after' ? '✅' : '📸'}
                  </div>
                </div>
              ))}
              {jobPhotos.length > 4 && (
                <div className="w-full h-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-600">
                  +{jobPhotos.length - 4}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Photo Capture Buttons */}
        {(job.status === 'scheduled' || job.status === 'in_progress') && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPhotoCapture(job.id, 'before')}
              className="flex-1"
            >
              <Camera className="w-4 h-4 mr-1" />
              Before
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPhotoCapture(job.id, 'after')}
              className="flex-1"
            >
              <ImageIcon className="w-4 h-4 mr-1" />
              After
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {job.status === 'scheduled' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusUpdate(job.id, 'in_progress')}
              className="flex-1"
            >
              <Navigation className="w-4 h-4 mr-1" />
              Start Job
            </Button>
          )}
          
          {job.status === 'in_progress' && (
            <Button
              size="sm"
              onClick={() => onSelect(job)}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Complete
            </Button>
          )}
          
          {job.status === 'completed' && (
            <div className="flex-1 text-center py-2 text-sm text-gray-600">
              ✓ Completed
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

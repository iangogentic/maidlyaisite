"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Camera, 
  Image, 
  Grid3X3,
  Search,
  Filter,
  Download,
  Eye,
  MapPin,
  Calendar,
  User,
  Clock,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

import { Booking } from '@/lib/database-neon';

interface PhotoGalleryViewProps {
  bookings: Booking[];
}

interface PhotoData {
  id: string;
  filename: string;
  size: number;
  type: string;
  dataUrl: string;
  metadata: {
    id: string;
    timestamp: string;
    location?: {
      latitude: number;
      longitude: number;
      accuracy?: number;
    };
    type: 'before' | 'after' | 'general';
  };
  uploadedAt: string;
  booking: Booking;
}

export function PhotoGalleryView({ bookings }: PhotoGalleryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'before' | 'after' | 'general'>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoData | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Extract all photos from bookings
  const allPhotos = useMemo(() => {
    const photos: PhotoData[] = [];
    
    bookings.forEach(booking => {
      if (booking.photos && booking.photos.length > 0) {
        booking.photos.forEach(photo => {
          photos.push({
            ...photo,
            booking
          });
        });
      }
    });
    
    return photos.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }, [bookings]);

  // Filter photos based on search and type
  const filteredPhotos = useMemo(() => {
    return allPhotos.filter(photo => {
      const matchesSearch = searchQuery === '' || 
        photo.booking.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.booking.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.filename.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedType === 'all' || photo.metadata.type === selectedType;
      
      return matchesSearch && matchesType;
    });
  }, [allPhotos, searchQuery, selectedType]);

  // Photo statistics
  const photoStats = useMemo(() => {
    const stats = {
      total: allPhotos.length,
      before: allPhotos.filter(p => p.metadata.type === 'before').length,
      after: allPhotos.filter(p => p.metadata.type === 'after').length,
      general: allPhotos.filter(p => p.metadata.type === 'general').length,
      withLocation: allPhotos.filter(p => p.metadata.location).length,
      totalSize: allPhotos.reduce((sum, p) => sum + p.size, 0)
    };
    
    return stats;
  }, [allPhotos]);

  const getPhotoTypeColor = (type: string) => {
    switch (type) {
      case 'before': return 'bg-blue-100 text-blue-800';
      case 'after': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadPhoto = (photo: PhotoData) => {
    const link = document.createElement('a');
    link.href = photo.dataUrl;
    link.download = photo.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Photo Gallery</h2>
          <p className="text-gray-600">Manage service photos and documentation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Photos</p>
                <p className="text-2xl font-bold">{photoStats.total}</p>
              </div>
              <Camera className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Before Photos</p>
                <p className="text-2xl font-bold text-blue-600">{photoStats.before}</p>
              </div>
              <Image className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">After Photos</p>
                <p className="text-2xl font-bold text-green-600">{photoStats.after}</p>
              </div>
              <Image className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">General Photos</p>
                <p className="text-2xl font-bold text-gray-600">{photoStats.general}</p>
              </div>
              <Image className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With GPS</p>
                <p className="text-2xl font-bold text-purple-600">{photoStats.withLocation}</p>
              </div>
              <MapPin className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Size</p>
                <p className="text-lg font-bold">{formatFileSize(photoStats.totalSize)}</p>
              </div>
              <Download className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by customer, address, or filename..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('all')}
              >
                All ({photoStats.total})
              </Button>
              <Button
                variant={selectedType === 'before' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('before')}
              >
                Before ({photoStats.before})
              </Button>
              <Button
                variant={selectedType === 'after' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('after')}
              >
                After ({photoStats.after})
              </Button>
              <Button
                variant={selectedType === 'general' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('general')}
              >
                General ({photoStats.general})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Gallery */}
      {filteredPhotos.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
          : "space-y-4"
        }>
          {filteredPhotos.map((photo) => (
            <Card 
              key={photo.id} 
              className={`cursor-pointer hover:shadow-lg transition-shadow ${
                viewMode === 'list' ? 'p-4' : ''
              }`}
              onClick={() => setSelectedPhoto(photo)}
            >
              {viewMode === 'grid' ? (
                <div className="relative">
                  <img
                    src={photo.dataUrl}
                    alt={photo.filename}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={getPhotoTypeColor(photo.metadata.type)}>
                      {photo.metadata.type}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    {photo.metadata.location && (
                      <Badge className="bg-black bg-opacity-50 text-white">
                        <MapPin className="w-3 h-3 mr-1" />
                        GPS
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium truncate">{photo.booking.customer_name}</p>
                    <p className="text-xs text-gray-600 truncate">{photo.booking.address}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(photo.uploadedAt), 'MMM d, yyyy')}
                    </p>
                  </CardContent>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <img
                    src={photo.dataUrl}
                    alt={photo.filename}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{photo.booking.customer_name}</p>
                      <Badge className={getPhotoTypeColor(photo.metadata.type)}>
                        {photo.metadata.type}
                      </Badge>
                      {photo.metadata.location && (
                        <Badge variant="outline">
                          <MapPin className="w-3 h-3 mr-1" />
                          GPS
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{photo.booking.address}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(photo.uploadedAt), 'MMM d, yyyy h:mm a')} • {formatFileSize(photo.size)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadPhoto(photo);
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Photos Found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedType !== 'all' 
                ? 'No photos match your current filters.'
                : 'Photos will appear here once crew members start capturing service documentation.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Photo Details
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPhoto(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedPhoto.dataUrl}
                    alt={selectedPhoto.filename}
                    className="w-full rounded-lg border"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Photo Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <Badge className={getPhotoTypeColor(selectedPhoto.metadata.type)}>
                          {selectedPhoto.metadata.type}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Filename:</span>
                        <span>{selectedPhoto.filename}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span>{formatFileSize(selectedPhoto.size)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Uploaded:</span>
                        <span>{format(new Date(selectedPhoto.uploadedAt), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Job Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer:</span>
                        <span>{selectedPhoto.booking.customer_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service:</span>
                        <span>{selectedPhoto.booking.service_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Address:</span>
                        <span className="text-right">{selectedPhoto.booking.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span>{selectedPhoto.booking.scheduled_date}</span>
                      </div>
                    </div>
                  </div>

                  {selectedPhoto.metadata.location && (
                    <div>
                      <h3 className="font-semibold mb-2">GPS Location</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Latitude:</span>
                          <span>{selectedPhoto.metadata.location.latitude.toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Longitude:</span>
                          <span>{selectedPhoto.metadata.location.longitude.toFixed(6)}</span>
                        </div>
                        {selectedPhoto.metadata.location.accuracy && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Accuracy:</span>
                            <span>±{Math.round(selectedPhoto.metadata.location.accuracy)}m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => downloadPhoto(selectedPhoto)}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

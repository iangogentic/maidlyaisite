"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock,
  MapPin,
  User,
  Phone,
  DollarSign,
  Users,
  AlertTriangle,
  AlertCircle,
  CheckSquare,
  Square,
  Eye,
  UserCheck
} from 'lucide-react';

import { Booking } from '@/lib/database-neon';

interface SelectableBookingCardProps {
  booking: Booking;
  isSelected: boolean;
  onSelect: (bookingId: number, selected: boolean) => void;
  onClick?: () => void;
  onAssignCrew?: (booking: Booking) => void;
  hasConflicts?: boolean;
  conflictSeverity?: 'low' | 'medium' | 'high' | 'critical' | null;
  conflictCount?: number;
  compact?: boolean;
}

export function SelectableBookingCard({ 
  booking, 
  isSelected,
  onSelect,
  onClick,
  onAssignCrew,
  hasConflicts = false,
  conflictSeverity = null,
  conflictCount = 0,
  compact = false
}: SelectableBookingCardProps) {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConflictIndicator = () => {
    if (!hasConflicts || !conflictSeverity) return null;
    
    const severityConfig = {
      low: { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
      medium: { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-50' },
      high: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' },
      critical: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' }
    };
    
    const config = severityConfig[conflictSeverity];
    const Icon = config.icon;
    
    return (
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${config.bg}`}>
        <Icon className={`h-3 w-3 ${config.color}`} />
        <span className={`text-xs font-medium ${config.color}`}>
          {conflictCount} conflict{conflictCount !== 1 ? 's' : ''}
        </span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on the checkbox or action buttons
    if ((e.target as HTMLElement).closest('.checkbox-area') || 
        (e.target as HTMLElement).closest('.action-buttons')) {
      return;
    }
    onClick?.();
  };

  const handleSelectChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (booking.id) {
      onSelect(booking.id, !isSelected);
    }
  };

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
      } ${hasConflicts ? 'border-l-4 border-l-orange-400' : ''}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          {/* Selection Checkbox */}
          <div className="checkbox-area flex items-start space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectChange}
              className="p-1 h-auto"
            >
              {isSelected ? (
                <CheckSquare className="h-4 w-4 text-blue-600" />
              ) : (
                <Square className="h-4 w-4 text-gray-400" />
              )}
            </Button>

            {/* Booking Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {booking.customer_name}
                </h3>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status}
                </Badge>
                {getConflictIndicator()}
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(booking.scheduled_date)} at {formatTime(booking.scheduled_time)}</span>
                  </div>
                  {booking.price_cents && (
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-3 w-3" />
                      <span>{formatPrice(booking.price_cents)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">
                    {booking.address}, {booking.city}
                  </span>
                </div>

                {!compact && (
                  <>
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{booking.service_type} • {booking.bedrooms}BR/{booking.bathrooms}BA</span>
                    </div>

                    {booking.customer_phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{booking.customer_phone}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons flex items-center space-x-2 ml-4">
            {!compact && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick?.();
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssignCrew?.(booking);
                  }}
                >
                  <UserCheck className="h-3 w-3 mr-1" />
                  Assign
                </Button>
              </>
            )}

            {/* Crew assignment display - to be implemented when database schema supports it */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

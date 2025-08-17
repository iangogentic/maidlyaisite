"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock,
  MapPin,
  User,
  Phone,
  DollarSign,
  GripVertical,
  Users,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';

import { Booking } from '@/lib/database-neon';

interface DraggableBookingCardProps {
  booking: Booking;
  compact?: boolean;
  isDragging?: boolean;
  onClick?: () => void;
  onAssignCrew?: (booking: Booking) => void;
  hasConflicts?: boolean;
  conflictSeverity?: 'low' | 'medium' | 'high' | 'critical' | null;
  conflictCount?: number;
}

export function DraggableBookingCard({ 
  booking, 
  compact = false, 
  isDragging = false,
  onClick,
  onAssignCrew,
  hasConflicts = false,
  conflictSeverity = null,
  conflictCount = 0
}: DraggableBookingCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: booking.id?.toString() || `booking-${Math.random()}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format time for display
  const formatTime = (timeStr: string) => {
    try {
      return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
    } catch {
      return timeStr;
    }
  };

  // Get conflict indicator color and icon
  const getConflictIndicator = () => {
    if (!hasConflicts || !conflictSeverity) return null;
    
    switch (conflictSeverity) {
      case 'critical':
        return { 
          icon: <AlertTriangle className="h-3 w-3" />, 
          color: 'text-red-600 bg-red-100 border-red-200',
          bgOverlay: 'border-red-300 bg-red-50'
        };
      case 'high':
        return { 
          icon: <AlertTriangle className="h-3 w-3" />, 
          color: 'text-orange-600 bg-orange-100 border-orange-200',
          bgOverlay: 'border-orange-300 bg-orange-50'
        };
      case 'medium':
        return { 
          icon: <AlertCircle className="h-3 w-3" />, 
          color: 'text-yellow-600 bg-yellow-100 border-yellow-200',
          bgOverlay: 'border-yellow-300 bg-yellow-50'
        };
      case 'low':
        return { 
          icon: <AlertCircle className="h-3 w-3" />, 
          color: 'text-blue-600 bg-blue-100 border-blue-200',
          bgOverlay: 'border-blue-300 bg-blue-50'
        };
      default:
        return null;
    }
  };

  const conflictIndicator = getConflictIndicator();

  if (compact) {
    // Compact version for month view
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`
          text-xs p-1 rounded cursor-pointer transition-all relative
          ${hasConflicts && conflictIndicator ? conflictIndicator.bgOverlay : getStatusColor(booking.status)}
          ${isSortableDragging || isDragging ? 'opacity-50 shadow-lg' : 'hover:shadow-md'}
        `}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <div className="flex items-center justify-between">
          <div className="font-medium truncate">
            {booking.customer_name}
          </div>
          {hasConflicts && conflictIndicator && (
            <div className="flex-shrink-0 ml-1">
              {conflictIndicator.icon}
            </div>
          )}
        </div>
        <div className="opacity-75">
          {formatTime(booking.scheduled_time)}
        </div>
      </div>
    );
  }

  // Full version for day/week view
  return (
    <Card
      ref={setNodeRef}
      style={style}
              className={`
        cursor-pointer transition-all border-l-4 
        ${isSortableDragging || isDragging ? 'opacity-50 shadow-lg rotate-2' : 'hover:shadow-md'}
        ${hasConflicts && conflictIndicator ? 
          (conflictSeverity === 'critical' ? 'border-l-red-500 bg-red-50' :
           conflictSeverity === 'high' ? 'border-l-orange-500 bg-orange-50' :
           conflictSeverity === 'medium' ? 'border-l-yellow-500 bg-yellow-50' :
           'border-l-blue-500 bg-blue-50') :
          (booking.status === 'scheduled' ? 'border-l-blue-500' : 
           booking.status === 'confirmed' ? 'border-l-green-500' :
           booking.status === 'in_progress' ? 'border-l-yellow-500' :
           booking.status === 'completed' ? 'border-l-gray-500' :
           'border-l-red-500')}
      `}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-gray-900 truncate">
                {booking.customer_name}
              </h4>
              <Badge className={`text-xs ${getStatusColor(booking.status)}`}>
                {booking.status}
              </Badge>
              {hasConflicts && conflictIndicator && (
                <Badge className={`text-xs ${conflictIndicator.color} flex items-center space-x-1`}>
                  {conflictIndicator.icon}
                  <span>{conflictCount} conflict{conflictCount !== 1 ? 's' : ''}</span>
                </Badge>
              )}
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatTime(booking.scheduled_time)}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{booking.address}, {booking.city}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span className="capitalize">{booking.service_type}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <DollarSign className="h-3 w-3" />
                <span>${(booking.price_cents / 100).toFixed(0)}</span>
              </div>
            </div>
          </div>
          
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="ml-2 p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        </div>

        {/* Add-ons */}
        {booking.add_ons.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {booking.add_ons.slice(0, 2).map((addon, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {addon}
              </Badge>
            ))}
            {booking.add_ons.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{booking.add_ons.length - 2} more
              </Badge>
            )}
          </div>
        )}

        {/* Contact Info & Actions */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          {booking.customer_phone && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">{booking.customer_phone}</span>
              <Phone className="h-3 w-3 text-gray-400" />
            </div>
          )}
          
          {/* Crew Assignment Button */}
          {onAssignCrew && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAssignCrew(booking);
              }}
              className="w-full flex items-center justify-center space-x-1 text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded px-2 py-1 transition-colors"
            >
              <Users className="h-3 w-3" />
              <span>Assign Crew</span>
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

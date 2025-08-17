"use client";

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge } from '@/components/ui/badge';
import { Users, AlertCircle, CheckCircle } from 'lucide-react';
import { DraggableBookingCard } from './draggable-booking-card';

import { Booking } from '@/lib/database-neon';

interface CrewAvailability {
  available: number;
  total: number;
  crews: Array<{
    id: number;
    name: string;
    members: string[];
    status: string;
  }>;
}

interface DroppableTimeSlotProps {
  id: string;
  bookings: Booking[];
  crewAvailability: CrewAvailability;
  onBookingClick?: (booking: Booking) => void;
  onAssignCrew?: (booking: Booking) => void;
  getBookingConflicts?: (bookingId: number) => any[];
  hasConflicts?: (bookingId: number) => boolean;
  getBookingConflictSeverity?: (bookingId: number) => 'low' | 'medium' | 'high' | 'critical' | null;
}

export function DroppableTimeSlot({
  id,
  bookings,
  crewAvailability,
  onBookingClick,
  onAssignCrew,
  getBookingConflicts,
  hasConflicts,
  getBookingConflictSeverity
}: DroppableTimeSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  // Determine slot status based on bookings and crew availability
  const getSlotStatus = () => {
    const activeBookings = bookings.filter(b => b.status !== 'cancelled');
    
    if (activeBookings.length === 0) {
      return crewAvailability.available > 0 ? 'available' : 'no_crew';
    }
    
    if (activeBookings.length >= crewAvailability.total) {
      return 'full';
    }
    
    return 'partial';
  };

  const slotStatus = getSlotStatus();
  
  // Get background color based on status and drag state
  const getBackgroundColor = () => {
    const baseClasses = "min-h-[80px] p-2 rounded-lg border-2 border-dashed transition-all";
    
    if (isOver) {
      return `${baseClasses} border-teal-400 bg-teal-50`;
    }
    
    switch (slotStatus) {
      case 'available':
        return `${baseClasses} border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100`;
      case 'partial':
        return `${baseClasses} border-yellow-200 bg-yellow-50`;
      case 'full':
        return `${baseClasses} border-red-200 bg-red-50`;
      case 'no_crew':
        return `${baseClasses} border-gray-300 bg-gray-100`;
      default:
        return `${baseClasses} border-gray-200 bg-gray-50`;
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={getBackgroundColor()}
    >
      {/* Crew Availability Indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1">
          <Users className="h-3 w-3 text-gray-500" />
          <span className="text-xs text-gray-600">
            {crewAvailability.available}/{crewAvailability.total}
          </span>
        </div>
        
        {/* Status Indicator */}
        {slotStatus === 'full' && (
          <AlertCircle className="h-3 w-3 text-red-500" />
        )}
        {slotStatus === 'available' && crewAvailability.available > 0 && (
          <CheckCircle className="h-3 w-3 text-green-500" />
        )}
      </div>

      {/* Bookings */}
      <SortableContext 
        items={bookings.map(b => b.id?.toString() || `booking-${Math.random()}`)} 
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {bookings.map(booking => {
            const bookingHasConflicts = booking.id ? hasConflicts?.(booking.id) || false : false;
            const conflictSeverity = booking.id ? getBookingConflictSeverity?.(booking.id) || null : null;
            const conflictCount = booking.id ? getBookingConflicts?.(booking.id)?.length || 0 : 0;
            
            return (
              <DraggableBookingCard
                key={booking.id || `booking-${Math.random()}`}
                booking={booking}
                onClick={() => onBookingClick?.(booking)}
                onAssignCrew={onAssignCrew}
                hasConflicts={bookingHasConflicts}
                conflictSeverity={conflictSeverity}
                conflictCount={conflictCount}
              />
            );
          })}
        </div>
      </SortableContext>

      {/* Empty State */}
      {bookings.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <div className="text-xs">
              {slotStatus === 'available' ? 'Available' : 
               slotStatus === 'no_crew' ? 'No crew' : 'Drop here'}
            </div>
          </div>
        </div>
      )}

      {/* Crew Availability Details (on hover) */}
      {crewAvailability.crews.length > 0 && (
        <div className="mt-2 opacity-0 hover:opacity-100 transition-opacity">
          <div className="text-xs text-gray-500">
            Available crews:
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {crewAvailability.crews.slice(0, 2).map(crew => (
              <Badge key={crew.id} variant="outline" className="text-xs">
                {crew.name}
              </Badge>
            ))}
            {crewAvailability.crews.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{crewAvailability.crews.length - 2}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

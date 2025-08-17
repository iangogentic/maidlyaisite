"use client";

import React, { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
} from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Users
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, parseISO, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { DraggableBookingCard } from './draggable-booking-card';
import { DroppableTimeSlot } from './droppable-time-slot';
import { CrewAssignmentModal } from './crew-assignment-modal';
import { createConflictDetector } from '@/lib/conflict-detector';

// Import Booking interface from database schema
import { Booking } from '@/lib/database-neon';

// Crew interface for availability indicators
interface Crew {
  id: number;
  name: string;
  members: string[];
  status: 'available' | 'on_job' | 'break' | 'off_duty';
  current_job?: string;
  rating: number;
  jobs_completed: number;
}

interface CrewMember {
  id: number;
  name: string;
  email: string;
  phone?: string;
  employee_id?: string;
  status: 'available' | 'on_job' | 'break' | 'off_duty' | 'unavailable';
  hourly_rate_cents: number;
  hire_date?: string;
  certifications?: string[];
  emergency_contact?: any;
  latest_location?: {
    latitude: number;
    longitude: number;
    address?: string;
    timestamp: string;
  };
  active_time_entry?: any;
  is_clocked_in: boolean;
}

interface DragDropCalendarProps {
  bookings: Booking[];
  crews: Crew[];
  crewMembers?: CrewMember[];
  onBookingUpdate: (bookingId: number, newDate: string, newTime: string) => Promise<void>;
  onBookingClick?: (booking: Booking) => void;
  onAssignCrew?: (bookingId: number, crewMemberId: number) => Promise<void>;
  showConflicts?: boolean;
}

type CalendarView = 'day' | 'week' | 'month';

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

export function DragDropCalendar({ 
  bookings, 
  crews, 
  crewMembers = [],
  onBookingUpdate, 
  onBookingClick,
  onAssignCrew,
  showConflicts = true
}: DragDropCalendarProps) {
  const [view, setView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);
  const [showCrewAssignment, setShowCrewAssignment] = useState(false);
  const [selectedBookingForCrew, setSelectedBookingForCrew] = useState<Booking | null>(null);

  // Conflict detection
  const conflicts = useMemo(() => {
    if (!showConflicts || bookings.length === 0) return [];
    
    try {
      const detector = createConflictDetector({
        bookings,
        crewMembers,
        timeEntries: [], // Would need to fetch time entries for full conflict detection
        travelTimeMatrix: {}
      });
      
      return detector.detectAllConflicts();
    } catch (error) {
      console.error('Error detecting conflicts:', error);
      return [];
    }
  }, [bookings, crewMembers, showConflicts]);

  // Get conflicts for a specific booking
  const getBookingConflicts = useCallback((bookingId: number) => {
    return conflicts.filter(conflict => 
      conflict.affectedBookings.includes(bookingId)
    );
  }, [conflicts]);

  // Check if a booking has conflicts
  const hasConflicts = useCallback((bookingId: number) => {
    return getBookingConflicts(bookingId).length > 0;
  }, [getBookingConflicts]);

  // Get the highest severity conflict for a booking
  const getBookingConflictSeverity = useCallback((bookingId: number) => {
    const bookingConflicts = getBookingConflicts(bookingId);
    if (bookingConflicts.length === 0) return null;
    
    const severityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
    const highestSeverity = bookingConflicts.reduce((highest, conflict) => {
      return severityOrder[conflict.severity] < severityOrder[highest.severity] ? conflict : highest;
    });
    
    return highestSeverity.severity;
  }, [getBookingConflicts]);

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Get date range based on current view
  const dateRange = useMemo(() => {
    switch (view) {
      case 'day':
        return [currentDate];
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return eachDayOfInterval({ start: weekStart, end: weekEnd });
      case 'month':
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        return eachDayOfInterval({ start: monthStart, end: monthEnd });
      default:
        return [currentDate];
    }
  }, [view, currentDate]);

  // Filter bookings for current date range
  const visibleBookings = useMemo(() => {
    return bookings.filter(booking => {
      const bookingDate = parseISO(booking.scheduled_date);
      return dateRange.some(date => isSameDay(date, bookingDate));
    });
  }, [bookings, dateRange]);

  // Group bookings by date and time
  const bookingsByDateTime = useMemo(() => {
    const grouped: Record<string, Record<string, Booking[]>> = {};
    
    visibleBookings.forEach(booking => {
      const dateKey = booking.scheduled_date;
      const timeKey = booking.scheduled_time;
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {};
      }
      if (!grouped[dateKey][timeKey]) {
        grouped[dateKey][timeKey] = [];
      }
      
      grouped[dateKey][timeKey].push(booking);
    });
    
    return grouped;
  }, [visibleBookings]);

  // Get crew availability for a specific date/time
  const getCrewAvailability = useCallback((date: string, time: string) => {
    const availableCrews = crews.filter(crew => {
      // Check if crew is available (not on another job at this time)
      const hasConflict = visibleBookings.some(booking => 
        booking.scheduled_date === date && 
        booking.scheduled_time === time &&
        booking.status !== 'cancelled'
      );
      
      return crew.status === 'available' && !hasConflict;
    });
    
    return {
      available: availableCrews.length,
      total: crews.length,
      crews: availableCrews
    };
  }, [crews, visibleBookings]);

  // Navigation handlers
  const navigatePrevious = () => {
    switch (view) {
      case 'day':
        setCurrentDate(prev => addDays(prev, -1));
        break;
      case 'week':
        setCurrentDate(prev => subWeeks(prev, 1));
        break;
      case 'month':
        setCurrentDate(prev => subMonths(prev, 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (view) {
      case 'day':
        setCurrentDate(prev => addDays(prev, 1));
        break;
      case 'week':
        setCurrentDate(prev => addWeeks(prev, 1));
        break;
      case 'month':
        setCurrentDate(prev => addMonths(prev, 1));
        break;
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    
    const booking = visibleBookings.find(b => b.id?.toString() === event.active.id);
    setDraggedBooking(booking || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !draggedBooking) {
      setActiveId(null);
      setDraggedBooking(null);
      return;
    }

    const overId = over.id as string;
    const [newDate, newTime] = overId.split('_');
    
    // Only update if the date/time actually changed
    if (newDate !== draggedBooking.scheduled_date || newTime !== draggedBooking.scheduled_time) {
      try {
        if (draggedBooking.id) {
          await onBookingUpdate(draggedBooking.id, newDate, newTime);
        }
      } catch (error) {
        console.error('Failed to update booking:', error);
        // TODO: Show error toast
      }
    }
    
    setActiveId(null);
    setDraggedBooking(null);
  };

  // Handle crew assignment
  const handleAssignCrewClick = useCallback((booking: Booking) => {
    setSelectedBookingForCrew(booking);
    setShowCrewAssignment(true);
  }, []);

  const handleCrewAssignment = useCallback(async (bookingId: number, crewMemberId: number) => {
    if (onAssignCrew) {
      await onAssignCrew(bookingId, crewMemberId);
    }
  }, [onAssignCrew]);

  const handleCloseCrewAssignment = useCallback(() => {
    setShowCrewAssignment(false);
    setSelectedBookingForCrew(null);
  }, []);



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

  // Get header title based on view
  const getHeaderTitle = () => {
    switch (view) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Booking Calendar
              </CardTitle>
              
              {/* View Selector */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {(['day', 'week', 'month'] as CalendarView[]).map((viewType) => (
                  <Button
                    key={viewType}
                    variant={view === viewType ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setView(viewType)}
                    className={view === viewType ? 'bg-white shadow-sm' : ''}
                  >
                    {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={navigatePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
                
                <Button variant="outline" size="sm" onClick={navigateNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-lg font-semibold text-center sm:text-left lg:ml-4">
                {getHeaderTitle()}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Card>
          <CardContent className="p-6">
            {view === 'month' ? (
              // Month View - Grid Layout
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 gap-1 min-w-[700px]">
                  {/* Day Headers */}
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="p-2 text-center font-medium text-gray-600 border-b">
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{day.charAt(0)}</span>
                    </div>
                  ))}
                  
                  {/* Calendar Days */}
                  {dateRange.map(date => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const dayBookings = bookingsByDateTime[dateStr] || {};
                    const totalBookings = Object.values(dayBookings).flat().length;
                    
                    return (
                      <div
                        key={dateStr}
                        className={`min-h-[100px] sm:min-h-[120px] p-1 sm:p-2 border border-gray-200 ${
                          isToday(date) ? 'bg-blue-50 border-blue-300' : 'bg-white'
                        }`}
                      >
                        <div className="font-medium text-xs sm:text-sm mb-1 sm:mb-2">
                          {format(date, 'd')}
                        </div>
                        
                        {totalBookings > 0 && (
                          <div className="space-y-1">
                            {totalBookings <= 2 ? (
                              // Show individual bookings if 2 or fewer (reduced for mobile)
                              Object.entries(dayBookings).map(([time, bookings]) =>
                                bookings.map(booking => (
                                  <DraggableBookingCard
                                    key={booking.id || `booking-${Math.random()}`}
                                    booking={booking}
                                    compact
                                    onClick={() => onBookingClick?.(booking)}
                                  />
                                ))
                              )
                            ) : (
                              // Show summary if more than 2
                              <div className="text-xs bg-teal-100 text-teal-800 rounded px-1 sm:px-2 py-1 cursor-pointer"
                                   onClick={() => {
                                     // Switch to day view for this date on mobile
                                     setCurrentDate(date);
                                     setView('day');
                                   }}>
                                {totalBookings} jobs
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Day/Week View - Time Slot Layout
              <div className="space-y-4">
                {view === 'week' && (
                  // Week view header with dates
                  <div className="overflow-x-auto">
                    <div className="grid grid-cols-8 gap-2 mb-4 min-w-[800px]">
                      <div className="text-sm font-medium text-gray-600"></div>
                      {dateRange.map(date => (
                        <div
                          key={format(date, 'yyyy-MM-dd')}
                          className={`text-center p-2 rounded-lg ${
                            isToday(date) ? 'bg-blue-100 text-blue-900' : 'text-gray-700'
                          }`}
                        >
                          <div className="text-xs font-medium">
                            {format(date, 'EEE')}
                          </div>
                          <div className="text-lg font-bold">
                            {format(date, 'd')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Time Slots */}
                <div className={view === 'week' ? 'overflow-x-auto' : ''}>
                  <div className="space-y-4">
                    {timeSlots.map(time => (
                      <div key={time} className={`grid gap-2 ${
                        view === 'week' ? 'grid-cols-8 min-w-[800px]' : 'grid-cols-1'
                      }`}>
                        {/* Time Label */}
                        <div className="flex items-center justify-end pr-2 sm:pr-4 text-sm font-medium text-gray-600 min-w-[60px]">
                          <span className="hidden sm:inline">{formatTime(time)}</span>
                          <span className="sm:hidden">{time}</span>
                        </div>
                        
                        {/* Date Columns */}
                        {dateRange.map(date => {
                          const dateStr = format(date, 'yyyy-MM-dd');
                          const slotBookings = bookingsByDateTime[dateStr]?.[time] || [];
                          const crewAvailability = getCrewAvailability(dateStr, time);
                          const dropId = `${dateStr}_${time}`;
                          
                          return (
                            <DroppableTimeSlot
                              key={dropId}
                              id={dropId}
                              bookings={slotBookings}
                              crewAvailability={crewAvailability}
                              onBookingClick={onBookingClick}
                              onAssignCrew={handleAssignCrewClick}
                              getBookingConflicts={getBookingConflicts}
                              hasConflicts={hasConflicts}
                              getBookingConflictSeverity={getBookingConflictSeverity}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && draggedBooking ? (
            <DraggableBookingCard
              booking={draggedBooking}
              isDragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
                <span className="text-sm text-gray-600">Scheduled</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                <span className="text-sm text-gray-600">Confirmed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
                <span className="text-sm text-gray-600">In Progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-teal-600" />
                <span className="text-sm text-gray-600">Crew Available</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 text-center lg:text-right">
              <span className="hidden sm:inline">Drag bookings to reschedule • Click to view details</span>
              <span className="sm:hidden">Tap jobs to view details</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crew Assignment Modal */}
      <CrewAssignmentModal
        isOpen={showCrewAssignment}
        onClose={handleCloseCrewAssignment}
        booking={selectedBookingForCrew}
        crewMembers={crewMembers}
        onAssignCrew={handleCrewAssignment}
      />
    </div>
  );
}

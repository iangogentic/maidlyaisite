import { Booking, CrewMember, TimeEntry } from './database-neon';
import { format, parseISO, addMinutes, isAfter, isBefore, isEqual } from 'date-fns';

export interface ConflictDetails {
  id: string;
  type: 'time_overlap' | 'crew_double_booking' | 'resource_unavailable' | 'travel_time' | 'crew_unavailable';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedBookings: number[];
  affectedCrewMembers?: number[];
  suggestedResolutions: ResolutionSuggestion[];
  metadata?: any;
}

export interface ResolutionSuggestion {
  id: string;
  type: 'reschedule' | 'reassign_crew' | 'split_booking' | 'extend_time' | 'add_crew';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  estimatedEffort: string;
  autoApplicable: boolean;
  parameters?: any;
}

export interface ConflictContext {
  bookings: Booking[];
  crewMembers: CrewMember[];
  timeEntries: TimeEntry[];
  travelTimeMatrix?: { [key: string]: number }; // Travel time in minutes between locations
}

export class ConflictDetector {
  private context: ConflictContext;

  constructor(context: ConflictContext) {
    this.context = context;
  }

  /**
   * Detect all conflicts in the current context
   */
  public detectAllConflicts(): ConflictDetails[] {
    const conflicts: ConflictDetails[] = [];

    // Detect time overlap conflicts
    conflicts.push(...this.detectTimeOverlapConflicts());

    // Detect crew double-booking conflicts
    conflicts.push(...this.detectCrewDoubleBookingConflicts());

    // Detect crew availability conflicts
    conflicts.push(...this.detectCrewAvailabilityConflicts());

    // Detect travel time conflicts
    conflicts.push(...this.detectTravelTimeConflicts());

    // Sort by severity and return
    return this.sortConflictsBySeverity(conflicts);
  }

  /**
   * Detect conflicts for a specific booking
   */
  public detectBookingConflicts(bookingId: number): ConflictDetails[] {
    const booking = this.context.bookings.find(b => b.id === bookingId);
    if (!booking) return [];

    const conflicts: ConflictDetails[] = [];
    
    // Check for time overlaps with this specific booking
    const timeConflicts = this.detectTimeOverlapConflicts().filter(
      conflict => conflict.affectedBookings.includes(bookingId)
    );
    conflicts.push(...timeConflicts);

    // Check for crew conflicts with this booking
    const crewConflicts = this.detectCrewDoubleBookingConflicts().filter(
      conflict => conflict.affectedBookings.includes(bookingId)
    );
    conflicts.push(...crewConflicts);

    return conflicts;
  }

  /**
   * Detect time overlap conflicts between bookings
   */
  private detectTimeOverlapConflicts(): ConflictDetails[] {
    const conflicts: ConflictDetails[] = [];
    const activeBookings = this.context.bookings.filter(
      b => ['scheduled', 'confirmed', 'in_progress'].includes(b.status)
    );

    for (let i = 0; i < activeBookings.length; i++) {
      for (let j = i + 1; j < activeBookings.length; j++) {
        const booking1 = activeBookings[i];
        const booking2 = activeBookings[j];

        if (this.bookingsOverlap(booking1, booking2)) {
          const overlapMinutes = this.calculateOverlapMinutes(booking1, booking2);
          const severity = this.calculateTimeOverlapSeverity(overlapMinutes, booking1, booking2);

          conflicts.push({
            id: `time_overlap_${booking1.id}_${booking2.id}`,
            type: 'time_overlap',
            severity,
            title: 'Scheduling Conflict Detected',
            description: `Bookings ${booking1.id} and ${booking2.id} have overlapping time slots (${overlapMinutes} minutes overlap)`,
            affectedBookings: [booking1.id!, booking2.id!],
            suggestedResolutions: this.generateTimeOverlapResolutions(booking1, booking2, overlapMinutes),
            metadata: {
              overlapMinutes,
              booking1: this.formatBookingForDisplay(booking1),
              booking2: this.formatBookingForDisplay(booking2)
            }
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect crew double-booking conflicts
   */
  private detectCrewDoubleBookingConflicts(): ConflictDetails[] {
    const conflicts: ConflictDetails[] = [];
    const crewAssignments = this.getCrewAssignments();

    // Group bookings by crew member
    const crewBookings: { [crewId: number]: Booking[] } = {};
    
    for (const [bookingId, crewId] of Object.entries(crewAssignments)) {
      if (!crewBookings[crewId]) {
        crewBookings[crewId] = [];
      }
      const booking = this.context.bookings.find(b => b.id === parseInt(bookingId));
      if (booking) {
        crewBookings[crewId].push(booking);
      }
    }

    // Check for overlapping bookings for each crew member
    for (const [crewId, bookings] of Object.entries(crewBookings)) {
      const crewMember = this.context.crewMembers.find(c => c.id === parseInt(crewId));
      if (!crewMember) continue;

      for (let i = 0; i < bookings.length; i++) {
        for (let j = i + 1; j < bookings.length; j++) {
          const booking1 = bookings[i];
          const booking2 = bookings[j];

          if (this.bookingsOverlap(booking1, booking2)) {
            conflicts.push({
              id: `crew_double_booking_${crewId}_${booking1.id}_${booking2.id}`,
              type: 'crew_double_booking',
              severity: 'critical',
              title: 'Crew Double-Booking Detected',
              description: `${crewMember.name} is assigned to overlapping bookings`,
              affectedBookings: [booking1.id!, booking2.id!],
              affectedCrewMembers: [parseInt(crewId)],
              suggestedResolutions: this.generateCrewConflictResolutions(booking1, booking2, crewMember),
              metadata: {
                crewMember: crewMember.name,
                booking1: this.formatBookingForDisplay(booking1),
                booking2: this.formatBookingForDisplay(booking2)
              }
            });
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect crew availability conflicts
   */
  private detectCrewAvailabilityConflicts(): ConflictDetails[] {
    const conflicts: ConflictDetails[] = [];
    const crewAssignments = this.getCrewAssignments();

    for (const [bookingId, crewId] of Object.entries(crewAssignments)) {
      const booking = this.context.bookings.find(b => b.id === parseInt(bookingId));
      const crewMember = this.context.crewMembers.find(c => c.id === crewId);

      if (!booking || !crewMember) continue;

      // Check if crew member is available during booking time
      if (!this.isCrewAvailable(crewMember, booking)) {
        conflicts.push({
          id: `crew_unavailable_${crewId}_${bookingId}`,
          type: 'crew_unavailable',
          severity: 'high',
          title: 'Crew Member Unavailable',
          description: `${crewMember.name} is not available during the scheduled time`,
          affectedBookings: [parseInt(bookingId)],
          affectedCrewMembers: [crewId],
          suggestedResolutions: this.generateAvailabilityResolutions(booking, crewMember),
          metadata: {
            crewMember: crewMember.name,
            crewStatus: crewMember.status,
            booking: this.formatBookingForDisplay(booking)
          }
        });
      }
    }

    return conflicts;
  }

  /**
   * Detect travel time conflicts
   */
  private detectTravelTimeConflicts(): ConflictDetails[] {
    const conflicts: ConflictDetails[] = [];
    const crewAssignments = this.getCrewAssignments();

    // Group bookings by crew member and sort by time
    const crewSchedules: { [crewId: number]: Booking[] } = {};
    
    for (const [bookingId, crewId] of Object.entries(crewAssignments)) {
      if (!crewSchedules[crewId]) {
        crewSchedules[crewId] = [];
      }
      const booking = this.context.bookings.find(b => b.id === parseInt(bookingId));
      if (booking) {
        crewSchedules[crewId].push(booking);
      }
    }

    // Sort each crew's bookings by time and check travel time
    for (const [crewId, bookings] of Object.entries(crewSchedules)) {
      const sortedBookings = bookings.sort((a, b) => {
        const timeA = new Date(`${a.scheduled_date} ${a.scheduled_time}`);
        const timeB = new Date(`${b.scheduled_date} ${b.scheduled_time}`);
        return timeA.getTime() - timeB.getTime();
      });

      for (let i = 0; i < sortedBookings.length - 1; i++) {
        const currentBooking = sortedBookings[i];
        const nextBooking = sortedBookings[i + 1];

        const travelTime = this.calculateTravelTime(currentBooking, nextBooking);
        const availableTime = this.calculateTimeBetweenBookings(currentBooking, nextBooking);

        if (travelTime > availableTime) {
          const crewMember = this.context.crewMembers.find(c => c.id === parseInt(crewId));
          
          conflicts.push({
            id: `travel_time_${crewId}_${currentBooking.id}_${nextBooking.id}`,
            type: 'travel_time',
            severity: 'medium',
            title: 'Insufficient Travel Time',
            description: `Not enough time for ${crewMember?.name || 'crew member'} to travel between locations`,
            affectedBookings: [currentBooking.id!, nextBooking.id!],
            affectedCrewMembers: [parseInt(crewId)],
            suggestedResolutions: this.generateTravelTimeResolutions(currentBooking, nextBooking, travelTime, availableTime),
            metadata: {
              crewMember: crewMember?.name,
              requiredTravelTime: travelTime,
              availableTime,
              shortfall: travelTime - availableTime
            }
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Check if two bookings overlap in time
   */
  private bookingsOverlap(booking1: Booking, booking2: Booking): boolean {
    const start1 = new Date(`${booking1.scheduled_date} ${booking1.scheduled_time}`);
    const end1 = addMinutes(start1, booking1.duration_minutes);
    
    const start2 = new Date(`${booking2.scheduled_date} ${booking2.scheduled_time}`);
    const end2 = addMinutes(start2, booking2.duration_minutes);

    return (isBefore(start1, end2) && isAfter(end1, start2)) ||
           (isBefore(start2, end1) && isAfter(end2, start1)) ||
           isEqual(start1, start2);
  }

  /**
   * Calculate overlap in minutes between two bookings
   */
  private calculateOverlapMinutes(booking1: Booking, booking2: Booking): number {
    const start1 = new Date(`${booking1.scheduled_date} ${booking1.scheduled_time}`);
    const end1 = addMinutes(start1, booking1.duration_minutes);
    
    const start2 = new Date(`${booking2.scheduled_date} ${booking2.scheduled_time}`);
    const end2 = addMinutes(start2, booking2.duration_minutes);

    const overlapStart = start1 > start2 ? start1 : start2;
    const overlapEnd = end1 < end2 ? end1 : end2;

    return Math.max(0, (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60));
  }

  /**
   * Calculate time between bookings in minutes
   */
  private calculateTimeBetweenBookings(booking1: Booking, booking2: Booking): number {
    const end1 = addMinutes(new Date(`${booking1.scheduled_date} ${booking1.scheduled_time}`), booking1.duration_minutes);
    const start2 = new Date(`${booking2.scheduled_date} ${booking2.scheduled_time}`);
    
    return Math.max(0, (start2.getTime() - end1.getTime()) / (1000 * 60));
  }

  /**
   * Calculate travel time between two bookings (in minutes)
   */
  private calculateTravelTime(booking1: Booking, booking2: Booking): number {
    const key = `${booking1.address}_${booking2.address}`;
    
    // Use travel time matrix if available
    if (this.context.travelTimeMatrix && this.context.travelTimeMatrix[key]) {
      return this.context.travelTimeMatrix[key];
    }

    // Fallback: estimate based on distance (rough calculation)
    // In a real implementation, you'd use Google Maps API or similar
    const distance = this.estimateDistance(booking1, booking2);
    return Math.ceil(distance * 2); // Assume 30 mph average speed in city
  }

  /**
   * Estimate distance between two addresses (rough calculation)
   */
  private estimateDistance(booking1: Booking, booking2: Booking): number {
    // This is a very rough estimation
    // In production, you'd use proper geocoding and distance calculation
    if (booking1.city !== booking2.city) {
      return 45; // Different cities, assume 45 minutes
    }
    
    // Same city, estimate based on zip codes
    const zip1 = parseInt(booking1.zip_code);
    const zip2 = parseInt(booking2.zip_code);
    const zipDiff = Math.abs(zip1 - zip2);
    
    return Math.min(30, zipDiff * 3); // Rough estimate
  }

  /**
   * Check if crew member is available for a booking
   */
  private isCrewAvailable(crewMember: CrewMember, booking: Booking): boolean {
    // Check crew member status
    if (['off_duty', 'unavailable'].includes(crewMember.status)) {
      return false;
    }

    // Check for active time entries that might conflict
    const bookingStart = new Date(`${booking.scheduled_date} ${booking.scheduled_time}`);
    const bookingEnd = addMinutes(bookingStart, booking.duration_minutes);

    const conflictingEntries = this.context.timeEntries.filter(entry => {
      if (entry.crew_member_id !== crewMember.id || entry.status !== 'active') {
        return false;
      }

      if (entry.clock_in_time && !entry.clock_out_time) {
        // Currently clocked in
        const clockInTime = parseISO(entry.clock_in_time);
        return isBefore(clockInTime, bookingEnd);
      }

      return false;
    });

    return conflictingEntries.length === 0;
  }

  /**
   * Get crew assignments from bookings (placeholder - would come from database)
   */
  private getCrewAssignments(): { [bookingId: string]: number } {
    // This would typically come from a crew_assignments table
    // For now, we'll return an empty object as assignments are handled elsewhere
    return {};
  }

  /**
   * Calculate severity of time overlap conflict
   */
  private calculateTimeOverlapSeverity(overlapMinutes: number, booking1: Booking, booking2: Booking): 'low' | 'medium' | 'high' | 'critical' {
    if (overlapMinutes >= 60) return 'critical';
    if (overlapMinutes >= 30) return 'high';
    if (overlapMinutes >= 15) return 'medium';
    return 'low';
  }

  /**
   * Format booking for display in conflict details
   */
  private formatBookingForDisplay(booking: Booking) {
    return {
      id: booking.id,
      customer: booking.customer_name,
      address: `${booking.address}, ${booking.city}`,
      time: `${booking.scheduled_date} ${booking.scheduled_time}`,
      duration: booking.duration_minutes,
      service: booking.service_type
    };
  }

  /**
   * Generate resolution suggestions for time overlap conflicts
   */
  private generateTimeOverlapResolutions(booking1: Booking, booking2: Booking, overlapMinutes: number): ResolutionSuggestion[] {
    const suggestions: ResolutionSuggestion[] = [];

    // Reschedule one booking
    suggestions.push({
      id: 'reschedule_booking_1',
      type: 'reschedule',
      title: `Reschedule ${booking1.customer_name}'s appointment`,
      description: `Move booking ${booking1.id} to a different time slot`,
      impact: 'medium',
      estimatedEffort: '5-10 minutes',
      autoApplicable: false,
      parameters: { bookingId: booking1.id, suggestedOffset: overlapMinutes + 30 }
    });

    suggestions.push({
      id: 'reschedule_booking_2',
      type: 'reschedule',
      title: `Reschedule ${booking2.customer_name}'s appointment`,
      description: `Move booking ${booking2.id} to a different time slot`,
      impact: 'medium',
      estimatedEffort: '5-10 minutes',
      autoApplicable: false,
      parameters: { bookingId: booking2.id, suggestedOffset: overlapMinutes + 30 }
    });

    // Extend time if overlap is small
    if (overlapMinutes <= 30) {
      suggestions.push({
        id: 'extend_time_slot',
        type: 'extend_time',
        title: 'Extend time between bookings',
        description: `Add ${overlapMinutes + 15} minutes buffer between appointments`,
        impact: 'low',
        estimatedEffort: '2-3 minutes',
        autoApplicable: true,
        parameters: { bufferMinutes: overlapMinutes + 15 }
      });
    }

    return suggestions;
  }

  /**
   * Generate resolution suggestions for crew conflicts
   */
  private generateCrewConflictResolutions(booking1: Booking, booking2: Booking, crewMember: CrewMember): ResolutionSuggestion[] {
    const suggestions: ResolutionSuggestion[] = [];

    // Reassign crew member
    suggestions.push({
      id: 'reassign_crew_1',
      type: 'reassign_crew',
      title: `Reassign crew for ${booking1.customer_name}`,
      description: `Assign a different crew member to booking ${booking1.id}`,
      impact: 'medium',
      estimatedEffort: '3-5 minutes',
      autoApplicable: false,
      parameters: { bookingId: booking1.id, currentCrewId: crewMember.id }
    });

    suggestions.push({
      id: 'reassign_crew_2',
      type: 'reassign_crew',
      title: `Reassign crew for ${booking2.customer_name}`,
      description: `Assign a different crew member to booking ${booking2.id}`,
      impact: 'medium',
      estimatedEffort: '3-5 minutes',
      autoApplicable: false,
      parameters: { bookingId: booking2.id, currentCrewId: crewMember.id }
    });

    // Add additional crew member
    suggestions.push({
      id: 'add_crew_member',
      type: 'add_crew',
      title: 'Add additional crew member',
      description: 'Assign an additional crew member to handle both bookings',
      impact: 'high',
      estimatedEffort: '10-15 minutes',
      autoApplicable: false,
      parameters: { affectedBookings: [booking1.id, booking2.id] }
    });

    return suggestions;
  }

  /**
   * Generate resolution suggestions for availability conflicts
   */
  private generateAvailabilityResolutions(booking: Booking, crewMember: CrewMember): ResolutionSuggestion[] {
    const suggestions: ResolutionSuggestion[] = [];

    suggestions.push({
      id: 'reassign_available_crew',
      type: 'reassign_crew',
      title: 'Assign available crew member',
      description: 'Find and assign an available crew member to this booking',
      impact: 'low',
      estimatedEffort: '2-3 minutes',
      autoApplicable: true,
      parameters: { bookingId: booking.id, unavailableCrewId: crewMember.id }
    });

    suggestions.push({
      id: 'reschedule_for_availability',
      type: 'reschedule',
      title: 'Reschedule when crew is available',
      description: `Reschedule booking to when ${crewMember.name} is available`,
      impact: 'medium',
      estimatedEffort: '5-10 minutes',
      autoApplicable: false,
      parameters: { bookingId: booking.id, preferredCrewId: crewMember.id }
    });

    return suggestions;
  }

  /**
   * Generate resolution suggestions for travel time conflicts
   */
  private generateTravelTimeResolutions(booking1: Booking, booking2: Booking, requiredTime: number, availableTime: number): ResolutionSuggestion[] {
    const suggestions: ResolutionSuggestion[] = [];
    const shortfall = requiredTime - availableTime;

    suggestions.push({
      id: 'extend_time_between',
      type: 'reschedule',
      title: 'Extend time between appointments',
      description: `Add ${Math.ceil(shortfall)} minutes between bookings for travel time`,
      impact: 'low',
      estimatedEffort: '2-3 minutes',
      autoApplicable: true,
      parameters: { 
        bookingId: booking2.id, 
        delayMinutes: Math.ceil(shortfall) + 15 // Add buffer
      }
    });

    suggestions.push({
      id: 'reassign_closer_crew',
      type: 'reassign_crew',
      title: 'Assign crew member closer to location',
      description: 'Find a crew member who is geographically closer to the second booking',
      impact: 'medium',
      estimatedEffort: '5-8 minutes',
      autoApplicable: false,
      parameters: { 
        bookingId: booking2.id,
        locationPriority: true
      }
    });

    return suggestions;
  }

  /**
   * Sort conflicts by severity (critical first)
   */
  private sortConflictsBySeverity(conflicts: ConflictDetails[]): ConflictDetails[] {
    const severityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
    
    return conflicts.sort((a, b) => {
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }
}

/**
 * Utility function to create a ConflictDetector instance
 */
export function createConflictDetector(context: ConflictContext): ConflictDetector {
  return new ConflictDetector(context);
}

/**
 * Utility function to detect conflicts for a specific date range
 */
export function detectConflictsForDateRange(
  startDate: string,
  endDate: string,
  context: ConflictContext
): ConflictDetails[] {
  // Filter bookings to date range
  const filteredBookings = context.bookings.filter(booking => {
    const bookingDate = booking.scheduled_date;
    return bookingDate >= startDate && bookingDate <= endDate;
  });

  const filteredContext = {
    ...context,
    bookings: filteredBookings
  };

  const detector = new ConflictDetector(filteredContext);
  return detector.detectAllConflicts();
}

"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CrewAssignmentPanel } from './crew-assignment-panel';
import { Booking } from '@/lib/database-neon';

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

interface CrewAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: Booking | null;
  crewMembers: CrewMember[];
  onAssignCrew: (bookingId: number, crewMemberId: number) => Promise<void>;
}

export function CrewAssignmentModal({
  isOpen,
  onClose,
  booking,
  crewMembers,
  onAssignCrew
}: CrewAssignmentModalProps) {
  const handleAssignCrew = async (bookingId: number, crewMemberId: number) => {
    try {
      await onAssignCrew(bookingId, crewMemberId);
      onClose();
    } catch (error) {
      console.error('Error assigning crew:', error);
      // Handle error (could show toast notification)
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Assign Crew Member</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto">
          <CrewAssignmentPanel
            booking={booking}
            crewMembers={crewMembers}
            onAssignCrew={handleAssignCrew}
            onClose={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

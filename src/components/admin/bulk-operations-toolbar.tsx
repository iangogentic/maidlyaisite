"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  CheckSquare, 
  Square, 
  Users, 
  Calendar, 
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';

interface BulkOperationsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkStatusUpdate: (status: string) => Promise<void>;
  onBulkCrewAssignment: (crewMemberId: number) => Promise<void>;
  onBulkReschedule: (date: string, time: string) => Promise<void>;
  onClose: () => void;
  crewMembers: Array<{ id: number; name: string; is_available: boolean }>;
  isLoading?: boolean;
}

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-orange-100 text-orange-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

export function BulkOperationsToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBulkStatusUpdate,
  onBulkCrewAssignment,
  onBulkReschedule,
  onClose,
  crewMembers,
  isLoading = false
}: BulkOperationsToolbarProps) {
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showCrewDialog, setShowCrewDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCrewMember, setSelectedCrewMember] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  const handleStatusUpdate = async () => {
    if (selectedStatus) {
      await onBulkStatusUpdate(selectedStatus);
      setShowStatusDialog(false);
      setSelectedStatus('');
    }
  };

  const handleCrewAssignment = async () => {
    if (selectedCrewMember) {
      await onBulkCrewAssignment(parseInt(selectedCrewMember));
      setShowCrewDialog(false);
      setSelectedCrewMember('');
    }
  };

  const handleReschedule = async () => {
    if (rescheduleDate && rescheduleTime) {
      await onBulkReschedule(rescheduleDate, rescheduleTime);
      setShowRescheduleDialog(false);
      setRescheduleDate('');
      setRescheduleTime('');
    }
  };

  const availableCrewMembers = crewMembers.filter(member => member.is_available);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={selectedCount === totalCount ? onDeselectAll : onSelectAll}
              className="p-1"
            >
              {selectedCount === totalCount ? (
                <CheckSquare className="h-4 w-4 text-blue-600" />
              ) : selectedCount > 0 ? (
                <div className="h-4 w-4 bg-blue-600 border-2 border-blue-600 rounded flex items-center justify-center">
                  <div className="h-1 w-2 bg-white rounded-sm" />
                </div>
              ) : (
                <Square className="h-4 w-4 text-gray-400" />
              )}
            </Button>
            <span className="text-sm font-medium text-gray-900">
              {selectedCount} of {totalCount} selected
            </span>
          </div>

          {selectedCount > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {selectedCount} booking{selectedCount !== 1 ? 's' : ''} selected
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {selectedCount > 0 && (
            <>
              {/* Status Update Dialog */}
              <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <AlertCircle className="h-4 w-4 mr-2" />}
                    Update Status
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Status for {selectedCount} Booking{selectedCount !== 1 ? 's' : ''}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">New Status</label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(status => (
                            <SelectItem key={status.value} value={status.value}>
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${status.color.split(' ')[0]}`} />
                                <span>{status.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleStatusUpdate} disabled={!selectedStatus || isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        Update Status
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Crew Assignment Dialog */}
              <Dialog open={showCrewDialog} onOpenChange={setShowCrewDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Users className="h-4 w-4 mr-2" />}
                    Assign Crew
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Crew to {selectedCount} Booking{selectedCount !== 1 ? 's' : ''}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Available Crew Members</label>
                      <Select value={selectedCrewMember} onValueChange={setSelectedCrewMember}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select crew member" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCrewMembers.map(member => (
                            <SelectItem key={member.id} value={member.id.toString()}>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span>{member.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {availableCrewMembers.length === 0 && (
                        <p className="text-sm text-gray-500">No crew members are currently available</p>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowCrewDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCrewAssignment} 
                        disabled={!selectedCrewMember || isLoading || availableCrewMembers.length === 0}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        Assign Crew
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Reschedule Dialog */}
              <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Calendar className="h-4 w-4 mr-2" />}
                    Reschedule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reschedule {selectedCount} Booking{selectedCount !== 1 ? 's' : ''}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">New Date</label>
                        <input
                          type="date"
                          value={rescheduleDate}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">New Time</label>
                        <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium">Warning</p>
                          <p>This will reschedule all selected bookings to the same date and time. Make sure there are no conflicts.</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleReschedule} 
                        disabled={!rescheduleDate || !rescheduleTime || isLoading}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        Reschedule All
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}

          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

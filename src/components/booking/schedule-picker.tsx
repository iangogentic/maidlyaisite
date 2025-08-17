"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { format, addDays, startOfDay, isSameDay, isAfter } from 'date-fns';

interface SchedulePickerProps {
  data: any;
  onUpdate: (updates: any) => void;
}

const timeSlots = [
  { value: '08:00', label: '8:00 AM', popular: false },
  { value: '09:00', label: '9:00 AM', popular: true },
  { value: '10:00', label: '10:00 AM', popular: true },
  { value: '11:00', label: '11:00 AM', popular: false },
  { value: '12:00', label: '12:00 PM', popular: false },
  { value: '13:00', label: '1:00 PM', popular: true },
  { value: '14:00', label: '2:00 PM', popular: true },
  { value: '15:00', label: '3:00 PM', popular: false },
  { value: '16:00', label: '4:00 PM', popular: false },
];

export function SchedulePicker({ data, onUpdate }: SchedulePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    data.scheduledDate ? new Date(data.scheduledDate) : null
  );
  const [selectedTime, setSelectedTime] = useState<string>(data.scheduledTime || '');
  const [availableDates, setAvailableDates] = useState<Date[]>([]);

  useEffect(() => {
    // Generate available dates (next 14 days, excluding Sundays)
    const dates: Date[] = [];
    const today = startOfDay(new Date());
    
    for (let i = 1; i <= 21; i++) { // Check 21 days to get 14 available days
      const date = addDays(today, i);
      if (date.getDay() !== 0) { // Exclude Sundays
        dates.push(date);
      }
      if (dates.length >= 14) break;
    }
    
    setAvailableDates(dates);
  }, []);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onUpdate({
      scheduledDate: format(date, 'yyyy-MM-dd')
    });
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onUpdate({
      scheduledTime: time
    });
  };

  const getDateAvailability = (date: Date) => {
    // Simulate availability - in real app, this would check actual bookings
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 6; // Saturday
    
    if (isWeekend) {
      return { available: true, slots: 6, note: 'Weekend - Limited slots' };
    } else {
      return { available: true, slots: 8, note: 'Full availability' };
    }
  };

  const getTimeSlotAvailability = (time: string, date: Date | null) => {
    if (!date) return true;
    
    // Simulate some slots being unavailable
    const dateStr = format(date, 'yyyy-MM-dd');
    const unavailable = [
      { date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), times: ['09:00', '14:00'] },
      { date: format(addDays(new Date(), 3), 'yyyy-MM-dd'), times: ['10:00', '13:00'] },
    ];
    
    return !unavailable.some(u => u.date === dateStr && u.times.includes(time));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">Schedule Your Service</h3>
        <p className="text-muted-foreground">
          Choose your preferred date and time. We'll send a confirmation with crew details.
        </p>
      </div>

      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableDates.map((date) => {
              const availability = getDateAvailability(date);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              
              return (
                <Button
                  key={date.toISOString()}
                  variant={isSelected ? "default" : "outline"}
                  className={`h-auto p-3 flex flex-col items-center gap-1 ${
                    isSelected ? 'bg-primary text-primary-foreground' : ''
                  }`}
                  onClick={() => handleDateSelect(date)}
                  disabled={!availability.available}
                >
                  <div className="font-medium">
                    {format(date, 'EEE')}
                  </div>
                  <div className="text-lg font-bold">
                    {format(date, 'd')}
                  </div>
                  <div className="text-xs opacity-75">
                    {format(date, 'MMM')}
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="text-xs mt-1"
                  >
                    {availability.slots} slots
                  </Badge>
                </Button>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              We're closed on Sundays. Weekend appointments have limited availability.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Selection */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Select Time
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Available times for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {timeSlots.map((slot) => {
                const isAvailable = getTimeSlotAvailability(slot.value, selectedDate);
                const isSelected = selectedTime === slot.value;
                
                return (
                  <Button
                    key={slot.value}
                    variant={isSelected ? "default" : "outline"}
                    className={`relative ${
                      isSelected ? 'bg-primary text-primary-foreground' : ''
                    }`}
                    onClick={() => handleTimeSelect(slot.value)}
                    disabled={!isAvailable}
                  >
                    {slot.label}
                    {slot.popular && isAvailable && (
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-2 -right-2 text-xs px-1 py-0"
                      >
                        Popular
                      </Badge>
                    )}
                    {!isAvailable && (
                      <span className="absolute inset-0 bg-muted/50 rounded flex items-center justify-center text-xs">
                        Booked
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400 text-xs">🤖</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-1">
                      AI Scheduling Optimization
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Our AI considers your preferences, crew efficiency, and route optimization 
                      to suggest the best times for your service.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>• Crew will arrive within 15 minutes of scheduled time</p>
                <p>• You'll receive a notification when crew is en route</p>
                <p>• Estimated service duration: {Math.floor((data.homeSize || 1500) / 500) * 60 + 60} minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Summary */}
      {selectedDate && selectedTime && (
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-100">
                  Scheduled for {format(selectedDate, 'EEEE, MMMM d, yyyy')} at{' '}
                  {timeSlots.find(s => s.value === selectedTime)?.label}
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  You'll receive a confirmation email with crew details and contact information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

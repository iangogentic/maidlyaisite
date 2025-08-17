"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, MapPin, CreditCard, Phone, Mail, Home } from 'lucide-react';
import { format } from 'date-fns';

interface BookingConfirmationProps {
  bookingData: any;
}

export function BookingConfirmation({ bookingData }: BookingConfirmationProps) {
  const scheduledDate = bookingData.scheduledDate ? new Date(bookingData.scheduledDate) : null;
  const timeSlots = [
    { value: '08:00', label: '8:00 AM' },
    { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '13:00', label: '1:00 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '16:00', label: '4:00 PM' },
  ];
  
  const selectedTimeLabel = timeSlots.find(slot => slot.value === bookingData.scheduledTime)?.label || bookingData.scheduledTime;

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
          Booking Confirmed! 🎉
        </h3>
        <p className="text-muted-foreground">
          Your cleaning service has been successfully scheduled. We'll take great care of your home!
        </p>
      </div>

      {/* Booking Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Service Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {scheduledDate ? format(scheduledDate, 'EEEE, MMMM d, yyyy') : 'Date not set'}
                </p>
                <p className="text-sm text-muted-foreground">at {selectedTimeLabel}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium capitalize">
                  {bookingData.serviceType?.replace('_', ' ')} Cleaning
                </p>
                <p className="text-sm text-muted-foreground capitalize">
                  {bookingData.cleaningType?.replace('_', ' ')} products
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{bookingData.address}</p>
              <p className="text-sm text-muted-foreground">
                {bookingData.city}, {bookingData.state} {bookingData.zipCode}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">${bookingData.totalPrice}</p>
              <p className="text-sm text-muted-foreground">
                Payment confirmed • Beta discount applied
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Home Details */}
      <Card>
        <CardHeader>
          <CardTitle>Your Home</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{bookingData.homeSize}</p>
              <p className="text-sm text-muted-foreground">sq ft</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{bookingData.bedrooms}</p>
              <p className="text-sm text-muted-foreground">bedrooms</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{bookingData.bathrooms}</p>
              <p className="text-sm text-muted-foreground">bathrooms</p>
            </div>
          </div>
          
          {bookingData.addOns && bookingData.addOns.length > 0 && (
            <div className="mt-4">
              <p className="font-medium mb-2">Add-on Services:</p>
              <div className="flex flex-wrap gap-2">
                {bookingData.addOns.map((addon: string) => (
                  <Badge key={addon} variant="secondary">
                    {addon}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {bookingData.specialInstructions && (
            <div className="mt-4">
              <p className="font-medium mb-2">Special Instructions:</p>
              <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg">
                {bookingData.specialInstructions}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* What Happens Next */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">
            What Happens Next?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">1</span>
            </div>
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">Confirmation Email</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You'll receive a detailed confirmation email within 5 minutes with your booking details.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">2</span>
            </div>
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">AI Crew Briefing</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Our AI will generate a personalized briefing for your cleaning crew based on your preferences.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">3</span>
            </div>
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">Day Before Reminder</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                We'll send you a reminder with crew details and contact information.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">4</span>
            </div>
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">Service Day</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your crew will call 15 minutes before arrival and provide excellent service!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Need to Make Changes?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Call us: (555) 123-MAID</p>
              <p className="text-sm text-muted-foreground">Available 7 days a week, 8 AM - 8 PM</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Email: hello@maidly.ai</p>
              <p className="text-sm text-muted-foreground">We respond within 2 hours</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          className="flex-1" 
          onClick={() => window.print()}
        >
          Print Confirmation
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => window.location.href = '/'}
        >
          Back to Home
        </Button>
      </div>

      {/* Beta Thank You */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6 text-center">
          <h4 className="font-bold text-primary mb-2">
            Thank You for Joining Our Beta! 🚀
          </h4>
          <p className="text-sm text-muted-foreground">
            You're helping us build the future of home cleaning with AI. 
            Your feedback after the service will help us improve for everyone!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

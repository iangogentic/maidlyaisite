"use client";

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PricingCalculator } from '@/components/pricing/pricing-calculator';
import { CustomerDetailsForm } from './customer-details-form';
import { SchedulePicker } from './schedule-picker';
import { PaymentForm } from './payment-form';
import { BookingConfirmation } from './booking-confirmation';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

interface BookingData {
  // Pricing data
  homeSize: number;
  bedrooms: number;
  bathrooms: number;
  cleaningType: 'eco_friendly' | 'regular' | 'bring_own_supplies';
  serviceType: 'regular' | 'deep' | 'one_time';
  frequency?: 'weekly' | 'bi_weekly' | 'monthly';
  addOns: string[];
  totalPrice: number;
  
  // Customer data
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  specialInstructions?: string;
  
  // Schedule data
  scheduledDate?: string;
  scheduledTime?: string;
  
  // Payment data
  paymentIntentId?: string;
  
  // Booking result
  bookingId?: string;
}

const steps = [
  { id: 1, title: 'Service & Pricing', description: 'Configure your cleaning service' },
  { id: 2, title: 'Your Details', description: 'Contact and address information' },
  { id: 3, title: 'Schedule', description: 'Pick your preferred date and time' },
  { id: 4, title: 'Payment', description: 'Secure payment processing' },
  { id: 5, title: 'Confirmation', description: 'Your booking is confirmed!' }
];

export function BookingFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    homeSize: 1500,
    bedrooms: 3,
    bathrooms: 2,
    cleaningType: 'eco_friendly',
    serviceType: 'regular',
    addOns: [],
    totalPrice: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateBookingData = useCallback((updates: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...updates }));
  }, []);

  const handlePriceUpdate = useCallback((data: any) => {
    updateBookingData({
      homeSize: data.homeSize,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      cleaningType: data.cleaningType,
      serviceType: data.serviceType,
      frequency: data.frequency,
      addOns: data.addOns,
      totalPrice: data.totalPrice
    });
  }, [updateBookingData]);

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return bookingData.totalPrice > 0;
      case 2:
        return bookingData.customerName && bookingData.customerEmail && bookingData.address;
      case 3:
        return bookingData.scheduledDate && bookingData.scheduledTime;
      case 4:
        return bookingData.paymentIntentId;
      default:
        return false;
    }
  };

  const handleBookingSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: bookingData.customerName,
          customer_email: bookingData.customerEmail,
          customer_phone: bookingData.customerPhone,
          address: bookingData.address,
          city: bookingData.city,
          state: bookingData.state,
          zip_code: bookingData.zipCode,
          home_size: bookingData.homeSize,
          bedrooms: bookingData.bedrooms,
          bathrooms: bookingData.bathrooms,
          service_type: bookingData.serviceType,
          cleaning_type: bookingData.cleaningType,
          frequency: bookingData.frequency,
          scheduled_date: bookingData.scheduledDate,
          scheduled_time: bookingData.scheduledTime,
          duration_minutes: calculateDuration(),
          price_cents: bookingData.totalPrice * 100,
          add_ons: bookingData.addOns,
          special_instructions: bookingData.specialInstructions,
          ai_preferences: {},
          stripe_payment_intent_id: bookingData.paymentIntentId
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        updateBookingData({ bookingId: result.bookingId });
        nextStep();
      } else {
        throw new Error(result.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('There was an error creating your booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDuration = () => {
    let baseDuration = 120; // 2 hours base
    
    if (bookingData.serviceType === 'deep') baseDuration = 180; // 3 hours for deep clean
    if (bookingData.homeSize > 2500) baseDuration += 60; // Extra hour for large homes
    if (bookingData.addOns.length > 0) baseDuration += bookingData.addOns.length * 30; // 30 min per add-on
    
    return baseDuration;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                ${currentStep >= step.id 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : 'border-muted-foreground text-muted-foreground'
                }
              `}>
                {currentStep > step.id ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-16 h-0.5 mx-2 transition-all duration-200
                  ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}
                `} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-semibold">{steps[currentStep - 1].title}</h2>
          <p className="text-muted-foreground mt-1">{steps[currentStep - 1].description}</p>
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {currentStep === 1 && (
            <PricingCalculator
              onPriceUpdate={handlePriceUpdate}
            />
          )}

          {currentStep === 2 && (
            <CustomerDetailsForm
              data={bookingData}
              onUpdate={updateBookingData}
            />
          )}

          {currentStep === 3 && (
            <SchedulePicker
              data={bookingData}
              onUpdate={updateBookingData}
            />
          )}

          {currentStep === 4 && (
            <PaymentForm
              amount={bookingData.totalPrice}
              customerData={{
                name: bookingData.customerName || '',
                email: bookingData.customerEmail || '',
              }}
              bookingData={bookingData}
              onPaymentSuccess={(paymentIntentId) => {
                updateBookingData({ paymentIntentId });
                nextStep(); // Move to confirmation step
              }}
            />
          )}

          {currentStep === 5 && (
            <BookingConfirmation
              bookingData={bookingData}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      {currentStep < 5 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep === 4 ? (
            <Button
              onClick={handleBookingSubmit}
              disabled={!canProceed() || isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? 'Creating Booking...' : 'Complete Booking'}
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="bg-primary hover:bg-primary/90"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      )}

      {/* Booking Summary */}
      {currentStep > 1 && currentStep < 5 && (
        <Card className="mt-6 bg-muted/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Service:</span>
                <p className="font-medium capitalize">
                  {bookingData.serviceType.replace('_', ' ')} cleaning
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>
                <p className="font-medium capitalize">
                  {bookingData.cleaningType.replace('_', ' ')}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Home:</span>
                <p className="font-medium">
                  {bookingData.homeSize} sq ft, {bookingData.bedrooms} bed, {bookingData.bathrooms} bath
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Total:</span>
                <p className="font-bold text-lg text-primary">
                  ${bookingData.totalPrice}
                </p>
              </div>
            </div>
            {bookingData.addOns.length > 0 && (
              <div className="mt-3">
                <span className="text-muted-foreground text-sm">Add-ons:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {bookingData.addOns.map((addon) => (
                    <Badge key={addon} variant="secondary" className="text-xs">
                      {addon}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

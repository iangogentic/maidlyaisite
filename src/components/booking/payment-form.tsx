"use client";

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, Lock, AlertCircle } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  customerData: {
    name: string;
    email: string;
  };
  bookingData: any;
  onPaymentSuccess: (paymentIntentId: string) => void;
}

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function PaymentForm({ amount, customerData, bookingData, onPaymentSuccess }: PaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent 
        amount={amount}
        customerData={customerData}
        bookingData={bookingData}
        onPaymentSuccess={onPaymentSuccess}
      />
    </Elements>
  );
}

function PaymentFormContent({ amount, customerData, bookingData, onPaymentSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // Create payment intent when component mounts
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          customer_email: customerData.email,
          customer_name: customerData.name,
          booking_data: bookingData,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setClientSecret(data.client_secret);
      } else {
        setError('Failed to initialize payment. Please try again.');
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setError('Failed to initialize payment. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      setError('Payment system not ready. Please wait a moment and try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found. Please refresh and try again.');
      setIsProcessing(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerData.name,
            email: customerData.email,
          },
        },
      });

      if (error) {
        setError(error.message || 'Payment failed. Please try again.');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent.id);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">Secure Payment</h3>
        <p className="text-muted-foreground">
          Complete your booking with our secure payment system.
        </p>
      </div>

      {/* Payment Amount */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              ${amount}
            </div>
            <p className="text-muted-foreground">
              Total amount due today
            </p>
            <Badge variant="secondary" className="mt-2">
              🎉 Beta Special: 20% off applied
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900 dark:text-red-100 mb-1">Payment Error</h4>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Card Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="p-4 border rounded-md bg-background">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: 'hsl(var(--foreground))',
                        '::placeholder': {
                          color: 'hsl(var(--muted-foreground))',
                        },
                      },
                    },
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Enter your card details above. All information is encrypted and secure.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isProcessing || !stripe || !clientSecret}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Pay ${amount} Securely
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="bg-muted/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium mb-2">Your Payment is Secure</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 256-bit SSL encryption protects your data</li>
                <li>• We never store your full card information</li>
                <li>• PCI DSS compliant payment processing</li>
                <li>• 100% satisfaction guarantee</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Beta Notice */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="text-center">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              🎉 Beta Program Special
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              As a beta customer, you get 20% off your first 3 cleanings and help us 
              improve our AI-powered service. Thank you for being an early adopter!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import Stripe from 'stripe';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Client-side Stripe configuration
export const getStripePublishableKey = () => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
  }
  return key;
};

// Stripe webhook configuration
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Helper function to format amount for Stripe (convert dollars to cents)
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100);
};

// Helper function to format amount from Stripe (convert cents to dollars)
export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100;
};

// Create a payment intent
export const createPaymentIntent = async (
  amount: number,
  currency: string = 'usd',
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> => {
  return await stripe.paymentIntents.create({
    amount: formatAmountForStripe(amount),
    currency,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });
};

// Retrieve a payment intent
export const retrievePaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
};

// Update a payment intent
export const updatePaymentIntent = async (
  paymentIntentId: string,
  params: Stripe.PaymentIntentUpdateParams
): Promise<Stripe.PaymentIntent> => {
  return await stripe.paymentIntents.update(paymentIntentId, params);
};

// Confirm a payment intent
export const confirmPaymentIntent = async (
  paymentIntentId: string,
  params?: Stripe.PaymentIntentConfirmParams
): Promise<Stripe.PaymentIntent> => {
  return await stripe.paymentIntents.confirm(paymentIntentId, params);
};

// Create a customer
export const createStripeCustomer = async (
  email: string,
  name: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Customer> => {
  return await stripe.customers.create({
    email,
    name,
    metadata,
  });
};

// Retrieve a customer
export const retrieveStripeCustomer = async (
  customerId: string
): Promise<Stripe.Customer> => {
  return await stripe.customers.retrieve(customerId) as Stripe.Customer;
};

// Create a setup intent for saving payment methods
export const createSetupIntent = async (
  customerId: string
): Promise<Stripe.SetupIntent> => {
  return await stripe.setupIntents.create({
    customer: customerId,
    automatic_payment_methods: {
      enabled: true,
    },
  });
};

// List payment methods for a customer
export const listPaymentMethods = async (
  customerId: string,
  type: string = 'card'
): Promise<Stripe.PaymentMethod[]> => {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: type as Stripe.PaymentMethodListParams.Type,
  });
  return paymentMethods.data;
};

// Create a refund
export const createRefund = async (
  paymentIntentId: string,
  amount?: number,
  reason?: Stripe.RefundCreateParams.Reason
): Promise<Stripe.Refund> => {
  const params: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
  };
  
  if (amount) {
    params.amount = formatAmountForStripe(amount);
  }
  
  if (reason) {
    params.reason = reason;
  }
  
  return await stripe.refunds.create(params);
};

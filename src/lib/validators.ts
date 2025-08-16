import { z } from "zod";

// Feedback form validation
export const feedbackSchema = z.object({
  customer: z.string().min(1, "Customer name is required").max(100, "Customer name too long"),
  email: z.string().email("Invalid email address"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().min(1, "Comment is required").max(1000, "Comment too long"),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

// Chat message validation
export const chatMessageSchema = z.object({
  customerId: z.string().optional(),
  message: z.string().min(1, "Message cannot be empty").max(500, "Message too long"),
  context: z.object({
    preferences: z.array(z.string()).optional(),
    sessionId: z.string().optional(),
  }).optional(),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

// Demo preference validation
export const preferenceSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Preference label is required"),
  category: z.enum(["cleaning", "products", "access", "pets", "special"]),
  active: z.boolean().default(true),
});

export type Preference = z.infer<typeof preferenceSchema>;

// Contact form validation
export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  message: z.string().min(1, "Message is required").max(1000, "Message too long"),
  type: z.enum(["general", "careers", "partnership", "support"]).default("general"),
});

export type ContactInput = z.infer<typeof contactSchema>;

// Waitlist signup validation
export const waitlistSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  location: z.string().min(1, "Location is required").max(100, "Location too long"),
  frequency: z.enum(["weekly", "biweekly", "monthly"]).optional(),
  referralSource: z.string().optional(),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;

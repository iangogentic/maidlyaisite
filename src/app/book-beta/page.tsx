"use client";

import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/marketing/section";
import { CustomerInterestForm } from "@/components/forms/customer-interest-form";
import { Sparkles, MapPin, Users, Clock } from "lucide-react";

export default function BookBetaPage() {
  return (
    <>
      {/* Hero Section */}
      <Section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Beta Program - Limited Spots Available
          </Badge>
          <h1 className="text-display-lg font-bold text-foreground mb-6 font-display">
            Experience the Future of Home Cleaning
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Join our exclusive beta program and be among the first to experience AI-powered home cleaning that remembers exactly how you like things done.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Dallas Area Only</h3>
              <p className="text-sm text-muted-foreground text-center">
                Currently serving Dallas suburbs during our beta phase
              </p>
            </div>
            
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Limited Spots</h3>
              <p className="text-sm text-muted-foreground text-center">
                Only 50 beta customers to ensure personalized service
              </p>
            </div>
            
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Quick Response</h3>
              <p className="text-sm text-muted-foreground text-center">
                We'll contact you within 24 hours to schedule
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Form Section */}
      <Section className="bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <CustomerInterestForm />
        </div>
      </Section>

      {/* What to Expect */}
      <Section>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-display-sm font-bold text-foreground mb-6 font-display">
            What to Expect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-3">🤖 AI-Powered Memory</h3>
              <p className="text-muted-foreground">
                Our AI learns your preferences over time - from how you like your books arranged to your preferred cleaning products.
              </p>
            </div>
            
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-3">📱 Smart Scheduling</h3>
              <p className="text-muted-foreground">
                Flexible scheduling that adapts to your lifestyle with easy rescheduling and preference updates.
              </p>
            </div>
            
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-3">✨ Premium Quality</h3>
              <p className="text-muted-foreground">
                Professional cleaners equipped with eco-friendly supplies and detailed checklists personalized to your home.
              </p>
            </div>
            
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-3">💬 Direct Feedback</h3>
              <p className="text-muted-foreground">
                As a beta customer, your feedback directly shapes the future of our service. Help us build the perfect cleaning experience.
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

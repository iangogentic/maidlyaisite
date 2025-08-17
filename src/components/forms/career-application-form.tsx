"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowRight, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FormData {
  name: string;
  email: string;
  role_interest: string;
  portfolio_link: string;
  phone: string;
  linkedin: string;
  experience_level: string;
  why_interested: string;
  availability: string;
}

interface FormErrors {
  [key: string]: string;
}

export function CareerApplicationForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    role_interest: '',
    portfolio_link: '',
    phone: '',
    linkedin: '',
    experience_level: '',
    why_interested: '',
    availability: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.role_interest) {
      newErrors.role_interest = 'Please select a role';
    }

    if (formData.portfolio_link && !/^https?:\/\/.+/.test(formData.portfolio_link)) {
      newErrors.portfolio_link = 'Please enter a valid URL (starting with http:// or https://)';
    }

    if (formData.linkedin && !/^https?:\/\/.+/.test(formData.linkedin)) {
      newErrors.linkedin = 'Please enter a valid LinkedIn URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/careers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        setSubmitMessage('Application submitted successfully! Redirecting to schedule your intro call...');
        
        // Redirect to Calendly after a brief delay
        setTimeout(() => {
          window.open('https://calendly.com/tim-maidlyai/30min?month=2025-08', '_blank');
        }, 2000);
      } else {
        if (result.errors) {
          const newErrors: FormErrors = {};
          result.errors.forEach((error: { field: string; message: string }) => {
            newErrors[error.field] = error.message;
          });
          setErrors(newErrors);
        } else {
          setSubmitMessage(result.message || 'Failed to submit application. Please try again.');
        }
      }
    } catch (error) {
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-4">
          Application Submitted!
        </h3>
        <p className="text-lg text-muted-foreground mb-6">
          Thank you for applying to the Maidly.ai Founding Partner Program! You'll be redirected to schedule your 15-minute intro call with the founder in a moment.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          <a 
            href="https://calendly.com/tim-maidlyai/30min?month=2025-08" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Click here if you're not automatically redirected →
          </a>
        </p>
        <Badge variant="secondary" className="px-4 py-2">
          Application ID: #{Date.now().toString().slice(-6)}
        </Badge>
      </motion.div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Apply for Founding Partner Program</CardTitle>
        <p className="text-center text-muted-foreground">
          Join Maidly.ai as a founding partner and co-create the future
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Basic Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Full Name *
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="John Doe"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address *
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john@example.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-foreground mb-2">
                  LinkedIn Profile
                </label>
                <Input
                  id="linkedin"
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/johndoe"
                  className={errors.linkedin ? 'border-red-500' : ''}
                />
                {errors.linkedin && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.linkedin}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Role & Experience */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Role & Experience</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="role_interest" className="block text-sm font-medium text-foreground mb-2">
                  Role Interest *
                </label>
                <Select
                  value={formData.role_interest}
                  onValueChange={(value) => handleInputChange('role_interest', value)}
                >
                  <SelectTrigger className={errors.role_interest ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COO">COO Partner - Operations Builder</SelectItem>
                    <SelectItem value="CMO">CMO Partner - Marketing Builder</SelectItem>
                    <SelectItem value="CTO/AI">CTO/AI Partner - Tech Builder</SelectItem>
                    <SelectItem value="CFO">CFO Partner - Finance Builder</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role_interest && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.role_interest}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="experience_level" className="block text-sm font-medium text-foreground mb-2">
                  Experience Level
                </label>
                <Select
                  value={formData.experience_level}
                  onValueChange={(value) => handleInputChange('experience_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Recent Graduate">Recent Graduate</SelectItem>
                    <SelectItem value="1-2 years">1-2 years</SelectItem>
                    <SelectItem value="3-5 years">3-5 years</SelectItem>
                    <SelectItem value="5+ years">5+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label htmlFor="portfolio_link" className="block text-sm font-medium text-foreground mb-2">
                Portfolio/Website
              </label>
              <Input
                id="portfolio_link"
                type="url"
                value={formData.portfolio_link}
                onChange={(e) => handleInputChange('portfolio_link', e.target.value)}
                placeholder="https://yourportfolio.com"
                className={errors.portfolio_link ? 'border-red-500' : ''}
              />
              {errors.portfolio_link && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.portfolio_link}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-foreground mb-2">
                Availability
              </label>
              <Select
                value={formData.availability}
                onValueChange={(value) => handleInputChange('availability', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="When can you start?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Immediately">Immediately</SelectItem>
                  <SelectItem value="Within 2 weeks">Within 2 weeks</SelectItem>
                  <SelectItem value="Within 1 month">Within 1 month</SelectItem>
                  <SelectItem value="Flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Tell Us More</h4>
            
            <div>
              <label htmlFor="why_interested" className="block text-sm font-medium text-foreground mb-2">
                Why are you interested in becoming a founding partner at Maidly.ai?
              </label>
              <Textarea
                id="why_interested"
                value={formData.why_interested}
                onChange={(e) => handleInputChange('why_interested', e.target.value)}
                placeholder="Tell us what excites you about this opportunity..."
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.why_interested.length}/1000 characters
              </p>
            </div>
          </div>

          {/* Error/Success Messages */}
          <AnimatePresence>
            {submitMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-lg ${
                  submitMessage.includes('success') 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                <div className="flex items-center">
                  {submitMessage.includes('success') ? (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  ) : (
                    <AlertCircle className="w-5 h-5 mr-2" />
                  )}
                  {submitMessage}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full group"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting Application...
              </>
            ) : (
              <>
                Submit Application
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By submitting this application, you agree to our privacy policy and terms of service.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

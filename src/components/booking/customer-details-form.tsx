"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, MapPin } from 'lucide-react';

interface CustomerDetailsFormProps {
  data: any;
  onUpdate: (updates: any) => void;
}

export function CustomerDetailsForm({ data, onUpdate }: CustomerDetailsFormProps) {
  const [formData, setFormData] = useState({
    customerName: data.customerName || '',
    customerEmail: data.customerEmail || '',
    customerPhone: data.customerPhone || '',
    address: data.address || '',
    city: data.city || '',
    state: data.state || 'TX',
    zipCode: data.zipCode || '',
    specialInstructions: data.specialInstructions || ''
  });

  const handleChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdate(updated);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">Your Contact Information</h3>
        <p className="text-muted-foreground">
          We'll use this information to confirm your booking and coordinate service.
        </p>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Contact Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Full Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => handleChange('customerName', e.target.value)}
                placeholder="John Smith"
                required
              />
            </div>
            <div>
              <Label htmlFor="customerEmail">Email Address *</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleChange('customerEmail', e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="customerPhone">Phone Number</Label>
            <Input
              id="customerPhone"
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => handleChange('customerPhone', e.target.value)}
              placeholder="(555) 123-4567"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Optional, but helpful for service coordination
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Service Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="123 Main Street"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Plano"
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="TX"
                required
              />
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                placeholder="75024"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Special Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="specialInstructions">
              Anything special we should know?
            </Label>
            <Textarea
              id="specialInstructions"
              value={formData.specialInstructions}
              onChange={(e) => handleChange('specialInstructions', e.target.value)}
              placeholder="Access instructions, pets, areas to focus on, items to avoid, etc."
              rows={4}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Examples: "Spare key under mat", "Two cats - please keep doors closed", 
              "Focus extra attention on kitchen", "Avoid moving items on desk"
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Learning Notice */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 dark:text-blue-400 text-sm">🤖</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                AI Learning System
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Our AI will remember your preferences and improve with each visit. 
                The more details you provide, the better we can personalize your service!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

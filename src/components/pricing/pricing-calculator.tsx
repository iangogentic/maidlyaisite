"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  Leaf, 
  DollarSign, 
  Users, 
  Calendar,
  Phone,
  Check,
  Sparkles,
  Shield,
  Star
} from "lucide-react";

interface PricingState {
  homeSize: number;
  bedrooms: number;
  bathrooms: number;
  cleaningType: 'eco' | 'regular' | 'byo';
  serviceType: 'regular' | 'deep' | 'one_time';
  frequency: 'weekly' | 'biweekly' | 'monthly';
  addOns: string[];
}

const initialState: PricingState = {
  homeSize: 1200,
  bedrooms: 2,
  bathrooms: 2,
  cleaningType: 'regular',
  serviceType: 'regular',
  frequency: 'biweekly',
  addOns: []
};

const addOnOptions = [
  { id: 'oven', name: 'Inside Oven', price: 25 },
  { id: 'fridge', name: 'Inside Fridge', price: 20 },
  { id: 'cabinets', name: 'Inside Cabinets', price: 30 },
  { id: 'windows', name: 'Interior Windows', price: 15 }
];

const cleaningTypes = [
  {
    id: 'eco',
    name: 'Eco-Friendly',
    priceMultiplier: 1.15,
    icon: Leaf,
    badge: '+15%'
  },
  {
    id: 'regular',
    name: 'Regular',
    priceMultiplier: 1.0,
    icon: Sparkles,
    badge: 'Standard'
  },
  {
    id: 'byo',
    name: 'Bring Your Own',
    priceMultiplier: 0.8,
    icon: DollarSign,
    badge: '-20%'
  }
];

const frequencyOptions = [
  { id: 'weekly', name: 'Weekly', discount: 0.1, badge: '-10%' },
  { id: 'biweekly', name: 'Bi-weekly', discount: 0.05, badge: '-5%' },
  { id: 'monthly', name: 'Monthly', discount: 0, badge: 'Standard' }
];

interface PricingCalculatorProps {
  onPriceUpdate?: (data: {
    homeSize: number;
    bedrooms: number;
    bathrooms: number;
    cleaningType: 'eco_friendly' | 'regular' | 'bring_own_supplies';
    serviceType: 'regular' | 'deep' | 'one_time';
    frequency?: 'weekly' | 'bi_weekly' | 'monthly';
    addOns: string[];
    totalPrice: number;
  }) => void;
}

export function PricingCalculator({ onPriceUpdate }: PricingCalculatorProps = {}) {
  const [state, setState] = useState<PricingState>(initialState);

  // Call onPriceUpdate on initial mount and when state changes
  useEffect(() => {
    if (onPriceUpdate) {
      const totalPrice = calculateTotalPrice(state);
      const mappedCleaningType = state.cleaningType === 'eco' ? 'eco_friendly' : 
                                state.cleaningType === 'byo' ? 'bring_own_supplies' : 'regular';
      const mappedFrequency = state.frequency === 'biweekly' ? 'bi_weekly' : state.frequency;
      
      onPriceUpdate({
        homeSize: state.homeSize,
        bedrooms: state.bedrooms,
        bathrooms: state.bathrooms,
        cleaningType: mappedCleaningType as 'eco_friendly' | 'regular' | 'bring_own_supplies',
        serviceType: state.serviceType as 'regular' | 'deep' | 'one_time',
        frequency: mappedFrequency as 'weekly' | 'bi_weekly' | 'monthly' | undefined,
        addOns: state.addOns,
        totalPrice: totalPrice
      });
    }
  }, [state, onPriceUpdate]); // Run when state or onPriceUpdate changes

  const updateState = (updates: Partial<PricingState>) => {
    setState(prev => ({ ...prev, ...updates }));
    // onPriceUpdate will be called automatically by useEffect when state changes
  };

  const calculateTotalPrice = (currentState: PricingState) => {
    const basePrice = calculateBasePrice(currentState);
    const addOnPrice = calculateAddOnPrice(currentState);
    const frequencyDiscount = getFrequencyDiscount(currentState.frequency);
    
    const subtotal = basePrice + addOnPrice;
    const discountAmount = subtotal * frequencyDiscount;
    
    return Math.round(subtotal - discountAmount);
  };

  const calculateBasePrice = (currentState = state) => {
    // Base calculation: $0.08 per sq ft + $20 per bedroom + $25 per bathroom + $50 base fee
    const baseService = 50; // Base service fee
    const sqftPrice = currentState.homeSize * 0.08;
    const bedroomPrice = currentState.bedrooms * 20;
    const bathroomPrice = currentState.bathrooms * 25;
    
    return Math.round(baseService + sqftPrice + bedroomPrice + bathroomPrice);
  };

  const calculateAddOnPrice = (currentState = state) => {
    if (!currentState.addOns || !Array.isArray(currentState.addOns)) {
      return 0;
    }
    return currentState.addOns.reduce((total, addOnId) => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      return total + (addOn ? addOn.price : 0);
    }, 0);
  };

  const getFrequencyDiscount = (frequency?: string) => {
    const freq = frequencyOptions.find(f => f.id === frequency);
    return freq ? freq.discount : 0;
  };

  const calculateTotalPriceForDisplay = () => {
    const basePrice = calculateBasePrice();
    const cleaningType = cleaningTypes.find(t => t.id === state.cleaningType)!;
    const frequency = frequencyOptions.find(f => f.id === state.frequency)!;
    
    // Apply cleaning type multiplier
    const cleaningPrice = Math.round(basePrice * cleaningType.priceMultiplier);
    
    // Add-ons
    const addOnPrice = state.addOns.reduce((total, addOnId) => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      return total + (addOn?.price || 0);
    }, 0);
    
    // Apply frequency discount
    const subtotal = cleaningPrice + addOnPrice;
    const discount = Math.round(subtotal * frequency.discount);
    
    return {
      basePrice,
      cleaningPrice,
      addOnPrice,
      subtotal,
      frequencyDiscount: discount,
      total: subtotal - discount
    };
  };

  const pricing = calculateTotalPriceForDisplay();
  const selectedCleaningType = cleaningTypes.find(t => t.id === state.cleaningType)!;
  const selectedFrequency = frequencyOptions.find(f => f.id === state.frequency)!;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calculator */}
        <div className="lg:col-span-2 space-y-3">
          
          {/* Home Details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Home className="w-5 h-5 mr-2 text-primary" />
                Home Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Home Size Slider */}
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Home Size: <span className="text-primary font-semibold">{state.homeSize.toLocaleString()} sq ft</span>
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    step="50"
                    value={state.homeSize}
                    onChange={(e) => updateState({ homeSize: parseInt(e.target.value) })}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider relative z-10"
                    style={{
                      background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((state.homeSize - 500) / (5000 - 500)) * 100}%, hsl(var(--muted)) ${((state.homeSize - 500) / (5000 - 500)) * 100}%, hsl(var(--muted)) 100%)`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>500 sq ft</span>
                  <span>5,000+ sq ft</span>
                </div>
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Bedrooms</label>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4, 5].map((num) => (
                      <Button
                        key={num}
                        variant={state.bedrooms === num ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateState({ bedrooms: num })}
                        className="flex-1 h-10"
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Bathrooms</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <Button
                        key={num}
                        variant={state.bathrooms === num ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateState({ bathrooms: num })}
                        className="flex-1 h-10"
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cleaning Type */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Sparkles className="w-5 h-5 mr-2 text-primary" />
                Cleaning Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {cleaningTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = state.cleaningType === type.id;
                  
                  return (
                    <Button
                      key={type.id}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => updateState({ cleaningType: type.id as any })}
                      className="h-auto p-3 flex flex-col gap-1"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{type.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {type.badge}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Frequency */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Calendar className="w-5 h-5 mr-2 text-primary" />
                Frequency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {frequencyOptions.map((freq) => {
                  const isSelected = state.frequency === freq.id;
                  
                  return (
                    <Button
                      key={freq.id}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => updateState({ frequency: freq.id as any })}
                      className="h-auto p-3 flex flex-col gap-1"
                    >
                      <span className="font-medium">{freq.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {freq.badge}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Add-ons */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Star className="w-5 h-5 mr-2 text-primary" />
                Add-ons <span className="text-sm font-normal text-muted-foreground ml-2">(Optional)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {addOnOptions.map((addOn) => {
                  const isSelected = state.addOns.includes(addOn.id);
                  
                  return (
                    <Button
                      key={addOn.id}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => {
                        const newAddOns = isSelected
                          ? state.addOns.filter(id => id !== addOn.id)
                          : [...state.addOns, addOn.id];
                        updateState({ addOns: newAddOns });
                      }}
                      className="h-auto p-2 flex justify-between"
                    >
                      <span className="text-sm">{addOn.name}</span>
                      <span className="text-sm font-semibold">+${addOn.price}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Price Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <DollarSign className="w-5 h-5 mr-2 text-primary" />
                Your Quote
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Total Price */}
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-1">
                  ${pricing.total}
                </div>
                <p className="text-sm text-muted-foreground">per visit</p>
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Base service</span>
                  <span>${pricing.basePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>{selectedCleaningType.name}</span>
                  <span>{selectedCleaningType.priceMultiplier === 1 ? '$0' : `+$${pricing.cleaningPrice - pricing.basePrice}`}</span>
                </div>
                {state.addOns.length > 0 && (
                  <div className="flex justify-between">
                    <span>Add-ons ({state.addOns.length})</span>
                    <span>+${pricing.addOnPrice}</span>
                  </div>
                )}
                {pricing.frequencyDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{selectedFrequency.name} discount</span>
                    <span>-${pricing.frequencyDiscount}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Trust Signals */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3 h-3 text-green-600" />
                  <span>100% satisfaction guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="w-3 h-3 text-blue-600" />
                  <span>Insured & bonded crew</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>AI learns your preferences</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button size="lg" className="w-full bg-primary hover:bg-primary/90">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book This Service
                </Button>
                <Button size="lg" variant="outline" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Call (214) 555-MAID
                </Button>
              </div>

              {/* Price Lock */}
              <div className="text-center">
                <Badge variant="outline" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Price locked for 7 days
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

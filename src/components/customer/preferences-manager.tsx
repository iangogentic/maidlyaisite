'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Clock, 
  Moon, 
  Settings, 
  Save, 
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Smartphone
} from 'lucide-react';

interface CustomerPreferences {
  id?: number;
  customer_email: string;
  customer_phone?: string;
  customer_name?: string;
  // Notification channels
  sms_enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  // Notification types
  booking_confirmations: boolean;
  service_reminders: boolean;
  crew_arrival_notifications: boolean;
  service_completion: boolean;
  payment_receipts: boolean;
  promotional_messages: boolean;
  // Timing preferences
  reminder_timing: 'none' | '15min' | '30min' | '1hour' | '2hours' | '1day';
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone?: string;
}

interface PreferencesManagerProps {
  customerEmail: string;
  onSave?: (preferences: CustomerPreferences) => void;
  className?: string;
}

export default function PreferencesManager({ 
  customerEmail, 
  onSave,
  className = '' 
}: PreferencesManagerProps) {
  const [preferences, setPreferences] = useState<CustomerPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDefault, setIsDefault] = useState(false);

  // Fetch preferences on component mount
  const fetchPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/customer/preferences?email=${encodeURIComponent(customerEmail)}`);
      const data = await response.json();
      
      if (data.success) {
        setPreferences(data.preferences);
        setIsDefault(data.isDefault || false);
      } else {
        setError(data.error || 'Failed to load preferences');
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      setError('Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  }, [customerEmail]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  // Save preferences
  const handleSave = async () => {
    if (!preferences) return;
    
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      const response = await fetch('/api/customer/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPreferences(data.preferences);
        setSuccessMessage('Preferences saved successfully!');
        setIsDefault(false);
        onSave?.(data.preferences);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.error || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      const response = await fetch(`/api/customer/preferences?email=${encodeURIComponent(customerEmail)}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPreferences(data.preferences);
        setSuccessMessage('Preferences reset to defaults!');
        setIsDefault(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.error || 'Failed to reset preferences');
      }
    } catch (error) {
      console.error('Error resetting preferences:', error);
      setError('Failed to reset preferences');
    } finally {
      setIsSaving(false);
    }
  };

  // Update preference field
  const updatePreference = (field: keyof CustomerPreferences, value: any) => {
    if (!preferences) return;
    
    setPreferences(prev => prev ? {
      ...prev,
      [field]: value
    } : null);
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Preferences</h3>
          <p className="text-gray-600 mb-4">{error || 'Something went wrong'}</p>
          <button
            onClick={fetchPreferences}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Communication Preferences</h2>
          </div>
          {isDefault && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Using Defaults
            </span>
          )}
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 text-sm">{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-8">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={preferences.customer_name || ''}
                  onChange={(e) => updatePreference('customer_name', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={preferences.customer_phone || ''}
                  onChange={(e) => updatePreference('customer_phone', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Notification Channels */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Channels</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive updates via email</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.email_enabled}
                    onChange={(e) => updatePreference('email_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">SMS Notifications</p>
                    <p className="text-sm text-gray-600">Receive updates via text message</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.sms_enabled}
                    onChange={(e) => updatePreference('sms_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-600">Receive browser notifications</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.push_enabled}
                    onChange={(e) => updatePreference('push_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Notification Types */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Types</h3>
            <div className="space-y-3">
              {[
                { key: 'booking_confirmations', label: 'Booking Confirmations', desc: 'When your service is scheduled' },
                { key: 'service_reminders', label: 'Service Reminders', desc: 'Reminders before your scheduled service' },
                { key: 'crew_arrival_notifications', label: 'Crew Arrival', desc: 'When our team arrives at your location' },
                { key: 'service_completion', label: 'Service Completion', desc: 'When your service is finished' },
                { key: 'payment_receipts', label: 'Payment Receipts', desc: 'Payment confirmations and receipts' },
                { key: 'promotional_messages', label: 'Promotional Messages', desc: 'Special offers and updates' }
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{label}</p>
                    <p className="text-sm text-gray-600">{desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences[key as keyof CustomerPreferences] as boolean}
                      onChange={(e) => updatePreference(key as keyof CustomerPreferences, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Timing Preferences */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Timing Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Reminder Timing
                </label>
                <select
                  value={preferences.reminder_timing}
                  onChange={(e) => updatePreference('reminder_timing', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="none">No reminders</option>
                  <option value="15min">15 minutes before</option>
                  <option value="30min">30 minutes before</option>
                  <option value="1hour">1 hour before</option>
                  <option value="2hours">2 hours before</option>
                  <option value="1day">1 day before</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Moon className="inline h-4 w-4 mr-1" />
                    Quiet Hours Start
                  </label>
                  <input
                    type="time"
                    value={preferences.quiet_hours_start || ''}
                    onChange={(e) => updatePreference('quiet_hours_start', e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiet Hours End
                  </label>
                  <input
                    type="time"
                    value={preferences.quiet_hours_end || ''}
                    onChange={(e) => updatePreference('quiet_hours_end', e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                During quiet hours, you'll only receive urgent notifications
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
          </button>
          
          <button
            onClick={handleReset}
            disabled={isSaving}
            className="flex-1 sm:flex-none bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset to Defaults</span>
          </button>
        </div>
      </div>
    </div>
  );
}

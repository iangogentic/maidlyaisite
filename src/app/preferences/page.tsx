'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PreferencesManager from '@/components/customer/preferences-manager';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

function PreferencesPageContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(true);

  useEffect(() => {
    // Check if email is provided in URL params
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      setIsValidEmail(true);
      setShowEmailInput(false);
    }
  }, [searchParams]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail(email)) {
      setIsValidEmail(true);
      setShowEmailInput(false);
    }
  };

  const handleBackToEmail = () => {
    setShowEmailInput(true);
    setIsValidEmail(false);
  };

  if (showEmailInput) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Communication Preferences
            </h1>
            <p className="text-gray-600">
              Manage how you receive notifications from Maidly
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email address"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the email address associated with your Maidly account
                </p>
              </div>

              <button
                type="submit"
                disabled={!email || !validateEmail(email)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Access Preferences
              </button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Your preferences are stored securely and can be updated at any time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackToEmail}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Change Email
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Communication Preferences
              </h1>
              <p className="text-gray-600">
                Managing preferences for: <span className="font-medium">{email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Preferences Manager */}
        <PreferencesManager
          customerEmail={email}
          onSave={(preferences) => {
            console.log('Preferences saved:', preferences);
          }}
        />

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-center space-x-2 text-green-600 mb-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Secure & Private</span>
            </div>
            <p className="text-sm text-gray-600">
              Your communication preferences are stored securely and will only be used to 
              customize your notification experience with Maidly. You can update these 
              settings at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PreferencesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PreferencesPageContent />
    </Suspense>
  );
}

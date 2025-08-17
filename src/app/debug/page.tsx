"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Users, 
  Database,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

export default function DebugPage() {
  const [seedingCrew, setSeedingCrew] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const seedCrewMembers = async () => {
    setSeedingCrew(true);
    setSeedResult(null);
    
    try {
      const response = await fetch('/api/seed-crew', {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSeedResult('✅ Crew members seeded successfully!');
      } else {
        setSeedResult(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      setSeedResult(`❌ Error: ${error}`);
    } finally {
      setSeedingCrew(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Debug & Testing Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Use this page to test and debug the GPS crew check-in system before production deployment.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-yellow-900 mb-2">⚠️ Important Requirements</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Must be accessed via <strong>HTTPS</strong> (geolocation requirement)</li>
                <li>• Allow location permissions when prompted</li>
                <li>• Test on mobile device for best results</li>
                <li>• Ensure GPS/location services are enabled</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Database Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="w-4 h-4" />
                Database Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Seed the database with test crew members before testing the crew dashboard.
              </p>
              
              <Button
                onClick={seedCrewMembers}
                disabled={seedingCrew}
                className="w-full"
              >
                {seedingCrew ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Seeding...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Seed Crew Members
                  </>
                )}
              </Button>
              
              {seedResult && (
                <div className={`text-sm p-2 rounded ${
                  seedResult.includes('✅') 
                    ? 'bg-green-50 text-green-800' 
                    : 'bg-red-50 text-red-800'
                }`}>
                  {seedResult}
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                Creates 4 test crew members: Sarah Johnson, Mike Chen, Lisa Rodriguez, David Kim
              </div>
            </CardContent>
          </Card>

          {/* GPS Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="w-4 h-4" />
                GPS Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Test GPS location services and API integration before using the crew dashboard.
              </p>
              
              <a
                href="/test-gps"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full">
                  <MapPin className="w-4 h-4 mr-2" />
                  Open GPS Test
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              </a>
              
              <div className="text-xs text-gray-500">
                Tests geolocation permissions, accuracy, and API connectivity
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Test Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="/crew" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full h-auto p-4 flex-col">
                  <Users className="w-6 h-6 mb-2" />
                  <span className="font-medium">Crew Dashboard</span>
                  <span className="text-xs text-gray-500">Mobile GPS check-in</span>
                </Button>
              </a>
              
              <a href="/admin" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full h-auto p-4 flex-col">
                  <Database className="w-6 h-6 mb-2" />
                  <span className="font-medium">Admin Dashboard</span>
                  <span className="text-xs text-gray-500">Crew management</span>
                </Button>
              </a>
              
              <a href="/test-gps" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full h-auto p-4 flex-col">
                  <MapPin className="w-6 h-6 mb-2" />
                  <span className="font-medium">GPS Test</span>
                  <span className="text-xs text-gray-500">Location debugging</span>
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Testing Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Testing Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">1. Database Setup</p>
                  <p className="text-xs text-gray-600">Run "Seed Crew Members" above</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">2. GPS Permissions</p>
                  <p className="text-xs text-gray-600">Test GPS functionality and allow location access</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">3. API Integration</p>
                  <p className="text-xs text-gray-600">Verify check-in API works with GPS data</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">4. Mobile Testing</p>
                  <p className="text-xs text-gray-600">Test crew dashboard on mobile device</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">5. Admin Verification</p>
                  <p className="text-xs text-gray-600">Check admin dashboard shows crew locations and time entries</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-orange-600">Known Issues & Fixes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">🔒 HTTPS Required</p>
                <p className="text-gray-600">Geolocation API requires HTTPS. Use ngrok or deploy to test properly.</p>
              </div>
              
              <div>
                <p className="font-medium">📱 Mobile Accuracy</p>
                <p className="text-gray-600">GPS accuracy varies. Indoor: 10-50m, Outdoor: 3-10m typical.</p>
              </div>
              
              <div>
                <p className="font-medium">🔋 Battery Usage</p>
                <p className="text-gray-600">Continuous GPS tracking drains battery. Use wisely in production.</p>
              </div>
              
              <div>
                <p className="font-medium">🌐 Offline Handling</p>
                <p className="text-gray-600">App detects offline status but doesn't queue requests yet.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

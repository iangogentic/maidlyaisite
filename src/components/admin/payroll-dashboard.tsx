"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Send,
  Download,
  Plus,
  RefreshCw,
  MapPin,
  Star,
  CreditCard,
  FileText,
  Settings
} from "lucide-react";

interface CrewMember {
  id: number;
  name: string;
  email: string;
  phone?: string;
  employee_id: string;
  payment_type: 'hourly' | 'salary' | 'per_job' | 'commission';
  hourly_rate?: number;
  stripe_connect_account_id?: string;
  total_hours_this_period: number;
  gross_pay_this_period: number;
  performance_rating: number;
  status: 'active' | 'inactive';
}

interface TimeEntry {
  id: number;
  crew_member_id: number;
  crew_member_name: string;
  booking_id?: number;
  customer_name?: string;
  clock_in_time: string;
  clock_out_time?: string;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  status: 'active' | 'completed' | 'approved';
  location_clock_in?: {
    address: string;
  };
}

interface PayrollPeriod {
  id: number;
  start_date: string;
  end_date: string;
  pay_date: string;
  status: 'draft' | 'processing' | 'paid' | 'failed';
  total_amount_cents: number;
  total_crew_members: number;
}

export function PayrollDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedCrewMember, setSelectedCrewMember] = useState<CrewMember | null>(null);
  const [showOnboardingDialog, setShowOnboardingDialog] = useState(false);
  const [showPayrollDialog, setShowPayrollDialog] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [crewResponse, timeResponse, payrollResponse] = await Promise.all([
        fetch('/api/payroll/crew-members'),
        fetch('/api/payroll/time-entries'),
        fetch('/api/payroll/process')
      ]);

      if (crewResponse.ok) {
        const crewData = await crewResponse.json();
        setCrewMembers(crewData.crew_members || []);
      }

      if (timeResponse.ok) {
        const timeData = await timeResponse.json();
        setTimeEntries(timeData.time_entries || []);
      }

      if (payrollResponse.ok) {
        const payrollData = await payrollResponse.json();
        setPayrollPeriods(payrollData.payroll_periods || []);
      }
    } catch (error) {
      console.error('Error fetching payroll data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Process payroll
  const processPayroll = async (crewMemberIds?: number[]) => {
    try {
      setProcessing(true);
      
      const response = await fetch('/api/payroll/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payroll_period_id: payrollPeriods.find(p => p.status === 'draft')?.id,
          crew_member_ids: crewMemberIds,
          pay_date: new Date().toISOString().split('T')[0]
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Payroll processed:', result);
        await fetchData(); // Refresh data
        setShowPayrollDialog(false);
      }
    } catch (error) {
      console.error('Error processing payroll:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Start Stripe onboarding
  const startOnboarding = async (crewMemberId: number) => {
    try {
      const response = await fetch('/api/payroll/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crew_member_id: crewMemberId,
          return_url: `${window.location.origin}/admin/payroll/onboarding/complete`,
          refresh_url: `${window.location.origin}/admin/payroll/onboarding/refresh`
        })
      });

      if (response.ok) {
        const result = await response.json();
        window.open(result.onboarding_url, '_blank');
      }
    } catch (error) {
      console.error('Error starting onboarding:', error);
    }
  };

  // Calculate summary stats
  const totalPayrollThisPeriod = crewMembers.reduce((sum, cm) => sum + cm.gross_pay_this_period, 0);
  const totalHoursThisPeriod = crewMembers.reduce((sum, cm) => sum + cm.total_hours_this_period, 0);
  const activeTimeEntries = timeEntries.filter(te => te.status === 'active').length;
  const pendingOnboarding = crewMembers.filter(cm => !cm.stripe_connect_account_id).length;

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();
  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
        <span className="ml-2 text-gray-600">Loading payroll data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payroll Management</h2>
          <p className="text-gray-600">Manage crew payments, time tracking, and Stripe Connect integration</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showPayrollDialog} onOpenChange={setShowPayrollDialog}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Send className="h-4 w-4 mr-2" />
                Process Payroll
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Process Payroll</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-gray-600">
                  This will send payments to all crew members with completed Stripe onboarding.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Payment Summary</p>
                      <p className="text-sm text-yellow-700">
                        Total Amount: {formatCurrency(totalPayrollThisPeriod)}
                      </p>
                      <p className="text-sm text-yellow-700">
                        Crew Members: {crewMembers.filter(cm => cm.stripe_connect_account_id).length} ready
                      </p>
                      {pendingOnboarding > 0 && (
                        <p className="text-sm text-yellow-700">
                          {pendingOnboarding} crew members need Stripe onboarding
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowPayrollDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => processPayroll()}
                  disabled={processing}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {processing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Process Payments
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payroll</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPayrollThisPeriod)}</p>
                <p className="text-xs text-green-600 mt-1">This period</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{totalHoursThisPeriod.toFixed(1)}</p>
                <p className="text-xs text-blue-600 mt-1">This period</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Crew</p>
                <p className="text-2xl font-bold text-gray-900">{crewMembers.length}</p>
                <p className="text-xs text-purple-600 mt-1">{activeTimeEntries} clocked in</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Setup</p>
                <p className="text-2xl font-bold text-gray-900">{pendingOnboarding}</p>
                <p className="text-xs text-orange-600 mt-1">Need Stripe onboarding</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="crew">Crew Members</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
          <TabsTrigger value="periods">Pay Periods</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Time Entries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Time Entries
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {timeEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{entry.crew_member_name}</p>
                      <p className="text-sm text-gray-600">
                        {entry.customer_name || 'Training/Admin'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(entry.clock_in_time)} - {entry.clock_out_time ? formatTime(entry.clock_out_time) : 'Active'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={
                        entry.status === 'active' ? 'bg-green-100 text-green-800' :
                        entry.status === 'completed' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {entry.status}
                      </Badge>
                      <p className="text-sm font-medium mt-1">{entry.total_hours.toFixed(1)}h</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Crew Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Crew Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {crewMembers.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-teal-700">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.total_hours_this_period.toFixed(1)} hours</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{member.performance_rating.toFixed(1)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{formatCurrency(member.gross_pay_this_period)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Crew Members Tab */}
        <TabsContent value="crew" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Crew Members & Payment Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crewMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-teal-700">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <p className="text-sm text-gray-500">
                          {member.payment_type === 'hourly' ? `$${member.hourly_rate}/hr` : member.payment_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(member.gross_pay_this_period)}</p>
                        <p className="text-xs text-gray-500">{member.total_hours_this_period.toFixed(1)} hours</p>
                      </div>
                      {member.stripe_connect_account_id ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => startOnboarding(member.id)}
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Setup Payment
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedCrewMember(member)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Tracking Tab */}
        <TabsContent value="time" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Time Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{entry.crew_member_name}</h3>
                          <p className="text-sm text-gray-600">
                            {entry.customer_name || 'Training/Admin'}
                          </p>
                          {entry.location_clock_in && (
                            <p className="text-xs text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {entry.location_clock_in.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatTime(entry.clock_in_time)} - {entry.clock_out_time ? formatTime(entry.clock_out_time) : 'Active'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {entry.regular_hours.toFixed(1)}h regular
                          {entry.overtime_hours > 0 && ` + ${entry.overtime_hours.toFixed(1)}h OT`}
                        </p>
                      </div>
                      <Badge className={
                        entry.status === 'active' ? 'bg-green-100 text-green-800' :
                        entry.status === 'completed' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {entry.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pay Periods Tab */}
        <TabsContent value="periods" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Periods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payrollPeriods.map((period) => (
                  <div key={period.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {formatDate(period.start_date)} - {formatDate(period.end_date)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Pay Date: {formatDate(period.pay_date)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {period.total_crew_members} crew members
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-lg font-medium">{formatCurrency(period.total_amount_cents)}</p>
                        <Badge className={
                          period.status === 'paid' ? 'bg-green-100 text-green-800' :
                          period.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          period.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {period.status}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Crew Member Details Modal */}
      {selectedCrewMember && (
        <Dialog open={!!selectedCrewMember} onOpenChange={() => setSelectedCrewMember(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedCrewMember.name} - Payroll Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Employee ID</label>
                  <p className="text-lg font-medium">{selectedCrewMember.employee_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Type</label>
                  <p className="text-lg font-medium capitalize">{selectedCrewMember.payment_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Rate</label>
                  <p className="text-lg font-medium">
                    {selectedCrewMember.hourly_rate ? `$${selectedCrewMember.hourly_rate}/hr` : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Performance Rating</label>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-lg font-medium">{selectedCrewMember.performance_rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">This Period</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Hours</label>
                    <p className="text-lg font-medium">{selectedCrewMember.total_hours_this_period.toFixed(1)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Gross Pay</label>
                    <p className="text-lg font-medium">{formatCurrency(selectedCrewMember.gross_pay_this_period)}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Payment Setup</h4>
                {selectedCrewMember.stripe_connect_account_id ? (
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span>Stripe Connect account active</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-orange-700">
                      <AlertCircle className="h-5 w-5" />
                      <span>Payment setup required</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => startOnboarding(selectedCrewMember.id)}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Setup Now
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedCrewMember(null)}>
                  Close
                </Button>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Send className="h-4 w-4 mr-2" />
                  Send Individual Payment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

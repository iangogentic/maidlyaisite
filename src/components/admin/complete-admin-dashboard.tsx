"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PushNotificationCenter } from "./push-notification-center";
import { PayrollDashboard } from "./payroll-dashboard";
import { PhotoGalleryView } from "./photo-gallery-view";
import { DragDropCalendar } from "./drag-drop-calendar";
import { CrewAssignmentModal } from "./crew-assignment-modal";
import { ConflictDetectorPanel } from "./conflict-detector-panel";
import { BulkOperationsToolbar } from "./bulk-operations-toolbar";
import { SelectableBookingCard } from "./selectable-booking-card";
import { RevenueChart, SatisfactionChart } from "./lazy-charts";
import { Booking } from '@/lib/database-neon';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock, 
  MapPin,
  Phone,
  Mail,
  Star,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  DollarSign,
  Search,
  Filter,
  Plus,
  Bell,
  Settings,
  LogOut,
  Home,
  Briefcase,
  UserCheck,
  Zap,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Send,
  Calendar as CalendarIcon,
  XCircle,
  Camera,
  Image,
  Grid3X3,
  ExternalLink,
  Copy,
  GraduationCap
} from "lucide-react";

interface CompleteAdminDashboardProps {
  onLogout: () => void;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  total_bookings: number;
  satisfaction_score: number;
  lifetime_value_cents: number;
  last_service_date?: string;
}

interface Crew {
  id: number;
  name: string;
  members: string[];
  status: 'available' | 'on_job' | 'break' | 'off_duty';
  current_job?: string;
  rating: number;
  jobs_completed: number;
}

interface CareerApplication {
  id: number;
  name: string;
  email: string;
  role_interest: string;
  portfolio_link?: string;
  phone?: string;
  linkedin?: string;
  experience_level?: string;
  why_interested?: string;
  availability?: string;
  acceptance_token?: string;
  status?: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

interface QuickStat {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

export function CompleteAdminDashboard({ onLogout }: CompleteAdminDashboardProps) {
  const [selectedView, setSelectedView] = useState<'overview' | 'jobs' | 'customers' | 'crew' | 'calendar' | 'conflicts' | 'payroll' | 'hiring' | 'photos' | 'analytics'>('overview');
  const [searchQuery, setSearchQuery] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [crewMembers, setCrewMembers] = useState<any[]>([]);
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<CareerApplication | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [showNewBookingDialog, setShowNewBookingDialog] = useState(false);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  const [showNewCrewDialog, setShowNewCrewDialog] = useState(false);
  const [showNewCrewMemberDialog, setShowNewCrewMemberDialog] = useState(false);
  const [newCrewMember, setNewCrewMember] = useState({
    name: '',
    email: '',
    phone: '',
    hourly_rate: ''
  });

  // Bulk operations state
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState<Set<number>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  
  // Crew assignment modal state
  const [showCrewAssignment, setShowCrewAssignment] = useState(false);
  const [selectedBookingForCrew, setSelectedBookingForCrew] = useState<Booking | null>(null);
  
  // New booking form state
  const [newBooking, setNewBooking] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    address: '',
    city: '',
    state: 'TX',
    zip_code: '',
    scheduled_date: '',
    scheduled_time: '',
    service_type: 'regular',
    home_size: 1500,
    bedrooms: 3,
    bathrooms: 2,
    special_instructions: ''
  });

  // Fetch data functions
  const fetchBookings = useCallback(async () => {
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  }, []);

  const fetchCrewMembers = useCallback(async () => {
    try {
      const response = await fetch('/api/crew');
      if (response.ok) {
        const data = await response.json();
        setCrewMembers(data.crew_members || []);
      }
    } catch (error) {
      console.error('Error fetching crew members:', error);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  }, []);

  const fetchCrews = useCallback(async () => {
    try {
      const response = await fetch('/api/crew');
      if (response.ok) {
        const data = await response.json();
        setCrews(data.crews || []);
      }
    } catch (error) {
      console.error('Error fetching crews:', error);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/careers');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.data?.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchBookings(), fetchCustomers(), fetchCrews(), fetchCrewMembers(), fetchApplications()]);
    setRefreshing(false);
  }, [fetchBookings, fetchCustomers, fetchCrews, fetchCrewMembers, fetchApplications]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBookings(), fetchCustomers(), fetchCrews(), fetchCrewMembers(), fetchApplications()]);
      setLoading(false);
    };
    loadData();
  }, [fetchBookings, fetchCustomers, fetchCrews, fetchCrewMembers, fetchApplications]);

  // Calculate stats from real data
  const todaysBookings = bookings.filter(booking => {
    const today = new Date().toISOString().split('T')[0];
    return booking.scheduled_date === today;
  });

  const todaysRevenue = todaysBookings.reduce((sum, booking) => sum + (booking.price_cents / 100), 0);
  const activeJobs = bookings.filter(b => ['scheduled', 'confirmed', 'in_progress'].includes(b.status)).length;
  const avgRating = customers.length > 0 
    ? (customers.reduce((sum, c) => sum + c.satisfaction_score, 0) / customers.length).toFixed(1)
    : "4.9";

  const quickStats: QuickStat[] = [
    {
      label: "Today's Revenue",
      value: `$${todaysRevenue.toFixed(0)}`,
      change: `${todaysBookings.length} bookings`,
      trend: 'up',
      icon: <DollarSign className="h-5 w-5" />,
      color: "text-green-600 bg-green-50 border-green-200"
    },
    {
      label: "Active Jobs",
      value: activeJobs,
      change: `${bookings.length} total`,
      trend: 'up',
      icon: <Briefcase className="h-5 w-5" />,
      color: "text-blue-600 bg-blue-50 border-blue-200"
    },
    {
      label: "Total Customers",
      value: customers.length,
      change: "Growing",
      trend: 'up',
      icon: <Users className="h-5 w-5" />,
      color: "text-purple-600 bg-purple-50 border-purple-200"
    },
    {
      label: "Avg Rating",
      value: avgRating,
      change: "Excellent",
      trend: 'up',
      icon: <Star className="h-5 w-5" />,
      color: "text-yellow-600 bg-yellow-50 border-yellow-200"
    }
  ];

  // Handle booking status update
  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  // Handle booking reschedule via drag-and-drop
  const handleBookingReschedule = async (bookingId: number, newDate: string, newTime: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          scheduled_date: newDate,
          scheduled_time: newTime
        })
      });
      
      if (response.ok) {
        await refreshData();
      } else {
        throw new Error('Failed to reschedule booking');
      }
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      throw error;
    }
  };

  // Handle crew assignment
    const handleCrewAssignment = async (bookingId: number, crewMemberId: number) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/assign-crew`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crew_member_id: crewMemberId
        })
      });

      if (response.ok) {
        await refreshData();
      } else {
        console.error('Failed to assign crew member');
      }
    } catch (error) {
      console.error('Error assigning crew:', error);
    }
  };

  // Handle crew member creation
  const handleCreateCrewMember = async () => {
    try {
      // Basic validation
      if (!newCrewMember.name.trim()) {
        alert('Please enter a name');
        return;
      }
      if (!newCrewMember.email.trim()) {
        alert('Please enter an email address');
        return;
      }
      if (!newCrewMember.email.includes('@')) {
        alert('Please enter a valid email address');
        return;
      }
      if (!newCrewMember.hourly_rate.trim()) {
        alert('Please enter an hourly rate');
        return;
      }

      const response = await fetch('/api/crew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCrewMember.name.trim(),
          email: newCrewMember.email.trim().toLowerCase(),
          phone: newCrewMember.phone.trim(),
          hourly_rate_cents: Math.round(parseFloat(newCrewMember.hourly_rate) * 100)
        })
      });

      if (response.ok) {
        setShowNewCrewMemberDialog(false);
        setNewCrewMember({ name: '', email: '', phone: '', hourly_rate: '' });
        await refreshData();
        alert('Crew member created successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Failed to create crew member';
        
        if (errorMessage.includes('duplicate key') || errorMessage.includes('already exists')) {
          alert('A crew member with this email address already exists. Please use a different email.');
        } else {
          alert(`Failed to create crew member: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('Error creating crew member:', error);
      alert('Error creating crew member: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Bulk operations handlers
  const handleBulkSelect = (bookingId: number, selected: boolean) => {
    const newSelected = new Set(selectedBookings);
    if (selected) {
      newSelected.add(bookingId);
    } else {
      newSelected.delete(bookingId);
    }
    setSelectedBookings(newSelected);
  };

  const handleSelectAll = () => {
    const allBookingIds = new Set(bookings.map(b => b.id).filter(id => id !== undefined) as number[]);
    setSelectedBookings(allBookingIds);
  };

  const handleDeselectAll = () => {
    setSelectedBookings(new Set());
  };

  const handleBulkStatusUpdate = async (status: string) => {
    setBulkLoading(true);
    try {
      const response = await fetch('/api/bookings/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingIds: Array.from(selectedBookings),
          operation: 'status_update',
          data: { status }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Successfully updated ${result.summary.successful} booking(s) to ${status}`);
        await refreshData();
        setSelectedBookings(new Set());
      } else {
        alert(`Bulk update failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error in bulk status update:', error);
      alert('Error updating bookings');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkCrewAssignment = async (crewMemberId: number) => {
    setBulkLoading(true);
    try {
      const response = await fetch('/api/bookings/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingIds: Array.from(selectedBookings),
          operation: 'crew_assignment',
          data: { crew_member_id: crewMemberId }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const crewMember = crewMembers.find(cm => cm.id === crewMemberId);
        alert(`Successfully assigned ${crewMember?.name || 'crew member'} to ${result.summary.successful} booking(s)`);
        await refreshData();
        setSelectedBookings(new Set());
      } else {
        alert(`Bulk crew assignment failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error in bulk crew assignment:', error);
      alert('Error assigning crew to bookings');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkReschedule = async (date: string, time: string) => {
    setBulkLoading(true);
    try {
      const response = await fetch('/api/bookings/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingIds: Array.from(selectedBookings),
          operation: 'reschedule',
          data: { 
            scheduled_date: date,
            scheduled_time: time
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Successfully rescheduled ${result.summary.successful} booking(s) to ${date} at ${time}`);
        await refreshData();
        setSelectedBookings(new Set());
      } else {
        alert(`Bulk reschedule failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error in bulk reschedule:', error);
      alert('Error rescheduling bookings');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleCloseBulkMode = () => {
    setBulkMode(false);
    setSelectedBookings(new Set());
  };



  // Handle new booking creation
  const createBooking = async () => {
    try {
      const bookingData = {
        ...newBooking,
        price_cents: 25000, // Default price
        duration_minutes: 120,
        cleaning_type: 'regular',
        add_ons: [],
        ai_preferences: {}
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        setShowNewBookingDialog(false);
        setNewBooking({
          customer_name: '',
          customer_email: '',
          customer_phone: '',
          address: '',
          city: '',
          state: 'TX',
          zip_code: '',
          scheduled_date: '',
          scheduled_time: '',
          service_type: 'regular',
          home_size: 1500,
          bedrooms: 3,
          bathrooms: 2,
          special_instructions: ''
        });
        await refreshData();
      }
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  // Hiring helper functions
  const formatApplicationDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleColor = (role: string) => {
    const colors = {
      COO: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      CMO: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      "CTO/AI": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      CFO: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getApplicationStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      accepted: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      accepted: CheckCircle,
      rejected: XCircle,
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  const handleApplicationClick = (application: CareerApplication) => {
    setSelectedApplication(application);
    setIsApplicationModalOpen(true);
  };

  const copyAcceptanceLink = async (token: string) => {
    const link = `${window.location.origin}/acceptance/${token}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const updateApplicationStatus = async (id: number, status: 'pending' | 'accepted' | 'rejected') => {
    try {
      const response = await fetch(`/api/admin/careers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Refresh applications data
        await fetchApplications();
        // Update selected application if it's the one being updated
        if (selectedApplication?.id === id) {
          setSelectedApplication({ ...selectedApplication, status });
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Maidly Operations</h1>
              </div>
              
              {/* Organized Navigation */}
              <nav className="hidden md:flex space-x-1">
                {/* Core Operations */}
                {[
                  { id: 'overview', label: 'Overview', icon: Home },
                  { id: 'jobs', label: 'Jobs', icon: Briefcase },
                  { id: 'calendar', label: 'Calendar', icon: Calendar },
                  { id: 'conflicts', label: 'Conflicts', icon: AlertTriangle }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedView(item.id as any)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedView === item.id
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                
                {/* Separator */}
                <div className="w-px h-8 bg-gray-200 mx-2" />
                
                {/* People Management */}
                <div className="relative">
                  <button
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => {
                      const dropdown = document.getElementById('people-dropdown');
                      dropdown?.classList.toggle('hidden');
                    }}
                  >
                    <Users className="h-4 w-4" />
                    <span>People</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <div id="people-dropdown" className="hidden absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    {[
                      { id: 'customers', label: 'Customers', icon: Users },
                      { id: 'crew', label: 'Crew', icon: UserCheck },
                      { id: 'hiring', label: 'Hiring', icon: GraduationCap }
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedView(item.id as any);
                            document.getElementById('people-dropdown')?.classList.add('hidden');
                          }}
                          className={`w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
                            selectedView === item.id
                              ? 'bg-teal-50 text-teal-700'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Business Intelligence */}
                <div className="relative">
                  <button
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => {
                      const dropdown = document.getElementById('business-dropdown');
                      dropdown?.classList.toggle('hidden');
                    }}
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Business</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <div id="business-dropdown" className="hidden absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    {[
                      { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                      { id: 'payroll', label: 'Payroll', icon: DollarSign },
                      { id: 'photos', label: 'Photos', icon: Camera }
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedView(item.id as any);
                            document.getElementById('business-dropdown')?.classList.add('hidden');
                          }}
                          className={`w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
                            selectedView === item.id
                              ? 'bg-teal-50 text-teal-700'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </nav>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search jobs, customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Refresh */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshData}
                disabled={refreshing}
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>

              {/* Notifications */}
              <PushNotificationCenter userId="admin" />

              {/* Settings */}
              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>

              {/* Logout */}
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6">
        {selectedView === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickStats.map((stat, index) => (
                <Card key={index} className={`border ${stat.color.split(' ')[2]}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className={`text-xs ${stat.color.split(' ')[0]} mt-1`}>
                          {stat.change}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.color.split(' ')[1]} ${stat.color.split(' ')[0]}`}>
                        {stat.icon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Schedule */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-semibold">Today's Schedule</CardTitle>
                  <Dialog open={showNewBookingDialog} onOpenChange={setShowNewBookingDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Job
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Schedule New Job</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Customer Name</label>
                          <Input
                            value={newBooking.customer_name}
                            onChange={(e) => setNewBooking({...newBooking, customer_name: e.target.value})}
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email</label>
                          <Input
                            type="email"
                            value={newBooking.customer_email}
                            onChange={(e) => setNewBooking({...newBooking, customer_email: e.target.value})}
                            placeholder="john@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Phone</label>
                          <Input
                            value={newBooking.customer_phone}
                            onChange={(e) => setNewBooking({...newBooking, customer_phone: e.target.value})}
                            placeholder="(555) 123-4567"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Service Type</label>
                          <select 
                            className="w-full p-2 border rounded-md"
                            value={newBooking.service_type}
                            onChange={(e) => setNewBooking({...newBooking, service_type: e.target.value})}
                          >
                            <option value="regular">Regular Cleaning</option>
                            <option value="deep">Deep Cleaning</option>
                            <option value="one_time">One Time</option>
                            <option value="move_in">Move In</option>
                            <option value="move_out">Move Out</option>
                          </select>
                        </div>
                        <div className="col-span-2 space-y-2">
                          <label className="text-sm font-medium">Address</label>
                          <Input
                            value={newBooking.address}
                            onChange={(e) => setNewBooking({...newBooking, address: e.target.value})}
                            placeholder="123 Main St"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">City</label>
                          <Input
                            value={newBooking.city}
                            onChange={(e) => setNewBooking({...newBooking, city: e.target.value})}
                            placeholder="Dallas"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">ZIP Code</label>
                          <Input
                            value={newBooking.zip_code}
                            onChange={(e) => setNewBooking({...newBooking, zip_code: e.target.value})}
                            placeholder="75201"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Date</label>
                          <Input
                            type="date"
                            value={newBooking.scheduled_date}
                            onChange={(e) => setNewBooking({...newBooking, scheduled_date: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Time</label>
                          <Input
                            type="time"
                            value={newBooking.scheduled_time}
                            onChange={(e) => setNewBooking({...newBooking, scheduled_time: e.target.value})}
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <label className="text-sm font-medium">Special Instructions</label>
                          <Textarea
                            value={newBooking.special_instructions}
                            onChange={(e) => setNewBooking({...newBooking, special_instructions: e.target.value})}
                            placeholder="Any special requests or notes..."
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowNewBookingDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={createBooking} className="bg-teal-600 hover:bg-teal-700">
                          Schedule Job
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="space-y-4">
                  {todaysBookings.length > 0 ? (
                    todaysBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {formatTime(booking.scheduled_time)}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">{booking.customer_name}</h4>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {booking.address}, {booking.city}
                            </p>
                            <p className="text-sm text-gray-500">
                              {booking.service_type} • ${(booking.price_cents / 100).toFixed(0)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Phone className="h-4 w-4" />
                          </Button>
                          {booking.status === 'scheduled' && (
                            <Button 
                              size="sm" 
                              onClick={() => booking.id && updateBookingStatus(booking.id, 'confirmed')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Confirm
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No jobs scheduled for today</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getStatusColor(booking.status)}`}>
                        <Calendar className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{booking.customer_name}</p>
                        <p className="text-sm text-gray-600">{booking.service_type}</p>
                        <p className="text-xs text-gray-400">{formatDate(booking.scheduled_date)}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    className="h-20 flex-col space-y-2 bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => setShowNewBookingDialog(true)}
                  >
                    <Calendar className="h-6 w-6" />
                    <span className="text-sm">Schedule Job</span>
                  </Button>
                  <Button 
                    className="h-20 flex-col space-y-2 bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => setShowNewCustomerDialog(true)}
                  >
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Add Customer</span>
                  </Button>
                  <Button className="h-20 flex-col space-y-2 bg-purple-500 hover:bg-purple-600 text-white">
                    <UserCheck className="h-6 w-6" />
                    <span className="text-sm">Crew Check-in</span>
                  </Button>
                  <Button className="h-20 flex-col space-y-2 bg-orange-500 hover:bg-orange-600 text-white">
                    <Send className="h-6 w-6" />
                    <span className="text-sm">Send Invoice</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Jobs Management View */}
        {selectedView === 'jobs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Jobs Management</h2>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setBulkMode(!bulkMode)}
                  className={bulkMode ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  {bulkMode ? 'Exit Bulk Mode' : 'Bulk Operations'}
                </Button>
                <Button 
                  onClick={() => setShowNewBookingDialog(true)}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Job
                </Button>
              </div>
            </div>

            {/* Bulk Operations Toolbar */}
            {bulkMode && (
              <BulkOperationsToolbar
                selectedCount={selectedBookings.size}
                totalCount={bookings.length}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                onBulkStatusUpdate={handleBulkStatusUpdate}
                onBulkCrewAssignment={handleBulkCrewAssignment}
                onBulkReschedule={handleBulkReschedule}
                onClose={handleCloseBulkMode}
                crewMembers={crewMembers}
                isLoading={bulkLoading}
              />
            )}

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                      <p className="text-gray-500">Create your first booking to get started.</p>
                    </div>
                  ) : bulkMode ? (
                    // Bulk mode - use SelectableBookingCard
                    bookings.map((booking) => (
                      <SelectableBookingCard
                        key={booking.id}
                        booking={booking}
                        isSelected={booking.id ? selectedBookings.has(booking.id) : false}
                        onSelect={handleBulkSelect}
                        onClick={() => setSelectedBooking(booking)}
                        onAssignCrew={(booking) => {
                          setSelectedBookingForCrew(booking);
                          setShowCrewAssignment(true);
                        }}
                      />
                    ))
                  ) : (
                    // Normal mode - use original layout
                    bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-medium text-gray-900">{booking.customer_name}</h3>
                              <p className="text-sm text-gray-600">
                                {formatDate(booking.scheduled_date)} at {formatTime(booking.scheduled_time)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {booking.address}, {booking.city} • {booking.service_type}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                          <span className="font-medium">${(booking.price_cents / 100).toFixed(0)}</span>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedBookingForCrew(booking);
                                setShowCrewAssignment(true);
                              }}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Customers Management View */}
        {selectedView === 'customers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
              <Button 
                onClick={() => setShowNewCustomerDialog(true)}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Customer
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {customers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-medium text-gray-900">{customer.name}</h3>
                            <p className="text-sm text-gray-600">{customer.email}</p>
                            <p className="text-sm text-gray-500">
                              {customer.total_bookings} bookings • ${(customer.lifetime_value_cents / 100).toFixed(0)} LTV
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">{customer.satisfaction_score.toFixed(1)}</span>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Calendar Management View */}
        {selectedView === 'calendar' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Booking Calendar</h2>
              <Button 
                onClick={() => setShowNewBookingDialog(true)}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule Job
              </Button>
            </div>

            <DragDropCalendar
              bookings={bookings}
              crews={crews}
              crewMembers={crewMembers}
              onBookingUpdate={handleBookingReschedule}
              onBookingClick={setSelectedBooking}
              onAssignCrew={handleCrewAssignment}
              showConflicts={true}
            />
          </div>
        )}

        {/* Conflict Detection View */}
        {selectedView === 'conflicts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Conflict Detection</h2>
              <Button 
                onClick={refreshData}
                disabled={refreshing}
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Analysis
              </Button>
            </div>

            <ConflictDetectorPanel onRefresh={refreshData} />
          </div>
        )}

        {/* Analytics View */}
        {selectedView === 'analytics' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Business Analytics</h2>
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={refreshData}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Revenue Chart */}
              <RevenueChart />
              
              {/* Customer Satisfaction Chart */}
              <SatisfactionChart onRefresh={refreshData} />
              
              {/* Additional Analytics Placeholders */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Customer Satisfaction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Customer satisfaction metrics coming soon</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      Crew Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Crew performance analytics coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Crew Management View */}
        {selectedView === 'crew' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Crew Management</h2>
              <div className="flex space-x-2">
                <Dialog open={showNewCrewMemberDialog} onOpenChange={setShowNewCrewMemberDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-teal-600 hover:bg-teal-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Crew Member</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input 
                          placeholder="John Smith" 
                          value={newCrewMember.name}
                          onChange={(e) => setNewCrewMember({...newCrewMember, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input 
                          type="email"
                          placeholder="john@example.com" 
                          value={newCrewMember.email}
                          onChange={(e) => setNewCrewMember({...newCrewMember, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Phone</label>
                        <Input 
                          placeholder="(555) 123-4567" 
                          value={newCrewMember.phone}
                          onChange={(e) => setNewCrewMember({...newCrewMember, phone: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Hourly Rate ($)</label>
                        <Input 
                          type="number"
                          placeholder="15.00" 
                          value={newCrewMember.hourly_rate}
                          onChange={(e) => setNewCrewMember({...newCrewMember, hourly_rate: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowNewCrewMemberDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        className="bg-teal-600 hover:bg-teal-700"
                        onClick={handleCreateCrewMember}
                        disabled={!newCrewMember.name || !newCrewMember.email}
                      >
                        Add Member
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={showNewCrewDialog} onOpenChange={setShowNewCrewDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Crew</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Team Name</label>
                      <Input placeholder="Team Alpha" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Members</label>
                      <Textarea placeholder="Enter member names, one per line" />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowNewCrewDialog(false)}>
                      Cancel
                    </Button>
                    <Button className="bg-teal-600 hover:bg-teal-700">
                      Add Crew
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {crews.map((crew) => (
                <Card key={crew.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{crew.name}</CardTitle>
                      <Badge className={
                        crew.status === 'available' ? 'bg-green-100 text-green-800' :
                        crew.status === 'on_job' ? 'bg-blue-100 text-blue-800' :
                        crew.status === 'break' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {crew.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Team Members</p>
                      <div className="space-y-1">
                        {crew.members.map((member, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-teal-700">
                                {member.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="text-sm text-gray-700">{member}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {crew.current_job && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Current Job</p>
                        <p className="text-sm text-gray-700">{crew.current_job}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{crew.rating.toFixed(1)}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {crew.jobs_completed} jobs completed
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedCrew(crew)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {crews.length === 0 && !loading && (
              <Card>
                <CardContent className="p-12">
                  <div className="text-center">
                    <UserCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No crews yet</h3>
                    <p className="text-gray-600 mb-6">
                      Add your first cleaning crew to get started
                    </p>
                    <Button 
                      onClick={() => setShowNewCrewDialog(true)}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Crew
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Individual Crew Members Section */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Individual Crew Members</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {crewMembers.map((member) => (
                  <Card key={member.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-teal-700">
                            {member.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{member.name}</h4>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <p className="text-xs text-gray-500">
                            ${(member.hourly_rate_cents / 100).toFixed(2)}/hr
                          </p>
                        </div>
                        <Badge className={
                          member.status === 'available' ? 'bg-green-100 text-green-800' :
                          member.status === 'on_job' ? 'bg-blue-100 text-blue-800' :
                          member.status === 'break' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {member.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {member.phone && (
                        <div className="mt-2 flex items-center text-sm text-gray-600">
                          <Phone className="h-3 w-3 mr-1" />
                          {member.phone}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {crewMembers.length === 0 && !loading && (
                <Card>
                  <CardContent className="p-8">
                    <div className="text-center">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No crew members yet</h4>
                      <p className="text-gray-600 mb-4">
                        Add individual crew members to start building your team
                      </p>
                      <Button 
                        onClick={() => setShowNewCrewMemberDialog(true)}
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Member
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Payroll Management View */}
        {selectedView === 'payroll' && (
          <PayrollDashboard />
        )}

        {/* Hiring Management View */}
        {selectedView === 'hiring' && (
          <div className="space-y-6">
            {/* Hiring Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50 border-indigo-200 dark:border-indigo-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Total Applications</p>
                      <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">{applications.length}</p>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">All time</p>
                    </div>
                    <Mail className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-950/50 dark:to-teal-900/50 border-teal-200 dark:border-teal-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-teal-700 dark:text-teal-300">This Week</p>
                      <p className="text-3xl font-bold text-teal-900 dark:text-teal-100">
                        {applications.filter(app => {
                          const weekAgo = new Date();
                          weekAgo.setDate(weekAgo.getDate() - 7);
                          return new Date(app.created_at) > weekAgo;
                        }).length}
                      </p>
                      <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">New applications</p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-teal-600 dark:text-teal-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-950/50 dark:to-pink-900/50 border-pink-200 dark:border-pink-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-pink-700 dark:text-pink-300">Most Popular Role</p>
                      <p className="text-2xl font-bold text-pink-900 dark:text-pink-100">
                        {applications.length > 0 ? 
                          Object.entries(applications.reduce((acc, app) => {
                            acc[app.role_interest] = (acc[app.role_interest] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
                          : 'N/A'
                        }
                      </p>
                      <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">
                        {applications.length > 0 ? 
                          Object.entries(applications.reduce((acc, app) => {
                            acc[app.role_interest] = (acc[app.role_interest] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)).sort(([,a], [,b]) => b - a)[0]?.[1] || 0
                          : 0
                        } applications
                      </p>
                    </div>
                    <Users className="h-10 w-10 text-pink-600 dark:text-pink-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50 border-amber-200 dark:border-amber-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Open Positions</p>
                      <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">4</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Active roles</p>
                    </div>
                    <CheckCircle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Career Applications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Career Applications
                </CardTitle>
                <p className="text-muted-foreground">
                  Manage job applications and hiring pipeline
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.map((application, index) => {
                    const StatusIcon = getStatusIcon(application.status || 'pending');
                    return (
                      <div
                        key={application.id}
                        className="border rounded-lg p-6 hover:shadow-md transition-all cursor-pointer hover:border-primary/50"
                        onClick={() => handleApplicationClick(application)}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{application.name}</h3>
                              <Badge className={getRoleColor(application.role_interest)}>
                                {application.role_interest}
                              </Badge>
                              <Badge className={getApplicationStatusColor(application.status || 'pending')}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {(application.status || 'pending').charAt(0).toUpperCase() + (application.status || 'pending').slice(1)}
                              </Badge>
                              {application.experience_level && (
                                <Badge variant="outline">{application.experience_level}</Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <a href={`mailto:${application.email}`} className="hover:text-foreground">
                                  {application.email}
                                </a>
                              </div>
                              
                              {application.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  <a href={`tel:${application.phone}`} className="hover:text-foreground">
                                    {application.phone}
                                  </a>
                                </div>
                              )}
                              
                              {application.linkedin && (
                                <div className="flex items-center gap-2">
                                  <ExternalLink className="w-4 h-4" />
                                  <a 
                                    href={application.linkedin} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:text-foreground"
                                  >
                                    LinkedIn Profile
                                  </a>
                                </div>
                              )}
                              
                              {application.portfolio_link && (
                                <div className="flex items-center gap-2">
                                  <ExternalLink className="w-4 h-4" />
                                  <a 
                                    href={application.portfolio_link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:text-foreground"
                                  >
                                    Portfolio
                                  </a>
                                </div>
                              )}
                            </div>

                            {application.why_interested && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-foreground mb-1">Why interested:</p>
                                <p className="text-sm text-muted-foreground line-clamp-2">{application.why_interested}</p>
                              </div>
                            )}

                            {application.availability && (
                              <div className="mt-2">
                                <span className="text-sm font-medium text-foreground">Availability: </span>
                                <span className="text-sm text-muted-foreground">{application.availability}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right flex flex-col items-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApplicationClick(application);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <p className="text-sm text-muted-foreground">
                              {formatApplicationDate(application.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {applications.length === 0 && (
                    <div className="text-center py-12">
                      <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                      <p className="text-muted-foreground">
                        Career applications will appear here once submitted.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Photos Management View */}
        {selectedView === 'photos' && (
          <PhotoGalleryView bookings={bookings} />
        )}
      </main>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Customer</label>
                  <p className="text-lg font-medium">{selectedBooking.customer_name}</p>
                  <p className="text-sm text-gray-600">{selectedBooking.customer_email}</p>
                  {selectedBooking.customer_phone && (
                    <p className="text-sm text-gray-600">{selectedBooking.customer_phone}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Service</label>
                  <p className="text-lg font-medium">{selectedBooking.service_type}</p>
                  <p className="text-sm text-gray-600">${(selectedBooking.price_cents / 100).toFixed(0)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date & Time</label>
                  <p className="text-lg font-medium">
                    {formatDate(selectedBooking.scheduled_date)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatTime(selectedBooking.scheduled_time)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <Badge className={getStatusColor(selectedBooking.status)}>
                    {selectedBooking.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Address</label>
                <p className="text-lg font-medium">
                  {selectedBooking.address}, {selectedBooking.city}, {selectedBooking.state}
                </p>
              </div>
              {selectedBooking.add_ons.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Add-ons</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedBooking.add_ons.map((addon, index) => (
                      <Badge key={index} variant="outline">{addon}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                  Close
                </Button>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Customer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-lg font-medium">{selectedCustomer.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-lg font-medium">{selectedCustomer.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-lg font-medium">{selectedCustomer.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Satisfaction</label>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-lg font-medium">{selectedCustomer.satisfaction_score.toFixed(1)}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Total Bookings</label>
                  <p className="text-lg font-medium">{selectedCustomer.total_bookings}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Lifetime Value</label>
                  <p className="text-lg font-medium">${(selectedCustomer.lifetime_value_cents / 100).toFixed(0)}</p>
                </div>
              </div>
              {selectedCustomer.last_service_date && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Service</label>
                  <p className="text-lg font-medium">{formatDate(selectedCustomer.last_service_date)}</p>
                </div>
              )}
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                  Close
                </Button>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Customer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Crew Details Modal */}
      {selectedCrew && (
        <Dialog open={!!selectedCrew} onOpenChange={() => setSelectedCrew(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crew Details - {selectedCrew.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <Badge className={
                    selectedCrew.status === 'available' ? 'bg-green-100 text-green-800' :
                    selectedCrew.status === 'on_job' ? 'bg-blue-100 text-blue-800' :
                    selectedCrew.status === 'break' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {selectedCrew.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Rating</label>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-lg font-medium">{selectedCrew.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Jobs Completed</label>
                  <p className="text-lg font-medium">{selectedCrew.jobs_completed}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Team Size</label>
                  <p className="text-lg font-medium">{selectedCrew.members.length} members</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Team Members</label>
                <div className="mt-2 space-y-2">
                  {selectedCrew.members.map((member, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-teal-700">
                          {member.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="font-medium">{member}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedCrew.current_job && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Current Assignment</label>
                  <p className="text-lg font-medium mt-1">{selectedCrew.current_job}</p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedCrew(null)}>
                  Close
                </Button>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Team
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Application Details Modal */}
      {selectedApplication && (
        <Dialog open={isApplicationModalOpen} onOpenChange={setIsApplicationModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Application Details - {selectedApplication.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Header with status and role */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge className={getRoleColor(selectedApplication.role_interest)}>
                  {selectedApplication.role_interest}
                </Badge>
                <Badge className={getApplicationStatusColor(selectedApplication.status || 'pending')}>
                  {(selectedApplication.status || 'pending').charAt(0).toUpperCase() + (selectedApplication.status || 'pending').slice(1)}
                </Badge>
                {selectedApplication.experience_level && (
                  <Badge variant="outline">{selectedApplication.experience_level}</Badge>
                )}
                <span className="text-sm text-muted-foreground ml-auto">
                  Applied {formatApplicationDate(selectedApplication.created_at)}
                </span>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email</p>
                        <a 
                          href={`mailto:${selectedApplication.email}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {selectedApplication.email}
                        </a>
                      </div>
                    </div>
                    
                    {selectedApplication.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Phone</p>
                          <a 
                            href={`tel:${selectedApplication.phone}`}
                            className="text-sm text-primary hover:underline"
                          >
                            {selectedApplication.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {selectedApplication.linkedin && (
                      <div className="flex items-center gap-3">
                        <ExternalLink className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">LinkedIn</p>
                          <a 
                            href={selectedApplication.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View Profile
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {selectedApplication.portfolio_link && (
                      <div className="flex items-center gap-3">
                        <ExternalLink className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Portfolio</p>
                          <a 
                            href={selectedApplication.portfolio_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View Portfolio
                          </a>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Application Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium mb-1">Role Interest</p>
                      <p className="text-sm text-muted-foreground">{selectedApplication.role_interest}</p>
                    </div>
                    
                    {selectedApplication.experience_level && (
                      <div>
                        <p className="font-medium mb-1">Experience Level</p>
                        <p className="text-sm text-muted-foreground">{selectedApplication.experience_level}</p>
                      </div>
                    )}
                    
                    {selectedApplication.availability && (
                      <div>
                        <p className="font-medium mb-1">Availability</p>
                        <p className="text-sm text-muted-foreground">{selectedApplication.availability}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Why Interested */}
              {selectedApplication.why_interested && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Why Interested</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{selectedApplication.why_interested}</p>
                  </CardContent>
                </Card>
              )}

              {/* Acceptance Token Section */}
              {selectedApplication.acceptance_token && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ExternalLink className="h-5 w-5" />
                      Acceptance Link
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <code className="flex-1 text-sm font-mono">
                        {`${typeof window !== 'undefined' ? window.location.origin : ''}/acceptance/${selectedApplication.acceptance_token}`}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyAcceptanceLink(selectedApplication.acceptance_token!)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        {copiedToken ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Send this link to the applicant to accept their application
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'pending')}
                  disabled={selectedApplication.status === 'pending'}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Mark Pending
                </Button>
                
                <Button
                  variant="default"
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'accepted')}
                  disabled={selectedApplication.status === 'accepted'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept Application
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                  disabled={selectedApplication.status === 'rejected'}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Application
                </Button>
                
                <div className="ml-auto">
                  <Button variant="outline" onClick={() => setIsApplicationModalOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Crew Assignment Modal */}
      <CrewAssignmentModal
        isOpen={showCrewAssignment}
        booking={selectedBookingForCrew}
        crewMembers={crewMembers}
        onAssignCrew={handleCrewAssignment}
        onClose={() => {
          setSelectedBookingForCrew(null);
          setShowCrewAssignment(false);
        }}
      />
    </div>
  );
}

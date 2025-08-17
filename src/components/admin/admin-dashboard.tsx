"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Mail, 
  Phone, 
  ExternalLink, 
  LogOut,
  Loader2,
  AlertCircle,
  RefreshCw,
  Eye,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

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

interface CustomerInterest {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  home_size?: string;
  cleaning_frequency?: string;
  current_service?: string;
  budget_range?: string;
  special_requests?: string;
  preferred_contact?: string;
  created_at: string;
}

interface DashboardData {
  applications: CareerApplication[];
  totalCount: number;
  summary: {
    total: number;
    byRole: Record<string, number>;
    recent: number;
  };
}

interface CustomerData {
  customers: CustomerInterest[];
  totalCount: number;
  summary: {
    total: number;
    recent: number;
    byFrequency: Record<string, number>;
    byBudget: Record<string, number>;
  };
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<CareerApplication | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerInterest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      // Fetch both applications and customers in parallel
      const [applicationsResponse, customersResponse] = await Promise.all([
        fetch("/api/admin/careers"),
        fetch("/api/admin/customers")
      ]);

      const applicationsResult = await applicationsResponse.json();
      const customersResult = await customersResponse.json();

      if (applicationsResult.success) {
        setData(applicationsResult.data);
      } else {
        if (applicationsResponse.status === 401) {
          onLogout();
          return;
        }
        setError(applicationsResult.message || "Failed to fetch applications");
      }

      if (customersResult.success) {
        setCustomerData(customersResult.data);
      } else {
        console.error("Failed to fetch customers:", customersResult.message);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      onLogout();
    }
  };

  const formatDate = (dateString: string) => {
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

  const getStatusColor = (status: string) => {
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
    setIsModalOpen(true);
  };

  const handleCustomerClick = (customer: CustomerInterest) => {
    setSelectedCustomer(customer);
    setIsCustomerModalOpen(true);
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
        // Refresh data to show updated status
        await fetchData();
        // Update selected application if it's the one being updated
        if (selectedApplication?.id === id) {
          setSelectedApplication({ ...selectedApplication, status });
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={fetchData} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button onClick={handleLogout} variant="ghost">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">Maidly.ai Admin</h1>
              <Badge variant="secondary">Dashboard</Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={fetchData} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleLogout} variant="ghost" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold">{data?.summary.total || 0}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">{data?.summary.recent || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Most Popular</p>
                  <p className="text-lg font-bold">
                    {data?.summary.byRole && Object.entries(data.summary.byRole).sort(([,a], [,b]) => b - a)[0]?.[0] || "N/A"}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Roles Applied</p>
                  <p className="text-2xl font-bold">{data?.summary.byRole ? Object.keys(data.summary.byRole).length : 0}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="operations-overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="operations-overview">Operations</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="hiring">Hiring</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Operations Overview Tab */}
          <TabsContent value="operations-overview" className="space-y-6">
            {/* Business KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Bookings</p>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">1</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">+1 this week</p>
                    </div>
                    <Calendar className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">Revenue (MTD)</p>
                      <p className="text-3xl font-bold text-green-900 dark:text-green-100">$250</p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">+$250 this month</p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Active Customers</p>
                      <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{customerData?.totalCount || 1}</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">+1 new customer</p>
                    </div>
                    <Users className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Avg. Order Value</p>
                      <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">$250</p>
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Per booking</p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Test User</p>
                        <p className="text-sm text-muted-foreground">Regular cleaning • Jan 20, 2025</p>
                      </div>
                      <Badge variant="secondary">Scheduled</Badge>
                    </div>
                    <div className="text-center py-4 text-muted-foreground">
                      <p className="text-sm">More bookings will appear here as customers book services</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Customer Preferences</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Eco-friendly cleaning is popular • Bi-weekly frequency preferred
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">Revenue Opportunity</p>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        Add-ons like "inside oven" increase order value by 20%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Bookings Management</h3>
                  <p className="text-muted-foreground mb-4">
                    View and manage all customer service bookings
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Bookings API is working - integration with UI coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hiring Tab - Moved from Applications */}
          <TabsContent value="hiring" className="space-y-6">
            {/* Hiring KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50 border-indigo-200 dark:border-indigo-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Total Applications</p>
                      <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">{data?.totalCount || 0}</p>
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
                      <p className="text-3xl font-bold text-teal-900 dark:text-teal-100">{data?.summary?.recent || 0}</p>
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
                      <p className="text-2xl font-bold text-pink-900 dark:text-pink-100">CTO/AI</p>
                      <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">4 applications</p>
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
                      <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">3</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Active roles</p>
                    </div>
                    <CheckCircle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Career Applications
                </CardTitle>
                <p className="text-muted-foreground">
                  Manage job applications and hiring pipeline
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.applications.map((application, index) => {
                    const StatusIcon = getStatusIcon(application.status || 'pending');
                    return (
                    <motion.div
                      key={application.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
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
                            <Badge className={getStatusColor(application.status || 'pending')}>
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
                              <p className="text-sm text-muted-foreground">{application.why_interested}</p>
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
                            {formatDate(application.created_at)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                    );
                  })}

                  {(!data?.applications || data.applications.length === 0) && (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                      <p className="text-muted-foreground">
                        Career applications will appear here once submitted.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Interests</CardTitle>
                <p className="text-muted-foreground">
                  Beta program signups and customer inquiries
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerData?.customers.map((customer, index) => (
                    <motion.div
                      key={customer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg p-6 hover:shadow-md transition-all cursor-pointer hover:border-primary/50"
                      onClick={() => handleCustomerClick(customer)}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{customer.name}</h3>
                            {customer.cleaning_frequency && (
                              <Badge variant="outline">{customer.cleaning_frequency}</Badge>
                            )}
                            {customer.budget_range && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                {customer.budget_range}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <a href={`mailto:${customer.email}`} className="hover:text-foreground">
                                {customer.email}
                              </a>
                            </div>
                            
                            {customer.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <a href={`tel:${customer.phone}`} className="hover:text-foreground">
                                  {customer.phone}
                                </a>
                              </div>
                            )}
                            
                            {customer.city && customer.state && (
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{customer.city}, {customer.state}</span>
                              </div>
                            )}
                            
                            {customer.home_size && (
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{customer.home_size}</span>
                              </div>
                            )}
                          </div>

                          {customer.special_requests && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-foreground mb-1">Special requests:</p>
                              <p className="text-sm text-muted-foreground">{customer.special_requests}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right flex flex-col items-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCustomerClick(customer);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(customer.created_at)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {(!customerData?.customers || customerData.customers.length === 0) && (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Customer Interests Yet</h3>
                      <p className="text-muted-foreground">
                        Customer beta signups will appear here once submitted.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Business Analytics
                </CardTitle>
                <p className="text-muted-foreground">
                  Comprehensive business performance metrics and insights
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Revenue Trends</h3>
                    <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Revenue chart will appear here</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Booking Patterns</h3>
                    <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Booking trends chart will appear here</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Customer Satisfaction</h3>
                    <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Satisfaction metrics will appear here</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">AI Learning Progress</h3>
                    <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">AI insights dashboard will appear here</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  System Settings
                </CardTitle>
                <p className="text-muted-foreground">
                  Configure system preferences and business settings
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Business Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium text-sm mb-2">Service Areas</h4>
                        <p className="text-sm text-muted-foreground">Manage service coverage areas</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium text-sm mb-2">Pricing Rules</h4>
                        <p className="text-sm text-muted-foreground">Configure dynamic pricing</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium text-sm mb-2">AI Settings</h4>
                        <p className="text-sm text-muted-foreground">Adjust AI learning parameters</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium text-sm mb-2">Notifications</h4>
                        <p className="text-sm text-muted-foreground">Email and SMS preferences</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Application Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>Application Details</span>
              {selectedApplication && (
                <Badge className={getStatusColor(selectedApplication.status || 'pending')}>
                  {React.createElement(getStatusIcon(selectedApplication.status || 'pending'), { className: "w-3 h-3 mr-1" })}
                  {(selectedApplication.status || 'pending').charAt(0).toUpperCase() + (selectedApplication.status || 'pending').slice(1)}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Basic Information</span>
                    <div className="flex gap-2">
                      <Button
                        variant={selectedApplication.status === 'accepted' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateApplicationStatus(selectedApplication.id, 'accepted')}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        variant={selectedApplication.status === 'rejected' ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        variant={selectedApplication.status === 'pending' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => updateApplicationStatus(selectedApplication.id, 'pending')}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Pending
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-lg mb-4">{selectedApplication.name}</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <a href={`mailto:${selectedApplication.email}`} className="hover:text-primary">
                            {selectedApplication.email}
                          </a>
                        </div>
                        {selectedApplication.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <a href={`tel:${selectedApplication.phone}`} className="hover:text-primary">
                              {selectedApplication.phone}
                            </a>
                          </div>
                        )}
                        {selectedApplication.linkedin && (
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            <a 
                              href={selectedApplication.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-primary"
                            >
                              LinkedIn Profile
                            </a>
                          </div>
                        )}
                        {selectedApplication.portfolio_link && (
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            <a 
                              href={selectedApplication.portfolio_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-primary"
                            >
                              Portfolio
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Role Interest</label>
                          <div className="mt-1">
                            <Badge className={getRoleColor(selectedApplication.role_interest)}>
                              {selectedApplication.role_interest}
                            </Badge>
                          </div>
                        </div>
                        
                        {selectedApplication.experience_level && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Experience Level</label>
                            <p className="mt-1">{selectedApplication.experience_level}</p>
                          </div>
                        )}
                        
                        {selectedApplication.availability && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Availability</label>
                            <p className="mt-1">{selectedApplication.availability}</p>
                          </div>
                        )}
                        
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Applied</label>
                          <p className="mt-1">{formatDate(selectedApplication.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Why Interested */}
              {selectedApplication.why_interested && (
                <Card>
                  <CardHeader>
                    <CardTitle>Why Interested in Founding Partner Program</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{selectedApplication.why_interested}</p>
                  </CardContent>
                </Card>
              )}

              {/* Acceptance Token */}
              {selectedApplication.acceptance_token && (
                <Card>
                  <CardHeader>
                    <CardTitle>Acceptance Link</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-muted rounded text-sm">
                        {window.location.origin}/acceptance/{selectedApplication.acceptance_token}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyAcceptanceLink(selectedApplication.acceptance_token!)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        {copiedToken ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Send this link to the applicant if they are accepted. They can use it to access their personalized acceptance page.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Customer Details Modal */}
      <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>Customer Details</span>
              {selectedCustomer && (
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  Beta Customer
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-lg mb-4">{selectedCustomer.name}</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <a href={`mailto:${selectedCustomer.email}`} className="hover:text-primary">
                            {selectedCustomer.email}
                          </a>
                        </div>
                        {selectedCustomer.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <a href={`tel:${selectedCustomer.phone}`} className="hover:text-primary">
                              {selectedCustomer.phone}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>Prefers {selectedCustomer.preferred_contact || 'email'} contact</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Service Address</label>
                          <div className="mt-1">
                            {selectedCustomer.address && <p>{selectedCustomer.address}</p>}
                            {(selectedCustomer.city || selectedCustomer.state) && (
                              <p>{selectedCustomer.city}{selectedCustomer.city && selectedCustomer.state && ', '}{selectedCustomer.state} {selectedCustomer.zip_code}</p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                          <p className="mt-1">{formatDate(selectedCustomer.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Service Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {selectedCustomer.home_size && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Home Size</label>
                          <p className="mt-1">{selectedCustomer.home_size}</p>
                        </div>
                      )}
                      
                      {selectedCustomer.cleaning_frequency && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Preferred Frequency</label>
                          <p className="mt-1">{selectedCustomer.cleaning_frequency}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {selectedCustomer.current_service && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Current Service</label>
                          <p className="mt-1">{selectedCustomer.current_service}</p>
                        </div>
                      )}
                      
                      {selectedCustomer.budget_range && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Budget Range</label>
                          <p className="mt-1">{selectedCustomer.budget_range}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Special Requests */}
              {selectedCustomer.special_requests && (
                <Card>
                  <CardHeader>
                    <CardTitle>Special Requests & Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{selectedCustomer.special_requests}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

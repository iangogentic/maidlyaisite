"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  CheckCircle,
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
  Zap
} from "lucide-react";

interface ModernAdminDashboardProps {
  onLogout: () => void;
}

interface QuickStat {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'payment' | 'crew' | 'customer';
  title: string;
  subtitle: string;
  time: string;
  status: 'success' | 'pending' | 'warning' | 'error';
}

interface UpcomingJob {
  id: string;
  customer: string;
  address: string;
  time: string;
  service: string;
  crew: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
}

export function ModernAdminDashboard({ onLogout }: ModernAdminDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedView, setSelectedView] = useState<'overview' | 'jobs' | 'customers' | 'crew'>('overview');
  
  // Mock data - in real app, this would come from APIs
  const quickStats: QuickStat[] = [
    {
      label: "Today's Revenue",
      value: "$1,250",
      change: "+12%",
      trend: 'up',
      icon: <DollarSign className="h-5 w-5" />,
      color: "text-green-600 bg-green-50 border-green-200"
    },
    {
      label: "Active Jobs",
      value: 8,
      change: "+3",
      trend: 'up',
      icon: <Briefcase className="h-5 w-5" />,
      color: "text-blue-600 bg-blue-50 border-blue-200"
    },
    {
      label: "Available Crew",
      value: 12,
      change: "2 on break",
      trend: 'neutral',
      icon: <UserCheck className="h-5 w-5" />,
      color: "text-purple-600 bg-purple-50 border-purple-200"
    },
    {
      label: "Customer Rating",
      value: "4.9",
      change: "+0.1",
      trend: 'up',
      icon: <Star className="h-5 w-5" />,
      color: "text-yellow-600 bg-yellow-50 border-yellow-200"
    }
  ];

  const recentActivity: RecentActivity[] = [
    {
      id: "1",
      type: 'booking',
      title: "New booking confirmed",
      subtitle: "Sarah Johnson - Weekly cleaning",
      time: "2 min ago",
      status: 'success'
    },
    {
      id: "2",
      type: 'payment',
      title: "Payment received",
      subtitle: "$250 from Mike Chen",
      time: "15 min ago",
      status: 'success'
    },
    {
      id: "3",
      type: 'crew',
      title: "Crew checked in",
      subtitle: "Team Alpha at 123 Oak St",
      time: "32 min ago",
      status: 'pending'
    }
  ];

  const upcomingJobs: UpcomingJob[] = [
    {
      id: "1",
      customer: "Sarah Johnson",
      address: "123 Oak Street, Dallas",
      time: "10:00 AM",
      service: "Weekly Cleaning",
      crew: "Team Alpha",
      status: 'scheduled',
      priority: 'high'
    },
    {
      id: "2",
      customer: "Mike Chen",
      address: "456 Pine Ave, Dallas",
      time: "2:00 PM",
      service: "Deep Clean",
      crew: "Team Beta",
      status: 'scheduled',
      priority: 'medium'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
              
              {/* Quick Navigation */}
              <nav className="hidden md:flex space-x-1">
                {[
                  { id: 'overview', label: 'Overview', icon: Home },
                  { id: 'jobs', label: 'Jobs', icon: Briefcase },
                  { id: 'customers', label: 'Customers', icon: Users },
                  { id: 'crew', label: 'Crew', icon: UserCheck }
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

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </Button>

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
                          {stat.change} from yesterday
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
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Job
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">{job.time}</div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{job.customer}</h4>
                            <Badge className={`text-xs ${getPriorityColor(job.priority)}`}>
                              {job.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {job.address}
                          </p>
                          <p className="text-sm text-gray-500">{job.service} • {job.crew}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                        {activity.type === 'booking' && <Calendar className="h-3 w-3" />}
                        {activity.type === 'payment' && <DollarSign className="h-3 w-3" />}
                        {activity.type === 'crew' && <Users className="h-3 w-3" />}
                        {activity.type === 'customer' && <Users className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.subtitle}</p>
                        <p className="text-xs text-gray-400">{activity.time}</p>
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
                  {[
                    { label: 'Schedule Job', icon: Calendar, color: 'bg-blue-500 hover:bg-blue-600' },
                    { label: 'Add Customer', icon: Users, color: 'bg-green-500 hover:bg-green-600' },
                    { label: 'Crew Check-in', icon: UserCheck, color: 'bg-purple-500 hover:bg-purple-600' },
                    { label: 'Send Invoice', icon: Mail, color: 'bg-orange-500 hover:bg-orange-600' }
                  ].map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Button key={index} className={`h-20 flex-col space-y-2 ${action.color} text-white`}>
                        <Icon className="h-6 w-6" />
                        <span className="text-sm">{action.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Other views would be implemented similarly with focused, task-oriented interfaces */}
        {selectedView !== 'overview' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} Management
            </h2>
            <p className="text-gray-600 mb-6">
              Focused interface for {selectedView} management coming soon
            </p>
            <Button onClick={() => setSelectedView('overview')} variant="outline">
              Back to Overview
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

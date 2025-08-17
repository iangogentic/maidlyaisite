"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Booking } from '@/lib/database-neon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  MapPin, 
  Clock, 
  Star, 
  CheckCircle, 
  AlertCircle,
  UserCheck,
  Phone,
  Mail,
  Calendar,
  Award,
  Navigation,
  Zap
} from 'lucide-react';

interface CrewMember {
  id: number;
  name: string;
  email: string;
  phone?: string;
  employee_id?: string;
  status: 'available' | 'on_job' | 'break' | 'off_duty' | 'unavailable';
  hourly_rate_cents: number;
  hire_date?: string;
  certifications?: string[];
  emergency_contact?: any;
  latest_location?: {
    latitude: number;
    longitude: number;
    address?: string;
    timestamp: string;
  };
  active_time_entry?: any;
  is_clocked_in: boolean;
}

interface EnhancedCrewMember extends CrewMember {
  assignmentScore?: number;
  assignmentReasons?: string[];
}

interface CrewAssignmentPanelProps {
  booking?: Booking | null;
  crewMembers: CrewMember[];
  onAssignCrew?: (bookingId: number, crewMemberId: number) => void;
  onClose?: () => void;
}

export function CrewAssignmentPanel({ 
  booking, 
  crewMembers, 
  onAssignCrew, 
  onClose 
}: CrewAssignmentPanelProps) {
  const [selectedCrewMember, setSelectedCrewMember] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'proximity' | 'availability' | 'rating'>('proximity');

  // Calculate crew member scores for assignment suggestions
  const crewWithScores = useMemo((): EnhancedCrewMember[] => {
    if (!booking) return crewMembers;

    return crewMembers.map((member): EnhancedCrewMember => {
      let score = 0;
      const reasons: string[] = [];

      // Availability score (40% weight)
      if (member.status === 'available') {
        score += 40;
        reasons.push('Available now');
      } else if (member.status === 'break') {
        score += 20;
        reasons.push('On break (can be called)');
      }

      // Location proximity score (30% weight) - simplified calculation
      if (member.latest_location) {
        // For demo purposes, add random proximity score
        const proximityScore = Math.random() * 30;
        score += proximityScore;
        if (proximityScore > 20) {
          reasons.push('Close to location');
        } else if (proximityScore > 10) {
          reasons.push('Moderate distance');
        }
      }

      // Certification/skills score (20% weight)
      if (member.certifications && member.certifications.length > 0) {
        const certScore = Math.min(member.certifications.length * 5, 20);
        score += certScore;
        reasons.push(`${member.certifications.length} certifications`);
      }

      // Experience score (10% weight) - based on hire date
      if (member.hire_date) {
        const hireDate = new Date(member.hire_date);
        const monthsExperience = (Date.now() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        const experienceScore = Math.min(monthsExperience * 0.5, 10);
        score += experienceScore;
        if (monthsExperience > 12) {
          reasons.push('Experienced team member');
        }
      }

      return {
        ...member,
        assignmentScore: Math.round(score),
        assignmentReasons: reasons
      };
    });
  }, [crewMembers, booking]);

  // Sort crew members based on selected criteria
  const sortedCrew = useMemo(() => {
    const sorted = [...crewWithScores];
    
    switch (sortBy) {
      case 'proximity':
        return sorted.sort((a, b) => {
          // Prioritize available members, then by assignment score
          if (a.status === 'available' && b.status !== 'available') return -1;
          if (b.status === 'available' && a.status !== 'available') return 1;
          return (b.assignmentScore || 0) - (a.assignmentScore || 0);
        });
      case 'availability':
        return sorted.sort((a, b) => {
          const statusOrder = { available: 0, break: 1, on_job: 2, off_duty: 3, unavailable: 4 };
          return statusOrder[a.status] - statusOrder[b.status];
        });
      case 'rating':
        return sorted.sort((a, b) => (b.assignmentScore || 0) - (a.assignmentScore || 0));
      default:
        return sorted;
    }
  }, [crewWithScores, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'on_job': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'break': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'off_duty': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'unavailable': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'on_job': return <UserCheck className="h-4 w-4" />;
      case 'break': return <Clock className="h-4 w-4" />;
      case 'off_duty': return <AlertCircle className="h-4 w-4" />;
      case 'unavailable': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleAssign = () => {
    if (booking && booking.id && selectedCrewMember && onAssignCrew) {
      onAssignCrew(booking.id, selectedCrewMember);
      onClose?.();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-teal-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Assign Crew</h2>
            {booking && (
              <p className="text-sm text-gray-600">
                {booking.customer_name} • {booking.address}, {booking.city}
              </p>
            )}
          </div>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
      </div>

      {/* Booking Details */}
      {booking && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{booking.scheduled_date} at {booking.scheduled_time}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{booking.service_type}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">$</span>
                <span>${(booking.price_cents / 100).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sort Controls */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Sort by:</span>
        <div className="flex space-x-1">
          {[
            { key: 'proximity', label: 'Best Match', icon: Zap },
            { key: 'availability', label: 'Availability', icon: CheckCircle },
            { key: 'rating', label: 'Score', icon: Star }
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={sortBy === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy(key as any)}
              className="text-xs"
            >
              <Icon className="h-3 w-3 mr-1" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Crew Members List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedCrew.map((member) => (
          <Card 
            key={member.id}
            className={`cursor-pointer transition-all duration-200 ${
              selectedCrewMember === member.id 
                ? 'ring-2 ring-teal-500 bg-teal-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedCrewMember(member.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-teal-100 text-teal-700">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {member.name}
                      </h3>
                      {member.assignmentScore && member.assignmentScore > 70 && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          <Star className="h-3 w-3 mr-1" />
                          Recommended
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={`text-xs ${getStatusColor(member.status)}`}>
                        {getStatusIcon(member.status)}
                        <span className="ml-1 capitalize">{member.status.replace('_', ' ')}</span>
                      </Badge>
                      
                      {member.is_clocked_in && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Clocked In
                        </Badge>
                      )}
                      
                      <span className="text-xs text-gray-500">
                        ${(member.hourly_rate_cents / 100).toFixed(0)}/hr
                      </span>
                    </div>

                    {/* Certifications */}
                    {member.certifications && member.certifications.length > 0 && (
                      <div className="flex items-center space-x-1 mb-2">
                        <Award className="h-3 w-3 text-gray-400" />
                        <div className="flex flex-wrap gap-1">
                          {member.certifications.slice(0, 3).map((cert, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                          {member.certifications.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.certifications.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    {member.latest_location && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Navigation className="h-3 w-3" />
                        <span>
                          {member.latest_location.address || 'Location tracked'}
                        </span>
                      </div>
                    )}

                    {/* Assignment Reasons */}
                    {member.assignmentReasons && member.assignmentReasons.length > 0 && (
                      <div className="mt-2 text-xs text-gray-600">
                        <span className="font-medium">Match factors: </span>
                        {member.assignmentReasons.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignment Score */}
                {member.assignmentScore !== undefined && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-teal-600">
                      {member.assignmentScore}
                    </div>
                    <div className="text-xs text-gray-500">
                      Match Score
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assignment Actions */}
      {booking && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            {selectedCrewMember ? (
              <>Selected: {sortedCrew.find(m => m.id === selectedCrewMember)?.name}</>
            ) : (
              'Select a crew member to assign'
            )}
          </div>
          <Button 
            onClick={handleAssign}
            disabled={!selectedCrewMember}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Assign Crew
          </Button>
        </div>
      )}
    </div>
  );
}

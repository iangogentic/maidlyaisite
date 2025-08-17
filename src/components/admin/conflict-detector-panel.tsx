"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Clock, 
  Users, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Eye,
  Zap,
  Calendar,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface ConflictDetails {
  id: string;
  type: 'time_overlap' | 'crew_double_booking' | 'resource_unavailable' | 'travel_time' | 'crew_unavailable';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedBookings: number[];
  affectedCrewMembers?: number[];
  suggestedResolutions: ResolutionSuggestion[];
  metadata?: any;
}

interface ResolutionSuggestion {
  id: string;
  type: 'reschedule' | 'reassign_crew' | 'split_booking' | 'extend_time' | 'add_crew';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  estimatedEffort: string;
  autoApplicable: boolean;
  parameters?: any;
}

interface ConflictSummary {
  totalConflicts: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byType: {
    time_overlap: number;
    crew_double_booking: number;
    crew_unavailable: number;
    travel_time: number;
    resource_unavailable: number;
  };
  affectedBookings: number;
  affectedCrewMembers: number;
}

interface ConflictDetectorPanelProps {
  onRefresh?: () => void;
}

export function ConflictDetectorPanel({ onRefresh }: ConflictDetectorPanelProps) {
  const [conflicts, setConflicts] = useState<ConflictDetails[]>([]);
  const [summary, setSummary] = useState<ConflictSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<ConflictDetails | null>(null);
  const [expandedConflicts, setExpandedConflicts] = useState<Set<string>>(new Set());

  const fetchConflicts = useCallback(async () => {
    try {
      const response = await fetch('/api/conflicts');
      if (response.ok) {
        const data = await response.json();
        setConflicts(data.conflicts || []);
        setSummary(data.summary || null);
      } else {
        console.error('Failed to fetch conflicts');
      }
    } catch (error) {
      console.error('Error fetching conflicts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchConflicts();
    onRefresh?.();
  }, [fetchConflicts, onRefresh]);

  const handleApplyResolution = async (conflictId: string, suggestion: ResolutionSuggestion) => {
    try {
      const response = await fetch('/api/conflicts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply_suggestion',
          conflictId,
          parameters: {
            suggestionId: suggestion.id,
            ...suggestion.parameters
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Refresh conflicts after applying resolution
          await fetchConflicts();
        }
      }
    } catch (error) {
      console.error('Error applying resolution:', error);
    }
  };

  const handleDismissConflict = async (conflictId: string) => {
    try {
      const response = await fetch('/api/conflicts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dismiss',
          conflictId
        })
      });

      if (response.ok) {
        // Remove from local state
        setConflicts(prev => prev.filter(c => c.id !== conflictId));
      }
    } catch (error) {
      console.error('Error dismissing conflict:', error);
    }
  };

  const toggleConflictExpansion = (conflictId: string) => {
    setExpandedConflicts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conflictId)) {
        newSet.delete(conflictId);
      } else {
        newSet.add(conflictId);
      }
      return newSet;
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'time_overlap': return <Clock className="h-4 w-4" />;
      case 'crew_double_booking': return <Users className="h-4 w-4" />;
      case 'crew_unavailable': return <Users className="h-4 w-4" />;
      case 'travel_time': return <MapPin className="h-4 w-4" />;
      case 'resource_unavailable': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  useEffect(() => {
    fetchConflicts();
  }, [fetchConflicts]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span>Conflict Detection</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Analyzing conflicts...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      {summary && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>Conflict Detection Summary</span>
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{summary.bySeverity.critical}</div>
                <div className="text-sm text-gray-500">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{summary.bySeverity.high}</div>
                <div className="text-sm text-gray-500">High</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{summary.bySeverity.medium}</div>
                <div className="text-sm text-gray-500">Medium</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{summary.bySeverity.low}</div>
                <div className="text-sm text-gray-500">Low</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{summary.affectedBookings} bookings affected</span>
                <span>{summary.affectedCrewMembers} crew members affected</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conflicts List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Conflicts ({conflicts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {conflicts.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                No conflicts detected! All bookings are properly scheduled.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {conflicts.map((conflict) => (
                <div key={conflict.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getTypeIcon(conflict.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{conflict.title}</h4>
                          <Badge className={getSeverityColor(conflict.severity)}>
                            {conflict.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{conflict.description}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Bookings: {conflict.affectedBookings.join(', ')}
                          </span>
                          {conflict.affectedCrewMembers && conflict.affectedCrewMembers.length > 0 && (
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              Crew: {conflict.affectedCrewMembers.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleConflictExpansion(conflict.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {expandedConflicts.has(conflict.id) ? 'Hide' : 'View'} Solutions
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismissConflict(conflict.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Resolution Suggestions */}
                  {expandedConflicts.has(conflict.id) && (
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="font-medium mb-3">Suggested Resolutions:</h5>
                      <div className="space-y-3">
                        {conflict.suggestedResolutions.map((suggestion) => (
                          <div key={suggestion.id} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-sm">{suggestion.title}</span>
                                  <Badge variant="outline" className={getImpactColor(suggestion.impact)}>
                                    {suggestion.impact} impact
                                  </Badge>
                                  {suggestion.autoApplicable && (
                                    <Badge variant="outline" className="text-green-600">
                                      <Zap className="h-3 w-3 mr-1" />
                                      Auto
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{suggestion.description}</p>
                                <div className="text-xs text-gray-500">
                                  Estimated effort: {suggestion.estimatedEffort}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant={suggestion.autoApplicable ? "default" : "outline"}
                                onClick={() => handleApplyResolution(conflict.id, suggestion)}
                                className="ml-3"
                              >
                                {suggestion.autoApplicable ? (
                                  <>
                                    <Zap className="h-3 w-3 mr-1" />
                                    Apply
                                  </>
                                ) : (
                                  <>
                                    <ArrowRight className="h-3 w-3 mr-1" />
                                    Apply
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

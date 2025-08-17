"use client";

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  MessageSquare,
  Users,
  Calendar,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  RefreshCw,
  Filter,
  ThumbsUp,
  ThumbsDown,
  Minus
} from 'lucide-react';

interface SatisfactionDataPoint {
  date: string;
  averageRating: number;
  totalRatings: number;
  distribution: {
    rating1: number;
    rating2: number;
    rating3: number;
    rating4: number;
    rating5: number;
  };
}

interface SatisfactionAnalytics {
  period: string;
  data: SatisfactionDataPoint[];
  overallMetrics: {
    averageRating: number;
    totalResponses: number;
    responseRate: number;
    npsScore: number;
    trendDirection: 'up' | 'down' | 'stable';
  };
  segments?: any;
  recentComments?: Array<{
    rating: number;
    comment: string;
    date: string;
    serviceType?: string;
  }>;
}

interface SatisfactionChartProps {
  onRefresh?: () => void;
}

export function SatisfactionChart({ onRefresh }: SatisfactionChartProps) {
  const [data, setData] = useState<SatisfactionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [segmentBy, setSegmentBy] = useState<'all' | 'service_type' | 'crew' | 'time'>('all');
  const [showComments, setShowComments] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        period,
        segmentBy,
        includeComments: showComments.toString(),
      });
      
      const response = await fetch(`/api/analytics/satisfaction?${params}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch satisfaction data');
      }
      
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period, segmentBy, showComments]);

  const handleRefresh = () => {
    fetchData();
    onRefresh?.();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    switch (period) {
      case 'daily':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'weekly':
        return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case 'monthly':
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      default:
        return dateStr;
    }
  };

  const formatRating = (value: number) => `${value.toFixed(1)}★`;

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNPSColor = (score: number) => {
    if (score >= 50) return 'text-green-600';
    if (score >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderChart = () => {
    if (!data?.data) return <div className="h-80 flex items-center justify-center text-gray-500">No data available</div>;

    const chartData = data.data.map(point => ({
      ...point,
      date: formatDate(point.date),
    }));

    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[1, 5]} />
            <Tooltip 
              formatter={(value: number) => [formatRating(value), 'Average Rating']}
              labelFormatter={(label) => `Period: ${label}`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="averageRating"
              stroke="#0ea5e9"
              fill="#0ea5e9"
              fillOpacity={0.3}
              name="Average Rating"
            />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[1, 5]} />
            <Tooltip 
              formatter={(value: number) => [formatRating(value), 'Average Rating']}
              labelFormatter={(label) => `Period: ${label}`}
            />
            <Legend />
            <Bar dataKey="averageRating" fill="#0ea5e9" name="Average Rating" />
          </BarChart>
        );
      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[1, 5]} />
            <Tooltip 
              formatter={(value: number) => [formatRating(value), 'Average Rating']}
              labelFormatter={(label) => `Period: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="averageRating"
              stroke="#0ea5e9"
              strokeWidth={3}
              dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
              name="Average Rating"
            />
          </LineChart>
        );
    }
  };

  const renderRatingDistribution = () => {
    if (!data?.data) return null;

    // Aggregate rating distribution across all periods
    const totalDistribution = data.data.reduce((acc, point) => {
      acc.rating1 += point.distribution.rating1;
      acc.rating2 += point.distribution.rating2;
      acc.rating3 += point.distribution.rating3;
      acc.rating4 += point.distribution.rating4;
      acc.rating5 += point.distribution.rating5;
      return acc;
    }, { rating1: 0, rating2: 0, rating3: 0, rating4: 0, rating5: 0 });

    const pieData = [
      { name: '5 Stars', value: totalDistribution.rating5, color: '#22c55e' },
      { name: '4 Stars', value: totalDistribution.rating4, color: '#84cc16' },
      { name: '3 Stars', value: totalDistribution.rating3, color: '#eab308' },
      { name: '2 Stars', value: totalDistribution.rating2, color: '#f97316' },
      { name: '1 Star', value: totalDistribution.rating1, color: '#ef4444' },
    ].filter(item => item.value > 0);

    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Customer Satisfaction</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Customer Satisfaction</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-red-500">
            Error: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>Customer Satisfaction Trends</span>
              </CardTitle>
              {data?.overallMetrics && (
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <span>Avg Rating:</span>
                    <Badge variant="secondary">{formatRating(data.overallMetrics.averageRating)}</Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>Trend:</span>
                    {getTrendIcon(data.overallMetrics.trendDirection)}
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>NPS:</span>
                    <Badge variant="secondary" className={getNPSColor(data.overallMetrics.npsScore)}>
                      {data.overallMetrics.npsScore}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Period Selection */}
              <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>

              {/* Chart Type Selection */}
              <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">
                    <div className="flex items-center space-x-2">
                      <LineChartIcon className="h-4 w-4" />
                      <span>Line</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="area">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Area</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bar">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Bar</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart() || <div />}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      {data?.overallMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold">{formatRating(data.overallMetrics.averageRating)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Responses</p>
                  <p className="text-2xl font-bold">{data.overallMetrics.totalResponses}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold">{data.overallMetrics.responseRate}%</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">NPS Score</p>
                  <p className={`text-2xl font-bold ${getNPSColor(data.overallMetrics.npsScore)}`}>
                    {data.overallMetrics.npsScore}
                  </p>
                </div>
                {data.overallMetrics.npsScore >= 0 ? (
                  <ThumbsUp className="h-8 w-8 text-green-500" />
                ) : (
                  <ThumbsDown className="h-8 w-8 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rating Distribution and Recent Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5 text-purple-500" />
              <span>Rating Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderRatingDistribution()}
          </CardContent>
        </Card>

        {/* Recent Comments */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <span>Recent Feedback</span>
              </CardTitle>
              <Button
                onClick={() => setShowComments(!showComments)}
                variant="outline"
                size="sm"
              >
                {showComments ? 'Hide' : 'Show'} Comments
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showComments && data?.recentComments ? (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {data.recentComments.map((comment, index) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < comment.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        {comment.serviceType && (
                          <Badge variant="outline" className="text-xs">
                            {comment.serviceType.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{comment.date}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                {showComments ? 'No recent comments available' : 'Click "Show Comments" to view recent feedback'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
  DollarSign, 
  Calendar,
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  RefreshCw,
  Download
} from 'lucide-react';

interface RevenueDataPoint {
  date: string;
  revenue: number;
  bookings: number;
  averageValue: number;
}

interface RevenueAnalytics {
  period: string;
  data: RevenueDataPoint[];
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  growthRate?: number;
  comparisonData?: RevenueDataPoint[];
}

interface RevenueChartProps {
  className?: string;
}

type ChartType = 'line' | 'area' | 'bar';
type TimePeriod = 'daily' | 'weekly' | 'monthly';

export function RevenueChart({ className }: RevenueChartProps) {
  const [data, setData] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<TimePeriod>('monthly');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [showComparison, setShowComparison] = useState(false);

  const fetchRevenueData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        period,
        compare: showComparison.toString(),
      });

      const response = await fetch(`/api/analytics/revenue?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch revenue data');
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [period, showComparison]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    switch (period) {
      case 'daily':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'weekly':
        return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case 'monthly':
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      default:
        return dateString;
    }
  };

  const renderChart = () => {
    if (!data?.data.length) return null;

    const chartData = data.data.map(point => ({
      ...point,
      formattedDate: formatDate(point.date),
    }));

    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e2e8f0' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              labelFormatter={(label) => `Period: ${label}`}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#0ea5e9" 
              strokeWidth={3}
              dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#0ea5e9', strokeWidth: 2 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e2e8f0' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              labelFormatter={(label) => `Period: ${label}`}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#0ea5e9" 
              fill="url(#revenueGradient)"
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e2e8f0' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              labelFormatter={(label) => `Period: ${label}`}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend />
            <Bar 
              dataKey="revenue" 
              fill="#0ea5e9"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <Button onClick={fetchRevenueData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Trends
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={fetchRevenueData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-4 pt-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={period} onValueChange={(value: TimePeriod) => setPeriod(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === 'area' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('area')}
            >
              <AreaChartIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant={showComparison ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowComparison(!showComparison)}
          >
            Compare
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Summary Stats */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data.totalRevenue)}
              </div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
              {data.growthRate !== undefined && (
                <div className={`text-xs flex items-center justify-center gap-1 mt-1 ${
                  data.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {data.growthRate >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(data.growthRate).toFixed(1)}%
                </div>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.totalBookings}
              </div>
              <div className="text-sm text-muted-foreground">Total Bookings</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(data.averageBookingValue)}
              </div>
              <div className="text-sm text-muted-foreground">Avg. Booking Value</div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart() || <div />}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

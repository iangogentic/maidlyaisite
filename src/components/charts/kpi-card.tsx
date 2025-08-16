"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  delta?: {
    value: number;
    label: string;
    trend: "up" | "down";
  };
  chart?: {
    data: Array<{ value: number }>;
    type: "line" | "area";
  };
  className?: string;
}

export function KpiCard({ title, value, delta, chart, className }: KpiCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">{value}</div>
            {delta && (
              <div className="flex items-center space-x-1 text-xs">
                {delta.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={cn(
                    "font-medium",
                    delta.trend === "up" ? "text-green-600" : "text-red-600"
                  )}
                >
                  {delta.value > 0 ? "+" : ""}{delta.value}%
                </span>
                <span className="text-muted-foreground">{delta.label}</span>
              </div>
            )}
          </div>
          
          {chart && (
            <div className="h-12 w-20">
              <ResponsiveContainer width="100%" height="100%">
                {chart.type === "area" ? (
                  <AreaChart data={chart.data}>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                ) : (
                  <LineChart data={chart.data}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Sample data for demo
export const sampleKpiData = {
  satisfaction: {
    title: "Satisfaction",
    value: "4.8",
    delta: {
      value: 12,
      label: "vs last month",
      trend: "up" as const,
    },
    chart: {
      type: "area" as const,
      data: [
        { value: 4.2 },
        { value: 4.3 },
        { value: 4.1 },
        { value: 4.5 },
        { value: 4.6 },
        { value: 4.7 },
        { value: 4.8 },
      ],
    },
  },
  reworkRate: {
    title: "Rework Rate",
    value: "2.1%",
    delta: {
      value: -35,
      label: "vs last month",
      trend: "down" as const,
    },
    chart: {
      type: "line" as const,
      data: [
        { value: 5.2 },
        { value: 4.8 },
        { value: 4.1 },
        { value: 3.5 },
        { value: 2.8 },
        { value: 2.3 },
        { value: 2.1 },
      ],
    },
  },
  preferencesLearned: {
    title: "Preferences Learned",
    value: "47",
    delta: {
      value: 23,
      label: "this month",
      trend: "up" as const,
    },
    chart: {
      type: "area" as const,
      data: [
        { value: 12 },
        { value: 19 },
        { value: 25 },
        { value: 31 },
        { value: 38 },
        { value: 42 },
        { value: 47 },
      ],
    },
  },
};

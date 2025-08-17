"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Lazy load chart components to reduce initial bundle size and prevent webpack issues
const RevenueChart = dynamic(
  () => import('./revenue-chart').then(mod => ({ default: mod.RevenueChart })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading revenue chart...</span>
      </div>
    ),
    ssr: false
  }
);

const SatisfactionChart = dynamic(
  () => import('./satisfaction-chart').then(mod => ({ default: mod.SatisfactionChart })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading satisfaction chart...</span>
      </div>
    ),
    ssr: false
  }
);

export { RevenueChart, SatisfactionChart };

"use client";

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import StatsCard from '@/components/dashboard/stats-card';
import InteractiveQuery from '@/components/dashboard/interactive-query';
import TrendsChart from '@/components/dashboard/trends-chart';
import TrendingVideos from '@/components/dashboard/trending-videos';
import { BarChart, Eye, Heart, MessageSquare } from 'lucide-react';

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6">
          <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight font-headline text-foreground">
              Dashboard
            </h1>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatsCard title="Total Views (Month)" value="150M" icon={Eye} change="+5.2%" />
              <StatsCard title="Total Likes (Month)" value="12.3M" icon={Heart} change="+8.1%" />
              <StatsCard title="Total Comments (Month)" value="1.1M" icon={MessageSquare} change="-1.5%" isNegative />
              <StatsCard title="Top Genre" value="Genge" icon={BarChart} />
            </div>
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <InteractiveQuery />
              </div>
              <div className="lg:col-span-3 space-y-6">
                <TrendsChart />
                <TrendingVideos />
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

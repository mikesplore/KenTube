import DashboardPage from '@/components/pages/dashboard-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kenya Tube Insights | Dashboard',
  description: 'Insights and statistics for Kenyan YouTube trends.',
};

export default function Home() {
  return <DashboardPage />;
}

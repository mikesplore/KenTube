import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change?: string;
  isNegative?: boolean;
}

export default function StatsCard({ title, value, icon: Icon, change, isNegative = false }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={cn("text-xs text-muted-foreground", isNegative ? 'text-red-500' : 'text-emerald-500')}>
            {change} from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}

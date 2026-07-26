import React from 'react';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Card } from './Card';

export interface KPICardProps {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  loading?: boolean;
}

const trendIcons = {
  up: <TrendingUp className="h-4 w-4" />,
  down: <TrendingDown className="h-4 w-4" />,
  neutral: <Minus className="h-4 w-4" />,
};

const trendColors = {
  up: 'text-success',
  down: 'text-danger',
  neutral: 'text-text-muted',
};

export const KPICard: React.FC<KPICardProps> = ({
  icon,
  value,
  label,
  trend,
  trendValue,
  loading,
}) => (
  <Card className="animate-fadeIn flex items-start gap-4 p-6">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-indigo/10 text-accent-indigo">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      {loading ? (
        <div className="h-8 w-16 animate-pulse rounded bg-bg-surface-hover" />
      ) : (
        <p className="text-2xl font-bold text-text-primary">{value}</p>
      )}
      <p className="mt-0.5 text-xs text-text-muted">{label}</p>
    </div>
    {trend && trendValue && (
      <div className={cn('flex items-center gap-1 text-xs font-medium', trendColors[trend])}>
        {trendIcons[trend]}
        {trendValue}
      </div>
    )}
  </Card>
);

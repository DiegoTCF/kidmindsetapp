import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TimePeriod = 'week' | 'month' | 'all';

interface TimePeriodFilterProps {
  value: TimePeriod;
  onChange: (period: TimePeriod) => void;
  className?: string;
}

export function TimePeriodFilter({ value, onChange, className }: TimePeriodFilterProps) {
  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      <Button
        variant={value === 'week' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('week')}
        className="text-xs px-3"
      >
        This Week
      </Button>
      <Button
        variant={value === 'month' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('month')}
        className="text-xs px-3"
      >
        This Month
      </Button>
      <Button
        variant={value === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('all')}
        className="text-xs px-3"
      >
        All Time
      </Button>
    </div>
  );
}

export function getDateRangeForPeriod(period: TimePeriod): { startDate: Date | null; endDate: Date } {
  const now = new Date();
  const endDate = now;
  
  switch (period) {
    case 'week': {
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      return { startDate, endDate };
    }
    case 'month': {
      const startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
      return { startDate, endDate };
    }
    case 'all':
    default:
      return { startDate: null, endDate };
  }
}

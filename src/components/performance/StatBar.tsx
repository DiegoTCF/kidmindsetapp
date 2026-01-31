import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatBarProps {
  label: string;
  value: number | null;
  icon: LucideIcon;
  lowLabel?: string;
  highLabel?: string;
  delay?: number;
  maxValue?: number;
}

const getValueColor = (value: number | null): string => {
  if (value === null) return 'bg-muted';
  if (value >= 8) return 'bg-emerald-500';
  if (value >= 6) return 'bg-amber-500';
  if (value >= 4) return 'bg-orange-500';
  return 'bg-red-500';
};

const getValueTextColor = (value: number | null): string => {
  if (value === null) return 'text-muted-foreground';
  if (value >= 8) return 'text-emerald-400';
  if (value >= 6) return 'text-amber-400';
  if (value >= 4) return 'text-orange-400';
  return 'text-red-400';
};

export function StatBar({ 
  label, 
  value, 
  icon: Icon, 
  lowLabel = 'Low', 
  highLabel = 'High', 
  delay = 0,
  maxValue = 10
}: StatBarProps) {
  const percentage = value !== null ? (value / maxValue) * 100 : 0;
  const displayValue = value !== null ? value.toFixed(1) : '—';
  const colorClass = getValueColor(value);
  const textColorClass = getValueTextColor(value);

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
    >
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${textColorClass}`} />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <span className={`text-sm font-bold ${textColorClass}`}>
          {displayValue}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className={`absolute inset-y-0 left-0 ${colorClass} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
        />
        {/* Subtle shimmer on the bar */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{
            delay: delay + 1,
            duration: 1,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </motion.div>
  );
}

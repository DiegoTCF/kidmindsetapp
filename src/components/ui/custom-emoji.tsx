import { cn } from "@/lib/utils";
import { 
  FrownIcon, 
  MehIcon, 
  SmileIcon, 
  LaughIcon, 
  Target, 
  Home, 
  Building2, 
  TrendingUp,
  Brain,
  Trophy,
  PartyPopper,
  Flame,
  Goal
} from "lucide-react";

interface CustomIconProps {
  type: 'sad' | 'not-great' | 'okay' | 'good' | 'amazing' | 'target' | 'home' | 'stadium' | 'progress' | 'brain' | 'trophy' | 'party' | 'flame' | 'goals' | 'crusher';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10'
};

const iconMap = {
  sad: FrownIcon,
  'not-great': MehIcon,
  okay: MehIcon,
  good: SmileIcon,
  amazing: LaughIcon,
  target: Target,
  home: Home,
  stadium: Building2,
  progress: TrendingUp,
  brain: Brain,
  trophy: Trophy,
  party: PartyPopper,
  flame: Flame,
  goals: Goal,
  crusher: Trophy
};

export function CustomIcon({ type, size = 'md', className }: CustomIconProps) {
  const IconComponent = iconMap[type];
  
  return (
    <IconComponent 
      className={cn(
        "transition-all duration-200",
        iconSizes[size],
        className
      )}
      style={{
        color: '#ff0066',
        strokeWidth: '2.5'
      }}
      aria-label={type}
    />
  );
}
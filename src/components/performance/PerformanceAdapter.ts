import { Flame, Brain, Trophy, Target, Zap, Heart, Star, TrendingUp } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface PerformanceStat {
  label: string;
  value: number | null;
  icon: LucideIcon;
  lowLabel: string;
  highLabel: string;
}

export interface PerformanceProfile {
  playerName: string;
  avatarUrl: string | null;
  position: string;
}

export interface AdaptedPerformanceData {
  profile: PerformanceProfile;
  overallRating: number;
  hasData: boolean;
  stats: PerformanceStat[];
}

interface BehaviourData {
  behaviour_type: string;
  average_score: number | null;
}

interface ActivityRatingData {
  workRate?: number;
  confidence?: number;
  mistakes?: number;
  focus?: number;
  performance?: number;
}

const BEHAVIOUR_CONFIG: Record<string, { icon: LucideIcon; label: string; lowLabel: string; highLabel: string }> = {
  brave_on_ball: {
    icon: Flame,
    label: 'Brave on Ball',
    lowLabel: 'Hesitant',
    highLabel: 'Fearless'
  },
  brave_off_ball: {
    icon: Brain,
    label: 'Brave off Ball',
    lowLabel: 'Passive',
    highLabel: 'Always Available'
  },
  electric: {
    icon: Zap,
    label: 'Electric',
    lowLabel: 'Low Energy',
    highLabel: 'Full Power'
  },
  aggressive: {
    icon: Target,
    label: 'Aggressive',
    lowLabel: 'Soft',
    highLabel: 'Warrior'
  }
};

const RATING_CONFIG: Record<string, { icon: LucideIcon; label: string; lowLabel: string; highLabel: string }> = {
  workRate: {
    icon: TrendingUp,
    label: 'Work Rate',
    lowLabel: 'Low Effort',
    highLabel: 'Maximum Effort'
  },
  confidence: {
    icon: Star,
    label: 'Confidence',
    lowLabel: 'Nervous',
    highLabel: 'Unstoppable'
  },
  focus: {
    icon: Brain,
    label: 'Focus',
    lowLabel: 'Distracted',
    highLabel: 'Locked In'
  },
  performance: {
    icon: Trophy,
    label: 'Performance',
    lowLabel: 'Struggled',
    highLabel: 'Dominated'
  },
  mistakes: {
    icon: Heart,
    label: 'Handling Mistakes',
    lowLabel: 'Affected Me',
    highLabel: 'Bounced Back'
  }
};

/**
 * Adapts App B's performance data into the format needed for FIFA-style UI components
 */
export function adaptPerformanceData(
  childName: string,
  avatarUrl: string | null,
  behaviourData: BehaviourData[],
  activityRatings: ActivityRatingData | null,
  bestSelfAverage: number | null
): AdaptedPerformanceData {
  const stats: PerformanceStat[] = [];
  let totalScore = 0;
  let scoreCount = 0;

  // Add behaviour stats
  Object.entries(BEHAVIOUR_CONFIG).forEach(([key, config]) => {
    const behaviour = behaviourData.find(b => b.behaviour_type === key);
    const value = behaviour?.average_score ?? null;
    
    stats.push({
      label: config.label,
      value,
      icon: config.icon,
      lowLabel: config.lowLabel,
      highLabel: config.highLabel
    });

    if (value !== null) {
      totalScore += value;
      scoreCount++;
    }
  });

  // Add activity rating stats if available
  if (activityRatings) {
    Object.entries(RATING_CONFIG).forEach(([key, config]) => {
      const value = activityRatings[key as keyof ActivityRatingData] ?? null;
      
      if (value !== null) {
        stats.push({
          label: config.label,
          value,
          icon: config.icon,
          lowLabel: config.lowLabel,
          highLabel: config.highLabel
        });
        totalScore += value;
        scoreCount++;
      }
    });
  }

  // Add best self if available
  if (bestSelfAverage !== null) {
    stats.push({
      label: 'Best Self',
      value: bestSelfAverage,
      icon: Star,
      lowLabel: 'Off Day',
      highLabel: 'Peak Performance'
    });
    totalScore += bestSelfAverage;
    scoreCount++;
  }

  // Calculate overall rating (0-10 scale → 0-99 scale)
  const hasData = scoreCount > 0;
  const avgScore = hasData ? totalScore / scoreCount : 0;
  const overallRating = hasData ? Math.min(99, Math.round(avgScore * 9.9)) : 0;

  return {
    profile: {
      playerName: childName || 'Player',
      avatarUrl,
      position: 'CAM'
    },
    overallRating,
    hasData,
    stats
  };
}

/**
 * Calculate overall rating from an average score (0-10 scale)
 */
export function calculateOverallRating(avgScore: number): number {
  return Math.min(99, Math.round(avgScore * 9.9));
}

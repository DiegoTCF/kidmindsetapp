import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useChildData } from "@/hooks/useChildData";
import { PlayerCard } from "@/components/performance/PlayerCard";
import { StatBar } from "@/components/performance/StatBar";
import { PlayerCardSkeleton, StatBarSkeleton } from "@/components/performance/PerformanceSkeletons";
import { adaptPerformanceData, AdaptedPerformanceData } from "@/components/performance/PerformanceAdapter";
import { TimePeriodFilter, TimePeriod, getDateRangeForPeriod } from "@/components/performance/TimePeriodFilter";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export function ProgressPlayerCard() {
  const { childId, loading: childLoading } = useChildData();
  const [performanceData, setPerformanceData] = useState<AdaptedPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllStats, setShowAllStats] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');

  useEffect(() => {
    if (childId) {
      loadPerformanceData();
    } else if (!childLoading) {
      setLoading(false);
    }
  }, [childId, childLoading, timePeriod]);

  const loadPerformanceData = async () => {
    if (!childId) return;
    
    setLoading(true);
    try {
      const { startDate } = getDateRangeForPeriod(timePeriod);
      
      // Fetch child details for name and avatar
      const { data: childData, error: childError } = await supabase
        .from('children')
        .select('name')
        .eq('id', childId)
        .single();

      if (childError) {
        console.error('Error loading child data:', childError);
      }

      // Fetch player identity for avatar
      const { data: userData } = await supabase.auth.getUser();
      let avatarUrl: string | null = null;
      
      if (userData?.user?.id) {
        const { data: identityData } = await supabase
          .from('player_identities')
          .select('avatar_url')
          .eq('user_id', userData.user.id)
          .maybeSingle();
        
        avatarUrl = identityData?.avatar_url || null;
      }

      // Fetch super behaviour ratings with date filter
      let behaviourQuery = supabase
        .from('super_behaviour_ratings')
        .select('behaviour_type, average_score, created_at')
        .eq('child_id', childId)
        .order('created_at', { ascending: false });
      
      if (startDate) {
        behaviourQuery = behaviourQuery.gte('created_at', startDate.toISOString());
      }
      
      const { data: behaviourData, error: behaviourError } = await behaviourQuery;

      if (behaviourError) {
        console.error('Error loading behaviour data:', behaviourError);
      }

      // Group behaviour data and calculate averages
      const behaviourAverages: { behaviour_type: string; average_score: number }[] = [];
      if (behaviourData && behaviourData.length > 0) {
        const behaviourGroups: { [key: string]: number[] } = {};
        behaviourData.forEach(rating => {
          if (!behaviourGroups[rating.behaviour_type]) {
            behaviourGroups[rating.behaviour_type] = [];
          }
          if (rating.average_score !== null) {
            behaviourGroups[rating.behaviour_type].push(rating.average_score);
          }
        });

        Object.entries(behaviourGroups).forEach(([type, scores]) => {
          if (scores.length > 0) {
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            behaviourAverages.push({ behaviour_type: type, average_score: avg });
          }
        });
      }

      // Fetch activity ratings from post_activity_data with date filter
      let activitiesQuery = supabase
        .from('activities')
        .select('post_activity_data, activity_date')
        .eq('child_id', childId)
        .eq('post_activity_completed', true)
        .order('activity_date', { ascending: false })
        .limit(50);
      
      if (startDate) {
        activitiesQuery = activitiesQuery.gte('activity_date', startDate.toISOString().split('T')[0]);
      }
      
      const { data: activities, error: activitiesError } = await activitiesQuery;

      let activityRatings = null;
      if (!activitiesError && activities && activities.length > 0) {
        let workRateSum = 0, confidenceSum = 0, mistakesSum = 0, focusSum = 0, performanceSum = 0;
        let count = 0;

        activities.forEach(activity => {
          if (activity.post_activity_data) {
            const data = activity.post_activity_data as any;
            if (data.workRate && data.confidence && data.mistakes && data.focus && data.performance) {
              workRateSum += data.workRate;
              confidenceSum += data.confidence;
              mistakesSum += data.mistakes;
              focusSum += data.focus;
              performanceSum += data.performance;
              count++;
            }
          }
        });

        if (count > 0) {
          activityRatings = {
            workRate: workRateSum / count,
            confidence: confidenceSum / count,
            mistakes: mistakesSum / count,
            focus: focusSum / count,
            performance: performanceSum / count
          };
        }
      }

      // Fetch best self scores with date filter
      let bestSelfQuery = supabase
        .from('best_self_scores')
        .select('score, created_at')
        .eq('user_id', userData?.user?.id || '')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (startDate) {
        bestSelfQuery = bestSelfQuery.gte('created_at', startDate.toISOString());
      }
      
      const { data: bestSelfData } = await bestSelfQuery;

      let bestSelfAverage: number | null = null;
      if (bestSelfData && bestSelfData.length > 0) {
        const totalScore = bestSelfData.reduce((sum, item) => sum + item.score, 0);
        bestSelfAverage = totalScore / bestSelfData.length / 10; // Convert from 0-100 to 0-10 scale
      }

      // Use the adapter to transform the data
      const adapted = adaptPerformanceData(
        childData?.name || 'Player',
        avatarUrl,
        behaviourAverages,
        activityRatings,
        bestSelfAverage
      );

      setPerformanceData(adapted);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || childLoading) {
    return (
      <div className="space-y-6">
        <PlayerCardSkeleton />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <StatBarSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!performanceData) {
    return null;
  }

  const displayStats = showAllStats 
    ? performanceData.stats 
    : performanceData.stats.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Time Period Filter */}
      <TimePeriodFilter 
        value={timePeriod} 
        onChange={setTimePeriod}
        className="mb-2"
      />
      
      {/* FIFA-style Player Card */}
      <div className="flex justify-center">
        <PlayerCard
          playerName={performanceData.profile.playerName}
          position={performanceData.profile.position}
          overallRating={performanceData.overallRating}
          avatarUrl={performanceData.profile.avatarUrl}
          hasData={performanceData.hasData}
        />
      </div>

      {/* Stat Bars */}
      {performanceData.stats.length > 0 && (
        <div className="space-y-4 bg-card rounded-xl p-4 shadow-soft">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Performance Breakdown
          </h3>
          
          <div className="space-y-4">
            {displayStats.map((stat, index) => (
              <StatBar
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                lowLabel={stat.lowLabel}
                highLabel={stat.highLabel}
                delay={index * 0.1}
              />
            ))}
          </div>

          {performanceData.stats.length > 4 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllStats(!showAllStats)}
              className="w-full mt-2"
            >
              {showAllStats ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Show {performanceData.stats.length - 4} More Stats
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

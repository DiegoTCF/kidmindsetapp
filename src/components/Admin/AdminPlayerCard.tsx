import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PlayerCard } from "@/components/performance/PlayerCard";
import { PlayerCardSkeleton } from "@/components/performance/PerformanceSkeletons";
import { adaptPerformanceData, AdaptedPerformanceData } from "@/components/performance/PerformanceAdapter";

interface AdminPlayerCardProps {
  childId: string;
  userId?: string;
}

export function AdminPlayerCard({ childId, userId }: AdminPlayerCardProps) {
  const [performanceData, setPerformanceData] = useState<AdaptedPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      loadPerformanceData();
    }
  }, [childId, userId]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      // Fetch child details for name
      const { data: childData } = await supabase
        .from('children')
        .select('name, parent_id')
        .eq('id', childId)
        .single();

      if (!childData) {
        setLoading(false);
        return;
      }

      // Get parent's user_id to fetch player identity
      let avatarUrl: string | null = null;
      if (userId) {
        const { data: identityData } = await supabase
          .from('player_identities')
          .select('avatar_url')
          .eq('user_id', userId)
          .maybeSingle();
        
        avatarUrl = identityData?.avatar_url || null;
      } else {
        // Try to get user_id from parent
        const { data: parentData } = await supabase
          .from('parents')
          .select('user_id')
          .eq('id', childData.parent_id)
          .single();

        if (parentData?.user_id) {
          const { data: identityData } = await supabase
            .from('player_identities')
            .select('avatar_url')
            .eq('user_id', parentData.user_id)
            .maybeSingle();
          
          avatarUrl = identityData?.avatar_url || null;
        }
      }

      // Fetch super behaviour ratings
      const { data: behaviourData } = await supabase
        .from('super_behaviour_ratings')
        .select('behaviour_type, average_score')
        .eq('child_id', childId)
        .order('created_at', { ascending: false });

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

      // Fetch activity ratings from post_activity_data
      const { data: activities } = await supabase
        .from('activities')
        .select('post_activity_data')
        .eq('child_id', childId)
        .eq('post_activity_completed', true)
        .order('activity_date', { ascending: false })
        .limit(20);

      let activityRatings = null;
      if (activities && activities.length > 0) {
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

      // Fetch best self scores - need user_id from parent
      let bestSelfAverage: number | null = null;
      const { data: parentData } = await supabase
        .from('parents')
        .select('user_id')
        .eq('id', childData.parent_id)
        .single();

      if (parentData?.user_id) {
        const { data: bestSelfData } = await supabase
          .from('best_self_scores')
          .select('score')
          .eq('user_id', parentData.user_id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (bestSelfData && bestSelfData.length > 0) {
          const totalScore = bestSelfData.reduce((sum, item) => sum + item.score, 0);
          bestSelfAverage = totalScore / bestSelfData.length / 10;
        }
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

  if (loading) {
    return (
      <div className="flex justify-center">
        <PlayerCardSkeleton />
      </div>
    );
  }

  if (!performanceData) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <PlayerCard
        playerName={performanceData.profile.playerName}
        position={performanceData.profile.position}
        overallRating={performanceData.overallRating}
        avatarUrl={performanceData.profile.avatarUrl}
        hasData={performanceData.hasData}
      />
    </div>
  );
}

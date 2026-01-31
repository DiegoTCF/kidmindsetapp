import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayerCard } from "@/components/performance/PlayerCard";
import { StatBar } from "@/components/performance/StatBar";
import { PlayerCardSkeleton } from "@/components/performance/PerformanceSkeletons";
import { adaptPerformanceData, AdaptedPerformanceData } from "@/components/performance/PerformanceAdapter";
import { TimePeriodFilter, TimePeriod, getDateRangeForPeriod } from "@/components/performance/TimePeriodFilter";

interface AdminPlayerCardProps {
  childId: string;
  userId?: string;
}

export function AdminPlayerCard({ childId, userId }: AdminPlayerCardProps) {
  const [performanceData, setPerformanceData] = useState<AdaptedPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');

  useEffect(() => {
    if (childId) {
      loadPerformanceData();
    }
  }, [childId, userId, timePeriod]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      const { startDate } = getDateRangeForPeriod(timePeriod);
      
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
      let parentUserId: string | null = userId || null;
      
      if (!parentUserId) {
        // Try to get user_id from parent
        const { data: parentData } = await supabase
          .from('parents')
          .select('user_id')
          .eq('id', childData.parent_id)
          .single();

        parentUserId = parentData?.user_id || null;
      }

      if (parentUserId) {
        const { data: identityData } = await supabase
          .from('player_identities')
          .select('avatar_url')
          .eq('user_id', parentUserId)
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
      
      const { data: behaviourData } = await behaviourQuery;

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
      
      const { data: activities } = await activitiesQuery;

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

      // Fetch best self scores - need user_id from parent with date filter
      let bestSelfAverage: number | null = null;
      if (parentUserId) {
        let bestSelfQuery = supabase
          .from('best_self_scores')
          .select('score, created_at')
          .eq('user_id', parentUserId)
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (startDate) {
          bestSelfQuery = bestSelfQuery.gte('created_at', startDate.toISOString());
        }
        
        const { data: bestSelfData } = await bestSelfQuery;

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
    <div className="space-y-6">
      {/* Time Period Filter */}
      <TimePeriodFilter 
        value={timePeriod} 
        onChange={setTimePeriod}
        className="mb-2"
      />
      
      {/* FIFA-Style Player Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center">
          <PlayerCard
            playerName={performanceData.profile.playerName}
            position={performanceData.profile.position}
            overallRating={performanceData.overallRating}
            avatarUrl={performanceData.profile.avatarUrl}
            hasData={performanceData.hasData}
          />
        </div>
      </motion.div>

      {/* Stats Bars - Same as player sees */}
      {performanceData.stats.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Performance Stats Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {performanceData.stats.slice(0, 4).map((stat, index) => (
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
              
              {performanceData.stats.length > 4 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? 'Show Less' : `Show ${performanceData.stats.length - 4} More Stats`}
                    <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  {showDetails && (
                    <motion.div
                      className="space-y-5"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      {performanceData.stats.slice(4).map((stat, index) => (
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
                    </motion.div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty state when no data */}
      {!performanceData.hasData && (
        <Card className="bg-card/50 backdrop-blur-sm border-destructive/30">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No performance data yet. The player needs to complete some activities to see stats here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChildData } from "@/hooks/useChildData";
import { PlayerViewIndicator } from "@/components/layout/PlayerViewIndicator";
import { BackToHomeButton } from "@/components/layout/BackToHomeButton";
import ActivityLog from "@/components/Progress/ActivityLog";
import Charts from "@/components/Progress/Charts";
import BehaviourCharts from "@/components/Progress/BehaviourCharts";
import { CoreSkillsHistory } from "@/components/Progress/CoreSkillsHistory";
import { BestSelfTracker } from "@/components/Progress/BestSelfTracker";
import { TrendingUp, Building2, Plus, Calendar, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// New FIFA-style components
import { PlayerCard } from "@/components/performance/PlayerCard";
import { StatBar } from "@/components/performance/StatBar";
import { adaptPerformanceData, AdaptedPerformanceData } from "@/components/performance/PerformanceAdapter";
import { PerformancePageSkeleton } from "@/components/performance/PerformanceSkeletons";

const activityFilters = ["All", "Match", "Training", "1to1", "Futsal", "Small Group", "Other"];

export default function Performance() {
  const navigate = useNavigate();
  const { childId, loading: childLoading } = useChildData();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [activeSection, setActiveSection] = useState<'progress' | 'stadium'>('progress');
  const [performanceData, setPerformanceData] = useState<AdaptedPerformanceData | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [childName, setChildName] = useState<string>('Player');
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (childId) {
      loadPerformanceData();
      loadAvatarUrl();
    }
  }, [childId]);

  const loadAvatarUrl = async () => {
    if (!childId) return;
    
    try {
      // Get current user's profile with avatar
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check for avatar in storage
        const { data } = await supabase.storage
          .from('avatars')
          .getPublicUrl(`${user.id}/avatar`);
        
        if (data?.publicUrl) {
          // Check if the file actually exists
          const response = await fetch(data.publicUrl, { method: 'HEAD' });
          if (response.ok) {
            setAvatarUrl(data.publicUrl);
          }
        }
      }
    } catch (error) {
      console.error('Error loading avatar:', error);
    }
  };

  const loadPerformanceData = async () => {
    if (!childId) return;
    
    try {
      setLoading(true);

      // Load child name
      const { data: childData, error: childError } = await supabase
        .from('children')
        .select('name')
        .eq('id', childId)
        .single();

      if (!childError && childData) {
        setChildName(childData.name);
      }

      // Load behaviour ratings
      const { data: behaviourData, error: behaviourError } = await supabase
        .from('super_behaviour_ratings')
        .select('behaviour_type, average_score')
        .eq('child_id', childId);

      if (behaviourError) throw behaviourError;

      // Process behaviour data - get latest average per type
      const behaviourMap: { [key: string]: number[] } = {};
      behaviourData?.forEach(rating => {
        if (!behaviourMap[rating.behaviour_type]) {
          behaviourMap[rating.behaviour_type] = [];
        }
        if (rating.average_score !== null) {
          behaviourMap[rating.behaviour_type].push(rating.average_score);
        }
      });

      const processedBehaviours = Object.entries(behaviourMap).map(([type, scores]) => ({
        behaviour_type: type,
        average_score: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null
      }));

      // Load activity ratings
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('post_activity_data')
        .eq('child_id', childId)
        .eq('post_activity_completed', true)
        .not('post_activity_data', 'is', null)
        .limit(50);

      if (activitiesError) throw activitiesError;

      // Calculate activity rating averages
      let workRateSum = 0, confidenceSum = 0, mistakesSum = 0, focusSum = 0, performanceSum = 0;
      let ratingsCount = 0;

      activities?.forEach(activity => {
        const data = activity.post_activity_data as any;
        if (data?.workRate && data?.confidence && data?.mistakes && data?.focus && data?.performance) {
          workRateSum += data.workRate;
          confidenceSum += data.confidence;
          mistakesSum += data.mistakes;
          focusSum += data.focus;
          performanceSum += data.performance;
          ratingsCount++;
        }
      });

      const activityRatings = ratingsCount > 0 ? {
        workRate: workRateSum / ratingsCount,
        confidence: confidenceSum / ratingsCount,
        mistakes: mistakesSum / ratingsCount,
        focus: focusSum / ratingsCount,
        performance: performanceSum / ratingsCount
      } : null;

      // Load best self average
      const { data: bestSelfData, error: bestSelfError } = await supabase
        .from('best_self_scores')
        .select('score')
        .not('activity_id', 'is', null);

      let bestSelfAverage: number | null = null;
      if (!bestSelfError && bestSelfData && bestSelfData.length > 0) {
        bestSelfAverage = bestSelfData.reduce((sum, s) => sum + s.score, 0) / bestSelfData.length;
      }

      // Adapt data for UI
      const adapted = adaptPerformanceData(
        childName || 'Player',
        avatarUrl,
        processedBehaviours,
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

  // Update performance data when avatar changes
  useEffect(() => {
    if (performanceData && avatarUrl) {
      setPerformanceData(prev => prev ? {
        ...prev,
        profile: { ...prev.profile, avatarUrl }
      } : null);
    }
  }, [avatarUrl]);

  if (childLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <BackToHomeButton className="mb-4" />
        <PerformancePageSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <BackToHomeButton className="mb-4" />
      <PlayerViewIndicator />
      
      {/* FIFA-Style Player Card */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PlayerCard
          playerName={performanceData?.profile.playerName || childName || 'Player'}
          overallRating={performanceData?.overallRating || 0}
          avatarUrl={performanceData?.profile.avatarUrl || avatarUrl}
          hasData={performanceData?.hasData || false}
          position={performanceData?.profile.position || 'CAM'}
        />
      </motion.div>

      {/* Stats Bars */}
      {performanceData && performanceData.stats.length > 0 && (
        <motion.div
          className="mb-8 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Performance Stats
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
                    {showDetails ? 'Show Less' : `Show ${performanceData.stats.length - 4} More`}
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
      {performanceData && !performanceData.hasData && (
        <Card className="mb-8 bg-card/50 backdrop-blur-sm border-destructive/30">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Complete some activities to see your performance stats!
            </p>
            <Button onClick={() => navigate('/stadium')}>
              <Plus className="w-4 h-4 mr-2" />
              Start Activity
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Section Toggle */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeSection === 'progress' ? 'default' : 'outline'}
          onClick={() => setActiveSection('progress')}
          className="flex-1"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Details
        </Button>
        <Button
          variant={activeSection === 'stadium' ? 'default' : 'outline'}
          onClick={() => setActiveSection('stadium')}
          className="flex-1"
        >
          <Building2 className="w-4 h-4 mr-2" />
          Stadium
        </Button>
      </div>

      {/* Progress Section */}
      {activeSection === 'progress' && (
        <Tabs defaultValue="activities" className="space-y-6">
          <TabsList className="flex w-full overflow-x-auto">
            <TabsTrigger value="activities" className="flex-shrink-0 text-xs">Activity Log</TabsTrigger>
            <TabsTrigger value="behaviours" className="flex-shrink-0 text-xs">Super Behaviours</TabsTrigger>
            <TabsTrigger value="stats" className="flex-shrink-0 text-xs">Your Stats</TabsTrigger>
            <TabsTrigger value="core-skills" className="flex-shrink-0 text-xs">Core Skills</TabsTrigger>
            <TabsTrigger value="best-self" className="flex-shrink-0 text-xs">Best Self</TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {activityFilters.map(filter => (
                <Button 
                  key={filter} 
                  variant={selectedFilter === filter ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setSelectedFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
            <ActivityLog selectedFilter={selectedFilter} childId={childId} />
          </TabsContent>

          <TabsContent value="behaviours" className="space-y-6">
            <BehaviourCharts selectedFilter={selectedFilter} childId={childId} />
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {activityFilters.map(filter => (
                <Button 
                  key={filter} 
                  variant={selectedFilter === filter ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setSelectedFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
            <Charts selectedFilter={selectedFilter} childId={childId} />
          </TabsContent>

          <TabsContent value="core-skills" className="space-y-6">
            <CoreSkillsHistory />
          </TabsContent>

          <TabsContent value="best-self" className="space-y-6">
            <BestSelfTracker />
          </TabsContent>
        </Tabs>
      )}

      {/* Stadium Section */}
      {activeSection === 'stadium' && (
        <div className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Your Stadium
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Create new activities and track your sessions here.
              </p>
              
              <Button 
                onClick={() => navigate('/stadium')} 
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Activity
              </Button>

              <Button 
                variant="outline"
                onClick={() => navigate('/stadium')} 
                className="w-full"
              >
                <Calendar className="w-4 h-4 mr-2" />
                View Full Stadium
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

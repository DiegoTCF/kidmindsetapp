import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
interface ActivityStats {
  type: string;
  count: number;
  percentage: number;
}
interface MoodTrend {
  date: string;
  mood: number;
  confidence: number;
}
interface WorryStats {
  reason: string;
  count: number;
  percentage: number;
}

// Color mapping for specific activity types
const ACTIVITY_COLORS: {
  [key: string]: string;
} = {
  'Match': '#FF4D4D',
  // Red
  'Team Training': '#FFA500',
  // Orange
  'Training': '#FFA500',
  // Orange (alias)
  '1to1': '#FFDD44',
  // Yellow
  '1-to-1': '#FFDD44',
  // Yellow (alias)
  'Small Group': '#00CC99',
  // Green
  'Futsal': '#3399FF',
  // Blue
  'Other Sport': '#9966FF',
  // Purple
  'Other': '#9966FF' // Purple (alias)
};

// Fallback colors for any unlisted activity types
const FALLBACK_COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899'];
const getActivityColor = (activityType: string, index: number): string => {
  return ACTIVITY_COLORS[activityType] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
};
interface ChartsProps {
  selectedFilter: string;
  childId?: string;
}
export default function Charts({
  selectedFilter,
  childId
}: ChartsProps) {
  const [activityStats, setActivityStats] = useState<ActivityStats[]>([]);
  const [moodTrends, setMoodTrends] = useState<MoodTrend[]>([]);
  const [worryStats, setWorryStats] = useState<WorryStats[]>([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [totalWorries, setTotalWorries] = useState(0);
  const [avgMood, setAvgMood] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [totalGoals, setTotalGoals] = useState(0);
  const [totalAssists, setTotalAssists] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  useEffect(() => {
    loadChartData();
  }, [selectedFilter, childId]);
  const loadChartData = async () => {
    try {
      let targetChildId = childId;

      // If no childId provided, get current user's child ID using RLS-safe function
      if (!targetChildId) {
        console.log('[ProgressPage] Charts: Getting current user child ID...');
        const {
          data: childIdResult,
          error: childIdError
        } = await supabase.rpc('get_current_user_child_id');
        if (childIdError) {
          console.error('[ProgressPage] Charts: Error getting child ID:', childIdError);
          return;
        }
        if (!childIdResult) {
          console.log('[ProgressPage] Charts: No child found for current user');
          return;
        }
        targetChildId = childIdResult;
        console.log('[ProgressPage] Charts: Using child ID:', targetChildId);
      }

      // Load activities for stats
      const {
        data: activities,
        error: activitiesError
      } = await supabase.from('activities').select('activity_type, post_activity_completed, post_activity_data, activity_date, goals_scored, assists_made, worry_reason').eq('child_id', targetChildId).order('activity_date', {
        ascending: false
      });
      if (activitiesError) throw activitiesError;
      if (activities && activities.length > 0) {
        // Filter activities based on selected filter
        let filteredActivities = activities;
        if (selectedFilter !== "All") {
          filteredActivities = activities.filter(activity => activity.activity_type.toLowerCase() === selectedFilter.toLowerCase());
        }

        // Calculate activity type distribution
        const typeStats: {
          [key: string]: number;
        } = {};
        const worryReasons: {
          [key: string]: number;
        } = {};
        let completedCount = 0;
        const moodData: MoodTrend[] = [];
        let goalsSum = 0;
        let assistsSum = 0;
        let matchesCount = 0;
        let worriesCount = 0;
        filteredActivities.forEach(activity => {
          typeStats[activity.activity_type] = (typeStats[activity.activity_type] || 0) + 1;

          // Count worry reasons
          if (activity.worry_reason) {
            worryReasons[activity.worry_reason] = (worryReasons[activity.worry_reason] || 0) + 1;
            worriesCount++;
          }

          // Count matches (assuming 'match' is the activity type for matches)
          if (activity.activity_type.toLowerCase() === 'match') {
            matchesCount++;
          }

          // Sum goals and assists
          if (activity.goals_scored) {
            goalsSum += activity.goals_scored;
          }
          if (activity.assists_made) {
            assistsSum += activity.assists_made;
          }
          if (activity.post_activity_completed) {
            completedCount++;

            // Extract mood and confidence data
            if (activity.post_activity_data) {
              const data = activity.post_activity_data as any;
              if (data.mood && data.confidence) {
                moodData.push({
                  date: activity.activity_date,
                  mood: data.mood,
                  confidence: data.confidence
                });
              }
            }
          }
        });

        // Convert to chart format
        const total = filteredActivities.length;
        const statsArray = Object.entries(typeStats).map(([type, count]) => ({
          type,
          count,
          percentage: Math.round(count / total * 100)
        }));
        setActivityStats(statsArray);
        setTotalActivities(total);
        setTotalWorries(worriesCount);
        setCompletionRate(Math.round(completedCount / total * 100));
        setTotalGoals(goalsSum);
        setTotalAssists(assistsSum);
        setTotalMatches(matchesCount);

        // Convert worry stats to chart format
        const worryStatsArray = Object.entries(worryReasons).map(([reason, count]) => ({
          reason,
          count,
          percentage: Math.round(count / total * 100)
        }));
        setWorryStats(worryStatsArray);

        // Sort mood trends by date and take last 10
        const sortedMoodData = moodData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-10);
        setMoodTrends(sortedMoodData);

        // Calculate averages
        if (moodData.length > 0) {
          const avgMoodValue = moodData.reduce((sum, item) => sum + item.mood, 0) / moodData.length;
          const avgConfidenceValue = moodData.reduce((sum, item) => sum + item.confidence, 0) / moodData.length;
          setAvgMood(Math.round(avgMoodValue * 10) / 10);
          setAvgConfidence(Math.round(avgConfidenceValue * 10) / 10);
        }
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
  };
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  return <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{totalActivities}</p>
              <p className="text-sm text-muted-foreground">Total Activities</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{completionRate}%</p>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{avgMood}/5</p>
              <p className="text-sm text-muted-foreground">Avg Mood After activity</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{avgConfidence}/10</p>
              <p className="text-sm text-muted-foreground">Avg Confidence before activity</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Match Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{totalMatches}</p>
              <p className="text-sm text-muted-foreground">Total Matches</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{totalGoals}</p>
              <p className="text-sm text-muted-foreground">Total Goals</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{totalAssists}</p>
              <p className="text-sm text-muted-foreground">Total Assists</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        {/* Activity Types Pie Chart */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Activity Types</CardTitle>
          </CardHeader>
          <CardContent>
            {activityStats.length > 0 ? <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={activityStats} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="count">
                      {activityStats.map((entry, index) => <Cell key={`cell-${index}`} fill={getActivityColor(entry.type, index)} />)}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} activities`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {activityStats.map((stat, index) => <div key={stat.type} className="flex items-center gap-1 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{
                  backgroundColor: getActivityColor(stat.type, index)
                }} />
                      <span>{stat.type} ({stat.percentage}%)</span>
                    </div>)}
                </div>
              </div> : <div className="text-center text-muted-foreground py-8">
                Complete some activities to see your distribution
              </div>}
          </CardContent>
        </Card>
      </div>

      {/* Mindset Insights */}
      {worryStats.length > 0 && <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              💙 Mindset Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Out of {totalActivities} activities, you used mindset support {totalWorries} times
                </p>
              </div>
              
              <div className="space-y-3">
                {worryStats.map((worry, index) => <div key={worry.reason} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{worry.reason}</span>
                      <span className="text-sm text-muted-foreground">
                        {worry.count} {worry.count === 1 ? 'time' : 'times'} ({worry.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="h-2 rounded-full transition-all duration-500" style={{
                  width: `${worry.percentage}%`,
                  backgroundColor: FALLBACK_COLORS[index % FALLBACK_COLORS.length]
                }} />
                    </div>
                  </div>)}
              </div>
              
              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm text-primary font-medium mb-2">💡 Growth Insight</p>
                <p className="text-sm text-foreground/90">
                  {worryStats.length === 1 ? `You mainly worry about "${worryStats[0].reason.toLowerCase()}". That's totally normal! Keep using the mindset support tools to build confidence.` : `You've shown great self-awareness by working through ${worryStats.length} different worries. This emotional intelligence will help you grow stronger mentally!`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>}
    </div>;
}
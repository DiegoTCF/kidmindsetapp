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

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--success))', 'hsl(var(--warning))'];

interface ChartsProps {
  selectedFilter: string;
}

export default function Charts({ selectedFilter }: ChartsProps) {
  const [activityStats, setActivityStats] = useState<ActivityStats[]>([]);
  const [moodTrends, setMoodTrends] = useState<MoodTrend[]>([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [avgMood, setAvgMood] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);

  useEffect(() => {
    loadChartData();
  }, [selectedFilter]);

  const loadChartData = async () => {
    try {
      // Get current child ID
      const { data: children } = await supabase
        .from('children')
        .select('id')
        .limit(1);
      
      if (!children || children.length === 0) return;
      
      const childId = children[0].id;

      // Load activities for stats
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('activity_type, post_activity_completed, post_activity_data, activity_date')
        .eq('child_id', childId)
        .order('activity_date', { ascending: false });

      if (activitiesError) throw activitiesError;

      if (activities && activities.length > 0) {
        // Filter activities based on selected filter
        let filteredActivities = activities;
        if (selectedFilter !== "All") {
          filteredActivities = activities.filter(activity => 
            activity.activity_type.toLowerCase() === selectedFilter.toLowerCase()
          );
        }

        // Calculate activity type distribution
        const typeStats: { [key: string]: number } = {};
        let completedCount = 0;
        const moodData: MoodTrend[] = [];

        filteredActivities.forEach(activity => {
          typeStats[activity.activity_type] = (typeStats[activity.activity_type] || 0) + 1;
          
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
          percentage: Math.round((count / total) * 100)
        }));

        setActivityStats(statsArray);
        setTotalActivities(total);
        setCompletionRate(Math.round((completedCount / total) * 100));

        // Sort mood trends by date and take last 10
        const sortedMoodData = moodData
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(-10);
        
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

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <p className="text-sm text-muted-foreground">Avg Mood</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{avgConfidence}/10</p>
              <p className="text-sm text-muted-foreground">Avg Confidence</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Types Pie Chart */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Activity Types</CardTitle>
          </CardHeader>
          <CardContent>
            {activityStats.length > 0 ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={activityStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {activityStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} activities`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {activityStats.map((stat, index) => (
                    <div key={stat.type} className="flex items-center gap-1 text-sm">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{stat.type} ({stat.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Complete some activities to see your distribution
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mood & Confidence Trend */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Mood & Confidence Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {moodTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={moodTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    fontSize={12}
                  />
                  <YAxis domain={[0, 10]} fontSize={12} />
                  <Tooltip 
                    labelFormatter={(label) => formatDate(label)}
                    formatter={(value, name) => [
                      `${value}${name === 'mood' ? '/5' : '/10'}`, 
                      name === 'mood' ? 'Mood' : 'Confidence'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="hsl(var(--warning))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--warning))", strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="confidence" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Complete some activities with post-activity reflections to see trends
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
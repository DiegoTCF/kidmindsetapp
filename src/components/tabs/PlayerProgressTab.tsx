import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Calendar, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ChildProgress {
  name: string;
  age: number;
  level: number;
  points: number;
  weeklyMoodAvg: number;
  completionRate: number;
  activeDays: number;
  recentMoods: { date: string; mood: number }[];
  taskStreaks: { name: string; streak: number }[];
  journalEntries: number;
}

export function PlayerProgressTab() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<"weekly" | "monthly" | "alltime">("weekly");
  const [childProgress, setChildProgress] = useState<ChildProgress>({
    name: "Champion",
    age: 8,
    level: 1,
    points: 0,
    weeklyMoodAvg: 3.5,
    completionRate: 0,
    activeDays: 0,
    recentMoods: [],
    taskStreaks: [],
    journalEntries: 0
  });

  useEffect(() => {
    loadChildData();
    loadProgressData(selectedPeriod);
  }, [user, selectedPeriod]);

  const loadChildData = async () => {
    if (!user?.id) return;

    try {
      // Get parent data first
      const { data: parentData } = await supabase
        .from('parents')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (parentData) {
        // Get child data
        const { data: childData } = await supabase
          .from('children')
          .select('name, age, level, points')
          .eq('parent_id', parentData.id)
          .maybeSingle();

        if (childData) {
          setChildProgress(prev => ({
            ...prev,
            name: childData.name,
            age: childData.age,
            level: childData.level || 1,
            points: childData.points || 0
          }));
        }
      }
    } catch (error) {
      console.error('Error loading child data:', error);
    }
  };

  const loadProgressData = (period: "weekly" | "monthly" | "alltime") => {
    const days = period === "weekly" ? 7 : period === "monthly" ? 30 : 365;
    
    // Calculate mood data
    const moodEntries = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const dailyMood = localStorage.getItem(`kidmindset_mood_${dateStr}`);
      if (dailyMood) {
        moodEntries.push({
          date: dateStr,
          mood: Number(dailyMood)
        });
      }
    }
    
    // Calculate completion rate
    let totalTasks = 0;
    let completedTasks = 0;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const taskData = localStorage.getItem(`kidmindset_tasks_${dateStr}`);
      if (taskData) {
        const tasks = JSON.parse(taskData);
        totalTasks += tasks.length;
        completedTasks += tasks.filter((t: any) => t.completed).length;
      }
    }
    
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Count journal entries
    let journalCount = 0;
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const postGameData = localStorage.getItem(`kidmindset_postgame_${dateStr}`);
      if (postGameData) {
        const data = JSON.parse(postGameData);
        if (data.journalPrompts && Object.values(data.journalPrompts).some((v: any) => v.trim())) {
          journalCount++;
        }
      }
    }
    
    const weeklyMoodAvg = moodEntries.length > 0 
      ? moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length
      : 3.5;
    
    setChildProgress(prev => ({
      ...prev,
      weeklyMoodAvg: Math.round(weeklyMoodAvg * 10) / 10,
      completionRate,
      activeDays: moodEntries.length,
      recentMoods: moodEntries.slice(0, 10),
      journalEntries: journalCount
    }));
  };

  const getMoodEmoji = (mood: number) => {
    return ["😢", "😕", "😐", "😊", "😁"][mood - 1] || "😐";
  };

  return (
    <div className="space-y-6">
      {/* Child Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Player Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {childProgress.name[0]?.toUpperCase() || '🌟'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{childProgress.name}</h3>
              <p className="text-muted-foreground">Age: {childProgress.age}</p>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                  Level {childProgress.level}
                </span>
                <span className="text-sm bg-accent/10 text-accent px-2 py-1 rounded">
                  {childProgress.points} points
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Period Selector */}
      <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="alltime">All Time</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPeriod} className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{childProgress.weeklyMoodAvg}/5</p>
                <p className="text-sm text-muted-foreground">Avg Mood</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-accent">{childProgress.completionRate}%</p>
                <p className="text-sm text-muted-foreground">Task Rate</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-success">{childProgress.activeDays}</p>
                <p className="text-sm text-muted-foreground">Active Days</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-warning">{childProgress.journalEntries}</p>
                <p className="text-sm text-muted-foreground">Journal Entries</p>
              </CardContent>
            </Card>
          </div>

          {/* Mood Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Mood Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {childProgress.recentMoods.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {childProgress.recentMoods.map((entry, index) => (
                      <div key={index} className="text-center p-3 rounded-lg bg-muted/50 min-w-[60px]">
                        <span className="text-2xl block mb-1">
                          {getMoodEmoji(entry.mood)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.date).getDate()}/{new Date(entry.date).getMonth() + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>📈 Average mood for this period: <strong>{childProgress.weeklyMoodAvg}/5</strong></p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No mood data available for this period
                </p>
              )}
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Daily engagement</span>
                  <span className="font-medium">
                    {childProgress.activeDays} of {selectedPeriod === "weekly" ? 7 : selectedPeriod === "monthly" ? 30 : 365} days
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Task completion rate</span>
                  <span className="font-medium">{childProgress.completionRate}%</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Journal entries</span>
                  <span className="font-medium">{childProgress.journalEntries}</span>
                </div>
                
                {selectedPeriod === "alltime" && (
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                    <span className="text-sm text-primary">Current level</span>
                    <span className="font-medium text-primary">Level {childProgress.level}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
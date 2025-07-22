import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Target, Activity, TrendingUp } from "lucide-react";
import DailyActivityPieChart from "./DailyActivityPieChart";

interface PersonalStats {
  weeklyMoodAvg: number;
  daysActive: number;
  taskCompletions: { [taskName: string]: number };
  totalDays: number;
}

interface TaskCompletion {
  taskName: string;
  completedDays: number;
}

export default function PersonalStats() {
  const [stats, setStats] = useState<PersonalStats>({
    weeklyMoodAvg: 0,
    daysActive: 0,
    taskCompletions: {},
    totalDays: 0
  });
  const [loading, setLoading] = useState(true);
  const [taskStats, setTaskStats] = useState<TaskCompletion[]>([]);

  useEffect(() => {
    loadPersonalStats();
  }, []);

  const loadPersonalStats = async () => {
    console.log('[ProgressStats] Loading personalized metrics...');
    setLoading(true);

    try {
      // Get current user's child ID
      const { data: childIdResult, error: childIdError } = await supabase
        .rpc('get_current_user_child_id');
        
      if (childIdError) {
        console.error('[ProgressStats] Error getting child ID:', childIdError);
        setLoading(false);
        return;
      }

      if (!childIdResult) {
        console.log('[ProgressStats] No child found for current user');
        setLoading(false);
        return;
      }

      const childId = childIdResult;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

      // 1. Load Average Daily Mood (Weekly)
      console.log('[ProgressStats] Loading weekly mood average...');
      const { data: moodEntries, error: moodError } = await supabase
        .from('progress_entries')
        .select('entry_value, entry_date')
        .eq('child_id', childId)
        .eq('entry_type', 'mood')
        .gte('entry_date', sevenDaysAgoStr)
        .order('entry_date', { ascending: false });

      if (moodError) {
        console.error('[ProgressStats] Error fetching mood entries:', moodError);
      }

      let weeklyMoodAvg = 0;
      if (moodEntries && moodEntries.length > 0) {
        // Get unique dates (latest mood per day)
        const uniqueDailyMoods = moodEntries.reduce((acc, entry) => {
          const date = entry.entry_date;
          if (!acc[date]) {
            acc[date] = entry.entry_value as number;
          }
          return acc;
        }, {} as Record<string, number>);

        const moodValues = Object.values(uniqueDailyMoods);
        weeklyMoodAvg = moodValues.reduce((sum, val) => sum + val, 0) / moodValues.length;
        console.log('[ProgressStats] Weekly mood average calculated:', weeklyMoodAvg);
      }

      // 2. Load Days Active in the App
      console.log('[ProgressStats] Loading active days count...');
      const { data: actionLogs, error: logsError } = await supabase
        .from('user_action_logs')
        .select('created_at')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (logsError) {
        console.error('[ProgressStats] Error fetching action logs:', logsError);
      }

      let daysActive = 0;
      if (actionLogs && actionLogs.length > 0) {
        // Count unique dates
        const uniqueDates = new Set(
          actionLogs.map(log => new Date(log.created_at).toDateString())
        );
        daysActive = uniqueDates.size;
        console.log('[ProgressStats] Days active calculated:', daysActive);
      }

      // Calculate total days since joining (approximation based on first action log)
      let totalDays = 1;
      if (actionLogs && actionLogs.length > 0) {
        const firstLogDate = new Date(actionLogs[actionLogs.length - 1].created_at);
        const daysSinceJoining = Math.ceil((Date.now() - firstLogDate.getTime()) / (1000 * 60 * 60 * 24));
        totalDays = Math.max(1, daysSinceJoining);
      }

      // 3. Load Daily Task Completions
      console.log('[ProgressStats] Loading task completions...');
      
      // Get all task completion entries from the past 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
      
      // Get all task entries
      const { data: taskEntries, error: taskError } = await supabase
        .from('progress_entries')
        .select('entry_value, entry_date')
        .eq('child_id', childId)
        .eq('entry_type', 'task')
        .gte('entry_date', thirtyDaysAgoStr);

      if (taskError) {
        console.error('[ProgressStats] Error fetching task entries:', taskError);
      }

      // Process task entries from Supabase
      const taskCompletions: { [taskName: string]: number } = {};
      const taskStats: TaskCompletion[] = [];
      
      // First get all task definitions to map IDs to names
      const { data: taskDefinitions, error: taskDefError } = await supabase
        .from('daily_tasks')
        .select('id, label')
        .eq('active', true);
        
      if (taskDefError) {
        console.error('[ProgressStats] Error fetching task definitions:', taskDefError);
      }
      
      // Create a mapping from task ID to task name
      const taskIdToName: Record<string, string> = {};
      if (taskDefinitions && taskDefinitions.length > 0) {
        taskDefinitions.forEach(task => {
          taskIdToName[task.id] = task.label;
        });
      }
      
      // Process task entries from Supabase
      if (taskEntries && taskEntries.length > 0) {
        taskEntries.forEach(entry => {
          if (entry.entry_value && 
              typeof entry.entry_value === 'object' &&
              'task_id' in entry.entry_value &&
              'completed' in entry.entry_value &&
              entry.entry_value.completed === true) {
              
            const taskId = entry.entry_value.task_id as string;
            const taskName = taskIdToName[taskId] || `Task ${taskId.substring(0, 4)}`;
            
            taskCompletions[taskName] = (taskCompletions[taskName] || 0) + 1;
          }
        });
        
        // Convert to taskStats format
        Object.keys(taskCompletions).forEach(taskName => {
          taskStats.push({
            taskName,
            completedDays: taskCompletions[taskName]
          });
        });
      }

      console.log('[ProgressStats] Task completions calculated:', taskCompletions);

      setStats({
        weeklyMoodAvg: Number(weeklyMoodAvg.toFixed(1)),
        daysActive,
        taskCompletions,
        totalDays
      });
      
      setTaskStats(taskStats);

    } catch (error) {
      console.error('[ProgressStats] Error loading personal stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 4) return 'text-success';
    if (mood >= 3) return 'text-warning';
    return 'text-destructive';
  };

  const getActivityRate = () => {
    return stats.totalDays > 0 ? Math.round((stats.daysActive / stats.totalDays) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Weekly Mood Average
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center">
              <p className={`text-3xl font-bold ${getMoodColor(stats.weeklyMoodAvg)}`}>
                {stats.weeklyMoodAvg > 0 ? `${stats.weeklyMoodAvg}/5` : 'No data'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Past 7 days
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Days Active
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{stats.daysActive}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Since you joined ({getActivityRate()}% activity rate)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Task Completions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">
                {Object.values(stats.taskCompletions).reduce((sum, count) => sum + count, 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Total tasks completed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Activities Pie Chart */}
      <DailyActivityPieChart />

      {/* Motivational Message */}
      {stats.weeklyMoodAvg > 0 && (
        <Card className="shadow-soft bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-primary mb-1">🌟 Keep Going!</p>
              <p className="text-sm text-foreground/90">
                {stats.weeklyMoodAvg >= 4 
                  ? "You're having an amazing week! Your positive energy is inspiring!"
                  : stats.weeklyMoodAvg >= 3
                  ? "You're doing great! Keep building those positive habits!"
                  : "Every day is a chance to grow. You're stronger than you think!"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
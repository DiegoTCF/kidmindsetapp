import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Target } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface TaskCompletion {
  taskName: string;
  completedDays: number;
  totalDays: number;
  completionRate: number;
}

// Color scheme for different activities
const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))', 
  'hsl(var(--secondary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--info))'
];

export default function DailyActivityPieChart() {
  const [taskData, setTaskData] = useState<TaskCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTaskCompletionData();
  }, []);

  const loadTaskCompletionData = async () => {
    console.log('[DailyActivityPieChart] Loading 7-day task completion data...');
    setLoading(true);

    try {
      // Get current user's child ID
      const { data: childIdResult, error: childIdError } = await supabase
        .rpc('get_current_user_child_id');
        
      if (childIdError) {
        console.error('[DailyActivityPieChart] Error getting child ID:', childIdError);
        setLoading(false);
        return;
      }

      if (!childIdResult) {
        console.log('[DailyActivityPieChart] No child found for current user');
        setLoading(false);
        return;
      }

      const childId = childIdResult;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

      // Load user-specific and default daily tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('daily_tasks')
        .select('label, active')
        .or(`user_id.is.null,user_id.eq.${(await supabase.auth.getUser()).data.user?.id}`)
        .eq('active', true)
        .order('order');

      if (tasksError) {
        console.error('[DailyActivityPieChart] Error fetching tasks:', tasksError);
        setLoading(false);
        return;
      }

      // Load task completion entries for the last 7 days
      const { data: completionEntries, error: completionError } = await supabase
        .from('progress_entries')
        .select('entry_value, entry_date')
        .eq('child_id', childId)
        .eq('entry_type', 'task_completion')
        .gte('entry_date', sevenDaysAgoStr);

      if (completionError) {
        console.error('[DailyActivityPieChart] Error fetching completion entries:', completionError);
      }

      console.log('[DailyActivityPieChart] Tasks:', tasks);
      console.log('[DailyActivityPieChart] Completion entries:', completionEntries);

      // Process completion data
      const completionStats: { [taskName: string]: Set<string> } = {};
      
      // Initialize with available tasks
      if (tasks) {
        tasks.forEach(task => {
          completionStats[task.label] = new Set();
        });
      }

      // Process completion entries from Supabase
      if (completionEntries) {
        completionEntries.forEach(entry => {
          const taskData = entry.entry_value as any;
          if (taskData && typeof taskData === 'object') {
            // If it's an object with task names and completion status
            Object.keys(taskData).forEach(taskName => {
              if (taskData[taskName] === true || taskData[taskName] === 'completed') {
                if (!completionStats[taskName]) {
                  completionStats[taskName] = new Set();
                }
                completionStats[taskName].add(entry.entry_date);
              }
            });
          } else if (typeof taskData === 'string') {
            // If it's a task name string, mark as completed for that date
            if (!completionStats[taskData]) {
              completionStats[taskData] = new Set();
            }
            completionStats[taskData].add(entry.entry_date);
          }
        });
      }

      // Fallback: Also check localStorage for recent data (temporary solution)
      try {
        const today = new Date();
        for (let i = 0; i < 7; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - i);
          const dateStr = checkDate.toDateString();
          
          const savedTasks = localStorage.getItem(`kidmindset_tasks_${dateStr}`);
          if (savedTasks) {
            const tasks = JSON.parse(savedTasks);
            tasks.forEach((task: any) => {
              if (task.completed) {
                if (!completionStats[task.name]) {
                  completionStats[task.name] = new Set();
                }
                completionStats[task.name].add(checkDate.toISOString().split('T')[0]);
              }
            });
          }
        }
      } catch (error) {
        console.error('[DailyActivityPieChart] Error processing localStorage data:', error);
      }

      // Convert to chart data
      const chartData: TaskCompletion[] = Object.keys(completionStats).map(taskName => {
        const completedDays = completionStats[taskName].size;
        const totalDays = 7; // Looking at last 7 days
        const completionRate = Math.round((completedDays / totalDays) * 100);
        
        return {
          taskName,
          completedDays,
          totalDays,
          completionRate
        };
      }).filter(task => task.completionRate > 0); // Only show tasks with some completion

      console.log('[DailyActivityPieChart] Final chart data:', chartData);
      setTaskData(chartData);

    } catch (error) {
      console.error('[DailyActivityPieChart] Error loading task completion data:', error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.taskName}</p>
          <p className="text-sm text-muted-foreground">
            {data.completedDays}/{data.totalDays} days completed
          </p>
          <p className="text-sm font-bold">{data.completionRate}% completion rate</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Daily Activities Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (taskData.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Daily Activities Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Target className="h-8 w-8 mx-auto mb-2 opacity-50 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Start completing daily tasks to see your progress!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5" />
          Daily Activities Progress (Last 7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pie Chart */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={taskData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ taskName, completionRate }) => 
                  `${taskName.split(' ')[0]} ${completionRate}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="completionRate"
                animationBegin={0}
                animationDuration={800}
              >
                {taskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => (
                  <span className="text-sm">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed List */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Activity Details:</h4>
          {taskData.map((task, index) => (
            <div key={task.taskName} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/20">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-medium">{task.taskName}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{task.completionRate}%</p>
                <p className="text-xs text-muted-foreground">
                  {task.completedDays}/7 days
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
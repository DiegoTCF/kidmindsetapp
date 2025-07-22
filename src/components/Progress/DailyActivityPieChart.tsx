import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Target } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface TaskCompletion {
  taskName: string;
  completedDays: number;
  completionRate: number;
}

// Core tasks mapping
const CORE_TASKS = [
  "20x Press Ups",
  "20x Sit Ups or 1 min plank", 
  "Stretch your muscles",
  "Make your bed"
];

// Color scheme for each task
const TASK_COLORS = {
  "20x Press Ups": 'hsl(var(--primary))',
  "20x Sit Ups or 1 min plank": 'hsl(var(--accent))',
  "Stretch your muscles": 'hsl(var(--success))',
  "Make your bed": 'hsl(var(--warning))'
};

export default function DailyActivityPieChart() {
  const [taskData, setTaskData] = useState<TaskCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTaskCompletionData();
  }, []);

  const loadTaskCompletionData = async () => {
    console.log('[DailyActivityPieChart] Loading weekly task completion data for core tasks...');
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

      console.log('[DailyActivityPieChart] Completion entries:', completionEntries);

      // Process completion data for core tasks only
      const completionStats: { [taskName: string]: Set<string> } = {};
      
      // Initialize with core tasks
      CORE_TASKS.forEach(task => {
        completionStats[task] = new Set();
      });

      // Process completion entries from Supabase
      if (completionEntries) {
        completionEntries.forEach(entry => {
          const taskData = entry.entry_value as any;
          if (taskData && typeof taskData === 'object') {
            // If it's an object with task names and completion status
            Object.keys(taskData).forEach(taskName => {
              if ((taskData[taskName] === true || taskData[taskName] === 'completed') && 
                  CORE_TASKS.includes(taskName)) {
                completionStats[taskName].add(entry.entry_date);
              }
            });
          } else if (typeof taskData === 'string' && CORE_TASKS.includes(taskData)) {
            // If it's a task name string, mark as completed for that date
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
              if (task.completed && CORE_TASKS.includes(task.name)) {
                completionStats[task.name].add(checkDate.toISOString().split('T')[0]);
              }
            });
          }
        }
      } catch (error) {
        console.error('[DailyActivityPieChart] Error processing localStorage data:', error);
      }

      // Convert to chart data
      const chartData: TaskCompletion[] = CORE_TASKS.map(taskName => {
        const completedDays = completionStats[taskName].size;
        const completionRate = Math.round((completedDays / 7) * 100);
        
        return {
          taskName,
          completedDays,
          completionRate
        };
      });

      console.log('[DailyActivityPieChart] Final chart data:', chartData);
      setTaskData(chartData);

    } catch (error) {
      console.error('[DailyActivityPieChart] Error loading task completion data:', error);
    } finally {
      setLoading(false);
    }
  };

  const TaskPieChart = ({ task }: { task: TaskCompletion }) => {
    const data = [
      { name: 'Completed', value: task.completionRate },
      { name: 'Remaining', value: 100 - task.completionRate }
    ];

    return (
      <Card className="shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-center">
            {task.taskName}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative h-32 mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={45}
                  startAngle={90}
                  endAngle={450}
                  paddingAngle={2}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  <Cell fill={TASK_COLORS[task.taskName] || 'hsl(var(--primary))'} />
                  <Cell fill="hsl(var(--muted))" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Percentage in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold">{task.completionRate}%</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              {task.completedDays}/7 days this week
            </p>
          </div>
        </CardContent>
      </Card>
    );
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Daily Activities Progress (This Week)</h3>
      </div>
      
      {/* Grid of pie charts - 2x2 on mobile, 4x1 on larger screens */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {taskData.map((task) => (
          <TaskPieChart key={task.taskName} task={task} />
        ))}
      </div>
    </div>
  );
}
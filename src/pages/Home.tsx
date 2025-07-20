import { useState, useEffect } from "react";
import { Plus, Star, Flame, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { TopNavigation } from "@/components/nav/TopNavigation";

interface MoodOption {
  emoji: string;
  label: string;
  value: number;
}

interface DailyTask {
  id: string;
  name: string;
  completed: boolean;
  streak: number;
  isCustom?: boolean;
}

interface PlayerData {
  name: string;
  level: number;
  points: number;
  weeklyMoodAvg: number;
}

const moodOptions: MoodOption[] = [
  { emoji: "😢", label: "Sad", value: 1 },
  { emoji: "😕", label: "Not Great", value: 2 },
  { emoji: "😐", label: "Okay", value: 3 },
  { emoji: "😊", label: "Good", value: 4 },
  { emoji: "😁", label: "Amazing", value: 5 },
];

const defaultTasks: DailyTask[] = [
  { id: "pushups", name: "Press ups", completed: false, streak: 0 },
  { id: "situps", name: "Sit ups", completed: false, streak: 0 },
  { id: "makebed", name: "Make Bed", completed: false, streak: 0 },
];

export default function Home() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Player state
  const [playerData, setPlayerData] = useState<PlayerData>({
    name: "Player", // Default fallback
    level: 1,
    points: 0,
    weeklyMoodAvg: 3.5
  });

  // Mood tracking
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const [moodSubmitted, setMoodSubmitted] = useState(false);

  // Task management
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(defaultTasks);
  const [newTaskName, setNewTaskName] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    console.log('[KidMindset] Loading player data...');
    loadPlayerData();
    loadTodayData();
  }, []);

  const loadPlayerData = async () => {
    try {
      // Load child data from Supabase
      const { data: children } = await supabase
        .from('children')
        .select('id, name, level, points')
        .limit(1);
      
      if (children && children.length > 0) {
        const childData = children[0];
        setPlayerData({
          name: childData.name || "Player",
          level: childData.level || 1,
          points: childData.points || 0,
          weeklyMoodAvg: 3.5 // Could be calculated from mood entries
        });
        console.log('[KidMindset] Child data loaded:', childData);
      } else {
        // Fallback to localStorage for demo purposes
        const saved = localStorage.getItem('kidmindset_player');
        const profileData = localStorage.getItem('kidmindset_profile');
        
        if (saved) {
          const data = JSON.parse(saved);
          const profileName = profileData ? JSON.parse(profileData).name : null;
          
          setPlayerData({
            ...data,
            name: profileName || data.name || "Player"
          });
          console.log('[KidMindset] Player data loaded from localStorage:', data);
        }
      }
    } catch (error) {
      console.error('[KidMindset] Error loading player data:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem('kidmindset_player');
      if (saved) {
        const data = JSON.parse(saved);
        setPlayerData({
          ...data,
          name: data.name || "Player"
        });
      }
    }
  };

  const loadTodayData = () => {
    const today = new Date().toDateString();
    
    // Load mood
    const savedMood = localStorage.getItem(`kidmindset_mood_${today}`);
    if (savedMood) {
      setTodayMood(Number(savedMood));
      setMoodSubmitted(true);
    }

    // Load tasks
    const savedTasks = localStorage.getItem(`kidmindset_tasks_${today}`);
    if (savedTasks) {
      setDailyTasks(JSON.parse(savedTasks));
    }
  };

  const handleMoodSubmit = (moodValue: number) => {
    const today = new Date().toDateString();
    
    setTodayMood(moodValue);
    setMoodSubmitted(true);
    
    // Save mood
    localStorage.setItem(`kidmindset_mood_${today}`, moodValue.toString());
    
    // Award points
    const newPoints = playerData.points + 5;
    const updatedPlayer = { ...playerData, points: newPoints };
    
    if (newPoints >= playerData.level * 100) {
      updatedPlayer.level += 1;
      toast({
        title: "🎉 Level Up!",
        description: `Congratulations! You're now level ${updatedPlayer.level}!`,
      });
    }
    
    setPlayerData(updatedPlayer);
    localStorage.setItem('kidmindset_player', JSON.stringify(updatedPlayer));
    
    console.log('[KidMindset] Mood submitted:', moodValue);
    
    toast({
      title: "Mood recorded! +5 points",
      description: getMoodMessage(moodValue),
    });
  };

  const getMoodMessage = (mood: number): string => {
    if (mood >= 4) return "You're doing great! Keep that positive energy!";
    if (mood === 3) return "That's okay! Every day is a new opportunity!";
    return "Remember, it's okay to have tough days. You're still amazing!";
  };

  const handleTaskComplete = (taskId: string) => {
    const today = new Date().toDateString();
    
    const updatedTasks = dailyTasks.map(task => {
      if (task.id === taskId && !task.completed) {
        return { ...task, completed: true, streak: task.streak + 1 };
      }
      return task;
    });
    
    setDailyTasks(updatedTasks);
    localStorage.setItem(`kidmindset_tasks_${today}`, JSON.stringify(updatedTasks));
    
    // Award points
    const newPoints = playerData.points + 10;
    const updatedPlayer = { ...playerData, points: newPoints };
    
    if (newPoints >= playerData.level * 100) {
      updatedPlayer.level += 1;
      toast({
        title: "🎉 Level Up!",
        description: `Congratulations! You're now level ${updatedPlayer.level}!`,
      });
    }
    
    setPlayerData(updatedPlayer);
    localStorage.setItem('kidmindset_player', JSON.stringify(updatedPlayer));
    
    console.log('[KidMindset] Task completed:', taskId);
    
    toast({
      title: "Task completed! +10 points",
      description: "Great job staying consistent!",
    });
  };

  const handleAddCustomTask = () => {
    if (!newTaskName.trim()) return;
    
    const newTask: DailyTask = {
      id: `custom_${Date.now()}`,
      name: newTaskName.trim(),
      completed: false,
      streak: 0,
      isCustom: true
    };
    
    const updatedTasks = [...dailyTasks, newTask];
    setDailyTasks(updatedTasks);
    
    const today = new Date().toDateString();
    localStorage.setItem(`kidmindset_tasks_${today}`, JSON.stringify(updatedTasks));
    
    setNewTaskName("");
    setShowAddTask(false);
    
    console.log('[KidMindset] Custom task added:', newTask.name);
    
    toast({
      title: "Task added!",
      description: "Your custom task has been added to today's list.",
    });
  };


  const getProgressToNextLevel = () => {
    const pointsForCurrentLevel = (playerData.level - 1) * 100;
    const pointsForNextLevel = playerData.level * 100;
    const currentProgress = playerData.points - pointsForCurrentLevel;
    const totalNeeded = pointsForNextLevel - pointsForCurrentLevel;
    
    return (currentProgress / totalNeeded) * 100;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Top Navigation */}
      <TopNavigation />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {playerData.name}! 🧠
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 px-3 py-1 bg-level-bg rounded-full">
                <Star className="w-4 h-4 text-level-foreground" />
                <span className="text-sm font-semibold text-level-foreground">
                  Level {playerData.level}
                </span>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  {playerData.points} pts
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-3 mb-2">
          <div 
            className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${getProgressToNextLevel()}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {100 - Math.floor(getProgressToNextLevel())}% to level {playerData.level + 1}
        </p>
      </div>

      {/* Mood Check */}
      <Card className="mb-6 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            How are you feeling today? 💙
          </CardTitle>
          {playerData.weeklyMoodAvg && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Weekly average:</span>
              <span className="font-semibold text-primary">
                {playerData.weeklyMoodAvg.toFixed(1)}/5
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {!moodSubmitted ? (
            <div className="grid grid-cols-5 gap-2">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => handleMoodSubmit(mood.value)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-transparent
                           hover:border-primary/30 hover:bg-primary/5 transition-all duration-200
                           active:scale-95 touch-manipulation"
                >
                  <span className="text-3xl font-bold text-primary filter drop-shadow-sm" role="img" aria-label={mood.label}>
                    {mood.emoji}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {mood.label}
                  </span>
                  <span className="text-xs font-bold text-primary">
                    {mood.value}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <span className="text-3xl mb-2 block">
                {moodOptions.find(m => m.value === todayMood)?.emoji}
              </span>
              <p className="text-sm text-muted-foreground">
                Mood recorded for today! Come back tomorrow to check in again.
              </p>
              {playerData.weeklyMoodAvg && (
                <p className="text-xs text-muted-foreground mt-2">
                  Weekly average: {playerData.weeklyMoodAvg.toFixed(1)}/5
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Tasks */}
      <Card className="mb-6 shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Daily Tasks
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddTask(true)}
              className="flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Add Custom Task */}
          {showAddTask && (
            <div className="flex gap-2 p-3 bg-muted/50 rounded-lg">
              <Input
                placeholder="Enter custom task..."
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTask()}
                className="flex-1"
              />
              <Button onClick={handleAddCustomTask} size="sm">
                Add
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddTask(false)}
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Task List */}
          {dailyTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200",
                task.completed 
                  ? "bg-success/10 border-success/30" 
                  : "bg-card border-border hover:border-primary/30"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  task.completed ? "bg-success" : "bg-muted-foreground"
                )} />
                <div>
                  <p className={cn(
                    "font-medium",
                    task.completed && "line-through text-muted-foreground"
                  )}>
                    {task.name}
                  </p>
                  {task.streak > 0 && (
                    <p className="text-xs text-orange-500 flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {task.streak} day streak
                    </p>
                  )}
                </div>
              </div>

              {!task.completed && (
                <Button
                  onClick={() => handleTaskComplete(task.id)}
                  size="sm"
                  className="shadow-sm"
                >
                  Complete
                </Button>
              )}
            </div>
          ))}

          {dailyTasks.every(task => task.completed) && dailyTasks.length > 0 && (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">🎉</div>
              <p className="font-semibold text-success">All tasks completed!</p>
              <p className="text-sm text-muted-foreground">
                Amazing work today, champion!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
import { useState, useEffect } from "react";
import { Plus, Star, Trophy, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { TopNavigation } from "@/components/nav/TopNavigation";
import { CustomIcon } from "@/components/ui/custom-emoji";

interface MoodOption {
  iconType: 'sad' | 'not-great' | 'okay' | 'good' | 'amazing';
  label: string;
  value: number;
}

interface DailyTask {
  id: string;
  name: string;
  completed: boolean;
  notDone?: boolean; // Track explicit "not done" state
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
  { iconType: "sad", label: "Sad", value: 1 },
  { iconType: "not-great", label: "Not Great", value: 2 },
  { iconType: "okay", label: "Okay", value: 3 },
  { iconType: "good", label: "Good", value: 4 },
  { iconType: "amazing", label: "Amazing", value: 5 },
];

// Default tasks as fallback
const defaultTasks: DailyTask[] = [
  { id: "pushups", name: "20x Press Ups", completed: false, streak: 0 },
  { id: "situps", name: "20x Sit Ups or 1 min plank", completed: false, streak: 0 },
  { id: "makebed", name: "Make your bed", completed: false, streak: 0 },
  { id: "stretches", name: "Stretch your muscles", completed: false, streak: 0 },
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
  const [showMoodReview, setShowMoodReview] = useState(false);

  // Task management
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(defaultTasks);
  const [newTaskName, setNewTaskName] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    console.log('[KidMindset] Loading player data...');
    loadPlayerData();
    loadDailyTasks();
    loadTodayData();
    loadWeeklyMoodAverage();
  }, []);

  const loadPlayerData = async () => {
    try {
      console.log('[Admin Child Fetch] Getting current user child data...');
      
      // Use the new comprehensive function that gets all child data including weekly mood
      const { data: childDataResult, error: childDataError } = await supabase
        .rpc('get_current_user_child_data');
      
      if (childDataError) {
        console.error('[Admin Child Fetch] Error getting child data:', childDataError);
        throw childDataError;
      }
      
      if (!childDataResult || childDataResult.length === 0) {
        console.log('[Admin Child Fetch] No child found for current user');
        // Fallback to localStorage
        const saved = localStorage.getItem('kidmindset_player');
        const profileData = localStorage.getItem('kidmindset_profile');
        
        if (saved) {
          const data = JSON.parse(saved);
          const profileName = profileData ? JSON.parse(profileData).name : null;
          
          setPlayerData({
            ...data,
            name: profileName || data.name || "Player"
          });
          console.log('[Admin Child Fetch] Player data loaded from localStorage:', data);
        }
        return;
      }
      
      const childData = childDataResult[0]; // Get first (and only) result
      // Child data loaded successfully
      
      // Update player data with fresh Supabase data
      const updatedPlayer = {
        name: childData.child_name || "Player",
        level: childData.child_level || 1,
        points: childData.child_points || 0,
        weeklyMoodAvg: Number(childData.weekly_mood_avg) || 3.5
      };
      
      setPlayerData(updatedPlayer);
      
      // Also save to localStorage for offline use
      localStorage.setItem('kidmindset_player', JSON.stringify(updatedPlayer));
      
    } catch (error) {
      console.error('[Admin Child Fetch] Error loading player data:', error);
      
      // Fallback to localStorage on error
      const saved = localStorage.getItem('kidmindset_player');
      if (saved) {
        const data = JSON.parse(saved);
        setPlayerData({
          ...data,
          name: data.name || "Player",
          level: data.level || 1,
          points: data.points || 0,
          weeklyMoodAvg: data.weeklyMoodAvg || 3.5
        });
        console.log('[Admin Child Fetch] Fallback to localStorage data');
      }
    }
  };

  const loadDailyTasks = async () => {
    try {
      console.log('[KidMindset] Loading daily tasks from Supabase...');
      
      // Get current user's child ID
      const { data: childIdResult, error: childIdError } = await supabase
        .rpc('get_current_user_child_id');
      
      if (childIdError) {
        console.error('[KidMindset] Error getting child ID for loading tasks:', childIdError);
      }
      
      // Fetch global tasks from daily_tasks table
      const { data: tasksData, error: tasksError } = await supabase
        .from('daily_tasks')
        .select('id, label, "order"')
        .eq('active', true)
        .is('user_id', null) // Global tasks (not user-specific)
        .order('"order"', { ascending: true });
      
      if (tasksError) {
        console.error('[KidMindset] Error loading tasks from Supabase:', tasksError);
        console.log('[KidMindset] Using default tasks as fallback');
        return;
      }
      
      // Fetch user-specific task overrides
      const { data: userTasks, error: userTasksError } = await supabase
        .from('daily_tasks')
        .select('id, label, "order"')
        .eq('active', true)
        .eq('user_id', user?.id) // User-specific tasks
        .order('"order"', { ascending: true });
      
      if (userTasksError) {
        console.error('[KidMindset] Error fetching user daily tasks:', userTasksError);
      }
      
      let tasksToUse: DailyTask[] = defaultTasks; // Fallback to defaults
      
      if (tasksData && tasksData.length > 0) {
        console.log('[KidMindset] Tasks loaded from Supabase:', tasksData);
        
        // Convert Supabase tasks to DailyTask format
        tasksToUse = tasksData.map(task => ({
          id: task.id,
          name: task.label,
          completed: false,
          streak: 0
        }));
        
        // Add user-specific tasks
        if (userTasks && userTasks.length > 0) {
          userTasks.forEach(userTask => {
            tasksToUse.push({
              id: userTask.id,
              name: userTask.label,
              completed: false,
              streak: 0,
              isCustom: true
            });
          });
        }
        
        console.log('[KidMindset] Using tasks from Supabase');
      } else {
        console.log('[KidMindset] No tasks found in Supabase, using defaults');
      }
      
      const today = new Date().toDateString();
      
      // Now fetch completed tasks for today from progress_entries
      if (childIdResult) {
        const todayDate = new Date().toISOString().split('T')[0];
        
        const { data: completedTasks, error: completedTasksError } = await supabase
          .from('progress_entries')
          .select('entry_value')
          .eq('child_id', childIdResult)
          .eq('entry_type', 'task')
          .eq('entry_date', todayDate);
        
        if (completedTasksError) {
          console.error('[KidMindset] Error fetching completed tasks:', completedTasksError);
        }
        
        if (completedTasks && completedTasks.length > 0) {
          // Mark tasks as completed based on Supabase data
          tasksToUse = tasksToUse.map(task => {
            // Check if this task is marked as completed in any entry
            const taskStatus = completedTasks.find(entry => 
              entry.entry_value && 
              typeof entry.entry_value === 'object' &&
              'task_id' in entry.entry_value &&
              entry.entry_value.task_id === task.id
            );
            
            if (taskStatus && taskStatus.entry_value && 
                typeof taskStatus.entry_value === 'object' &&
                'completed' in taskStatus.entry_value) {
              task.completed = taskStatus.entry_value.completed === true;
              task.notDone = taskStatus.entry_value.completed === false;
            }
            
            return task;
          });
        }
      }

      // Now check if there's saved completion state for today in localStorage as backup
      const savedTasks = localStorage.getItem(`kidmindset_tasks_${today}`);
      
      if (savedTasks) {
        console.log('[KidMindset] Found saved task states for today, merging...');
        const savedTasksData: DailyTask[] = JSON.parse(savedTasks);
        
        // Merge saved completion states with current task definitions
        const mergedTasks = tasksToUse.map(task => {
          const savedTask = savedTasksData.find(saved => saved.id === task.id);
          if (savedTask) {
            // Keep the completion state and streak from saved data
            return {
              ...task,
              completed: task.completed || savedTask.completed, // Prioritize Supabase data
              notDone: task.notDone || savedTask.notDone,      // Prioritize Supabase data
              streak: savedTask.streak
            };
          }
          return task;
        });
        
        setDailyTasks(mergedTasks);
        console.log('[KidMindset] Daily tasks updated with saved completion states');
        
        // Update localStorage with merged data
        localStorage.setItem(`kidmindset_tasks_${today}`, JSON.stringify(mergedTasks));
      } else {
        console.log('[KidMindset] No saved task states for today, using fresh tasks');
        setDailyTasks(tasksToUse);
        
        // Initialize localStorage for today
        localStorage.setItem(`kidmindset_tasks_${today}`, JSON.stringify(tasksToUse));
      }
    } catch (error) {
      console.error('[KidMindset] Error fetching daily tasks:', error);
      console.log('[KidMindset] Using default tasks as fallback');
      
      // Still try to load saved states for defaults
      const today = new Date().toDateString();
      const savedTasks = localStorage.getItem(`kidmindset_tasks_${today}`);
      if (savedTasks) {
        setDailyTasks(JSON.parse(savedTasks));
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

    // Tasks are now loaded in loadDailyTasks() to properly merge with Supabase data
    // This prevents overriding completion states
  };

  const loadWeeklyMoodAverage = async () => {
    try {
      console.log('[KidMindset] Getting child ID for mood average...');
      
      // Use the new RLS-safe function to get child ID
      const { data: childIdResult, error: childIdError } = await supabase
        .rpc('get_current_user_child_id');
      
      if (childIdError) {
        console.error('[KidMindset] Error getting child ID for mood average:', childIdError);
        return;
      }
      
      if (!childIdResult) {
        console.log('[KidMindset] No child found for weekly mood average');
        return;
      }
      
      const childId = childIdResult;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      console.log('[KidMindset] Loading mood entries for child:', childId, 'since:', sevenDaysAgo.toISOString().split('T')[0]);
      
      const { data: moodEntries, error: moodError } = await supabase
        .from('progress_entries')
        .select('entry_value, entry_date')
        .eq('child_id', childId)
        .eq('entry_type', 'mood')
        .gte('entry_date', sevenDaysAgo.toISOString().split('T')[0])
        .order('entry_date', { ascending: false });
      
      if (moodError) {
        console.error('[KidMindset] Error fetching mood entries:', moodError);
        return;
      }
      
      console.log('[KidMindset] Raw mood entries:', moodEntries);
      
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
        const average = moodValues.reduce((sum, val) => sum + val, 0) / moodValues.length;
        
        console.log('[KidMindset] Unique daily moods:', uniqueDailyMoods);
        console.log('[KidMindset] Mood values for average:', moodValues);
        
        setPlayerData(prev => ({
          ...prev,
          weeklyMoodAvg: average
        }));
        
        console.log('[MoodAverage]', average);
        console.log('[KidMindset] Weekly mood average calculated:', average);
      } else {
        console.log('[KidMindset] No mood entries found for weekly average');
      }
    } catch (error) {
      console.error('[KidMindset] Error loading weekly mood average:', error);
    }
  };

  const handleMoodSubmit = async (moodValue: number) => {
    setMoodSubmitted(true);
    setTodayMood(moodValue);
    const today = new Date().toDateString();
    localStorage.setItem(`kidmindset_mood_${today}`, JSON.stringify({ 
      mood: moodValue,
      submitted: true 
    }));
    
    // Save mood to Supabase
    try {
      console.log('[KidMindset] Saving mood to Supabase...');
      
      // Use RLS-safe function to get child ID
      const { data: childIdResult, error: childIdError } = await supabase
        .rpc('get_current_user_child_id');
      
      if (childIdError) {
        console.error('[KidMindset] Error getting child ID for mood save:', childIdError);
        throw childIdError;
      }
      
      if (!childIdResult) {
        console.error('[KidMindset] No child found for current user');
        throw new Error('No child found for current user');
      }
      
      const childId = childIdResult;
      const todayDate = new Date().toISOString().split('T')[0];
      
      console.log('[KidMindset] Saving mood for child:', childId, 'value:', moodValue, 'date:', todayDate);
      
      const { data: insertData, error: insertError } = await supabase
        .from('progress_entries')
        .insert({
          child_id: childId,
          entry_type: 'mood',
          entry_value: moodValue,
          entry_date: todayDate,
          points_earned: 5
        })
        .select();
      
      if (insertError) {
        console.error('[KidMindset] Error saving mood to database:', insertError);
        throw insertError;
      }
      
      console.log('[KidMindset] Mood saved successfully:', insertData);
      
      // Points and level are now automatically updated in Supabase via trigger
      // Reload fresh data from Supabase
      setTimeout(() => {
        loadPlayerData(); // This will get the updated points and level from Supabase
      }, 1000);
    } catch (error) {
      console.error('[KidMindset] Error saving mood to database:', error);
      toast({
        title: "Error saving mood",
        description: "There was a problem saving your mood. Please try again.",
      });
      return;
    }
    
    // Show immediate feedback while Supabase syncs
    toast({
      title: "Mood recorded! +5 points",
      description: getMoodMessage(moodValue),
    });
    
    console.log('[KidMindset] Mood submitted:', moodValue);
  };

  const handleMoodChange = async (moodValue: number) => {
    console.log('[MoodChange]', moodValue);
    const today = new Date().toDateString();
    
    setTodayMood(moodValue);
    setShowMoodReview(false);
    
    // Update saved mood locally
    localStorage.setItem(`kidmindset_mood_${today}`, moodValue.toString());
    
    // Update mood in Supabase
    try {
      console.log('[KidMindset] Getting child ID for mood update...');
      
      // Use the new RLS-safe function to get child ID
      const { data: childIdResult, error: childIdError } = await supabase
        .rpc('get_current_user_child_id');
      
      if (childIdError) {
        console.error('[KidMindset] Error getting child ID for mood update:', childIdError);
        throw childIdError;
      }
      
      if (!childIdResult) {
        console.error('[KidMindset] No child found for mood update');
        toast({
          title: "Setup required",
          description: "Please complete your profile setup first.",
        });
        return;
      }
      
      const childId = childIdResult;
      const todayDate = new Date().toISOString().split('T')[0];
      
      console.log('[KidMindset] Updating mood for child:', childId, 'value:', moodValue, 'date:', todayDate);
      
      // Check if mood entry exists for today (get the latest one)
      const { data: existingEntries, error: fetchError } = await supabase
        .from('progress_entries')
        .select('id')
        .eq('child_id', childId)
        .eq('entry_type', 'mood')
        .eq('entry_date', todayDate)
        .order('created_at', { ascending: false })
        .limit(1);
      
      const existingEntry = existingEntries && existingEntries.length > 0 ? existingEntries[0] : null;
      
      if (fetchError) {
        console.error('[KidMindset] Error checking existing mood entry:', fetchError);
        throw fetchError;
      }
      
      if (existingEntry) {
        // Update existing entry
        const { data: updateData, error: updateError } = await supabase
          .from('progress_entries')
          .update({ entry_value: moodValue })
          .eq('id', existingEntry.id)
          .select();
        
        if (updateError) {
          console.error('[KidMindset] Error updating mood entry:', updateError);
          throw updateError;
        }
        
        console.log('[KidMindset] Updated existing mood entry:', updateData);
      } else {
        // Create new entry
        const { data: insertData, error: insertError } = await supabase
          .from('progress_entries')
          .insert({
            child_id: childId,
            entry_type: 'mood',
            entry_value: moodValue,
            entry_date: todayDate,
            points_earned: 0 // No additional points for mood changes
          })
          .select();
        
        if (insertError) {
          console.error('[KidMindset] Error creating new mood entry:', insertError);
          throw insertError;
        }
        
        console.log('[KidMindset] Created new mood entry:', insertData);
      }
      
      // Force reload weekly average after a delay
      setTimeout(() => {
        console.log('[KidMindset] Reloading weekly mood average...');
        loadWeeklyMoodAverage();
      }, 1000);
    } catch (error) {
      console.error('[KidMindset] Error updating mood in database:', error);
      toast({
        title: "Error updating mood",
        description: "There was a problem updating your mood. Please try again.",
      });
      return;
    }
    
    console.log('[KidMindset] Mood changed to:', moodValue);
    
    toast({
      title: "Mood updated!",
      description: getMoodMessage(moodValue),
    });
  };

  const getMoodMessage = (mood: number): string => {
    if (mood >= 4) return "You're doing great! Keep that positive energy!";
    if (mood === 3) return "That's okay! Every day is a new opportunity!";
    return "Remember, it's okay to have tough days. You're still amazing!";
  };

  const handleTaskComplete = async (taskId: string) => {
    const today = new Date().toDateString();
    
    const updatedTasks = dailyTasks.map(task => {
      if (task.id === taskId) {
        // Save task completion to Supabase (points will be automatically synced via trigger)
        saveTaskToSupabase(taskId, true);
        
        toast({
          title: "Task completed! +25 points",
          description: "Great job staying consistent!",
        });
        
        return { ...task, completed: true, notDone: false, streak: task.streak + 1 };
      }
      return task;
    });
    
    setDailyTasks(updatedTasks);
    localStorage.setItem(`kidmindset_tasks_${today}`, JSON.stringify(updatedTasks));
    
    // Reload player data to get updated points and level from Supabase
    setTimeout(() => {
      loadPlayerData();
    }, 1000);
    
    console.log('[KidMindset] Task completed:', taskId);
  };

  const handleTaskNotDone = async (taskId: string) => {
    const today = new Date().toDateString();
    
    const updatedTasks = dailyTasks.map(task => {
      if (task.id === taskId) {
        // Save task as not done to Supabase
        saveTaskToSupabase(taskId, false);
        
        return { ...task, completed: false, notDone: true };
      }
      return task;
    });
    
    setDailyTasks(updatedTasks);
    localStorage.setItem(`kidmindset_tasks_${today}`, JSON.stringify(updatedTasks));
    
    console.log('[KidMindset] Task marked as not done:', taskId);
    
    toast({
      title: "Task marked as not done",
      description: "You can change this later today if needed.",
    });
  };

  const handleTaskReset = async (taskId: string) => {
    const today = new Date().toDateString();
    
    const updatedTasks = dailyTasks.map(task => {
      if (task.id === taskId) {
        if (task.completed) {
          // Delete the task entry from Supabase (points will be automatically recalculated via trigger)
          deleteTaskFromSupabase(taskId);
          
          toast({
            title: "Task reset",
            description: "25 points removed. Make your choice again!",
          });
        }
        
        return { ...task, completed: false, notDone: false, streak: task.completed ? Math.max(0, task.streak - 1) : task.streak };
      }
      return task;
    });
    
    setDailyTasks(updatedTasks);
    localStorage.setItem(`kidmindset_tasks_${today}`, JSON.stringify(updatedTasks));
    
    // Reload player data to get updated points from Supabase
    setTimeout(() => {
      loadPlayerData();
    }, 1000);
    
    console.log('[KidMindset] Task reset:', taskId);
  };

  const saveTaskToSupabase = async (taskId: string, completed: boolean) => {
    try {
      const { data: childIdResult, error: childIdError } = await supabase
        .rpc('get_current_user_child_id');
      
      if (childIdError || !childIdResult) {
        console.error('[KidMindset] Error getting child ID for task save:', childIdError);
        return;
      }
      
      const todayDate = new Date().toISOString().split('T')[0];
      
      // Check if task entry exists for today
      const { data: existingEntry } = await supabase
        .from('progress_entries')
        .select('id')
        .eq('child_id', childIdResult)
        .eq('entry_type', 'task')
        .eq('entry_date', todayDate)
        .filter('entry_value', 'cs', `{"task_id":"${taskId}"}`) // Filter JSON contains
        .maybeSingle();
      
      if (existingEntry) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from('progress_entries')
          .update({ 
            entry_value: { task_id: taskId, completed },
            points_earned: completed ? 25 : 0 // Increased to 25 points per task
          })
          .eq('id', existingEntry.id);
          
        if (updateError) {
          console.error('[KidMindset] Error updating task entry:', updateError);
          return;
        }
      } else {
        // Create new entry
        const { error: insertError } = await supabase
          .from('progress_entries')
          .insert({
            child_id: childIdResult,
            entry_type: 'task',
            entry_value: { task_id: taskId, completed },
            entry_date: todayDate,
            points_earned: completed ? 25 : 0 // Increased to 25 points per task
          });
          
        if (insertError) {
          console.error('[KidMindset] Error creating task entry:', insertError);
          return;
        }
      }
      
      console.log('[KidMindset] Task saved to Supabase:', taskId, completed);
    } catch (error) {
      console.error('[KidMindset] Error saving task to Supabase:', error);
    }
  };

  const deleteTaskFromSupabase = async (taskId: string) => {
    try {
      const { data: childIdResult, error: childIdError } = await supabase
        .rpc('get_current_user_child_id');
      
      if (childIdError || !childIdResult) {
        console.error('[KidMindset] Error getting child ID for task delete:', childIdError);
        return;
      }
      
      const todayDate = new Date().toISOString().split('T')[0];
      
      // Delete task entry for today
      const { error: deleteError } = await supabase
        .from('progress_entries')
        .delete()
        .eq('child_id', childIdResult)
        .eq('entry_type', 'task')
        .eq('entry_date', todayDate)
        .filter('entry_value', 'cs', `{"task_id":"${taskId}"}`) // Filter JSON contains
      
      if (deleteError) {
        console.error('[KidMindset] Error deleting task from Supabase:', deleteError);
        return;
      }
      
      console.log('[KidMindset] Task deleted from Supabase:', taskId);
    } catch (error) {
      console.error('[KidMindset] Error deleting task from Supabase:', error);
    }
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
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-sm mx-auto p-4">
        {/* Top Navigation */}
        <TopNavigation />

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                Welcome back, {playerData.name}! 
                <CustomIcon type="brain" size="md" />
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
          <div className="w-full max-w-full bg-muted rounded-full h-3 mb-2 overflow-hidden">
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
              How are you feeling today?
              <CustomIcon type="good" size="sm" />
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
            {!moodSubmitted || showMoodReview ? (
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-2">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => showMoodReview ? handleMoodChange(mood.value) : handleMoodSubmit(mood.value)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200",
                        "active:scale-95 touch-manipulation",
                        showMoodReview && todayMood === mood.value
                          ? "border-primary bg-primary/10"
                          : "border-transparent hover:border-primary/30 hover:bg-primary/5"
                      )}
                    >
                      <CustomIcon type={mood.iconType} size="lg" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {mood.label}
                      </span>
                      <span className="text-xs font-bold text-primary">
                        {mood.value}
                      </span>
                    </button>
                  ))}
                </div>
                {showMoodReview && (
                  <div className="flex justify-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowMoodReview(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="flex justify-center">
                  <CustomIcon 
                    type={moodOptions.find(m => m.value === todayMood)?.iconType || 'okay'} 
                    size="xl" 
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Mood recorded for today! Come back tomorrow to check in again.
                  </p>
                  {playerData.weeklyMoodAvg && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Weekly average: {playerData.weeklyMoodAvg.toFixed(1)}/5
                    </p>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowMoodReview(true)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  Change mood
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Tasks */}
        <Card className="mb-6 shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <CustomIcon type="target" size="md" />
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
                      <p className="text-xs flex items-center gap-1" style={{ color: '#ff0066' }}>
                        <CustomIcon type="flame" size="sm" />
                        {task.streak} day streak
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!task.completed && !task.notDone ? (
                    // Show both options when no selection made
                    <>
                      <Button
                        onClick={() => handleTaskComplete(task.id)}
                        size="sm"
                        variant="default"
                        className="w-8 h-8 p-0 bg-success hover:bg-success/80 text-white"
                        title="Mark as done"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleTaskNotDone(task.id)}
                        size="sm"
                        variant="outline"
                        className="w-8 h-8 p-0 hover:border-destructive/50 hover:text-destructive"
                        title="Mark as not done"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : task.completed ? (
                    // Show done state with ability to change
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-sm text-success">
                        <Check className="w-4 h-4" />
                        <span>Done</span>
                      </div>
                      <Button
                        onClick={() => handleTaskReset(task.id)}
                        size="sm"
                        variant="ghost"
                        className="w-6 h-6 p-0 text-xs text-muted-foreground hover:text-foreground"
                        title="Change selection"
                      >
                        ↻
                      </Button>
                    </div>
                  ) : task.notDone ? (
                    // Show not done state with ability to change
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-sm text-destructive">
                        <X className="w-4 h-4" />
                        <span>Not done</span>
                      </div>
                      <Button
                        onClick={() => handleTaskReset(task.id)}
                        size="sm"
                        variant="ghost"
                        className="w-6 h-6 p-0 text-xs text-muted-foreground hover:text-foreground"
                        title="Change selection"
                      >
                        ↻
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {dailyTasks.every(task => task.completed) && dailyTasks.length > 0 && (
              <div className="text-center py-4">
                <div className="flex justify-center mb-2">
                  <CustomIcon type="party" size="xl" />
                </div>
                <p className="font-semibold text-success">All tasks completed!</p>
                <p className="text-sm text-muted-foreground">
                  Amazing work today, champion!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
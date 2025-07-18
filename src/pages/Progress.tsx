import { useState, useEffect } from "react";
import { Calendar, TrendingUp, Target, Trophy, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MoodEntry {
  date: string;
  mood: number;
  type: 'daily' | 'post-game';
}

interface TaskStreak {
  taskName: string;
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
}

interface JournalEntry {
  id: string;
  date: string;
  type: 'post-game' | 'daily';
  content: {
    wentWell?: string;
    couldImprove?: string;
    whatAffected?: string;
    reflection?: string;
  };
}

interface PlayerStats {
  totalPoints: number;
  currentLevel: number;
  activeDays: number;
  completionRate: number;
}

export default function Progress() {
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [taskStreaks, setTaskStreaks] = useState<TaskStreak[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    totalPoints: 0,
    currentLevel: 1,
    activeDays: 0,
    completionRate: 0
  });

  useEffect(() => {
    console.log('[KidMindset] Progress page loaded');
    loadProgressData();
  }, []);

  const loadProgressData = () => {
    // Load mood data from localStorage
    const moodEntries: MoodEntry[] = [];
    const journalData: JournalEntry[] = [];
    
    // Get last 30 days of data
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      // Load daily mood
      const dailyMood = localStorage.getItem(`kidmindset_mood_${dateStr}`);
      if (dailyMood) {
        moodEntries.push({
          date: dateStr,
          mood: Number(dailyMood),
          type: 'daily'
        });
      }
      
      // Load post-game data
      const postGameData = localStorage.getItem(`kidmindset_postgame_${dateStr}`);
      if (postGameData) {
        const data = JSON.parse(postGameData);
        if (data.mood) {
          moodEntries.push({
            date: dateStr,
            mood: data.mood,
            type: 'post-game'
          });
        }
        
        // Add journal entry if exists
        if (data.journalPrompts && Object.values(data.journalPrompts).some((v: any) => v.trim())) {
          journalData.push({
            id: `postgame_${dateStr}`,
            date: dateStr,
            type: 'post-game',
            content: data.journalPrompts
          });
        }
      }
    }
    
    setMoodData(moodEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setJournalEntries(journalData);
    
    // Load player data
    const playerData = localStorage.getItem('kidmindset_player');
    if (playerData) {
      const data = JSON.parse(playerData);
      setPlayerStats({
        totalPoints: data.points || 0,
        currentLevel: data.level || 1,
        activeDays: moodEntries.length,
        completionRate: calculateCompletionRate()
      });
    }
    
    // Calculate task streaks
    calculateTaskStreaks();
  };

  const calculateCompletionRate = (): number => {
    let totalTasks = 0;
    let completedTasks = 0;
    
    for (let i = 0; i < 7; i++) {
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
    
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const calculateTaskStreaks = () => {
    const streakData: { [key: string]: TaskStreak } = {};
    
    // Get unique task names from recent data
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const taskData = localStorage.getItem(`kidmindset_tasks_${dateStr}`);
      if (taskData) {
        const tasks = JSON.parse(taskData);
        tasks.forEach((task: any) => {
          if (!streakData[task.name]) {
            streakData[task.name] = {
              taskName: task.name,
              currentStreak: 0,
              bestStreak: 0,
              completionRate: 0
            };
          }
        });
      }
    }
    
    // Calculate streaks for each task
    Object.keys(streakData).forEach(taskName => {
      let currentStreak = 0;
      let bestStreak = 0;
      let totalDays = 0;
      let completedDays = 0;
      
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        
        const taskData = localStorage.getItem(`kidmindset_tasks_${dateStr}`);
        if (taskData) {
          const tasks = JSON.parse(taskData);
          const task = tasks.find((t: any) => t.name === taskName);
          
          if (task) {
            totalDays++;
            if (task.completed) {
              completedDays++;
              if (i === 0 || currentStreak > 0) { // Only count if it's today or part of current streak
                currentStreak++;
              }
            } else {
              if (currentStreak > bestStreak) {
                bestStreak = currentStreak;
              }
              if (i === 0) currentStreak = 0; // Reset if today wasn't completed
            }
          }
        }
      }
      
      if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
      }
      
      streakData[taskName] = {
        ...streakData[taskName],
        currentStreak,
        bestStreak,
        completionRate: totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
      };
    });
    
    setTaskStreaks(Object.values(streakData));
  };

  const getMoodAverage = (days: number = 7): number => {
    const recentMoods = moodData
      .filter(entry => {
        const entryDate = new Date(entry.date);
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - days);
        return entryDate >= daysAgo;
      })
      .map(entry => entry.mood);
    
    if (recentMoods.length === 0) return 3;
    return Math.round((recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length) * 10) / 10;
  };

  const deleteJournalEntry = (entryId: string) => {
    setJournalEntries(prev => prev.filter(entry => entry.id !== entryId));
    console.log('[KidMindset] Journal entry deleted:', entryId);
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMoodEmoji = (mood: number): string => {
    const emojiMap = { 1: "😢", 2: "😕", 3: "😐", 4: "😊", 5: "😁" };
    return emojiMap[mood as keyof typeof emojiMap] || "😐";
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          📈 Progress
        </h1>
        <p className="text-muted-foreground">
          Track your journey and celebrate your growth
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Level</span>
            </div>
            <p className="text-2xl font-bold text-primary">{playerStats.currentLevel}</p>
            <p className="text-xs text-muted-foreground">{playerStats.totalPoints} points</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-success" />
              <span className="text-sm font-medium">Completion</span>
            </div>
            <p className="text-2xl font-bold text-success">{playerStats.completionRate}%</p>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Active Days</span>
            </div>
            <p className="text-2xl font-bold text-accent">{playerStats.activeDays}</p>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium">Mood Avg</span>
            </div>
            <p className="text-2xl font-bold text-warning">{getMoodAverage()}/5</p>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Mood Timeline */}
      <Card className="mb-6 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Mood Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {moodData.length > 0 ? (
            <div className="space-y-2">
              {moodData.slice(0, 10).map((entry, index) => (
                <div key={`${entry.date}-${entry.type}`} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getMoodEmoji(entry.mood)}</span>
                    <div>
                      <p className="text-sm font-medium">{formatDate(entry.date)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{entry.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{entry.mood}/5</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No mood data yet. Start tracking your daily mood to see your progress!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Task Streaks */}
      <Card className="mb-6 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Task Streaks</CardTitle>
        </CardHeader>
        <CardContent>
          {taskStreaks.length > 0 ? (
            <div className="space-y-3">
              {taskStreaks.map((streak) => (
                <div key={streak.taskName} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{streak.taskName}</p>
                    <p className="text-xs text-muted-foreground">
                      {streak.completionRate}% completion rate
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-500">
                      🔥 {streak.currentStreak} days
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Best: {streak.bestStreak}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Complete some tasks to see your streaks!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Journal Logs */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Journal Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {journalEntries.length > 0 ? (
            <div className="space-y-4">
              {journalEntries.map((entry) => (
                <div key={entry.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{formatDate(entry.date)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{entry.type} reflection</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteJournalEntry(entry.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {entry.content.wentWell && (
                      <div>
                        <p className="font-medium text-success">What went well:</p>
                        <p className="text-muted-foreground">{entry.content.wentWell}</p>
                      </div>
                    )}
                    {entry.content.couldImprove && (
                      <div>
                        <p className="font-medium text-warning">Could improve:</p>
                        <p className="text-muted-foreground">{entry.content.couldImprove}</p>
                      </div>
                    )}
                    {entry.content.whatAffected && (
                      <div>
                        <p className="font-medium text-accent">What affected performance:</p>
                        <p className="text-muted-foreground">{entry.content.whatAffected}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No journal entries yet. Complete some reflections to see them here!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
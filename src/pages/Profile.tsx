import { useState, useEffect } from "react";
import { User, Settings, Star, Trophy, Target, Calendar, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  name: string;
  age: number;
  level: number;
  joinDate: string;
  weeklySchedule: string[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
}

const defaultAchievements: Achievement[] = [
  {
    id: "first_mood",
    title: "Mood Tracker",
    description: "Recorded your first mood",
    icon: "😊",
    unlocked: false
  },
  {
    id: "task_master",
    title: "Task Master",
    description: "Completed all daily tasks",
    icon: "✅",
    unlocked: false
  },
  {
    id: "week_warrior",
    title: "Week Warrior",
    description: "7-day task streak",
    icon: "🔥",
    unlocked: false
  },
  {
    id: "level_up",
    title: "Level Up",
    description: "Reached level 2",
    icon: "⭐",
    unlocked: false
  },
  {
    id: "reflector",
    title: "Deep Reflector",
    description: "Completed post-game reflection",
    icon: "🤔",
    unlocked: false
  },
  {
    id: "confident",
    title: "Confidence Builder",
    description: "Rated confidence 8+ five times",
    icon: "💪",
    unlocked: false
  }
];

export default function Profile() {
  const { toast } = useToast();
  const { signOut } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile>({
    name: "Champion",
    age: 12,
    level: 1,
    joinDate: new Date().toISOString(),
    weeklySchedule: []
  });
  
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    age: ""
  });

  useEffect(() => {
    console.log('[KidMindset] Profile page loaded');
    loadProfileData();
    checkAchievements();
  }, []);

  const loadProfileData = () => {
    // Load profile from localStorage
    const savedProfile = localStorage.getItem('kidmindset_profile');
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      setProfile(profileData);
      setEditForm({
        name: profileData.name,
        age: profileData.age.toString()
      });
    }

    // Load player data for level
    const playerData = localStorage.getItem('kidmindset_player');
    if (playerData) {
      const data = JSON.parse(playerData);
      setProfile(prev => ({ ...prev, level: data.level || 1 }));
    }

    // Load achievements
    const savedAchievements = localStorage.getItem('kidmindset_achievements');
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }
  };

  const checkAchievements = () => {
    const updatedAchievements = [...achievements];
    let newUnlocks = 0;

    // Check mood tracker achievement
    const hasMoodData = localStorage.getItem(`kidmindset_mood_${new Date().toDateString()}`);
    if (hasMoodData && !updatedAchievements.find(a => a.id === "first_mood")?.unlocked) {
      const achievement = updatedAchievements.find(a => a.id === "first_mood");
      if (achievement) {
        achievement.unlocked = true;
        achievement.unlockedDate = new Date().toISOString();
        newUnlocks++;
      }
    }

    // Check task completion
    const today = new Date().toDateString();
    const taskData = localStorage.getItem(`kidmindset_tasks_${today}`);
    if (taskData) {
      const tasks = JSON.parse(taskData);
      if (tasks.length > 0 && tasks.every((t: any) => t.completed)) {
        const achievement = updatedAchievements.find(a => a.id === "task_master");
        if (achievement && !achievement.unlocked) {
          achievement.unlocked = true;
          achievement.unlockedDate = new Date().toISOString();
          newUnlocks++;
        }
      }
    }

    // Check level achievement
    const playerData = localStorage.getItem('kidmindset_player');
    if (playerData) {
      const data = JSON.parse(playerData);
      if (data.level >= 2) {
        const achievement = updatedAchievements.find(a => a.id === "level_up");
        if (achievement && !achievement.unlocked) {
          achievement.unlocked = true;
          achievement.unlockedDate = new Date().toISOString();
          newUnlocks++;
        }
      }
    }

    // Check reflection achievement
    const postGameData = localStorage.getItem(`kidmindset_postgame_${today}`);
    if (postGameData) {
      const data = JSON.parse(postGameData);
      if (data.mood || Object.values(data.journalPrompts || {}).some((v: any) => v.trim())) {
        const achievement = updatedAchievements.find(a => a.id === "reflector");
        if (achievement && !achievement.unlocked) {
          achievement.unlocked = true;
          achievement.unlockedDate = new Date().toISOString();
          newUnlocks++;
        }
      }
    }

    if (newUnlocks > 0) {
      setAchievements(updatedAchievements);
      localStorage.setItem('kidmindset_achievements', JSON.stringify(updatedAchievements));
      
      toast({
        title: `🎉 ${newUnlocks} New Achievement${newUnlocks > 1 ? 's' : ''}!`,
        description: "Check your profile to see what you've unlocked!",
      });
    }
  };

  const handleEditSubmit = () => {
    const updatedProfile = {
      ...profile,
      name: editForm.name.trim() || "Champion",
      age: parseInt(editForm.age) || 12
    };

    setProfile(updatedProfile);
    localStorage.setItem('kidmindset_profile', JSON.stringify(updatedProfile));
    setIsEditing(false);
    
    console.log('[KidMindset] Profile updated:', updatedProfile);
    
    toast({
      title: "Profile updated!",
      description: "Your information has been saved.",
    });
  };

  const getUnlockedCount = (): number => {
    return achievements.filter(a => a.unlocked).length;
  };

  const formatJoinDate = (): string => {
    return new Date(profile.joinDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleLogout = async () => {
    console.log('[AuthFlow] Logout button clicked');
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          👤 My Account
        </h1>
        <p className="text-muted-foreground">
          Your journey and achievements
        </p>
      </div>

      {/* Profile Header */}
      <Card className="mb-6 shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Settings className="w-4 h-4" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full 
                               flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold">{profile.name}</h2>
                <p className="text-muted-foreground">Age {profile.age}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 text-level-foreground" />
                    <span className="text-sm font-medium">Level</span>
                  </div>
                  <p className="text-lg font-bold text-primary">{profile.level}</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Trophy className="w-4 h-4 text-achievement" />
                    <span className="text-sm font-medium">Achievements</span>
                  </div>
                  <p className="text-lg font-bold text-achievement">
                    {getUnlockedCount()}/{achievements.length}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Calendar className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium">Joined</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatJoinDate()}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={editForm.age}
                  onChange={(e) => setEditForm(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Enter your age"
                  min="6"
                  max="18"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleEditSubmit} className="flex-1">
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
              
              <div className="pt-4 border-t">
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="w-full"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="mb-6 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-achievement" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200",
                  achievement.unlocked
                    ? "bg-achievement/10 border-achievement/30"
                    : "bg-muted/30 border-muted opacity-60"
                )}
              >
                <div className="flex-shrink-0">
                  <span className="text-2xl block w-10 h-10 flex items-center justify-center rounded-lg bg-background">
                    {achievement.unlocked ? achievement.icon : "🔒"}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "font-semibold",
                    achievement.unlocked ? "text-achievement" : "text-muted-foreground"
                  )}>
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                  {achievement.unlocked && achievement.unlockedDate && (
                    <p className="text-xs text-achievement mt-1">
                      Unlocked {new Date(achievement.unlockedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Points Earned:</span>
              <span className="font-semibold">
                {JSON.parse(localStorage.getItem('kidmindset_player') || '{}').points || 0}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Level:</span>
              <span className="font-semibold text-primary">Level {profile.level}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Achievements Unlocked:</span>
              <span className="font-semibold text-achievement">
                {getUnlockedCount()} / {achievements.length}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member Since:</span>
              <span className="font-semibold">{formatJoinDate()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
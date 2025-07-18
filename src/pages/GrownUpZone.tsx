import { useState, useEffect } from "react";
import { Lock, ArrowLeft, Eye, CreditCard, Calendar, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ChildProgress {
  name: string;
  level: number;
  points: number;
  weeklyMoodAvg: number;
  completionRate: number;
  activeDays: number;
  recentMoods: { date: string; mood: number }[];
  taskStreaks: { name: string; streak: number }[];
  journalEntries: number;
}

export default function GrownUpZone() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMethod, setAuthMethod] = useState<"pin" | "email">("pin");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [childProgress, setChildProgress] = useState<ChildProgress>({
    name: "Champion",
    level: 1,
    points: 0,
    weeklyMoodAvg: 3.5,
    completionRate: 0,
    activeDays: 0,
    recentMoods: [],
    taskStreaks: [],
    journalEntries: 0
  });

  const DEMO_PIN = "1234"; // In real app, this would be user-set
  const DEMO_EMAIL = "parent@example.com"; // In real app, this would be from user account

  useEffect(() => {
    console.log('[KidMindset] Grown Up Zone accessed');
    
    // Check if already authenticated in this session
    const authToken = sessionStorage.getItem('kidmindset_parent_auth');
    if (authToken === 'authenticated') {
      setIsAuthenticated(true);
      loadChildProgress();
    }
  }, []);

  const handlePinAuth = () => {
    if (pin === DEMO_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem('kidmindset_parent_auth', 'authenticated');
      loadChildProgress();
      
      console.log('[KidMindset] Parent authenticated via PIN');
      
      toast({
        title: "Access granted",
        description: "Welcome to the Grown Up Zone",
      });
    } else {
      toast({
        title: "Invalid PIN",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleEmailAuth = () => {
    if (email === DEMO_EMAIL) {
      setIsAuthenticated(true);
      sessionStorage.setItem('kidmindset_parent_auth', 'authenticated');
      loadChildProgress();
      
      console.log('[KidMindset] Parent authenticated via email');
      
      toast({
        title: "Access granted",
        description: "Welcome to the Grown Up Zone",
      });
    } else {
      toast({
        title: "Email not recognized",
        description: "Please use the registered parent email",
        variant: "destructive"
      });
    }
  };

  const loadChildProgress = () => {
    // Load all child progress data
    const playerData = JSON.parse(localStorage.getItem('kidmindset_player') || '{}');
    const profileData = JSON.parse(localStorage.getItem('kidmindset_profile') || '{}');
    
    // Calculate mood data
    const moodEntries = [];
    for (let i = 0; i < 7; i++) {
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
    
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Count journal entries
    let journalCount = 0;
    for (let i = 0; i < 30; i++) {
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
    
    setChildProgress({
      name: profileData.name || "Champion",
      level: playerData.level || 1,
      points: playerData.points || 0,
      weeklyMoodAvg: Math.round(weeklyMoodAvg * 10) / 10,
      completionRate,
      activeDays: moodEntries.length,
      recentMoods: moodEntries.slice(0, 5),
      taskStreaks: [], // Would calculate actual streaks
      journalEntries: journalCount
    });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('kidmindset_parent_auth');
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">⚙️ Grown Up Zone</h1>
              <p className="text-sm text-muted-foreground">Parent access required</p>
            </div>
          </div>

          {/* Auth Methods */}
          <div className="space-y-4">
            <div className="flex rounded-lg border p-1">
              <button
                onClick={() => setAuthMethod("pin")}
                className={cn(
                  "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all",
                  authMethod === "pin" 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                PIN Code
              </button>
              <button
                onClick={() => setAuthMethod("email")}
                className={cn(
                  "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all",
                  authMethod === "email" 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Email
              </button>
            </div>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  {authMethod === "pin" ? "Enter PIN" : "Enter Email"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {authMethod === "pin" ? (
                  <div>
                    <Label htmlFor="pin">Parent PIN</Label>
                    <Input
                      id="pin"
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Enter 4-digit PIN"
                      maxLength={4}
                      onKeyPress={(e) => e.key === 'Enter' && handlePinAuth()}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Demo PIN: 1234
                    </p>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="email">Parent Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="parent@example.com"
                      onKeyPress={(e) => e.key === 'Enter' && handleEmailAuth()}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Demo email: parent@example.com
                    </p>
                  </div>
                )}

                <Button
                  onClick={authMethod === "pin" ? handlePinAuth : handleEmailAuth}
                  className="w-full"
                  disabled={authMethod === "pin" ? pin.length !== 4 : !email}
                >
                  Access Grown Up Zone
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">⚙️ Grown Up Zone</h1>
            <p className="text-sm text-muted-foreground">Parent dashboard</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
        >
          Sign Out
        </Button>
      </div>

      {/* Child Progress Overview */}
      <Card className="mb-6 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            {childProgress.name}'s Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-primary/10">
              <p className="text-2xl font-bold text-primary">{childProgress.level}</p>
              <p className="text-sm text-muted-foreground">Current Level</p>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-success/10">
              <p className="text-2xl font-bold text-success">{childProgress.points}</p>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-warning/10">
              <p className="text-2xl font-bold text-warning">{childProgress.weeklyMoodAvg}/5</p>
              <p className="text-sm text-muted-foreground">Avg Mood</p>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-accent/10">
              <p className="text-2xl font-bold text-accent">{childProgress.completionRate}%</p>
              <p className="text-sm text-muted-foreground">Task Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="mb-6 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Recent Moods (Last 5 days)</h4>
              <div className="flex gap-2">
                {childProgress.recentMoods.map((entry, index) => (
                  <div key={index} className="text-center p-2 rounded bg-muted/50">
                    <span className="text-lg block">
                      {["😢", "😕", "😐", "😊", "😁"][entry.mood - 1]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.date).getDate()}/{new Date(entry.date).getMonth() + 1}
                    </span>
                  </div>
                ))}
                {childProgress.recentMoods.length === 0 && (
                  <p className="text-muted-foreground text-sm">No mood data yet</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Activity Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active days (last 7):</span>
                  <span className="font-medium">{childProgress.activeDays}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Journal entries:</span>
                  <span className="font-medium">{childProgress.journalEntries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Task completion rate:</span>
                  <span className="font-medium">{childProgress.completionRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Management */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-medium">Premium Monthly</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next billing:</span>
                <span className="font-medium">Dec 15, 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">$9.99/month</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              Manage Billing
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">No upcoming sessions</p>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              Schedule Session
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
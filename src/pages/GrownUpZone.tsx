import { useState, useEffect } from "react";
import { Lock, ArrowLeft, Loader2, User, BarChart3, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ProfileTab } from "@/components/tabs/ProfileTab";
import { PlayerProgressTab } from "@/components/tabs/PlayerProgressTab";
import { PaymentsTab } from "@/components/tabs/PaymentsTab";


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
  const { user } = useAuth();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMethod, setAuthMethod] = useState<"pin" | "email">("pin");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    console.log('[GrownUpZone] Accessing Grown Up Zone');
    
    // Check if already authenticated in this session
    const authToken = sessionStorage.getItem('kidmindset_parent_auth');
    if (authToken === 'authenticated') {
      setIsAuthenticated(true);
      loadChildProgress();
    }
  }, []);

  const handlePinAuth = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access the Grown Up Zone",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (pin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be 4 digits",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    console.log('[GrownUpZone] Verifying PIN for user:', user.id);

    try {
      // Fetch the parent's PIN from Supabase
      const { data: parentData, error } = await supabase
        .from('parents')
        .select('pin')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.log('[GrownUpZone] Error fetching parent data:', error.message);
        toast({
          title: "Error",
          description: "Unable to verify PIN. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (!parentData) {
        toast({
          title: "Parent profile not found",
          description: "Please complete your profile setup first.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Compare the entered PIN with the stored PIN
      if (pin === parentData.pin) {
        setIsAuthenticated(true);
        sessionStorage.setItem('kidmindset_parent_auth', 'authenticated');
        loadChildProgress();
        
        console.log('[GrownUpZone] Parent authenticated via PIN');
        
        toast({
          title: "Access granted",
          description: "Welcome to the Grown Up Zone",
        });
      } else {
        console.log('[GrownUpZone] Invalid PIN entered');
        toast({
          title: "Incorrect PIN",
          description: "Please check your PIN and try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.log('[GrownUpZone] Unexpected error during PIN verification:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  const handleEmailAuth = async () => {
    if (!user?.email) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access the Grown Up Zone",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (email === user.email) {
      setIsAuthenticated(true);
      sessionStorage.setItem('kidmindset_parent_auth', 'authenticated');
      loadChildProgress();
      
      console.log('[GrownUpZone] Parent authenticated via email');
      
      toast({
        title: "Access granted",
        description: "Welcome to the Grown Up Zone",
      });
    } else {
      toast({
        title: "Email not recognized",
        description: "Please use your registered email address",
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
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  authMethod === "pin" 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                PIN Code
              </button>
              <button
                onClick={() => setAuthMethod("email")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  authMethod === "email" 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
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
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && !loading && handlePinAuth()}
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="email">Parent Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={user?.email || "parent@example.com"}
                      onKeyPress={(e) => e.key === 'Enter' && !loading && handleEmailAuth()}
                    />
                  </div>
                )}

                <Button
                  onClick={authMethod === "pin" ? handlePinAuth : handleEmailAuth}
                  className="w-full"
                  disabled={loading || (authMethod === "pin" ? pin.length !== 4 : !email)}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
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

      {/* Tab Navigation */}
      <div className="flex-1">
        <Tabs defaultValue="profile" className="h-full">
          <div className="p-4 pb-0">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payments
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4">
            <TabsContent value="profile" className="mt-0">
              <ProfileTab />
            </TabsContent>

            <TabsContent value="progress" className="mt-0">
              <PlayerProgressTab />
            </TabsContent>

            <TabsContent value="payments" className="mt-0">
              <PaymentsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
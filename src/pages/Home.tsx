import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { TopNavigation } from "@/components/nav/TopNavigation";
import { BottomNav } from "@/components/nav/BottomNav";
import { LevelUpNotification } from "@/components/Progress/LevelUpNotification";
import CompleteProfileFlow from "@/components/Profile/CompleteProfileFlow";
import { HomePlayerCard } from "@/components/Home/HomePlayerCard";
import stadiumBackground from "@/assets/stadium-background.jpg";

interface PlayerData {
  name: string;
  level: number;
  points: number;
}

export default function Home() {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  
  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.clear();
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "Please try again or refresh the page",
        variant: "destructive"
      });
    }
  };

  // Player state
  const [playerData, setPlayerData] = useState<PlayerData>({
    name: "Player",
    level: 1,
    points: 0
  });

  // Level up tracking
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const [showLevelUpNotification, setShowLevelUpNotification] = useState(false);

  // Profile completion tracking
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  // Check if user needs to complete profile
  useEffect(() => {
    if (user) {
      checkProfileCompletion();
    }
  }, [user]);

  // Load saved data on mount
  useEffect(() => {
    loadPlayerData();
  }, []);

  const checkProfileCompletion = async () => {
    if (!user) return;
    
    setCheckingProfile(true);
    try {
      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (parentError) {
        console.error('Error checking parent record:', parentError);
        setCheckingProfile(false);
        return;
      }

      if (!parentData) {
        setNeedsProfileCompletion(true);
        setCheckingProfile(false);
        return;
      }

      const { data: childData, error: childError } = await supabase
        .from('children')
        .select('id')
        .eq('parent_id', parentData.id)
        .maybeSingle();

      if (childError) {
        console.error('Error checking child record:', childError);
        setCheckingProfile(false);
        return;
      }

      if (!childData) {
        setNeedsProfileCompletion(true);
      } else {
        setNeedsProfileCompletion(false);
      }
    } catch (error) {
      console.error('Error in profile completion check:', error);
    } finally {
      setCheckingProfile(false);
    }
  };

  const handleProfileComplete = () => {
    setNeedsProfileCompletion(false);
    loadPlayerData();
  };

  const loadPlayerData = async () => {
    try {
      const { data: childDataResult, error: childDataError } = await supabase
        .rpc('get_current_user_child_data');
      
      if (childDataError) {
        console.error('Error getting child data:', childDataError);
        throw childDataError;
      }
      
      if (!childDataResult || childDataResult.length === 0) {
        const saved = localStorage.getItem('kidmindset_player');
        if (saved) {
          const data = JSON.parse(saved);
          setPlayerData({
            name: data.name || "Player",
            level: data.level || 1,
            points: data.points || 0
          });
        }
        return;
      }
      
      const childData = childDataResult[0];
      
      const updatedPlayer = {
        name: childData.child_name || "Player",
        level: childData.child_level || 1,
        points: childData.child_points || 0
      };
      
      setPlayerData(prevData => {
        if (previousLevel !== null && updatedPlayer.level > previousLevel) {
          setShowLevelUpNotification(true);
        }
        if (previousLevel === null) {
          setPreviousLevel(updatedPlayer.level);
        }
        return updatedPlayer;
      });

      localStorage.setItem('kidmindset_player', JSON.stringify(updatedPlayer));
    } catch (error) {
      console.error('Error loading player data:', error);
      const saved = localStorage.getItem('kidmindset_player');
      if (saved) {
        const data = JSON.parse(saved);
        setPlayerData({
          name: data.name || "Player",
          level: data.level || 1,
          points: data.points || 0
        });
      }
    }
  };

  const handleNameChange = (newName: string) => {
    setPlayerData(prev => ({ ...prev, name: newName }));
    loadPlayerData();
  };

  // Show complete profile flow if needed
  if (needsProfileCompletion && !checkingProfile) {
    return <CompleteProfileFlow onComplete={handleProfileComplete} />;
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Stadium Background with Effects */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${stadiumBackground})` }}
      >
        {/* Gradient overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
        {/* Animated light rays effect */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent animate-pulse" />
      </div>

      {/* Content layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="w-full bg-black/60 backdrop-blur-md border-b border-white/10 py-3">
          <div className="flex flex-col items-center gap-1">
            {/* Logo */}
            <img 
              src="/lovable-uploads/The_Confident_Footballer.png" 
              alt="The Confident Footballer Logo" 
              className="h-16 w-auto drop-shadow-lg"
            />
            {/* Branding Text */}
            <div className="flex flex-col items-center">
              <span className="font-['Baloo_2'] text-lg font-bold text-primary drop-shadow-md">
                The Confident Footballer
              </span>
              <span className="font-['Baloo_2'] text-sm font-semibold text-black bg-white px-3 py-0.5 rounded-full shadow-md">
                Players App
              </span>
            </div>
          </div>
          {/* Logout Button - positioned in header */}
          <div className="absolute top-3 left-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              className="flex items-center gap-2 bg-black/50 border-white/20 text-white hover:bg-black/70"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        {/* Main content - centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24">
          {/* Welcome Message */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">
              Welcome Back, {playerData.name}
            </h1>
            <p className="text-sm text-white/80 mt-1 drop-shadow-md">
              Tap your card to edit profile
            </p>
          </div>

          {/* FIFA-style Player Card (clickable for edit) */}
          <HomePlayerCard onNameChange={handleNameChange} />

          {/* Top Navigation (action buttons) */}
          <div className="mt-6">
            <TopNavigation />
          </div>
        </div>
      </div>

      {/* Level Up Notification */}
      <LevelUpNotification 
        isVisible={showLevelUpNotification} 
        newLevel={playerData.level} 
        onClose={() => setShowLevelUpNotification(false)} 
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

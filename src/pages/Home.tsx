import { useState, useEffect } from "react";
import { LogOut, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { TopNavigation } from "@/components/nav/TopNavigation";
import { BottomNav } from "@/components/nav/BottomNav";
import { LevelUpNotification } from "@/components/Progress/LevelUpNotification";
import CompleteProfileFlow from "@/components/Profile/CompleteProfileFlow";
import { HomePlayerCard } from "@/components/Home/HomePlayerCard";
import { FloatingParticles, PowerRing } from "@/components/Home/GameEffects";
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
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/70 to-background/98" />
        {/* Hexagonal pattern overlay */}
        <div className="absolute inset-0 hex-pattern opacity-30" />
        {/* Animated light rays effect */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/40 via-transparent to-transparent animate-pulse" />
        {/* Cyan accent from bottom */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-cyan/30 via-transparent to-transparent" />
      </div>

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Content layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Header Bar - FIFA Style */}
        <header className="w-full bg-gradient-to-b from-card/98 to-card/90 backdrop-blur-md border-b border-primary/30 py-3 relative">
          {/* Animated gradient accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-gold to-cyan animate-shimmer" 
               style={{ backgroundSize: '200% 100%' }} />
          
          <div className="flex flex-col items-center gap-1">
            {/* Logo with enhanced glow effect */}
            <div className="relative">
              <img 
                src="/lovable-uploads/The_Confident_Footballer.png" 
                alt="The Confident Footballer Logo" 
                className="h-14 w-auto drop-shadow-lg relative z-10"
              />
              {/* Multi-layer glow behind logo */}
              <div className="absolute inset-0 blur-2xl bg-primary/30 scale-150 animate-pulse" />
              <div className="absolute inset-0 blur-xl bg-gold/20 scale-125" />
            </div>
            
            {/* Branding Text */}
            <div className="flex flex-col items-center">
              <span 
                className="text-base font-bold text-primary drop-shadow-md tracking-wider"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                THE CONFIDENT FOOTBALLER
              </span>
              <span className="text-xs font-bold text-primary-foreground bg-gradient-to-r from-primary via-primary to-primary/80 px-4 py-0.5 rounded-full shadow-lg shadow-primary/30 uppercase tracking-widest mt-1">
                Players App
              </span>
            </div>
          </div>
          
          {/* Logout Button */}
          <div className="absolute top-3 left-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              className="flex items-center gap-2 bg-card/80 border-border/50 text-muted-foreground hover:text-foreground hover:bg-card hover:border-primary/50 hover:shadow-glow-primary transition-all duration-300"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Main content - centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-28 pt-4">
          {/* Welcome Message - FIFA Style */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Crown className="w-5 h-5 text-gold animate-pulse-glow" />
              <h1 
                className="text-xl sm:text-2xl font-bold text-foreground drop-shadow-lg tracking-wider"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                WELCOME BACK
              </h1>
              <Crown className="w-5 h-5 text-gold animate-pulse-glow" />
            </div>
            <p 
              className="text-lg font-bold text-gradient-gold"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {playerData.name.toUpperCase()}
            </p>
          </div>

          <PowerRing>
            <div className="animate-float">
              <HomePlayerCard onNameChange={handleNameChange} />
            </div>
          </PowerRing>

          {/* Tap hint */}
          <p className="text-xs text-muted-foreground mt-4 animate-pulse">
            ✨ Tap your card to edit profile
          </p>

          {/* Top Navigation (action buttons) */}
          <div className="mt-4">
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

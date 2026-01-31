import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { TopNavigation } from "@/components/nav/TopNavigation";
import { LevelUpNotification } from "@/components/Progress/LevelUpNotification";
import CompleteProfileFlow from "@/components/Profile/CompleteProfileFlow";
import { HomePlayerCard } from "@/components/Home/HomePlayerCard";

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
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-sm mx-auto p-4">
        {/* Logout Button - Top Left */}
        <div className="flex justify-start mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout} 
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome Back, {playerData.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tap your card to edit profile
          </p>
        </div>

        {/* FIFA-style Player Card (clickable for edit) */}
        <div className="mb-8">
          <HomePlayerCard onNameChange={handleNameChange} />
        </div>

        {/* Top Navigation (action buttons) */}
        <TopNavigation />
      </div>

      {/* Level Up Notification */}
      <LevelUpNotification 
        isVisible={showLevelUpNotification} 
        newLevel={playerData.level} 
        onClose={() => setShowLevelUpNotification(false)} 
      />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Star, Target, Users, Eye, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdminPlayerView } from "@/hooks/useAdminPlayerView";
import { useAdmin } from "@/hooks/useAdmin";

interface BestSelfReflection {
  ball_with_me: string;
  ball_without_me: string;
  behaviour: string;
  body_language: string;
  noticed_by_others: string;
}

interface BestSelfScoreProps {
  score: number;
  onScoreChange: (score: number) => void;
}

export function BestSelfScore({ score, onScoreChange }: BestSelfScoreProps) {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { selectedChild, isViewingAsPlayer } = useAdminPlayerView();
  const [reflection, setReflection] = useState<BestSelfReflection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBestSelfReflection();
    }
  }, [user, selectedChild, isViewingAsPlayer]);

  const loadBestSelfReflection = async () => {
    if (!user) return;
    
    try {
      let targetUserId: string;

      // Check if admin is viewing as player
      if (isAdmin && isViewingAsPlayer && selectedChild) {
        console.log('[BestSelfScore] Admin viewing player reflection for:', selectedChild.name);
        // Get the parent user_id for the selected child
        const { data: parentData, error: parentError } = await supabase
          .from('children')
          .select(`
            parent_id,
            parents!inner (
              user_id
            )
          `)
          .eq('id', selectedChild.id)
          .single();

        if (parentError) {
          console.error('Error getting parent user ID:', parentError);
          return;
        }

        targetUserId = parentData.parents.user_id;
      } else {
        targetUserId = user.id;
      }

      const { data, error } = await supabase
        .from('best_self_reflections')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error loading reflection:', error);
        return;
      }

      if (data && data.length > 0) {
        setReflection(data[0]);
      } else {
        setReflection(null);
      }
    } catch (error) {
      console.error('Error loading reflection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (value: number[]) => {
    onScoreChange(value[0]);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "🔥 Outstanding!";
    if (score >= 80) return "⭐ Excellent!";
    if (score >= 70) return "👍 Great!";
    if (score >= 60) return "✅ Good";
    if (score >= 40) return "🟡 Getting there";
    return "🔴 Room to grow";
  };

  if (loading) {
    return (
      <Card className="shadow-soft border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Best Self Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reflection) {
    return (
      <Card className="shadow-soft border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Best Self Rating
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-4">
            <Star className="h-8 w-8 text-primary/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              You haven't defined your best self yet. Complete your reflection first to rate yourself.
            </p>
            <p className="text-xs text-muted-foreground">
              Go to Profile → Best Self or use the link in the Best Self Tracker to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Best Self Rating
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Show Best Self Reflection Summary */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Your Best Self Vision:</h4>
          
          <div className="grid gap-3">
            {reflection.ball_with_me && (
              <div className="flex gap-2 text-xs">
                <Target className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground line-clamp-2">{reflection.ball_with_me}</span>
              </div>
            )}
            
            {reflection.ball_without_me && (
              <div className="flex gap-2 text-xs">
                <Users className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground line-clamp-2">{reflection.ball_without_me}</span>
              </div>
            )}
            
            {reflection.behaviour && (
              <div className="flex gap-2 text-xs">
                <Heart className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground line-clamp-2">{reflection.behaviour}</span>
              </div>
            )}
            
            {reflection.noticed_by_others && (
              <div className="flex gap-2 text-xs">
                <Eye className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground line-clamp-2">{reflection.noticed_by_others}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rating Slider */}
        <div className="space-y-3 pt-2 border-t border-muted">
          <Label className="text-base font-medium">
            How close were you to your best self this week?
          </Label>
          <div className="px-3">
            <Slider
              value={[score]}
              onValueChange={handleScoreChange}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span className={`font-bold text-lg ${getScoreColor(score)}`}>
                {score}%
              </span>
              <span>100%</span>
            </div>
          </div>
          <div className="text-center">
            <span className="text-sm font-medium">
              {getScoreLabel(score)}
            </span>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          Rate yourself honestly based on how close you came to your best self vision during this activity.
        </div>
      </CardContent>
    </Card>
  );
}
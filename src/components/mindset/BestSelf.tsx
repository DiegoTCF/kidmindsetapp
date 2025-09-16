import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdminPlayerView } from "@/hooks/useAdminPlayerView";
import { useAdmin } from "@/hooks/useAdmin";
import { Star, Target, Users, Eye, Heart } from "lucide-react";

interface BestSelfReflection {
  id?: string;
  ball_with_me: string;
  ball_without_me: string;
  behaviour: string;
  body_language: string;
  noticed_by_others: string;
}

export function BestSelf() {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { selectedChild, isViewingAsPlayer } = useAdminPlayerView();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reflection, setReflection] = useState<BestSelfReflection>({
    ball_with_me: "",
    ball_without_me: "",
    behaviour: "",
    body_language: "",
    noticed_by_others: ""
  });

  useEffect(() => {
    if (user) {
      loadExistingReflection();
    }
  }, [user, selectedChild, isViewingAsPlayer]);

  const loadExistingReflection = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let targetUserId: string;

      // Check if admin is viewing as player
      if (isAdmin && isViewingAsPlayer && selectedChild) {
        console.log('[BestSelf] Admin loading reflection for player:', selectedChild.name);
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
        const existing = data[0];
        setReflection({
          ball_with_me: existing.ball_with_me || "",
          ball_without_me: existing.ball_without_me || "",
          behaviour: existing.behaviour || "",
          body_language: existing.body_language || "",
          noticed_by_others: existing.noticed_by_others || ""
        });
      }
    } catch (error) {
      console.error('Error loading reflection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save the reflection",
        variant: "destructive"
      });
      return;
    }

    // Validate that at least one field is filled
    const hasContent = Object.values(reflection).some(value => value.trim().length > 0);
    if (!hasContent) {
      toast({
        title: "Please fill in at least one field",
        description: "The reflection needs some content to be saved",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      let targetUserId: string;

      // Check if admin is viewing as player
      if (isAdmin && isViewingAsPlayer && selectedChild) {
        console.log('[BestSelf] Admin saving reflection for player:', selectedChild.name);
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
          toast({
            title: "Error",
            description: "Failed to identify the player's account",
            variant: "destructive"
          });
          return;
        }

        targetUserId = parentData.parents.user_id;
      } else {
        targetUserId = user.id;
      }

      // Check if user already has a reflection
      const { data: existing } = await supabase
        .from('best_self_reflections')
        .select('id')
        .eq('user_id', targetUserId)
        .limit(1);

      if (existing && existing.length > 0) {
        // Update existing reflection
        const { error } = await supabase
          .from('best_self_reflections')
          .update({
            ball_with_me: reflection.ball_with_me,
            ball_without_me: reflection.ball_without_me,
            behaviour: reflection.behaviour,
            body_language: reflection.body_language,
            noticed_by_others: reflection.noticed_by_others,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', targetUserId);

        if (error) throw error;
      } else {
        // Create new reflection
        const { error } = await supabase
          .from('best_self_reflections')
          .insert({
            user_id: targetUserId,
            ball_with_me: reflection.ball_with_me,
            ball_without_me: reflection.ball_without_me,
            behaviour: reflection.behaviour,
            body_language: reflection.body_language,
            noticed_by_others: reflection.noticed_by_others
          });

        if (error) throw error;
      }

      const playerName = isAdmin && isViewingAsPlayer && selectedChild ? selectedChild.name : "your";
      toast({
        title: "✨ Reflection Saved!",
        description: `${playerName === "your" ? "Your" : `${playerName}'s`} best self vision has been saved successfully`,
      });
    } catch (error) {
      console.error('Error saving reflection:', error);
      toast({
        title: "Error",
        description: "Failed to save your reflection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateReflection = (field: keyof BestSelfReflection, value: string) => {
    setReflection(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your reflection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Star className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            What Does the Best Version of {isAdmin && isViewingAsPlayer && selectedChild ? selectedChild.name : "You"} Look Like on the Pitch?
          </h1>
          <p className="text-muted-foreground text-lg">
            Define {isAdmin && isViewingAsPlayer && selectedChild ? "their" : "your"} ideal self as a player. This will help guide {isAdmin && isViewingAsPlayer && selectedChild ? "their" : "your"} growth and track {isAdmin && isViewingAsPlayer && selectedChild ? "their" : "your"} progress.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                With the Ball
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="ball_with_me" className="text-base font-medium">
                What does your best self do when you have the ball?
              </Label>
              <Textarea
                id="ball_with_me"
                placeholder="e.g., I stay calm under pressure, look for creative passes, take confident shots..."
                value={reflection.ball_with_me}
                onChange={(e) => updateReflection('ball_with_me', e.target.value)}
                className="mt-2 min-h-[100px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Without the Ball
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="ball_without_me" className="text-base font-medium">
                What does your best self do when you don't have the ball?
              </Label>
              <Textarea
                id="ball_without_me"
                placeholder="e.g., I make intelligent runs, communicate with teammates, press effectively..."
                value={reflection.ball_without_me}
                onChange={(e) => updateReflection('ball_without_me', e.target.value)}
                className="mt-2 min-h-[100px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Behavior & Attitude
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="behaviour" className="text-base font-medium">
                How do you behave on the pitch when you're at your best?
              </Label>
              <Textarea
                id="behaviour"
                placeholder="e.g., I encourage teammates, stay positive after mistakes, lead by example..."
                value={reflection.behaviour}
                onChange={(e) => updateReflection('behaviour', e.target.value)}
                className="mt-2 min-h-[100px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Body Language
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="body_language" className="text-base font-medium">
                What does your body language look like when you're playing your best?
              </Label>
              <Textarea
                id="body_language"
                placeholder="e.g., I stand tall, make eye contact, move with confidence, shoulders back..."
                value={reflection.body_language}
                onChange={(e) => updateReflection('body_language', e.target.value)}
                className="mt-2 min-h-[100px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                What Others Notice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="noticed_by_others" className="text-base font-medium">
                What do you want people to notice about you when you're playing?
              </Label>
              <Textarea
                id="noticed_by_others"
                placeholder="e.g., My work rate, my composure, my ability to create chances, my leadership..."
                value={reflection.noticed_by_others}
                onChange={(e) => updateReflection('noticed_by_others', e.target.value)}
                className="mt-2 min-h-[100px]"
              />
            </CardContent>
          </Card>

          <div className="flex justify-center pt-6">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              size="lg"
              className="px-8"
            >
              {saving ? "Saving..." : `Save ${isAdmin && isViewingAsPlayer && selectedChild ? `${selectedChild.name}'s` : "My"} Best Self Vision`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
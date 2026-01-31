import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PlayerCard } from "@/components/performance/PlayerCard";
import { PlayerCardSkeleton } from "@/components/performance/PerformanceSkeletons";
import { adaptPerformanceData, AdaptedPerformanceData } from "@/components/performance/PerformanceAdapter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HomePlayerCardProps {
  onNameChange?: (newName: string) => void;
}

export function HomePlayerCard({ onNameChange }: HomePlayerCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [performanceData, setPerformanceData] = useState<AdaptedPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [childId, setChildId] = useState<string | null>(null);

  useEffect(() => {
    loadPerformanceData();
  }, [user]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      // Get child ID
      const { data: childIdResult, error: childIdError } = await supabase
        .rpc('get_current_user_child_id');

      if (childIdError || !childIdResult) {
        console.log('No child found for current user');
        setLoading(false);
        return;
      }

      setChildId(childIdResult);

      // Fetch child details for name
      const { data: childData } = await supabase
        .from('children')
        .select('name')
        .eq('id', childIdResult)
        .single();

      // Fetch player identity for avatar
      let avatarUrl: string | null = null;
      if (user?.id) {
        const { data: identityData } = await supabase
          .from('player_identities')
          .select('avatar_url')
          .eq('user_id', user.id)
          .maybeSingle();
        
        avatarUrl = identityData?.avatar_url || null;
      }

      // Fetch super behaviour ratings
      const { data: behaviourData } = await supabase
        .from('super_behaviour_ratings')
        .select('behaviour_type, average_score')
        .eq('child_id', childIdResult)
        .order('created_at', { ascending: false });

      // Group behaviour data and calculate averages
      const behaviourAverages: { behaviour_type: string; average_score: number }[] = [];
      if (behaviourData && behaviourData.length > 0) {
        const behaviourGroups: { [key: string]: number[] } = {};
        behaviourData.forEach(rating => {
          if (!behaviourGroups[rating.behaviour_type]) {
            behaviourGroups[rating.behaviour_type] = [];
          }
          if (rating.average_score !== null) {
            behaviourGroups[rating.behaviour_type].push(rating.average_score);
          }
        });

        Object.entries(behaviourGroups).forEach(([type, scores]) => {
          if (scores.length > 0) {
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            behaviourAverages.push({ behaviour_type: type, average_score: avg });
          }
        });
      }

      // Fetch activity ratings from post_activity_data
      const { data: activities } = await supabase
        .from('activities')
        .select('post_activity_data')
        .eq('child_id', childIdResult)
        .eq('post_activity_completed', true)
        .order('activity_date', { ascending: false })
        .limit(20);

      let activityRatings = null;
      if (activities && activities.length > 0) {
        let workRateSum = 0, confidenceSum = 0, mistakesSum = 0, focusSum = 0, performanceSum = 0;
        let count = 0;

        activities.forEach(activity => {
          if (activity.post_activity_data) {
            const data = activity.post_activity_data as any;
            if (data.workRate && data.confidence && data.mistakes && data.focus && data.performance) {
              workRateSum += data.workRate;
              confidenceSum += data.confidence;
              mistakesSum += data.mistakes;
              focusSum += data.focus;
              performanceSum += data.performance;
              count++;
            }
          }
        });

        if (count > 0) {
          activityRatings = {
            workRate: workRateSum / count,
            confidence: confidenceSum / count,
            mistakes: mistakesSum / count,
            focus: focusSum / count,
            performance: performanceSum / count
          };
        }
      }

      // Fetch best self scores
      const { data: bestSelfData } = await supabase
        .from('best_self_scores')
        .select('score')
        .eq('user_id', user?.id || '')
        .order('created_at', { ascending: false })
        .limit(10);

      let bestSelfAverage: number | null = null;
      if (bestSelfData && bestSelfData.length > 0) {
        const totalScore = bestSelfData.reduce((sum, item) => sum + item.score, 0);
        bestSelfAverage = totalScore / bestSelfData.length / 10;
      }

      // Use the adapter to transform the data
      const adapted = adaptPerformanceData(
        childData?.name || 'Player',
        avatarUrl,
        behaviourAverages,
        activityRatings,
        bestSelfAverage
      );

      setPerformanceData(adapted);
      setEditName(childData?.name || '');
      setEditAvatarUrl(avatarUrl);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = () => {
    if (performanceData) {
      setEditName(performanceData.profile.playerName);
      setEditAvatarUrl(performanceData.profile.avatarUrl);
      setEditDialogOpen(true);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setUploadingPhoto(true);
    try {
      // Create a unique file name with user ID as folder (required by RLS policy)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        // If bucket doesn't exist, show helpful message
        if (uploadError.message.includes('Bucket not found')) {
          toast({
            title: "Storage not configured",
            description: "Please set up the avatars storage bucket first.",
            variant: "destructive"
          });
          return;
        }
        throw uploadError;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setEditAvatarUrl(urlData.publicUrl);
      toast({
        title: "Photo uploaded!",
        description: "Click Save to apply the changes."
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id || !childId) return;

    setSaving(true);
    try {
      // Update child name
      if (editName.trim()) {
        const { error: childError } = await supabase
          .from('children')
          .update({ name: editName.trim() })
          .eq('id', childId);

        if (childError) throw childError;
      }

      // Update or insert player identity with avatar
      const { data: existingIdentity } = await supabase
        .from('player_identities')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingIdentity) {
        const { error: identityError } = await supabase
          .from('player_identities')
          .update({ avatar_url: editAvatarUrl })
          .eq('user_id', user.id);

        if (identityError) throw identityError;
      } else {
        const { error: insertError } = await supabase
          .from('player_identities')
          .insert({ user_id: user.id, avatar_url: editAvatarUrl });

        if (insertError) throw insertError;
      }

      toast({
        title: "Profile updated!",
        description: "Your changes have been saved."
      });

      // Reload data and notify parent
      await loadPerformanceData();
      onNameChange?.(editName.trim());
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Save failed",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center">
        <PlayerCardSkeleton />
      </div>
    );
  }

  if (!performanceData) {
    return null;
  }

  return (
    <>
      {/* Clickable FIFA Card */}
      <div 
        className="flex justify-center cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
        onClick={handleCardClick}
      >
        <PlayerCard
          playerName={performanceData.profile.playerName}
          position={performanceData.profile.position}
          overallRating={performanceData.overallRating}
          avatarUrl={performanceData.profile.avatarUrl}
          hasData={performanceData.hasData}
        />
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  <AvatarImage src={editAvatarUrl || undefined} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {editName?.charAt(0)?.toUpperCase() || 'P'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <p className="text-sm text-muted-foreground">
                Tap to change photo
              </p>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name">Player Name</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={saving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !editName.trim()}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

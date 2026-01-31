import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2, Save } from "lucide-react";

interface AdminEditPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  childId: string;
  parentUserId: string | null;
  currentName: string;
  currentAvatarUrl: string | null;
  onSaved: () => void;
}

export function AdminEditPlayerDialog({
  open,
  onOpenChange,
  childId,
  parentUserId,
  currentName,
  currentAvatarUrl,
  onSaved
}: AdminEditPlayerDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(currentName);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentAvatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setName(currentName);
      setAvatarPreview(currentAvatarUrl);
      setAvatarFile(null);
    }
  }, [open, currentName, currentAvatarUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive"
        });
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update child name if changed
      if (name !== currentName) {
        const { error: nameError } = await supabase
          .from('children')
          .update({ name })
          .eq('id', childId);

        if (nameError) throw nameError;
      }

      // Upload new avatar if selected
      if (avatarFile && parentUserId) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${parentUserId}/avatar.${fileExt}`;

        // Upload to avatars bucket
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        // Update player identity with new avatar URL
        const { error: identityError } = await supabase
          .from('player_identities')
          .upsert({
            user_id: parentUserId,
            avatar_url: urlData.publicUrl,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        if (identityError) throw identityError;
      }

      toast({
        title: "Player Updated",
        description: "Player details have been saved successfully"
      });

      onSaved();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving player details:', error);
      toast({
        title: "Error",
        description: "Failed to save player details",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Player Details</DialogTitle>
          <DialogDescription>
            Update the player's name and photo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div 
              className="relative w-32 h-32 rounded-full overflow-hidden bg-muted cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Player avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-4 h-4 mr-2" />
              Change Photo
            </Button>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="player-name">Player Name</Label>
            <Input
              id="player-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter player name"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings, Star, Target, Calendar, LogOut, Camera, ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PlayerViewIndicator } from "@/components/layout/PlayerViewIndicator";

interface UserProfile {
  name: string;
  age: number;
  level: number;
  joinDate: string;
  weeklySchedule: string[];
  photoUrl?: string;
}

export default function Profile() {
  const { toast } = useToast();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<UserProfile>({
    name: "Champion",
    age: 12,
    level: 1,
    joinDate: new Date().toISOString(),
    weeklySchedule: [],
    photoUrl: undefined
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    age: ""
  });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    console.log('[KidMindset] Profile page loaded');
    loadProfileData();
  }, []);

  const loadProfileData = () => {
    // Load profile from localStorage
    const savedProfile = localStorage.getItem('kidmindset_profile');
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      setProfile(prev => ({ ...prev, ...profileData }));
      setEditForm({
        name: profileData.name,
        age: profileData.age?.toString() || "12"
      });
    }

    // Load player data for level
    const playerData = localStorage.getItem('kidmindset_player');
    if (playerData) {
      const data = JSON.parse(playerData);
      setProfile(prev => ({ ...prev, level: data.level || 1 }));
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingPhoto(true);

    try {
      // Convert to base64 for localStorage storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        
        const updatedProfile = {
          ...profile,
          photoUrl: base64String
        };
        
        setProfile(updatedProfile);
        localStorage.setItem('kidmindset_profile', JSON.stringify(updatedProfile));
        
        toast({
          title: "Photo updated!",
          description: "Your profile photo has been saved.",
        });
        
        setIsUploadingPhoto(false);
      };
      reader.onerror = () => {
        toast({
          title: "Upload failed",
          description: "Failed to process the image. Please try again.",
          variant: "destructive"
        });
        setIsUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive"
      });
      setIsUploadingPhoto(false);
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
    <motion.div 
      className="min-h-screen bg-background p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PlayerViewIndicator />
      
      {/* Back to Home Button */}
      <motion.div 
        className="mb-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button 
          variant="outline" 
          onClick={() => navigate('/home-test')}
          className="gap-2"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Button>
      </motion.div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          👤 My Profile
        </h1>
        <p className="text-muted-foreground">
          Manage your account
        </p>
      </div>

      {/* Profile Header with Photo */}
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
                {/* Profile Photo with Upload */}
                <div className="relative inline-block mb-3">
                  <motion.div 
                    className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg mx-auto"
                    whileHover={{ scale: 1.02 }}
                  >
                    {profile.photoUrl ? (
                      <img 
                        src={profile.photoUrl} 
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-3xl font-bold text-white">
                        {profile.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </motion.div>
                  
                  {/* Camera button overlay */}
                  <motion.button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Camera className="w-4 h-4" />
                  </motion.button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                
                {isUploadingPhoto && (
                  <p className="text-xs text-muted-foreground mb-2">Uploading...</p>
                )}
                
                <h2 className="text-xl font-bold">{profile.name}</h2>
                <p className="text-muted-foreground">Age {profile.age}</p>
                <p className="text-xs text-muted-foreground mt-1">Tap camera to change photo</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Level</span>
                  </div>
                  <p className="text-lg font-bold text-primary">{profile.level}</p>
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
              {/* Photo upload in edit mode */}
              <div className="text-center mb-4">
                <div className="relative inline-block">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg mx-auto">
                    {profile.photoUrl ? (
                      <img 
                        src={profile.photoUrl} 
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-2xl font-bold text-white">
                        {editForm.name.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Change photo</p>
              </div>

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
              <span className="text-muted-foreground">Member Since:</span>
              <span className="font-semibold">{formatJoinDate()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
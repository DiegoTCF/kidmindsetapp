import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Phone, Mail, Lock, Key } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function ProfileTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [parentData, setParentData] = useState({
    name: "",
    phone: "",
    pin: ""
  });
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPinChange, setShowPinChange] = useState(false);

  useEffect(() => {
    loadParentData();
  }, [user]);

  const loadParentData = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('parents')
        .select('name, phone, pin')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setParentData({
          name: data.name || "",
          phone: data.phone || "",
          pin: data.pin || ""
        });
      }
    } catch (error) {
      console.error('Error loading parent data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    }
  };

  const updateProfile = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('parents')
        .upsert({
          user_id: user.id,
          name: parentData.name,
          phone: parentData.phone,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const changePIN = async () => {
    if (!user?.id) return;

    if (newPin.length !== 4 || confirmPin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be 4 digits",
        variant: "destructive"
      });
      return;
    }

    if (newPin !== confirmPin) {
      toast({
        title: "PIN mismatch",
        description: "PINs do not match",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('parents')
        .upsert({
          user_id: user.id,
          name: parentData.name,
          pin: newPin,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setParentData(prev => ({ ...prev, pin: newPin }));
      setNewPin("");
      setConfirmPin("");
      setShowPinChange(false);

      toast({
        title: "PIN updated",
        description: "Your PIN has been changed successfully"
      });
    } catch (error) {
      console.error('Error updating PIN:', error);
      toast({
        title: "Error",
        description: "Failed to update PIN",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture & Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {parentData.name.split(' ').map(n => n[0]).join('').toUpperCase() || '👤'}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              Upload Photo
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={parentData.name}
                onChange={(e) => setParentData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed here. Use account settings.
              </p>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={parentData.phone}
                onChange={(e) => setParentData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter your phone number"
              />
            </div>

            <Button onClick={updateProfile} disabled={loading} className="w-full">
              Save Profile Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showPinChange ? (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                <span className="text-sm">Current PIN: ••••</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPinChange(true)}
              >
                Change PIN
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label htmlFor="newPin">New PIN</Label>
                <Input
                  id="newPin"
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Enter new 4-digit PIN"
                  maxLength={4}
                />
              </div>

              <div>
                <Label htmlFor="confirmPin">Confirm New PIN</Label>
                <Input
                  id="confirmPin"
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Confirm new PIN"
                  maxLength={4}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={changePIN}
                  disabled={loading || newPin.length !== 4 || confirmPin.length !== 4}
                  className="flex-1"
                >
                  Update PIN
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPinChange(false);
                    setNewPin("");
                    setConfirmPin("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">Change Password</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              To change your password, use the "Forgot Password" option on the sign-in page.
            </p>
            <Button variant="outline" size="sm" disabled>
              Reset Password (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
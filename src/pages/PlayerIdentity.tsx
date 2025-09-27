import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useChildData } from "@/hooks/useChildData";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Dna, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MAIN_ROLES, ROLE_TYPES, STRENGTHS_BY_ROLE_TYPE, UNIVERSAL_STRENGTHS_OUTFIELD, GOALKEEPER_STRENGTHS, HELPS_TEAM_GK, HELPS_TEAM_OUTFIELD, MOTTO_SUGGESTIONS, type MainRole } from "@/data/playerIdentityOptions";
import { RoleBoxSelector } from "@/components/PlayerIdentity/RoleBoxSelector";
import { RoleTypeGrid } from "@/components/PlayerIdentity/RoleTypeGrid";
import { ChipMultiSelect } from "@/components/PlayerIdentity/ChipMultiSelect";
import { DNADisplay } from "@/components/DNA/DNADisplay";
import { PlayerViewIndicator } from "@/components/layout/PlayerViewIndicator";

// Local type to avoid depending on generated Supabase types
interface PlayerIdentityRow {
  user_id: string;
  role_main: "Goalkeeper" | "Defender" | "Midfielder" | "Attacker" | null;
  role_type: string | null;
  strengths: string[] | null;
  helps_team: string[] | null;
  main_weapon: string | null;
  motto: string | null;
  avatar_url: string | null;
  updated_at?: string;
}
export default function PlayerIdentity() {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const {
    profile,
    updateProfile,
    refetchProfile
  } = useProfile();
  const {
    childId,
    loading: childDataLoading
  } = useChildData();
  const {
    isAdmin
  } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [existing, setExisting] = useState<boolean>(false);
  const [roleMain, setRoleMain] = useState<MainRole | null>(null);
  const [roleType, setRoleType] = useState<string>("");
  const [strengths, setStrengths] = useState<string[]>([]);
  const [helpsTeam, setHelpsTeam] = useState<string[]>([]);
  const [mainWeapon, setMainWeapon] = useState<string>("");
  const [motto, setMotto] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const roleTypeOptions = useMemo(() => roleMain ? ROLE_TYPES[roleMain] : [], [roleMain]);
  const baseStrengths = useMemo(() => {
    if (!roleMain) return [] as string[];
    return roleMain === "Goalkeeper" ? GOALKEEPER_STRENGTHS : UNIVERSAL_STRENGTHS_OUTFIELD;
  }, [roleMain]);
  const strengthOptions = useMemo(() => {
    const specific = roleType ? STRENGTHS_BY_ROLE_TYPE[roleType] ?? [] : [];
    return Array.from(new Set([...(baseStrengths as string[]), ...specific]));
  }, [baseStrengths, roleType]);
  const helpOptions = useMemo(() => {
    if (!roleMain) return [] as string[];
    return roleMain === "Goalkeeper" ? HELPS_TEAM_GK : HELPS_TEAM_OUTFIELD;
  }, [roleMain]);
  useEffect(() => {
    setRoleType("");
    setStrengths([]);
  }, [roleMain]);
  useEffect(() => {
    // SEO basics
    const prevTitle = document.title;
    document.title = "Player Identity | DNA";
    const metaDesc = document.querySelector('meta[name="description"]');
    const createdDesc = !metaDesc;
    const el = metaDesc || document.createElement("meta");
    el.setAttribute("name", "description");
    el.setAttribute("content", "Define your football DNA: role, strengths, and motto.");
    if (createdDesc) document.head.appendChild(el);
    const linkCanonical = document.querySelector('link[rel="canonical"]') || document.createElement("link");
    linkCanonical.setAttribute("rel", "canonical");
    linkCanonical.setAttribute("href", window.location.origin + "/dna");
    if (!linkCanonical.parentElement) document.head.appendChild(linkCanonical);
    return () => {
      document.title = prevTitle;
    };
  }, []);
  useEffect(() => {
    const load = async () => {
      if (!user || childDataLoading) return;
      setLoading(true);

      // Use the effective user ID (child ID if admin in player view, otherwise user ID)
      const effectiveUserId = childId || user.id;
      const isAdminPlayerView = childId && childId !== user.id;

      // Only load from player_identities if NOT in admin player view
      if (!isAdminPlayerView) {
        const {
          data,
          error
        } = await supabase.from("player_identities").select("*").eq("user_id", user.id) // Always use actual user ID for player_identities
        .maybeSingle();
        if (error) {
          console.error("Failed to load identity", error);
          toast({
            title: "Could not load identity",
            description: error.message,
            variant: "destructive"
          });
        }
        if (data) {
          setExisting(true);
          setRoleMain((data.role_main ?? null) as MainRole | null);
          setRoleType(data.role_type ?? "");
          setStrengths(Array.isArray(data.strengths) ? data.strengths : []);
          setHelpsTeam(Array.isArray(data.helps_team) ? data.helps_team : []);
          setMainWeapon(data.main_weapon ?? "");
          setMotto(data.motto ?? "");
          setAvatarUrl(data.avatar_url ?? "");
        } else {
          setExisting(false);
        }
      } else {
        // In admin player view, only load from profile data
        setExisting(false);
      }
      setLoading(false);
    };
    load();
  }, [user, toast, childId, childDataLoading]);

  // Load profile data for form prefill when editing
  useEffect(() => {
    if (editing && profile) {
      if (profile.role) setRoleMain(profile.role as MainRole);
      if (profile.strengths) setStrengths(profile.strengths);
      if (profile.help_team) setHelpsTeam(profile.help_team);
    }
  }, [editing, profile]);
  const onSave = async () => {
    if (!user) return;

    // Use the effective user ID (child ID if admin in player view, otherwise user ID)
    const effectiveUserId = childId || user.id;
    const isAdminPlayerView = childId && childId !== user.id;

    // Validation
    if (!roleMain) {
      toast({
        title: "Main Role is required",
        variant: "destructive"
      });
      return;
    }
    if (!roleType) {
      toast({
        title: "Role Type is required",
        variant: "destructive"
      });
      return;
    }
    if (motto.length > 140) {
      toast({
        title: "Motto too long",
        description: "Max 140 characters.",
        variant: "destructive"
      });
      return;
    }
    if (mainWeapon.length > 140) {
      toast({
        title: "Main Weapon too long",
        description: "Max 140 characters.",
        variant: "destructive"
      });
      return;
    }
    setSaving(true);
    try {
      // Only save to player_identities table if NOT in admin player view
      // (player_identities has FK constraint to auth.users)
      const isActualAdminPlayerView = childId && childId !== user.id && isAdminPlayerView;
      if (!isActualAdminPlayerView) {
        const payload: PlayerIdentityRow = {
          user_id: user.id,
          // Always use actual user ID for player_identities
          role_main: roleMain,
          role_type: roleType || null,
          strengths: strengths.slice(0, 3),
          helps_team: helpsTeam.slice(0, 3),
          main_weapon: mainWeapon || null,
          motto: motto || null,
          avatar_url: avatarUrl || null
        };
        const {
          error: playerIdentityError
        } = await supabase.from("player_identities").upsert(payload, {
          onConflict: "user_id"
        });
        if (playerIdentityError) throw playerIdentityError;
      }

      // Update profiles table - use user ID for regular customers, child ID for admin player view
      const profileUserId = isAdmin && childId ? childId : user.id;
      await updateProfile({
        role: roleMain,
        strengths: strengths.slice(0, 3),
        help_team: helpsTeam.slice(0, 3)
      });
      setExisting(true);
      setEditing(false);
      toast({
        title: "DNA saved",
        description: "Your player identity has been saved."
      });

      // Force refetch profile to ensure we have the latest data
      await refetchProfile();
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Error saving DNA",
        description: e.message ?? "Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Show form when editing, otherwise show DNA if any data exists
  const showForm = editing;
  const showDNA = !editing && (existing || profile?.role);
  return <div className="max-w-2xl mx-auto px-4 pt-20 pb-8 bg-background">
      <PlayerViewIndicator />
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Dna className="w-6 h-6" /> DNA
        </h1>
        <p className="text-foreground">What kind of player are you?</p>
      </header>

      <div className="space-y-4">
        {/* Show YOUR DNA card if data exists and not editing */}
        {showDNA && <DNADisplay onEdit={() => setEditing(true)} />}

        {/* Core Skills Assessment Card */}
        {!editing && <Card className="shadow-sm border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Target className="w-5 h-5" />
                Core Skills Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Test your mental skills across 6 key areas and track your progress over time.
              </p>
              <Button onClick={() => navigate('/core-skills/self-assessment')} className="w-full" size="lg">
                Take Assessment 🎯
              </Button>
            </CardContent>
          </Card>}

        {loading ? <div className="text-center py-8">
            <p>Loading your player identity...</p>
          </div> : showForm ? <>
            {/* Role Selection */}
            <Card className="shadow-sm">
              <CardHeader className="text-[#e50914]">
                <CardTitle>Choose Your Position / Role</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Main Role</Label>
                  <RoleBoxSelector roles={MAIN_ROLES} selected={roleMain} onSelect={v => setRoleMain(v as MainRole)} />
                </div>

                <div className="grid gap-2">
                  <h3 className="text-lg font-semibold">Pick the player that best describe your style</h3>
                  <RoleTypeGrid options={roleTypeOptions} selected={roleType} onSelect={setRoleType} disabled={!roleMain} />
                </div>
              </CardContent>
            </Card>

            {/* Top Strengths */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#ff0066]">Choose your top strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <Label>Select up to 3 strengths</Label>
                  <ChipMultiSelect options={strengthOptions} value={strengths} onChange={setStrengths} max={3} addYourOwn onAddCustom={async () => {
                const input = window.prompt("Add your own strength (max 30 chars)") || "";
                return input.trim().slice(0, 30) || null;
              }} />
                </div>
              </CardContent>
            </Card>

            {/* How You Help Team */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#e50914]">How You Help the Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <Label>Select up to 3 ways</Label>
                  <ChipMultiSelect options={helpOptions} value={helpsTeam} onChange={setHelpsTeam} max={3} />
                </div>
              </CardContent>
            </Card>

            {/* Motto & Main Weapon */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#E50914]">Your Identity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="motto">Motto</Label>
                  <Input id="motto" placeholder="A short motto that defines you" value={motto} maxLength={140} onChange={e => setMotto(e.target.value)} />
                  <div className="flex flex-wrap gap-2">
                    {MOTTO_SUGGESTIONS.map(m => <Button key={m} type="button" variant="secondary" size="sm" onClick={() => setMotto(m)}>
                        {m}
                      </Button>)}
                    <Button type="button" variant="secondary" size="sm" onClick={() => setMotto("No matter who with, or who against I focus on my behaviours")}>
                      No matter who with, or who against I focus on my behaviours
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="weapon">Main Weapon (optional)</Label>
                  <Input id="weapon" placeholder="One sentence about your standout skill" value={mainWeapon} onChange={e => setMainWeapon(e.target.value.slice(0, 140))} />
                </div>

              </CardContent>
            </Card>

            {/* Save Button */}
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <Button onClick={onSave} disabled={saving || loading} className="flex-1">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  {editing && <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                      Cancel
                    </Button>}
                </div>
              </CardContent>
            </Card>
          </> : <div className="text-center py-8">
            <p className="text-foreground">DNA saved! Your player identity is ready.</p>
          </div>}
      </div>
    </div>;
}
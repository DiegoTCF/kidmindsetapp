import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Dna } from "lucide-react";
import { MAIN_ROLES, ROLE_TYPES, STRENGTHS_BY_ROLE_TYPE, UNIVERSAL_STRENGTHS_OUTFIELD, GOALKEEPER_STRENGTHS, HELPS_TEAM_GK, HELPS_TEAM_OUTFIELD, MOTTO_SUGGESTIONS, type MainRole } from "@/data/playerIdentityOptions";
import { RoleBoxSelector } from "@/components/PlayerIdentity/RoleBoxSelector";
import { RoleTypeGrid } from "@/components/PlayerIdentity/RoleTypeGrid";
import { ChipMultiSelect } from "@/components/PlayerIdentity/ChipMultiSelect";
import { Link } from "react-router-dom";

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

// Using MAIN_ROLES from data/playerIdentityOptions

export default function PlayerIdentity() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState<boolean>(false);

  const [roleMain, setRoleMain] = useState<MainRole | null>(null);
  const [roleType, setRoleType] = useState<string>("");
  const [strengths, setStrengths] = useState<string[]>([]);
  const [helpsTeam, setHelpsTeam] = useState<string[]>([]);
  const [main_weapon, setMainWeapon] = useState<string>("");
  const [motto, setMotto] = useState<string>("");
  const [avatar_url, setAvatarUrl] = useState<string>("");

  const roleTypeOptions = useMemo(() => (roleMain ? ROLE_TYPES[roleMain] : []), [roleMain]);
  const baseStrengths = useMemo(() => {
    if (!roleMain) return [] as string[];
    return roleMain === "Goalkeeper" ? GOALKEEPER_STRENGTHS : UNIVERSAL_STRENGTHS_OUTFIELD;
  }, [roleMain]);
  const strengthOptions = useMemo(() => {
    const specific = roleType ? (STRENGTHS_BY_ROLE_TYPE[roleType] ?? []) : [];
    return Array.from(new Set([...(baseStrengths as string[]), ...specific]));
  }, [baseStrengths, roleType]);

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
  const helpOptions = useMemo(() => {
    if (!roleMain) return [] as string[];
    return roleMain === "Goalkeeper" ? HELPS_TEAM_GK : HELPS_TEAM_OUTFIELD;
  }, [roleMain]);
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from("player_identities")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Failed to load identity", error);
        toast({ title: "Could not load identity", description: error.message, variant: "destructive" });
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
      setLoading(false);
    };

    load();
  }, [user, toast]);


  const onSave = async () => {
    if (!user) return;

    // Validation
    if (!roleMain) {
      toast({ title: "Main Role is required", variant: "destructive" });
      return;
    }
    if (!roleType) {
      toast({ title: "Role Type is required", variant: "destructive" });
      return;
    }
    if (motto.length > 140) {
      toast({ title: "Motto too long", description: "Max 140 characters.", variant: "destructive" });
      return;
    }
    if (main_weapon.length > 140) {
      toast({ title: "Main Weapon too long", description: "Max 140 characters.", variant: "destructive" });
      return;
    }

    setSaving(true);

    const payload: PlayerIdentityRow = {
      user_id: user.id,
      role_main: roleMain,
      role_type: roleType || null,
      strengths: strengths.slice(0, 3),
      helps_team: helpsTeam.slice(0, 3),
      main_weapon: main_weapon || null,
      motto: motto || null,
      avatar_url: avatar_url || null,
    };

    try {
      const { error } = await (supabase as any)
        .from("player_identities")
        .upsert(payload, { onConflict: "user_id" });
      if (error) throw error;
      setExisting(true);
      toast({
        title: "Identity locked. We’ll remind you before every game.",
      });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Save failed", description: e.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-20 pb-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Dna className="w-6 h-6" /> DNA
        </h1>
        <p className="text-muted-foreground">Define your on-field DNA</p>
        <div className="mt-3">
          <Button variant="secondary" asChild>
            <Link to="/dna/you">Learn About Your Footballer’s Hat</Link>
          </Button>
        </div>
      </header>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Your DNA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5">
            <div className="grid gap-2">
              <Label>Main Role</Label>
              <RoleBoxSelector
                roles={MAIN_ROLES}
                selected={roleMain}
                onSelect={(v) => setRoleMain(v as MainRole)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Role Type</Label>
              <RoleTypeGrid
                options={roleTypeOptions}
                selected={roleType}
                onSelect={setRoleType}
                disabled={!roleMain}
              />
            </div>

            <div className="grid gap-2">
              <Label>Top Strengths (max 3)</Label>
              <ChipMultiSelect
                options={strengthOptions}
                value={strengths}
                onChange={setStrengths}
                max={3}
                addYourOwn
                onAddCustom={async () => {
                  const input = window.prompt("Add your own strength (max 30 chars)") || "";
                  return input.trim().slice(0, 30) || null;
                }}
              />
            </div>

            <div className="grid gap-2">
              <Label>How you help the team (max 3)</Label>
              <ChipMultiSelect
                options={helpOptions}
                value={helpsTeam}
                onChange={setHelpsTeam}
                max={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="motto">Motto</Label>
              <Input
                id="motto"
                placeholder="A short motto that defines you"
                value={motto}
                maxLength={140}
                onChange={(e) => setMotto(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                {MOTTO_SUGGESTIONS.map((m) => (
                  <Button key={m} type="button" variant="secondary" size="sm" onClick={() => setMotto(m)}>
                    {m}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="weapon">Main Weapon (optional)</Label>
              <Input
                id="weapon"
                placeholder="One sentence about your standout skill"
                value={main_weapon}
                onChange={(e) => setMainWeapon(e.target.value.slice(0, 140))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="avatar">Avatar URL (optional)</Label>
              <Input
                id="avatar"
                placeholder="Link to an image"
                value={avatar_url}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
              {avatar_url && (
                <img
                  src={avatar_url}
                  alt="Player identity avatar"
                  className="w-24 h-24 rounded-md object-cover border"
                  loading="lazy"
                />
              )}
            </div>

            <div className="pt-2">
              <Button onClick={onSave} disabled={saving || loading}>
                {saving ? "Saving..." : existing ? "Save changes" : "Create identity"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

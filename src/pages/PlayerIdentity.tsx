import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Dna } from "lucide-react";

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

const ROLE_OPTIONS = ["Goalkeeper", "Defender", "Midfielder", "Attacker"] as const;

export default function PlayerIdentity() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState<boolean>(false);

  const [form, setForm] = useState<{
    role_main: PlayerIdentityRow["role_main"];
    role_type: string;
    strengthsCsv: string; // comma separated for UX
    helpsTeamCsv: string; // comma separated for UX
    main_weapon: string;
    motto: string;
    avatar_url: string;
  }>({
    role_main: null,
    role_type: "",
    strengthsCsv: "",
    helpsTeamCsv: "",
    main_weapon: "",
    motto: "",
    avatar_url: "",
  });

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
        setForm({
          role_main: data.role_main ?? null,
          role_type: data.role_type ?? "",
          strengthsCsv: Array.isArray(data.strengths) ? data.strengths.join(", ") : "",
          helpsTeamCsv: Array.isArray(data.helps_team) ? data.helps_team.join(", ") : "",
          main_weapon: data.main_weapon ?? "",
          motto: data.motto ?? "",
          avatar_url: data.avatar_url ?? "",
        });
      } else {
        setExisting(false);
      }
      setLoading(false);
    };

    load();
  }, [user, toast]);

  const parsedStrengths = useMemo(() => form.strengthsCsv.split(",").map(s => s.trim()).filter(Boolean).slice(0, 3), [form.strengthsCsv]);
  const parsedHelpsTeam = useMemo(() => form.helpsTeamCsv.split(",").map(s => s.trim()).filter(Boolean).slice(0, 3), [form.helpsTeamCsv]);

  const onSave = async () => {
    if (!user) return;
    setSaving(true);

    const payload: PlayerIdentityRow = {
      user_id: user.id,
      role_main: form.role_main,
      role_type: form.role_type || null,
      strengths: parsedStrengths,
      helps_team: parsedHelpsTeam,
      main_weapon: form.main_weapon || null,
      motto: form.motto || null,
      avatar_url: form.avatar_url || null,
    };

    try {
      if (existing) {
        const { error } = await (supabase as any)
          .from("player_identities")
          .update(payload)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("player_identities")
          .insert(payload);
        if (error) throw error;
        setExisting(true);
      }

      toast({ title: "Saved", description: "Your DNA was saved successfully." });
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
          <Dna className="w-6 h-6" /> Player Identity
        </h1>
        <p className="text-muted-foreground">Define your on-field DNA</p>
      </header>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Your DNA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="role_main">Main Role</Label>
              <Select
                value={form.role_main ?? undefined}
                onValueChange={(v) => setForm((f) => ({ ...f, role_main: v as PlayerIdentityRow["role_main"] }))}
              >
                <SelectTrigger id="role_main">
                  <SelectValue placeholder="Select your main role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role_type">Role Type</Label>
              <Input
                id="role_type"
                placeholder="e.g. Creator, Finisher"
                value={form.role_type}
                onChange={(e) => setForm((f) => ({ ...f, role_type: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="strengths">Top Strengths (max 3)</Label>
              <Input
                id="strengths"
                placeholder="Comma separated, e.g. Vision, Pace, Passing"
                value={form.strengthsCsv}
                onChange={(e) => setForm((f) => ({ ...f, strengthsCsv: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Current: {parsedStrengths.join(" • ") || "None"}</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="helps">How you help the team (max 3)</Label>
              <Input
                id="helps"
                placeholder="Comma separated, e.g. Create chances, Win duels"
                value={form.helpsTeamCsv}
                onChange={(e) => setForm((f) => ({ ...f, helpsTeamCsv: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Current: {parsedHelpsTeam.join(" • ") || "None"}</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="weapon">Main Weapon</Label>
              <Input
                id="weapon"
                placeholder="One sentence about your standout skill"
                value={form.main_weapon}
                onChange={(e) => setForm((f) => ({ ...f, main_weapon: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="motto">Motto</Label>
              <Input
                id="motto"
                placeholder="A short motto that defines you"
                value={form.motto}
                onChange={(e) => setForm((f) => ({ ...f, motto: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="avatar">Avatar URL (optional)</Label>
              <Input
                id="avatar"
                placeholder="Link to an image"
                value={form.avatar_url}
                onChange={(e) => setForm((f) => ({ ...f, avatar_url: e.target.value }))}
              />
              {form.avatar_url && (
                <img
                  src={form.avatar_url}
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

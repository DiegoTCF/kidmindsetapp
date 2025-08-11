import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, GraduationCap, Home, Medal } from "lucide-react";

const radioOptions = [
  "Frustrated but ready to work",
  "Like I’m not good enough",
  "I forget it quickly and move on",
] as const;

export default function DNAYou() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  const [q4, setQ4] = useState<typeof radioOptions[number] | "">("");
  const [q5, setQ5] = useState("");
  const [q6, setQ6] = useState("");

  useEffect(() => {
    // SEO: title, description, canonical
    const prevTitle = document.title;
    document.title = "Footballer’s Hat – Your DNA";

    const metaDesc = document.querySelector('meta[name="description"]');
    const createdDesc = !metaDesc;
    const el = metaDesc || document.createElement("meta");
    el.setAttribute("name", "description");
    el.setAttribute("content", "Learn the Footballer’s Hat story and take a quick self-awareness quiz.");
    if (createdDesc) document.head.appendChild(el);

    const linkCanonical = document.querySelector('link[rel="canonical"]') || document.createElement("link");
    linkCanonical.setAttribute("rel", "canonical");
    linkCanonical.setAttribute("href", window.location.origin + "/dna/you");
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
        .from("player_identity_hats")
        .select("q1,q2,q3,q4,q5,q6")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Failed to load hats quiz", error);
      }

      if (data) {
        setQ1(data.q1 ?? "");
        setQ2(data.q2 ?? "");
        setQ3(data.q3 ?? "");
        setQ4((data.q4 as any) ?? "");
        setQ5(data.q5 ?? "");
        setQ6(data.q6 ?? "");
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const validate = () => {
    const within = (s: string) => s.length <= 140;
    if (!within(q1) || !within(q2) || !within(q3) || !within(q5) || !within(q6)) {
      toast({ title: "Answers too long", description: "Keep each answer under 140 characters.", variant: "destructive" });
      return false;
    }
    if (!q4 || !radioOptions.includes(q4 as any)) {
      toast({ title: "Choose an option for Q4", variant: "destructive" });
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    if (!user) return;
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        q1, q2, q3, q4, q5, q6,
      };
      const { error } = await (supabase as any)
        .from("player_identity_hats")
        .upsert(payload, { onConflict: "user_id" });
      if (error) throw error;
      toast({ title: "Saved", description: "Your answers were saved." });
      setSubmitted(true);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Save failed", description: e.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const Summary = useMemo(() => (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Summary – Your Hats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>Family Hat, School Hat, Footballer’s Hat, Qualities Hat.</p>
        <div className="grid gap-2">
          <div><span className="font-medium text-foreground">Q1</span>: {q1 || "—"}</div>
          <div><span className="font-medium text-foreground">Q2</span>: {q2 || "—"}</div>
          <div><span className="font-medium text-foreground">Q3</span>: {q3 || "—"}</div>
          <div><span className="font-medium text-foreground">Q4</span>: {q4 || "—"}</div>
          <div><span className="font-medium text-foreground">Q5</span>: {q5 || "—"}</div>
          <div><span className="font-medium text-foreground">Q6</span>: {q6 || "—"}</div>
        </div>
        <p className="pt-1 text-foreground">You are all your hats, not just one. A bad day doesn’t change who you are.</p>
        <div className="pt-2">
          <Button variant="secondary" onClick={() => setSubmitted(false)}>Retake quiz</Button>
        </div>
      </CardContent>
    </Card>
  ), [q1,q2,q3,q4,q5,q6]);

  return (
    <div className="max-w-3xl mx-auto px-4 pt-20 pb-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">The Footballer’s Hat</h1>
        <p className="text-muted-foreground">A quick story and self-check to build real confidence.</p>
      </header>

      {/* Story */}
      <section aria-labelledby="story" className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle id="story">1️⃣ The Hat Rack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>Think of your life like a hat rack with different hats hanging on it.</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2"><Home className="h-5 w-5" aria-hidden /> <span>A Family Hat – who you are at home.</span></li>
                <li className="flex items-center gap-2"><GraduationCap className="h-5 w-5" aria-hidden /> <span>A School Hat – who you are in the classroom or with friends.</span></li>
                <li className="flex items-center gap-2"><Trophy className="h-5 w-5" aria-hidden /> <span>A Footballer’s Hat – who you are on the pitch.</span></li>
                <li className="flex items-center gap-2"><Medal className="h-5 w-5" aria-hidden /> <span>A Qualities Hat – the traits that make you… you (kind, funny, hardworking, resilient).</span></li>
              </ul>
              <p>You don’t just wear one hat. You switch between them every day.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2️⃣ Match Day Reality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>Some days, your Footballer’s Hat feels amazing — you’ve had a great match, made smart decisions, maybe scored a goal. Other days, it feels heavy — mistakes, missed chances, bad passes.</p>
              <p>Here’s the truth: a bad game doesn’t make you less valuable as a person. It just means that on that day, that hat didn’t feel great — but the others are still on the rack, just as strong.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3️⃣ The Bad Day Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>If you had a poor game, does it make you a worse friend? A worse brother or sister? Does it erase the effort you’ve put into training or the kindness you show others? No. It’s one part of who you are — not the whole picture.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4️⃣ Why Your Hats Are Unique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>Every Footballer’s Hat is different — yours might say:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Quick thinker</li>
                <li>Great first touch</li>
                <li>Leader under pressure</li>
              </ul>
              <p>Your other hats carry different strengths — your school hat, your family hat, your qualities hat. No one else has the exact combination you do. That’s what makes you unique.</p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>5️⃣ The Lesson</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>When you know your value comes from all your hats, you stop letting one bad game decide your worth. Your Footballer’s Hat can have ups and downs — but you still have all the other hats that make you who you are.</p>
              <p className="font-medium">Key Line:</p>
              <p className="italic">“A bad day doesn’t change who I am — it just means I’ve got something to work on.”</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quiz */}
      <section aria-labelledby="quiz">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle id="quiz">Know Your Hats – Quick Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {submitted ? (
              Summary
            ) : (
              <div className="space-y-5">
                <div className="grid gap-2">
                  <Label>1. List 3 qualities you’re proud of that have nothing to do with football.</Label>
                  <Input value={q1} onChange={(e) => setQ1(e.target.value.slice(0,140))} placeholder="e.g. kind, funny, loyal" />
                </div>
                <div className="grid gap-2">
                  <Label>2. What’s one thing you do well as a footballer?</Label>
                  <Input value={q2} onChange={(e) => setQ2(e.target.value.slice(0,140))} placeholder="e.g. first touch, vision" />
                </div>
                <div className="grid gap-2">
                  <Label>3. What’s one thing you want to improve in your game?</Label>
                  <Input value={q3} onChange={(e) => setQ3(e.target.value.slice(0,140))} placeholder="e.g. weak foot, scanning" />
                </div>
                <div className="grid gap-2">
                  <Label>4. If you have a bad match, how does it usually make you feel?</Label>
                  <RadioGroup value={q4} onValueChange={(v) => setQ4(v as any)}>
                    {radioOptions.map((opt) => (
                      <div key={opt} className="flex items-center space-x-2">
                        <RadioGroupItem id={opt} value={opt} />
                        <Label htmlFor={opt}>{opt}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="grid gap-2">
                  <Label>5. What’s one thing you could tell yourself after a bad game?</Label>
                  <Input value={q5} onChange={(e) => setQ5(e.target.value.slice(0,140))} placeholder="e.g. Next play. Best play." />
                </div>
                <div className="grid gap-2">
                  <Label>6. Which “hat” are you wearing when you feel the most confident? Why?</Label>
                  <Input value={q6} onChange={(e) => setQ6(e.target.value.slice(0,140))} placeholder="e.g. School – because I lead group projects" />
                </div>
                <div className="pt-2">
                  <Button onClick={onSubmit} disabled={saving || loading}>{saving ? "Saving..." : "Save & See Summary"}</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

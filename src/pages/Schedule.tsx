import React, { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const ACTIVITY_TYPES = [
  "Team training",
  "1to1",
  "Small group/Futsal",
  "Match",
  "Other",
] as const;

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

type DayKey = (typeof DAYS)[number];

type WeeklySchedule = Record<string, string | undefined>;

function toKey(day: DayKey) {
  return day.toLowerCase();
}

function getNextDateForWeekday(targetDay: DayKey): Date {
  const dayIndex = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].indexOf(targetDay);
  const now = new Date();
  const result = new Date(now);
  const diff = (dayIndex - now.getDay() + 7) % 7 || 7; // next occurrence (not today)
  result.setDate(now.getDate() + diff);
  result.setHours(12,0,0,0);
  return result;
}

const Schedule: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [childId, setChildId] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<WeeklySchedule>({});
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [editDay, setEditDay] = useState<DayKey | null>(null);
  const [selectedType, setSelectedType] = useState<string>("");

  const [skipOpen, setSkipOpen] = useState(false);
  const [skipDay, setSkipDay] = useState<DayKey | null>(null);
  const [skipDate, setSkipDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    document.title = "Weekly Schedule | KidMindset";
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: idData, error: idError } = await supabase.rpc("get_current_user_child_id");
      if (idError || !idData) {
        setLoading(false);
        toast({ title: "Couldn’t load schedule", description: idError?.message || "No child found" });
        return;
      }
      setChildId(idData);

      const { data, error } = await supabase
        .from("children")
        .select("weekly_schedule")
        .eq("id", idData)
        .single();

      if (error) {
        toast({ title: "Failed to load schedule", description: error.message });
      } else {
        try {
          const parsed: WeeklySchedule = data?.weekly_schedule ? JSON.parse(data.weekly_schedule) : {};
          setSchedule(parsed || {});
        } catch (e) {
          setSchedule({});
        }
      }
      setLoading(false);
    };
    load();
  }, [toast]);

  const handleEdit = (day: DayKey) => {
    setEditDay(day);
    const current = schedule[toKey(day)] || "";
    setSelectedType(current);
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editDay || !childId) return;
    const key = toKey(editDay);
    const next = { ...schedule };
    next[key] = selectedType || undefined;

    const { error } = await supabase
      .from("children")
      .update({ weekly_schedule: JSON.stringify(next) })
      .eq("id", childId);

    if (error) {
      toast({ title: "Failed to save", description: error.message });
    } else {
      setSchedule(next);
      toast({ title: "Schedule updated", description: `${editDay} set to ${selectedType || "None"}` });
    }
    setEditOpen(false);
  };

  const handleDeletePermanent = async (day: DayKey) => {
    if (!childId) return;
    const key = toKey(day);
    const next = { ...schedule };
    delete next[key];

    const { error } = await supabase
      .from("children")
      .update({ weekly_schedule: JSON.stringify(next) })
      .eq("id", childId);

    if (error) {
      toast({ title: "Failed to delete", description: error.message });
    } else {
      setSchedule(next);
      toast({ title: "Removed from weekly plan", description: `${day} cleared` });
    }
  };

  const handleDeleteOnce = (day: DayKey) => {
    setSkipDay(day);
    setSkipDate(getNextDateForWeekday(day));
    setSkipOpen(true);
  };

  const confirmSkipOnce = async () => {
    if (!childId || !skipDay || !skipDate) return;
    const { error } = await supabase
      .from("schedule_overrides")
      .insert({
        child_id: childId,
        override_date: skipDate.toISOString().slice(0,10),
        override_type: "skip",
        note: `${skipDay} skipped from schedule`
      });

    if (error) {
      toast({ title: "Failed to schedule skip", description: error.message });
    } else {
      toast({ title: "One-off removed", description: `${skipDay} on ${skipDate.toDateString()} will be skipped` });
    }
    setSkipOpen(false);
  };

  const dayCards = useMemo(() => {
    return DAYS.map((day) => {
      const key = toKey(day);
      const activity = schedule[key];
      return (
        <Card key={day} className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{day}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">
              {activity ? activity : "No activity planned"}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleEdit(day)}>Edit</Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/stadium')}>Add extra</Button>
              <Button variant="destructive" size="sm" onClick={() => handleDeletePermanent(day)}>Delete</Button>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteOnce(day)}>Delete once</Button>
            </div>
          </CardContent>
        </Card>
      );
    });
  }, [schedule, navigate]);

  return (
    <AppLayout>
      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Weekly Schedule</h1>
          <p className="text-muted-foreground text-sm">Plan for the week with quick edit and one-off changes.</p>
        </header>

        {loading ? (
          <div className="text-center text-muted-foreground">Loading schedule...</div>
        ) : (
          <section className="space-y-3" aria-label="Weekly schedule">
            {dayCards}
          </section>
        )}
      </main>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editDay}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger aria-label="Activity type">
                <SelectValue placeholder="Select activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {ACTIVITY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* One-off skip dialog */}
      <Dialog open={skipOpen} onOpenChange={setSkipOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skip {skipDay} once</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Calendar mode="single" selected={skipDate} onSelect={setSkipDate} disabled={(d) => d < new Date()} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSkipOpen(false)}>Cancel</Button>
            <Button onClick={confirmSkipOnce} disabled={!skipDate}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Schedule;

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Pencil } from "lucide-react";

interface Activity {
  id: string;
  activity_name: string;
  activity_type: string;
  activity_date: string;
  final_score?: string;
  goals_scored?: number;
  assists_made?: number;
  pre_activity_completed: boolean;
  post_activity_completed: boolean;
  pre_activity_data?: any;
  post_activity_data?: any;
  points_awarded: number;
  created_at: string;
  worry_reason?: string;
  worry_answers?: any;
}

interface EditActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: Activity;
  onSaved: () => void;
}

export function EditActivityDialog({
  open,
  onOpenChange,
  activity,
  onSaved,
}: EditActivityDialogProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Basic info state
  const [activityName, setActivityName] = useState(activity.activity_name);
  const [activityType, setActivityType] = useState(activity.activity_type);
  const [activityDate, setActivityDate] = useState(activity.activity_date);
  const [finalScore, setFinalScore] = useState(activity.final_score || "");
  const [goalsScored, setGoalsScored] = useState(activity.goals_scored || 0);
  const [assistsMade, setAssistsMade] = useState(activity.assists_made || 0);

  // Pre-activity data state
  const [preConfidence, setPreConfidence] = useState(
    activity.pre_activity_data?.confidence || 5
  );
  const [preIntention, setPreIntention] = useState(
    activity.pre_activity_data?.intention || ""
  );

  // Post-activity data state
  const [postMood, setPostMood] = useState(
    activity.post_activity_data?.mood || 3
  );
  const [postConfidence, setPostConfidence] = useState(
    activity.post_activity_data?.confidence || 5
  );
  const [postSatisfaction, setPostSatisfaction] = useState(
    activity.post_activity_data?.satisfaction || 5
  );
  const [wentWell, setWentWell] = useState(
    activity.post_activity_data?.journalPrompts?.wentWell || ""
  );
  const [couldImprove, setCouldImprove] = useState(
    activity.post_activity_data?.journalPrompts?.couldImprove || ""
  );
  const [whatAffected, setWhatAffected] = useState(
    activity.post_activity_data?.journalPrompts?.whatAffected || ""
  );

  // Reset state when activity changes
  useEffect(() => {
    if (open && activity) {
      setActivityName(activity.activity_name);
      setActivityType(activity.activity_type);
      setActivityDate(activity.activity_date);
      setFinalScore(activity.final_score || "");
      setGoalsScored(activity.goals_scored || 0);
      setAssistsMade(activity.assists_made || 0);
      setPreConfidence(activity.pre_activity_data?.confidence || 5);
      setPreIntention(activity.pre_activity_data?.intention || "");
      setPostMood(activity.post_activity_data?.mood || 3);
      setPostConfidence(activity.post_activity_data?.confidence || 5);
      setPostSatisfaction(activity.post_activity_data?.satisfaction || 5);
      setWentWell(activity.post_activity_data?.journalPrompts?.wentWell || "");
      setCouldImprove(
        activity.post_activity_data?.journalPrompts?.couldImprove || ""
      );
      setWhatAffected(
        activity.post_activity_data?.journalPrompts?.whatAffected || ""
      );
    }
  }, [open, activity]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Build updated pre_activity_data
      const updatedPreActivityData = activity.pre_activity_data
        ? {
            ...activity.pre_activity_data,
            confidence: preConfidence,
            intention: preIntention,
          }
        : activity.pre_activity_completed
        ? { confidence: preConfidence, intention: preIntention }
        : null;

      // Build updated post_activity_data
      const updatedPostActivityData = activity.post_activity_data
        ? {
            ...activity.post_activity_data,
            mood: postMood,
            confidence: postConfidence,
            satisfaction: postSatisfaction,
            journalPrompts: {
              ...activity.post_activity_data.journalPrompts,
              wentWell,
              couldImprove,
              whatAffected,
            },
          }
        : activity.post_activity_completed
        ? {
            mood: postMood,
            confidence: postConfidence,
            satisfaction: postSatisfaction,
            journalPrompts: { wentWell, couldImprove, whatAffected },
          }
        : null;

      const updateData: any = {
        activity_name: activityName,
        activity_type: activityType,
        activity_date: activityDate,
        updated_at: new Date().toISOString(),
      };

      // Only include match-specific fields for Match type
      if (activityType === "Match") {
        updateData.final_score = finalScore || null;
        updateData.goals_scored = goalsScored;
        updateData.assists_made = assistsMade;
      }

      // Only update pre/post data if they exist
      if (updatedPreActivityData) {
        updateData.pre_activity_data = updatedPreActivityData;
      }
      if (updatedPostActivityData) {
        updateData.post_activity_data = updatedPostActivityData;
      }

      const { error } = await supabase
        .from("activities")
        .update(updateData)
        .eq("id", activity.id);

      if (error) throw error;

      toast({
        title: "Activity Updated",
        description: "Your activity has been saved successfully.",
      });

      onSaved();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving activity:", error);
      toast({
        title: "Error",
        description: "Failed to save activity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const activityTypes = [
    "Match",
    "Training",
    "1to1",
    "Futsal",
    "Small Group",
    "Other",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5" />
            Edit Activity
          </DialogTitle>
          <DialogDescription>
            Update your activity details, pre-match preparation, and
            post-activity reflections.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger
              value="pre"
              disabled={!activity.pre_activity_completed}
            >
              Pre-Activity
            </TabsTrigger>
            <TabsTrigger
              value="post"
              disabled={!activity.post_activity_completed}
            >
              Post-Activity
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="activity-name">Activity Name</Label>
              <Input
                id="activity-name"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                placeholder="Enter activity name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity-type">Activity Type</Label>
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity-date">Date</Label>
              <Input
                id="activity-date"
                type="date"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
              />
            </div>

            {activityType === "Match" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="final-score">Final Score</Label>
                  <Input
                    id="final-score"
                    value={finalScore}
                    onChange={(e) => setFinalScore(e.target.value)}
                    placeholder="e.g., 2-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goals">Goals Scored</Label>
                    <Input
                      id="goals"
                      type="number"
                      min="0"
                      value={goalsScored}
                      onChange={(e) =>
                        setGoalsScored(parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assists">Assists Made</Label>
                    <Input
                      id="assists"
                      type="number"
                      min="0"
                      value={assistsMade}
                      onChange={(e) =>
                        setAssistsMade(parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Pre-Activity Tab */}
          <TabsContent value="pre" className="space-y-4 mt-4">
            {activity.pre_activity_completed ? (
              <>
                <div className="space-y-3">
                  <Label>Confidence Level: {preConfidence}/10</Label>
                  <Slider
                    value={[preConfidence]}
                    onValueChange={(value) => setPreConfidence(value[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pre-intention">Intention</Label>
                  <Textarea
                    id="pre-intention"
                    value={preIntention}
                    onChange={(e) => setPreIntention(e.target.value)}
                    placeholder="What was your intention for this activity?"
                    rows={3}
                  />
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No pre-activity data recorded for this activity.
              </p>
            )}
          </TabsContent>

          {/* Post-Activity Tab */}
          <TabsContent value="post" className="space-y-4 mt-4">
            {activity.post_activity_completed ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Mood: {postMood}/5</Label>
                    <Slider
                      value={[postMood]}
                      onValueChange={(value) => setPostMood(value[0])}
                      min={1}
                      max={5}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confidence: {postConfidence}/10</Label>
                    <Slider
                      value={[postConfidence]}
                      onValueChange={(value) => setPostConfidence(value[0])}
                      min={1}
                      max={10}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Satisfaction: {postSatisfaction}/10</Label>
                    <Slider
                      value={[postSatisfaction]}
                      onValueChange={(value) => setPostSatisfaction(value[0])}
                      min={1}
                      max={10}
                      step={1}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="went-well">What went well?</Label>
                  <Textarea
                    id="went-well"
                    value={wentWell}
                    onChange={(e) => setWentWell(e.target.value)}
                    placeholder="What went well during this activity?"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="could-improve">What could improve?</Label>
                  <Textarea
                    id="could-improve"
                    value={couldImprove}
                    onChange={(e) => setCouldImprove(e.target.value)}
                    placeholder="What could you improve on?"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="what-affected">What affected you today?</Label>
                  <Textarea
                    id="what-affected"
                    value={whatAffected}
                    onChange={(e) => setWhatAffected(e.target.value)}
                    placeholder="What affected your performance today?"
                    rows={2}
                  />
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No post-activity data recorded for this activity.
              </p>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !activityName.trim()}>
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

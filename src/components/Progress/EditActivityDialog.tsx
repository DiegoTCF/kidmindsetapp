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
import { Loader2, Save, Pencil, CheckCircle, Circle, AlertCircle, HelpCircle, Zap, Target, Shield, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Activity {
  id: string;
  activity_name: string;
  activity_type: string;
  activity_date: string;
  child_id: string;
  final_score?: string;
  goals_scored?: number;
  assists_made?: number;
  pre_activity_completed: boolean;
  post_activity_completed: boolean;
  pre_activity_data?: any;
  post_activity_data?: any;
  pre_confidence_excited?: number;
  pre_confidence_nervous?: number;
  pre_confidence_body_ready?: number;
  pre_confidence_believe_well?: number;
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

// Mood options matching the original form
const moodOptions = [
  { emoji: "😢", label: "Sad", value: 1 },
  { emoji: "😕", label: "Not Great", value: 2 },
  { emoji: "😐", label: "Okay", value: 3 },
  { emoji: "😊", label: "Good", value: 4 },
  { emoji: "😁", label: "Amazing", value: 5 },
];

// Intention achieved options
const intentionOptions = [
  { value: "yes", label: "Yes!", icon: CheckCircle, color: "text-green-500" },
  { value: "partial", label: "Partially", icon: Circle, color: "text-primary" },
  { value: "no", label: "No", icon: AlertCircle, color: "text-destructive" },
  { value: "forgot", label: "Forgot", icon: HelpCircle, color: "text-yellow-500" },
];

// Behaviour type configuration
const behaviourTypes = [
  { 
    key: "braveOnBall", 
    dbKey: "brave_on_ball",
    label: "Brave on Ball", 
    icon: Shield,
    questions: [
      "Taking on 1v1s with determination",
      "Asking for the ball in tight spaces",
      "Making bold decisions on the ball",
      "Not being afraid to make mistakes"
    ]
  },
  { 
    key: "braveOffBall", 
    dbKey: "brave_off_ball",
    label: "Brave off Ball", 
    icon: Target,
    questions: [
      "Making runs into dangerous areas",
      "Pressing the opponent aggressively",
      "Taking responsibility in defence",
      "Being always available for teammates"
    ]
  },
  { 
    key: "electric", 
    dbKey: "electric",
    label: "Electric", 
    icon: Zap,
    questions: [
      "Playing with high energy",
      "Moving quickly and sharply",
      "Bringing intensity to the game",
      "Keeping the tempo high"
    ]
  },
  { 
    key: "aggressive", 
    dbKey: "aggressive",
    label: "Aggressive", 
    icon: Swords,
    questions: [
      "Winning physical battles",
      "Being first to every ball",
      "Showing determination in tackles",
      "Playing with a warrior mentality"
    ]
  },
];

export function EditActivityDialog({
  open,
  onOpenChange,
  activity,
  onSaved,
}: EditActivityDialogProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loadingBehaviours, setLoadingBehaviours] = useState(false);

  // Basic info state
  const [activityName, setActivityName] = useState(activity.activity_name);
  const [activityType, setActivityType] = useState(activity.activity_type);
  const [activityDate, setActivityDate] = useState(activity.activity_date);
  const [finalScore, setFinalScore] = useState(activity.final_score || "");
  const [goalsScored, setGoalsScored] = useState(activity.goals_scored || 0);
  const [assistsMade, setAssistsMade] = useState(activity.assists_made || 0);

  // Pre-activity confidence ratings (4 questions)
  const [confidenceRatings, setConfidenceRatings] = useState({
    excited: 5,
    nervous: 5,
    bodyReady: 5,
    believeWell: 5,
  });
  const [preIntention, setPreIntention] = useState("");

  // Post-activity reflections
  const [mood, setMood] = useState<number | null>(null);
  const [intentionAchieved, setIntentionAchieved] = useState<string | null>(null);
  const [reflections, setReflections] = useState({
    workRate: 5,
    confidence: 5,
    focus: 5,
    mistakes: 5,
    performance: 5,
  });
  const [journalPrompts, setJournalPrompts] = useState({
    wentWell: "",
    couldImprove: "",
    whatAffected: "",
  });
  const [bestSelfScore, setBestSelfScore] = useState(50);

  // Super behaviours (4 types, 4 questions each)
  const [superBehaviours, setSuperBehaviours] = useState({
    braveOnBall: { q1: 5, q2: 5, q3: 5, q4: 5 },
    braveOffBall: { q1: 5, q2: 5, q3: 5, q4: 5 },
    electric: { q1: 5, q2: 5, q3: 5, q4: 5 },
    aggressive: { q1: 5, q2: 5, q3: 5, q4: 5 },
  });

  // Load all data when dialog opens
  useEffect(() => {
    if (open && activity) {
      loadActivityData();
      loadBehaviourRatings();
      loadBestSelfScore();
    }
  }, [open, activity]);

  const loadActivityData = () => {
    // Basic info
    setActivityName(activity.activity_name);
    setActivityType(activity.activity_type);
    setActivityDate(activity.activity_date);
    setFinalScore(activity.final_score || "");
    setGoalsScored(activity.goals_scored || 0);
    setAssistsMade(activity.assists_made || 0);

    // Pre-activity data - check both JSON and individual columns
    const preData = activity.pre_activity_data;
    const confidenceFromJson = preData?.confidenceRatings;
    
    setConfidenceRatings({
      excited: confidenceFromJson?.excited ?? activity.pre_confidence_excited ?? 5,
      nervous: confidenceFromJson?.nervous ?? activity.pre_confidence_nervous ?? 5,
      bodyReady: confidenceFromJson?.bodyReady ?? activity.pre_confidence_body_ready ?? 5,
      believeWell: confidenceFromJson?.believeWell ?? activity.pre_confidence_believe_well ?? 5,
    });
    setPreIntention(preData?.intention || "");

    // Post-activity data
    const postData = activity.post_activity_data;
    setMood(postData?.mood ?? null);
    setIntentionAchieved(postData?.intentionAchieved ?? null);
    setReflections({
      workRate: postData?.workRate ?? 5,
      confidence: postData?.confidence ?? 5,
      focus: postData?.focus ?? 5,
      mistakes: postData?.mistakes ?? 5,
      performance: postData?.performance ?? 5,
    });
    setJournalPrompts({
      wentWell: postData?.journalPrompts?.wentWell || "",
      couldImprove: postData?.journalPrompts?.couldImprove || "",
      whatAffected: postData?.journalPrompts?.whatAffected || "",
    });

    // Load super behaviours from post_activity_data if available
    const behaviours = postData?.superBehaviours;
    if (behaviours) {
      setSuperBehaviours({
        braveOnBall: {
          q1: behaviours.braveOnBall?.question1 ?? 5,
          q2: behaviours.braveOnBall?.question2 ?? 5,
          q3: behaviours.braveOnBall?.question3 ?? 5,
          q4: behaviours.braveOnBall?.question4 ?? 5,
        },
        braveOffBall: {
          q1: behaviours.braveOffBall?.question1 ?? 5,
          q2: behaviours.braveOffBall?.question2 ?? 5,
          q3: behaviours.braveOffBall?.question3 ?? 5,
          q4: behaviours.braveOffBall?.question4 ?? 5,
        },
        electric: {
          q1: behaviours.electric?.question1 ?? 5,
          q2: behaviours.electric?.question2 ?? 5,
          q3: behaviours.electric?.question3 ?? 5,
          q4: behaviours.electric?.question4 ?? 5,
        },
        aggressive: {
          q1: behaviours.aggressive?.question1 ?? 5,
          q2: behaviours.aggressive?.question2 ?? 5,
          q3: behaviours.aggressive?.question3 ?? 5,
          q4: behaviours.aggressive?.question4 ?? 5,
        },
      });
    }
  };

  const loadBehaviourRatings = async () => {
    setLoadingBehaviours(true);
    try {
      const { data, error } = await supabase
        .from("super_behaviour_ratings")
        .select("*")
        .eq("activity_id", activity.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const updatedBehaviours = { ...superBehaviours };
        data.forEach((rating) => {
          const typeMap: Record<string, keyof typeof updatedBehaviours> = {
            brave_on_ball: "braveOnBall",
            brave_off_ball: "braveOffBall",
            electric: "electric",
            aggressive: "aggressive",
          };
          const key = typeMap[rating.behaviour_type];
          if (key) {
            updatedBehaviours[key] = {
              q1: rating.question_1_rating ?? 5,
              q2: rating.question_2_rating ?? 5,
              q3: rating.question_3_rating ?? 5,
              q4: rating.question_4_rating ?? 5,
            };
          }
        });
        setSuperBehaviours(updatedBehaviours);
      }
    } catch (error) {
      console.error("Error loading behaviour ratings:", error);
    } finally {
      setLoadingBehaviours(false);
    }
  };

  const loadBestSelfScore = async () => {
    try {
      const { data, error } = await supabase
        .from("best_self_scores")
        .select("score")
        .eq("activity_id", activity.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setBestSelfScore(data.score);
      }
    } catch (error) {
      console.error("Error loading best self score:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Build updated pre_activity_data
      const updatedPreActivityData = activity.pre_activity_completed
        ? {
            ...activity.pre_activity_data,
            confidenceRatings,
            intention: preIntention,
          }
        : null;

      // Build updated post_activity_data
      const updatedPostActivityData = activity.post_activity_completed
        ? {
            ...activity.post_activity_data,
            mood,
            intentionAchieved,
            workRate: reflections.workRate,
            confidence: reflections.confidence,
            focus: reflections.focus,
            mistakes: reflections.mistakes,
            performance: reflections.performance,
            journalPrompts,
            superBehaviours: {
              braveOnBall: {
                question1: superBehaviours.braveOnBall.q1,
                question2: superBehaviours.braveOnBall.q2,
                question3: superBehaviours.braveOnBall.q3,
                question4: superBehaviours.braveOnBall.q4,
              },
              braveOffBall: {
                question1: superBehaviours.braveOffBall.q1,
                question2: superBehaviours.braveOffBall.q2,
                question3: superBehaviours.braveOffBall.q3,
                question4: superBehaviours.braveOffBall.q4,
              },
              electric: {
                question1: superBehaviours.electric.q1,
                question2: superBehaviours.electric.q2,
                question3: superBehaviours.electric.q3,
                question4: superBehaviours.electric.q4,
              },
              aggressive: {
                question1: superBehaviours.aggressive.q1,
                question2: superBehaviours.aggressive.q2,
                question3: superBehaviours.aggressive.q3,
                question4: superBehaviours.aggressive.q4,
              },
            },
          }
        : null;

      // Main activity update
      const updateData: any = {
        activity_name: activityName,
        activity_type: activityType,
        activity_date: activityDate,
        updated_at: new Date().toISOString(),
      };

      // Match-specific fields
      if (activityType === "Match") {
        updateData.final_score = finalScore || null;
        updateData.goals_scored = goalsScored;
        updateData.assists_made = assistsMade;
      }

      // Pre-activity data and columns
      if (updatedPreActivityData) {
        updateData.pre_activity_data = updatedPreActivityData;
        updateData.pre_confidence_excited = confidenceRatings.excited;
        updateData.pre_confidence_nervous = confidenceRatings.nervous;
        updateData.pre_confidence_body_ready = confidenceRatings.bodyReady;
        updateData.pre_confidence_believe_well = confidenceRatings.believeWell;
      }

      // Post-activity data
      if (updatedPostActivityData) {
        updateData.post_activity_data = updatedPostActivityData;
      }

      const { error: activityError } = await supabase
        .from("activities")
        .update(updateData)
        .eq("id", activity.id);

      if (activityError) throw activityError;

      // Upsert super behaviour ratings
      if (activity.post_activity_completed) {
        const behaviourRecords = behaviourTypes.map((type) => ({
          activity_id: activity.id,
          child_id: activity.child_id,
          behaviour_type: type.dbKey,
          question_1_rating: superBehaviours[type.key as keyof typeof superBehaviours].q1,
          question_2_rating: superBehaviours[type.key as keyof typeof superBehaviours].q2,
          question_3_rating: superBehaviours[type.key as keyof typeof superBehaviours].q3,
          question_4_rating: superBehaviours[type.key as keyof typeof superBehaviours].q4,
          average_score:
            (superBehaviours[type.key as keyof typeof superBehaviours].q1 +
              superBehaviours[type.key as keyof typeof superBehaviours].q2 +
              superBehaviours[type.key as keyof typeof superBehaviours].q3 +
              superBehaviours[type.key as keyof typeof superBehaviours].q4) /
            4,
        }));

        const { error: behaviourError } = await supabase
          .from("super_behaviour_ratings")
          .upsert(behaviourRecords, { onConflict: "activity_id,behaviour_type" });

        if (behaviourError) {
          console.error("Error saving behaviour ratings:", behaviourError);
        }

        // Upsert best self score
        const { error: bestSelfError } = await supabase
          .from("best_self_scores")
          .upsert(
            {
              activity_id: activity.id,
              user_id: activity.child_id, // child_id is treated as user_id in this context
              score: bestSelfScore,
            },
            { onConflict: "activity_id" }
          );

        if (bestSelfError) {
          console.error("Error saving best self score:", bestSelfError);
        }
      }

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

  const updateBehaviour = (
    behaviourKey: keyof typeof superBehaviours,
    questionKey: "q1" | "q2" | "q3" | "q4",
    value: number
  ) => {
    setSuperBehaviours((prev) => ({
      ...prev,
      [behaviourKey]: {
        ...prev[behaviourKey],
        [questionKey]: value,
      },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5" />
            Edit Activity
          </DialogTitle>
          <DialogDescription>
            Update activity details, reflections, and behaviour ratings.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4 mx-6 max-w-[calc(100%-48px)]">
            <TabsTrigger value="basic" className="text-xs">Basic</TabsTrigger>
            <TabsTrigger value="pre" disabled={!activity.pre_activity_completed} className="text-xs">
              Pre
            </TabsTrigger>
            <TabsTrigger value="post" disabled={!activity.post_activity_completed} className="text-xs">
              Post
            </TabsTrigger>
            <TabsTrigger value="behaviours" disabled={!activity.post_activity_completed} className="text-xs">
              Behaviours
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-6">
            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 mt-4 pb-4">
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
                        onChange={(e) => setGoalsScored(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assists">Assists Made</Label>
                      <Input
                        id="assists"
                        type="number"
                        min="0"
                        value={assistsMade}
                        onChange={(e) => setAssistsMade(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Pre-Activity Tab */}
            <TabsContent value="pre" className="space-y-4 mt-4 pb-4">
              {activity.pre_activity_completed ? (
                <>
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Confidence Check-in</h3>
                    
                    {/* Excited */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>How excited are you to play?</Label>
                        <span className="text-sm font-medium">{confidenceRatings.excited}/10</span>
                      </div>
                      <Slider
                        value={[confidenceRatings.excited]}
                        onValueChange={(v) => setConfidenceRatings((p) => ({ ...p, excited: v[0] }))}
                        min={0}
                        max={10}
                        step={0.5}
                      />
                    </div>

                    {/* Nervous/Calm */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>How nervous or calm do you feel?</Label>
                        <span className="text-sm font-medium">{confidenceRatings.nervous}/10</span>
                      </div>
                      <Slider
                        value={[confidenceRatings.nervous]}
                        onValueChange={(v) => setConfidenceRatings((p) => ({ ...p, nervous: v[0] }))}
                        min={0}
                        max={10}
                        step={0.5}
                      />
                      <p className="text-xs text-muted-foreground">1 = very nervous, 10 = very calm</p>
                    </div>

                    {/* Body Ready */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>How ready does your body feel?</Label>
                        <span className="text-sm font-medium">{confidenceRatings.bodyReady}/10</span>
                      </div>
                      <Slider
                        value={[confidenceRatings.bodyReady]}
                        onValueChange={(v) => setConfidenceRatings((p) => ({ ...p, bodyReady: v[0] }))}
                        min={0}
                        max={10}
                        step={0.5}
                      />
                    </div>

                    {/* Believe Well */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>How much do you believe you can do well?</Label>
                        <span className="text-sm font-medium">{confidenceRatings.believeWell}/10</span>
                      </div>
                      <Slider
                        value={[confidenceRatings.believeWell]}
                        onValueChange={(v) => setConfidenceRatings((p) => ({ ...p, believeWell: v[0] }))}
                        min={0}
                        max={10}
                        step={0.5}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pre-intention">Intention for this activity</Label>
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
            <TabsContent value="post" className="space-y-4 mt-4 pb-4">
              {activity.post_activity_completed ? (
                <>
                  {/* Mood Selection */}
                  <div className="space-y-2">
                    <Label>How are you feeling?</Label>
                    <div className="flex justify-center gap-2">
                      {moodOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setMood(option.value)}
                          className={cn(
                            "flex flex-col items-center p-2 rounded-lg transition-all border-2",
                            mood === option.value
                              ? "border-primary bg-primary/10"
                              : "border-transparent hover:bg-muted"
                          )}
                        >
                          <span className="text-2xl">{option.emoji}</span>
                          <span className="text-xs text-muted-foreground">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Intention Achieved */}
                  <div className="space-y-2">
                    <Label>Did you achieve your intention?</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {intentionOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setIntentionAchieved(option.value)}
                            className={cn(
                              "flex flex-col items-center p-2 rounded-lg transition-all border-2",
                              intentionAchieved === option.value
                                ? "border-primary bg-primary/10"
                                : "border-transparent hover:bg-muted"
                            )}
                          >
                            <Icon className={cn("w-5 h-5", option.color)} />
                            <span className="text-xs text-muted-foreground mt-1">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reflection Sliders */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Reflections</h3>

                    {[
                      { key: "workRate", label: "Work Rate" },
                      { key: "confidence", label: "Confidence" },
                      { key: "focus", label: "Focus" },
                      { key: "mistakes", label: "Dealing with Mistakes" },
                      { key: "performance", label: "Overall Performance" },
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between">
                          <Label>{label}</Label>
                          <span className="text-sm font-medium">
                            {reflections[key as keyof typeof reflections]}/10
                          </span>
                        </div>
                        <Slider
                          value={[reflections[key as keyof typeof reflections]]}
                          onValueChange={(v) =>
                            setReflections((p) => ({ ...p, [key]: v[0] }))
                          }
                          min={1}
                          max={10}
                          step={1}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Journal Prompts */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Journal</h3>

                    <div className="space-y-2">
                      <Label htmlFor="went-well">What went well?</Label>
                      <Textarea
                        id="went-well"
                        value={journalPrompts.wentWell}
                        onChange={(e) =>
                          setJournalPrompts((p) => ({ ...p, wentWell: e.target.value }))
                        }
                        placeholder="What went well during this activity?"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="could-improve">What could improve?</Label>
                      <Textarea
                        id="could-improve"
                        value={journalPrompts.couldImprove}
                        onChange={(e) =>
                          setJournalPrompts((p) => ({ ...p, couldImprove: e.target.value }))
                        }
                        placeholder="What could you improve on?"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="what-affected">What affected you today?</Label>
                      <Textarea
                        id="what-affected"
                        value={journalPrompts.whatAffected}
                        onChange={(e) =>
                          setJournalPrompts((p) => ({ ...p, whatAffected: e.target.value }))
                        }
                        placeholder="What affected your performance today?"
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Best Self Score */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between">
                      <Label>Best Self Score</Label>
                      <span className="text-sm font-medium">{bestSelfScore}%</span>
                    </div>
                    <Slider
                      value={[bestSelfScore]}
                      onValueChange={(v) => setBestSelfScore(v[0])}
                      min={0}
                      max={100}
                      step={1}
                    />
                    <p className="text-xs text-muted-foreground">
                      How close were you to your best self this activity?
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No post-activity data recorded for this activity.
                </p>
              )}
            </TabsContent>

            {/* Behaviours Tab */}
            <TabsContent value="behaviours" className="space-y-6 mt-4 pb-4">
              {activity.post_activity_completed ? (
                loadingBehaviours ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  behaviourTypes.map((behaviour) => {
                    const Icon = behaviour.icon;
                    const data = superBehaviours[behaviour.key as keyof typeof superBehaviours];
                    return (
                      <div key={behaviour.key} className="space-y-3 p-4 rounded-lg border bg-card">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5 text-primary" />
                          <h4 className="font-medium">{behaviour.label}</h4>
                        </div>
                        
                        {behaviour.questions.map((question, idx) => {
                          const qKey = `q${idx + 1}` as "q1" | "q2" | "q3" | "q4";
                          return (
                            <div key={qKey} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{question}</span>
                                <span className="font-medium">{data[qKey]}/10</span>
                              </div>
                              <Slider
                                value={[data[qKey]]}
                                onValueChange={(v) =>
                                  updateBehaviour(
                                    behaviour.key as keyof typeof superBehaviours,
                                    qKey,
                                    v[0]
                                  )
                                }
                                min={1}
                                max={10}
                                step={1}
                              />
                            </div>
                          );
                        })}
                      </div>
                    );
                  })
                )
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No behaviour data recorded for this activity.
                </p>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end gap-2 p-6 pt-4 border-t">
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

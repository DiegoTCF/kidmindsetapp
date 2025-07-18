import { useState, useEffect } from "react";
import { CheckCircle, Clock, Target, Heart, Brain, Activity, Play, Music, Video, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Activity {
  name: string;
  type: string;
  date: Date;
  finalScore?: string;
  goalsScored?: number;
  assistsMade?: number;
}

interface PreActivityItem {
  id: string;
  name: string;
  completed: boolean;
  points: number;
  skipped: boolean;
}

interface SuperBehaviour {
  id: string;
  name: string;
  emoji: string;
  selected: boolean;
  description: string;
}

interface PostActivityReflection {
  mood: number | null;
  confidence: number;
  focus: number;
  mistakes: number;
  performance: number;
  workRate: number;
  superBehaviours: {
    braveOnBall: number;
    braveOffBall: number;
    aggressive: number;
    electric: number;
  };
  journalPrompts: {
    wentWell: string;
    couldImprove: string;
    whatAffected: string;
  };
  intentionAchieved: string | null;
}

interface ActivityFormProps {
  activity: Activity;
  onComplete: () => void;
}

const moodOptions = [
  { emoji: "😢", label: "Sad", value: 1 },
  { emoji: "😕", label: "Not Great", value: 2 },
  { emoji: "😐", label: "Okay", value: 3 },
  { emoji: "😊", label: "Good", value: 4 },
  { emoji: "😁", label: "Amazing", value: 5 },
];

const defaultPreActivityItems: PreActivityItem[] = [
  { id: "kit-ready", name: "Kit Ready", completed: false, points: 5, skipped: false },
  { id: "yoga-stretch", name: "Yoga / Stretch", completed: false, points: 25, skipped: false },
  { id: "visualisation", name: "Visualisation", completed: false, points: 25, skipped: false },
  { id: "breathing", name: "Breathing", completed: false, points: 5, skipped: false },
];

const superBehaviours: SuperBehaviour[] = [
  { id: "brave-on-ball", name: "Brave on the ball", emoji: "⚽", selected: false, description: "" },
  { id: "brave-off-ball", name: "Brave off the ball", emoji: "🛡️", selected: false, description: "" },
  { id: "electric", name: "Electric", emoji: "⚡", selected: false, description: "" },
  { id: "aggressive", name: "Aggressive", emoji: "💥", selected: false, description: "" },
];

export default function ActivityForm({ activity, onComplete }: ActivityFormProps) {
  const { toast } = useToast();
  
  const [confidenceLevel, setConfidenceLevel] = useState<number>(5);
  const [intention, setIntention] = useState("");
  const [selectedBehaviours, setSelectedBehaviours] = useState<SuperBehaviour[]>(superBehaviours);
  const [preActivityItems, setPreActivityItems] = useState<PreActivityItem[]>(defaultPreActivityItems);
  const [preActivityCompleted, setPreActivityCompleted] = useState(false);
  const [postActivityCompleted, setPostActivityCompleted] = useState(false);
  const [postActivityData, setPostActivityData] = useState<PostActivityReflection>({
    mood: null,
    confidence: 5,
    focus: 5,
    mistakes: 5,
    performance: 5,
    workRate: 5,
    superBehaviours: {
      braveOnBall: 5,
      braveOffBall: 5,
      aggressive: 5,
      electric: 5,
    },
    journalPrompts: {
      wentWell: "",
      couldImprove: "",
      whatAffected: "",
    },
    intentionAchieved: null,
  });

  const [currentChildId, setCurrentChildId] = useState<string | null>(null);

  useEffect(() => {
    loadChildData();
  }, []);

  const loadChildData = async () => {
    try {
      const { data: children } = await supabase
        .from('children')
        .select('id')
        .limit(1);
      
      if (children && children.length > 0) {
        setCurrentChildId(children[0].id);
      }
    } catch (error) {
      console.error('Error loading child data:', error);
    }
  };

  const calculatePreActivityPoints = () => {
    let points = 0;
    
    // Confidence + Checklist items
    points += 5; // Confidence
    preActivityItems.forEach(item => {
      if (item.completed) points += item.points;
    });
    
    // Intention (2 points per word)
    if (intention.trim()) {
      points += intention.trim().split(/\s+/).length * 2;
    }
    
    // Bonus for completing pre-activity
    points += 10;
    
    return points;
  };

  const calculatePostActivityPoints = () => {
    let points = 0;
    
    // Mood
    if (postActivityData.mood !== null) points += 5;
    
    // Reflection sliders (5 points each)
    points += 5 * 5; // confidence, focus, mistakes, performance, workRate
    
    // Super behaviours (1 point per rating level)
    Object.values(postActivityData.superBehaviours).forEach(rating => {
      points += rating;
    });
    
    // Journal (2 points per word)
    const totalWords = Object.values(postActivityData.journalPrompts)
      .join(' ')
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
      .length;
    points += totalWords * 2;
    
    // Bonus for completing post-activity
    points += 10;
    
    return points;
  };

  const handlePreActivitySubmit = async () => {
    if (!currentChildId) return;
    
    const prePoints = calculatePreActivityPoints();
    
    try {
      // Create activity record
      const { data: activityRecord, error: activityError } = await supabase
        .from('activities')
        .insert({
          child_id: currentChildId,
          activity_name: activity.name,
          activity_type: activity.type,
          activity_date: activity.date.toISOString().split('T')[0],
          final_score: activity.finalScore,
          goals_scored: activity.goalsScored,
          assists_made: activity.assistsMade,
          pre_activity_completed: true,
          pre_activity_data: {
            confidence: confidenceLevel,
            intention,
            items: preActivityItems as any,
            completedAt: new Date().toISOString()
          } as any,
          points_awarded: prePoints
        })
        .select()
        .single();

      if (activityError) throw activityError;

      // Update child points
      const { error: pointsError } = await supabase
        .from('children')
        .update({ 
          points: currentChildId ? 
            (await supabase.from('children').select('points').eq('id', currentChildId).single()).data?.points + prePoints || prePoints
            : prePoints
        })
        .eq('id', currentChildId);

      if (pointsError) throw pointsError;

      setPreActivityCompleted(true);
      
      toast({
        title: `🎉 Pre-Activity Complete! +${prePoints} points`,
        description: "Great preparation work! Ready for your activity?",
      });
    } catch (error) {
      console.error('Error saving pre-activity:', error);
      toast({
        title: "Error saving progress",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handlePostActivitySubmit = async () => {
    if (!currentChildId) return;
    
    const postPoints = calculatePostActivityPoints();
    const fullActivityBonus = 20; // Bonus for completing both pre and post
    const totalPoints = postPoints + fullActivityBonus;
    
    try {
      // Find existing activity record
      const { data: existingActivity } = await supabase
        .from('activities')
        .select('id, points_awarded')
        .eq('child_id', currentChildId)
        .eq('activity_name', activity.name)
        .eq('activity_date', activity.date.toISOString().split('T')[0])
        .single();

      if (existingActivity) {
        // Update existing activity
        const { error: updateError } = await supabase
          .from('activities')
          .update({
            post_activity_completed: true,
            post_activity_data: {
              ...postActivityData,
              completedAt: new Date().toISOString()
            },
            points_awarded: existingActivity.points_awarded + totalPoints
          })
          .eq('id', existingActivity.id);

        if (updateError) throw updateError;

        // Update child points
        const { error: pointsError } = await supabase
          .from('children')
          .update({ 
            points: currentChildId ? 
              (await supabase.from('children').select('points').eq('id', currentChildId).single()).data?.points + totalPoints || totalPoints
              : totalPoints
          })
          .eq('id', currentChildId);

        if (pointsError) throw pointsError;

        setPostActivityCompleted(true);
        
        toast({
          title: `🏆 Activity Complete! +${totalPoints} points`,
          description: "Amazing work! You've completed your full activity session.",
        });

        // Auto-close after celebration
        setTimeout(() => {
          onComplete();
        }, 3000);
      }
    } catch (error) {
      console.error('Error saving post-activity:', error);
      toast({
        title: "Error saving progress",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleItemComplete = (itemId: string) => {
    const updatedItems = preActivityItems.map(item => 
      item.id === itemId ? { ...item, completed: true } : item
    );
    setPreActivityItems(updatedItems);
    
    const item = preActivityItems.find(i => i.id === itemId);
    toast({
      title: `${item?.name} completed! +${item?.points} points`,
      description: "Great preparation work!",
    });
  };

  const handleItemSkip = (itemId: string) => {
    const updatedItems = preActivityItems.map(item => 
      item.id === itemId ? { ...item, skipped: true } : item
    );
    setPreActivityItems(updatedItems);
    
    const item = preActivityItems.find(i => i.id === itemId);
    toast({
      title: `${item?.name} skipped - No Time`,
      description: "No worries, you can do it next time!",
    });
  };

  const handleBehaviourSelect = (behaviourId: string) => {
    const updatedBehaviours = selectedBehaviours.map(behaviour => 
      behaviour.id === behaviourId 
        ? { ...behaviour, selected: !behaviour.selected }
        : behaviour
    );
    setSelectedBehaviours(updatedBehaviours);
  };

  const handleBehaviourDescription = (behaviourId: string, description: string) => {
    const updatedBehaviours = selectedBehaviours.map(behaviour => 
      behaviour.id === behaviourId 
        ? { ...behaviour, description }
        : behaviour
    );
    setSelectedBehaviours(updatedBehaviours);
  };

  const handleToolComplete = (toolType: string) => {
    const points = 25;
    toast({
      title: `${toolType} completed! +${points} points`,
      description: "Tool usage tracked successfully",
    });
  };

  const handlePostActivityMoodSubmit = (moodValue: number) => {
    setPostActivityData(prev => ({ ...prev, mood: moodValue }));
    toast({
      title: "Mood recorded! +5 points",
      description: "Thanks for sharing how you're feeling",
    });
  };

  const getPreActivityProgress = () => {
    const completedOrSkipped = preActivityItems.filter(item => item.completed || item.skipped).length;
    const hasConfidence = confidenceLevel > 0;
    const hasIntention = intention.trim().length > 0 || selectedBehaviours.some(b => b.selected);
    const completed = completedOrSkipped + (hasConfidence ? 1 : 0) + (hasIntention ? 1 : 0);
    const total = preActivityItems.length + 2; // +2 for confidence and intention
    return (completed / total) * 100;
  };

  const isPreActivityComplete = () => {
    const allItemsHandled = preActivityItems.every(item => item.completed || item.skipped);
    const hasConfidence = confidenceLevel > 0;
    const hasIntention = intention.trim().length > 0 || selectedBehaviours.some(b => b.selected && b.description.trim().length > 0);
    return allItemsHandled && hasConfidence && hasIntention;
  };

  const isPostActivityComplete = () => {
    return postActivityData.mood !== null && 
           postActivityData.journalPrompts.wentWell.trim() && 
           postActivityData.journalPrompts.couldImprove.trim() &&
           postActivityData.intentionAchieved !== null;
  };

  if (postActivityCompleted) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-soft">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
            <p className="text-muted-foreground mb-4">
              You've completed your full activity session. Great work on your football journey!
            </p>
            <Button onClick={onComplete} className="w-full">
              Back to Stadium
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={onComplete}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Stadium
        </Button>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {activity.name}
        </h1>
        <p className="text-muted-foreground">
          {activity.type} • {activity.date.toLocaleDateString()}
        </p>
      </div>

      <Tabs defaultValue="pre-activity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pre-activity" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Pre-Activity
            {preActivityCompleted && <CheckCircle className="w-4 h-4 text-success" />}
          </TabsTrigger>
          <TabsTrigger value="post-activity" className="flex items-center gap-2" disabled={!preActivityCompleted}>
            <Heart className="w-4 h-4" />
            Post-Activity
            {postActivityCompleted && <CheckCircle className="w-4 h-4 text-success" />}
          </TabsTrigger>
        </TabsList>

        {/* Pre-Activity */}
        <TabsContent value="pre-activity" className="space-y-6">
          {/* Progress Overview */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Pre-Activity Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-muted rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getPreActivityProgress()}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Progress: {Math.round(getPreActivityProgress())}%
              </p>
            </CardContent>
          </Card>

          {/* Confidence Scale */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5" />
                How confident are you feeling?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="px-2">
                  <Slider
                    value={[confidenceLevel]}
                    onValueChange={(value) => setConfidenceLevel(value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-primary">
                    {confidenceLevel}/10
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {preActivityItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200",
                    item.completed 
                      ? "bg-success/10 border-success/30" 
                      : item.skipped
                      ? "bg-muted/50 border-muted"
                      : "bg-card border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {item.completed ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : item.skipped ? (
                      <X className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className={cn(
                        "font-medium",
                        item.completed && "text-success",
                        item.skipped && "text-muted-foreground line-through"
                      )}>
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.skipped ? "Skipped - No Time" : `+${item.points} points`}
                      </p>
                    </div>
                  </div>

                  {!item.completed && !item.skipped && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleItemComplete(item.id)}
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                      >
                        Complete
                      </Button>
                      <Button
                        onClick={() => handleItemSkip(item.id)}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        No Time
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Set Intention */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Set your intention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Super Behaviour Badges */}
              <div>
                <p className="text-sm font-medium mb-3">Select your super behaviours:</p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedBehaviours.map((behaviour) => (
                    <div key={behaviour.id} className="space-y-2">
                      <Button
                        variant={behaviour.selected ? "default" : "outline"}
                        className={cn(
                          "w-full h-auto p-3 text-left border-2 rounded-xl transition-all duration-200",
                          behaviour.selected 
                            ? "bg-primary hover:bg-primary/90 border-primary" 
                            : "hover:border-primary/30"
                        )}
                        onClick={() => handleBehaviourSelect(behaviour.id)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{behaviour.emoji}</span>
                          <span className="text-sm font-medium">{behaviour.name}</span>
                        </div>
                      </Button>
                      
                      {behaviour.selected && (
                        <div className="ml-2">
                          <Input
                            placeholder="How are you going to do that?"
                            value={behaviour.description}
                            onChange={(e) => handleBehaviourDescription(behaviour.id, e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Traditional Intention (Optional) */}
              <div className="pt-4 border-t">
                <Textarea
                  placeholder="Additional thoughts or intentions..."
                  value={intention}
                  onChange={(e) => setIntention(e.target.value)}
                  className="w-full min-h-[60px]"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Optional: +{intention.trim().split(/\s+/).filter(word => word.length > 0).length * 2} points ({intention.trim().split(/\s+/).filter(word => word.length > 0).length} words)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Pre-Activity */}
          <Button 
            onClick={handlePreActivitySubmit}
            disabled={!isPreActivityComplete() || preActivityCompleted}
            className="w-full"
            size="lg"
          >
            {preActivityCompleted ? "Pre-Activity Complete! ✅" : "Start Activity →"}
          </Button>
        </TabsContent>

        {/* Post-Activity */}
        <TabsContent value="post-activity" className="space-y-6">
          {/* Intention Achievement */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Did you achieve your intention?</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Display selected behaviours from pre-activity */}
              {selectedBehaviours.some(b => b.selected) && (
                <div className="mb-4 p-3 bg-muted/50 rounded-xl">
                  <p className="text-sm font-medium mb-2">Your selected behaviours:</p>
                  {selectedBehaviours.filter(b => b.selected).map((behaviour) => (
                    <div key={behaviour.id} className="text-sm mb-1">
                      <span className="font-medium">{behaviour.emoji} {behaviour.name}:</span>
                      <span className="text-muted-foreground ml-2">{behaviour.description}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Achievement Response */}
              {postActivityData.intentionAchieved === null ? (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left border-2 hover:border-success/30 hover:bg-success/5"
                    onClick={() => setPostActivityData(prev => ({ ...prev, intentionAchieved: "yes" }))}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">✅</span>
                      <span className="text-sm font-medium">Yes, I achieved it!</span>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left border-2 hover:border-primary/30 hover:bg-primary/5"
                    onClick={() => setPostActivityData(prev => ({ ...prev, intentionAchieved: "partial" }))}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🎯</span>
                      <span className="text-sm font-medium">Partially, can be better</span>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left border-2 hover:border-destructive/30 hover:bg-destructive/5"
                    onClick={() => setPostActivityData(prev => ({ ...prev, intentionAchieved: "no" }))}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">❌</span>
                      <span className="text-sm font-medium">No</span>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left border-2 hover:border-warning/30 hover:bg-warning/5"
                    onClick={() => setPostActivityData(prev => ({ ...prev, intentionAchieved: "forgot" }))}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">😅</span>
                      <span className="text-sm font-medium">I forgot to do it</span>
                    </div>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-3xl mb-2">
                    {postActivityData.intentionAchieved === "yes" && "✅"}
                    {postActivityData.intentionAchieved === "partial" && "🎯"}
                    {postActivityData.intentionAchieved === "no" && "❌"}
                    {postActivityData.intentionAchieved === "forgot" && "😅"}
                  </div>
                  <p className="text-sm text-muted-foreground">Response recorded!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mood Check */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Mood</CardTitle>
            </CardHeader>
            <CardContent>
              {postActivityData.mood === null ? (
                <div className="grid grid-cols-5 gap-2">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => handlePostActivityMoodSubmit(mood.value)}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-transparent
                               hover:border-primary/30 hover:bg-primary/5 transition-all duration-200
                               active:scale-95"
                    >
                      <span className="text-2xl" role="img" aria-label={mood.label}>
                        {mood.emoji}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {mood.label}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <span className="text-3xl mb-2 block">
                    {moodOptions.find(m => m.value === postActivityData.mood)?.emoji}
                  </span>
                  <p className="text-sm text-muted-foreground">Mood recorded!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reflection Sliders */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Reflection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: "workRate", label: "Work rate", icon: Activity },
                { key: "confidence", label: "Confidence", icon: Brain },
                { key: "mistakes", label: "Mistakes", icon: Target },
                { key: "focus", label: "Focus", icon: Target },
                { key: "performance", label: "Performance", icon: Activity },
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{label}</span>
                    <span className="ml-auto text-primary font-bold">
                      {postActivityData[key as keyof typeof postActivityData] as number}/10
                    </span>
                  </div>
                  <Slider
                    value={[postActivityData[key as keyof typeof postActivityData] as number]}
                    onValueChange={(value) => setPostActivityData(prev => ({
                      ...prev,
                      [key]: value[0]
                    }))}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Super-Behaviour Ratings */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Super-Behaviour (1-10)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: "braveOnBall", label: "Brave on the ball" },
                { key: "braveOffBall", label: "Brave off the ball" },
                { key: "electric", label: "Electric" },
                { key: "aggressive", label: "Aggressive" },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{label}</span>
                    <span className="ml-auto text-primary font-bold">
                      {postActivityData.superBehaviours[key as keyof typeof postActivityData.superBehaviours]}/10
                    </span>
                  </div>
                  <Slider
                    value={[postActivityData.superBehaviours[key as keyof typeof postActivityData.superBehaviours]]}
                    onValueChange={(value) => setPostActivityData(prev => ({
                      ...prev,
                      superBehaviours: {
                        ...prev.superBehaviours,
                        [key]: value[0]
                      }
                    }))}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Journal */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Journal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  What went well?
                </label>
                <Textarea
                  placeholder="Share what you did well..."
                  value={postActivityData.journalPrompts.wentWell}
                  onChange={(e) => setPostActivityData(prev => ({
                    ...prev,
                    journalPrompts: {
                      ...prev.journalPrompts,
                      wentWell: e.target.value
                    }
                  }))}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  What could improve?
                </label>
                <Textarea
                  placeholder="Think about areas for growth..."
                  value={postActivityData.journalPrompts.couldImprove}
                  onChange={(e) => setPostActivityData(prev => ({
                    ...prev,
                    journalPrompts: {
                      ...prev.journalPrompts,
                      couldImprove: e.target.value
                    }
                  }))}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  What affected you today?
                </label>
                <Textarea
                  placeholder="Think about external factors..."
                  value={postActivityData.journalPrompts.whatAffected}
                  onChange={(e) => setPostActivityData(prev => ({
                    ...prev,
                    journalPrompts: {
                      ...prev.journalPrompts,
                      whatAffected: e.target.value
                    }
                  }))}
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Post-Activity */}
          <Button 
            onClick={handlePostActivitySubmit}
            disabled={!isPostActivityComplete()}
            className="w-full"
            size="lg"
          >
            Complete Activity 🎉
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
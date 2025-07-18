import { useState, useEffect } from "react";
import { CheckCircle, Clock, Target, Heart, Brain, Activity, Play, Music, Video, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
}

interface PostActivityReflection {
  mood: number | null;
  confidence: number;
  focus: number;
  mistakes: number;
  performance: number;
  workRate: number;
  superBehaviours: {
    braveOnBall: boolean;
    braveOffBall: boolean;
    aggressive: boolean;
    electric: boolean;
  };
  journalPrompts: {
    wentWell: string;
    couldImprove: string;
    whatAffected: string;
  };
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
  { id: "kit-ready", name: "Kit Ready", completed: false, points: 5 },
  { id: "yoga-stretch", name: "Yoga / Stretch", completed: false, points: 25 },
  { id: "visualisation", name: "Visualisation", completed: false, points: 25 },
  { id: "breathing", name: "Breathing", completed: false, points: 5 },
];

export default function ActivityForm({ activity, onComplete }: ActivityFormProps) {
  const { toast } = useToast();
  
  const [confidenceLevel, setConfidenceLevel] = useState<number>(5);
  const [intention, setIntention] = useState("");
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
      braveOnBall: false,
      braveOffBall: false,
      aggressive: false,
      electric: false,
    },
    journalPrompts: {
      wentWell: "",
      couldImprove: "",
      whatAffected: "",
    },
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
    
    // Super behaviours (5 points each)
    Object.values(postActivityData.superBehaviours).forEach(behaviour => {
      if (behaviour) points += 5;
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
    const completed = preActivityItems.filter(item => item.completed).length + (confidenceLevel ? 1 : 0) + (intention.trim() ? 1 : 0);
    const total = preActivityItems.length + 2; // +2 for confidence and intention
    return (completed / total) * 100;
  };

  const isPreActivityComplete = () => {
    return preActivityItems.every(item => item.completed) && confidenceLevel && intention.trim();
  };

  const isPostActivityComplete = () => {
    return postActivityData.mood !== null && 
           postActivityData.journalPrompts.wentWell.trim() && 
           postActivityData.journalPrompts.couldImprove.trim();
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
                Confidence Scale (1-10)
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
                    "flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200",
                    item.completed 
                      ? "bg-success/10 border-success/30" 
                      : "bg-card border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {item.completed ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className={cn(
                        "font-medium",
                        item.completed && "text-success"
                      )}>
                        {item.name} ✅
                      </p>
                      <p className="text-xs text-muted-foreground">
                        +{item.points} points
                      </p>
                    </div>
                  </div>

                  {!item.completed && (
                    <Button
                      onClick={() => handleItemComplete(item.id)}
                      size="sm"
                    >
                      Complete
                    </Button>
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
            <CardContent>
              <Textarea
                placeholder="What do you want to focus on today?"
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                className="w-full min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground mt-2">
                +{intention.trim().split(/\s+/).filter(word => word.length > 0).length * 2} points ({intention.trim().split(/\s+/).filter(word => word.length > 0).length} words)
              </p>
            </CardContent>
          </Card>

          {/* Tools Section */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">🧰 TOOLS</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 h-auto p-4"
                onClick={() => handleToolComplete("Yoga Stretch")}
              >
                <Video className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Yoga Stretch</p>
                  <p className="text-xs text-muted-foreground">25 pts</p>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 h-auto p-4"
                onClick={() => handleToolComplete("Visualisation Audio")}
              >
                <Music className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Visualisation Audio</p>
                  <p className="text-xs text-muted-foreground">25 pts</p>
                </div>
              </Button>
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
              <CardTitle className="text-lg">Super-Behaviour</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "braveOnBall", label: "Brave on/off ball" },
                { key: "electric", label: "Electric" },
                { key: "aggressive", label: "Aggressive" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={postActivityData.superBehaviours[key as keyof typeof postActivityData.superBehaviours]}
                    onCheckedChange={(checked) => setPostActivityData(prev => ({
                      ...prev,
                      superBehaviours: {
                        ...prev.superBehaviours,
                        [key]: checked
                      }
                    }))}
                  />
                  <label htmlFor={key} className="text-sm font-medium">
                    {label}
                  </label>
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
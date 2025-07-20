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
import { CustomIcon } from "@/components/ui/custom-emoji";
import { supabase } from "@/integrations/supabase/client";
import MindsetSupportFlow from "./MindsetSupportFlow";

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
    braveOnBall: {
      question1: number;
      question2: number;
      question3: number;
      question4: number;
    };
    braveOffBall: {
      question1: number;
      question2: number;
      question3: number;
      question4: number;
    };
    electric: {
      question1: number;
      question2: number;
      question3: number;
      question4: number;
    };
    aggressive: {
      question1: number;
      question2: number;
      question3: number;
      question4: number;
    };
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
  existingActivityId?: string;
  isResumingActivity?: boolean;
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
  { id: "brave-on-ball", name: "Brave on the ball", emoji: "flame", selected: false, description: "" },
  { id: "brave-off-ball", name: "Brave off the ball", emoji: "brain", selected: false, description: "" },
  { id: "electric", name: "Electric", emoji: "trophy", selected: false, description: "" },
  { id: "aggressive", name: "Aggressive", emoji: "target", selected: false, description: "" },
];

export default function ActivityForm({ activity, onComplete, existingActivityId, isResumingActivity = false }: ActivityFormProps) {
  const { toast } = useToast();
  
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0);
  const [intention, setIntention] = useState("");
  const [selectedBehaviours, setSelectedBehaviours] = useState<SuperBehaviour[]>(superBehaviours);
  const [preActivityItems, setPreActivityItems] = useState<PreActivityItem[]>(defaultPreActivityItems);
  const [preActivityCompleted, setPreActivityCompleted] = useState(isResumingActivity);
  const [postActivityCompleted, setPostActivityCompleted] = useState(false);
  // Step-by-step question state for super behaviors
  const [superBehaviorSteps, setSuperBehaviorSteps] = useState<{
    braveOnBall: number;
    braveOffBall: number;
    electric: number;
    aggressive: number;
  }>({
    braveOnBall: 0,
    braveOffBall: 0,
    electric: 0,
    aggressive: 0,
  });

  const [postActivityData, setPostActivityData] = useState<PostActivityReflection>({
    mood: null,
    confidence: 5,
    focus: 5,
    mistakes: 5,
    performance: 5,
    workRate: 5,
    superBehaviours: {
      braveOnBall: {
        question1: 5,
        question2: 5,
        question3: 5,
        question4: 5,
      },
      braveOffBall: {
        question1: 5,
        question2: 5,
        question3: 5,
        question4: 5,
      },
      electric: {
        question1: 5,
        question2: 5,
        question3: 5,
        question4: 5,
      },
      aggressive: {
        question1: 5,
        question2: 5,
        question3: 5,
        question4: 5,
      },
    },
    journalPrompts: {
      wentWell: "",
      couldImprove: "",
      whatAffected: "",
    },
    intentionAchieved: null,
  });

  const [currentChildId, setCurrentChildId] = useState<string | null>(null);
  
  // Mindset support flow state
  const [showMindsetFlow, setShowMindsetFlow] = useState(false);
  const [worryData, setWorryData] = useState<{
    reason: string;
    answers: Record<string, string>;
  } | null>(null);

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
    
    // Super behaviours (average of 4 questions) - includes braveOnBall, braveOffBall, electric, aggressive
    Object.values(postActivityData.superBehaviours).forEach(behaviour => {
      const average = (behaviour.question1 + behaviour.question2 + behaviour.question3 + behaviour.question4) / 4;
      points += Math.round(average);
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
          points_awarded: prePoints,
          worry_reason: worryData?.reason || null,
          worry_answers: worryData?.answers || null
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
      let activityId = existingActivityId;
      
      // If no existing activity ID, find it by name and date
      if (!activityId) {
        const { data: existingActivity } = await supabase
          .from('activities')
          .select('id, points_awarded')
          .eq('child_id', currentChildId)
          .eq('activity_name', activity.name)
          .eq('activity_date', activity.date.toISOString().split('T')[0])
          .single();
        
        if (existingActivity) {
          activityId = existingActivity.id;
        }
      }

      if (activityId) {
        // Get current points awarded to calculate new total
        const { data: currentActivity } = await supabase
          .from('activities')
          .select('points_awarded')
          .eq('id', activityId)
          .single();

        // Update existing activity
        const { error: updateError } = await supabase
          .from('activities')
          .update({
            post_activity_completed: true,
            post_activity_data: {
              ...postActivityData,
              completedAt: new Date().toISOString()
            },
            points_awarded: (currentActivity?.points_awarded || 0) + totalPoints
          })
          .eq('id', activityId);

        if (updateError) throw updateError;

        // Save detailed super behaviour ratings
        const behaviourEntries = [
          {
            activity_id: activityId,
            child_id: currentChildId,
            behaviour_type: 'brave_on_ball',
            question_1_rating: postActivityData.superBehaviours.braveOnBall.question1,
            question_2_rating: postActivityData.superBehaviours.braveOnBall.question2,
            question_3_rating: postActivityData.superBehaviours.braveOnBall.question3,
            question_4_rating: postActivityData.superBehaviours.braveOnBall.question4,
          },
          {
            activity_id: activityId,
            child_id: currentChildId,
            behaviour_type: 'brave_off_ball',
            question_1_rating: postActivityData.superBehaviours.braveOffBall.question1,
            question_2_rating: postActivityData.superBehaviours.braveOffBall.question2,
            question_3_rating: postActivityData.superBehaviours.braveOffBall.question3,
            question_4_rating: postActivityData.superBehaviours.braveOffBall.question4,
          },
          {
            activity_id: activityId,
            child_id: currentChildId,
            behaviour_type: 'electric',
            question_1_rating: postActivityData.superBehaviours.electric.question1,
            question_2_rating: postActivityData.superBehaviours.electric.question2,
            question_3_rating: postActivityData.superBehaviours.electric.question3,
            question_4_rating: postActivityData.superBehaviours.electric.question4,
          },
          {
            activity_id: activityId,
            child_id: currentChildId,
            behaviour_type: 'aggressive',
            question_1_rating: postActivityData.superBehaviours.aggressive.question1,
            question_2_rating: postActivityData.superBehaviours.aggressive.question2,
            question_3_rating: postActivityData.superBehaviours.aggressive.question3,
            question_4_rating: postActivityData.superBehaviours.aggressive.question4,
          },
        ];

        // Insert or update super behaviour ratings
        const { error: behaviourError } = await supabase
          .from('super_behaviour_ratings')
          .upsert(behaviourEntries, {
            onConflict: 'activity_id,behaviour_type'
          });

        if (behaviourError) {
          console.error('Error saving super behaviour ratings:', behaviourError);
          // Don't throw - we want the main activity to still complete
        }

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

  const handleMindsetFlowComplete = (worryReason: string, answers: Record<string, string>) => {
    setWorryData({ reason: worryReason, answers });
    setShowMindsetFlow(false);
    
    toast({
      title: "💙 Mindset Support Complete",
      description: "Great work addressing your worries! You're ready to continue.",
    });
  };

  const handleMindsetFlowClose = () => {
    setShowMindsetFlow(false);
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
    const hasWorryHandled = confidenceLevel > 7 || (confidenceLevel >= 1 && confidenceLevel <= 7 && worryData);
    
    console.log('Pre-activity completion check:', {
      allItemsHandled,
      hasConfidence,
      hasIntention,
      hasWorryHandled,
      confidenceLevel,
      worryData: !!worryData,
      complete: allItemsHandled && hasConfidence && hasIntention && hasWorryHandled
    });
    
    return allItemsHandled && hasConfidence && hasIntention && hasWorryHandled;
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

      <Tabs defaultValue={isResumingActivity ? "post-activity" : "pre-activity"} className="space-y-6">
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
                    onValueChange={(value) => {
                      console.log('Slider onChange triggered:', { 
                        oldValue: confidenceLevel, 
                        newValue: value[0],
                        showMindsetFlow,
                        worryData 
                      });
                      setConfidenceLevel(value[0]);
                      
                      // Reset worry data and mindset flow if confidence goes above 7
                      if (value[0] > 7) {
                        console.log('Clearing worry data and mindset flow for confidence > 7');
                        setWorryData(null);
                        setShowMindsetFlow(false);
                      }
                    }}
                    max={10}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-primary">
                    {confidenceLevel === 0 ? "Not selected" : `${confidenceLevel}/10`}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current confidence level: {confidenceLevel}
                  </p>
                </div>
                
                {/* Show worry selection if confidence is between 1-7 and no worry data */}
                {(() => {
                  const shouldShowWorryButtons = confidenceLevel >= 1 && confidenceLevel <= 7 && !worryData;
                  console.log('Worry buttons visibility check:', {
                    confidenceLevel,
                    showMindsetFlow,
                    worryData: !!worryData,
                    shouldShowWorryButtons
                  });
                  return shouldShowWorryButtons;
                })() && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-center">What is worrying you?</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'physical-big', text: 'The players look good or physically big', emoji: 'flame' },
                        { id: 'people-think', text: "I'm worried about what people might think", emoji: 'brain' },
                        { id: 'making-mistakes', text: "I'm scared of making mistakes", emoji: 'target' },
                        { id: 'getting-hurt', text: "I'm scared of getting hurt", emoji: 'trophy' },
                        { id: 'pressure-perform', text: "I'm feeling pressure to perform", emoji: 'target' }
                      ].map((worry) => (
                        <Button
                          key={worry.id}
                          variant="outline"
                          className="w-full h-auto p-3 text-left border-2 hover:border-primary/50 transition-all duration-200"
                          onClick={() => {
                            console.log('Worry button clicked:', worry.text);
                            setWorryData({ reason: worry.text, answers: {} });
                            setShowMindsetFlow(true);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <CustomIcon 
                              type={worry.emoji === 'target' ? 'target' : worry.emoji === '💪' ? 'flame' : worry.emoji === '👥' ? 'brain' : worry.emoji === '😬' ? 'target' : 'brain'} 
                              size="sm" 
                              className="text-primary"
                            />
                            <span className="text-sm font-medium leading-tight">{worry.text}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Show worry data if completed */}
                {worryData && confidenceLevel <= 7 && (
                  <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium text-primary">Mindset Support Completed</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Worry: {worryData.reason}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-4">
              {preActivityItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200",
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
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        onClick={() => handleItemComplete(item.id)}
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-xs px-2"
                      >
                        Complete
                      </Button>
                      <Button
                        onClick={() => handleItemSkip(item.id)}
                        size="sm"
                        variant="outline"
                        className="text-xs px-2 whitespace-nowrap"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                            <CustomIcon type={behaviour.emoji as any} size="sm" className="text-primary" />
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
            {preActivityCompleted ? "Pre-Activity Complete!" : "Start Activity →"}
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
                    <div key={behaviour.id} className="text-sm mb-1 flex items-center gap-2">
                      <CustomIcon type={behaviour.emoji as any} size="sm" className="text-primary" />
                      <span className="font-medium">{behaviour.name}:</span>
                      <span className="text-muted-foreground">{behaviour.description}</span>
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
                      <CustomIcon type="good" size="lg" />
                      <span className="text-sm font-medium">Yes, I achieved it!</span>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left border-2 hover:border-primary/30 hover:bg-primary/5"
                    onClick={() => setPostActivityData(prev => ({ ...prev, intentionAchieved: "partial" }))}
                  >
                    <div className="flex items-center gap-2">
                      <CustomIcon type="target" size="lg" />
                      <span className="text-sm font-medium">Partially, can be better</span>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left border-2 hover:border-destructive/30 hover:bg-destructive/5"
                    onClick={() => setPostActivityData(prev => ({ ...prev, intentionAchieved: "no" }))}
                  >
                    <div className="flex items-center gap-2">
                      <CustomIcon type="not-great" size="lg" />
                      <span className="text-sm font-medium">No</span>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left border-2 hover:border-warning/30 hover:bg-warning/5"
                    onClick={() => setPostActivityData(prev => ({ ...prev, intentionAchieved: "forgot" }))}
                  >
                    <div className="flex items-center gap-2">
                      <CustomIcon type="okay" size="lg" />
                      <span className="text-sm font-medium">I forgot to do it</span>
                    </div>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-3xl mb-2">
                     {postActivityData.intentionAchieved === "yes" && <CustomIcon type="good" size="md" />}
                     {postActivityData.intentionAchieved === "partial" && <CustomIcon type="target" size="md" />}
                     {postActivityData.intentionAchieved === "no" && <CustomIcon type="not-great" size="md" />}
                     {postActivityData.intentionAchieved === "forgot" && <CustomIcon type="okay" size="md" />}
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
              <CardTitle className="text-lg">During the activity, rate your:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: "workRate", label: "Work rate", icon: Activity },
                { key: "confidence", label: "Confidence", icon: Brain },
                { key: "mistakes", label: "Mistakes & recovery", icon: Target },
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
              <CardTitle className="text-lg">Super-Behaviour Ratings (1-10)</CardTitle>
              <p className="text-sm text-muted-foreground">Rate yourself step-by-step. Answer each question individually and your final score will be the average of all 4 questions.</p>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Brave on the Ball */}
              {(() => {
                const behaviorData = [
                  { key: 'question1', text: 'How often did you try to take players on or play forward?', subtext: '(1 = Not at all, 10 = All the time)' },
                  { key: 'question2', text: 'How much intent did you show when doing it — did you really go for it?', subtext: '(1 = Hesitant / Half-hearted, 10 = Full commitment every time)' },
                  { key: 'question3', text: 'Did you take risks even when you made mistakes or lost the ball?', subtext: '(1 = I avoided it after mistakes, 10 = I kept trying and stayed brave)' },
                  { key: 'question4', text: 'How much did you play to win your 1v1s, not just avoid losing the ball?', subtext: '(1 = Playing it safe, 10 = Attacking every 1v1 with purpose)' }
                ];
                const currentStep = superBehaviorSteps.braveOnBall;
                const currentQuestion = behaviorData[currentStep];
                const isComplete = currentStep >= 4;
                const average = isComplete ? ((postActivityData.superBehaviours.braveOnBall.question1 + postActivityData.superBehaviours.braveOnBall.question2 + postActivityData.superBehaviours.braveOnBall.question3 + postActivityData.superBehaviours.braveOnBall.question4) / 4).toFixed(1) : null;

                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <CustomIcon type="flame" size="lg" />
                      <h3 className="text-lg font-bold">Brave on the Ball</h3>
                      {isComplete && (
                        <span className="ml-auto text-primary font-bold">
                          Avg: {average}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Trying forward actions, dribbling, risky passes</p>
                    
                    {!isComplete ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-muted-foreground">Question {currentStep + 1} of 4</span>
                          <div className="flex gap-1">
                            {[0, 1, 2, 3].map((step) => (
                              <div
                                key={step}
                                className={`w-2 h-2 rounded-full ${
                                  step <= currentStep ? 'bg-primary' : 'bg-muted'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-4 p-4 bg-muted/20 rounded-xl">
                          <div>
                            <p className="text-sm font-medium mb-1">{currentQuestion.text}</p>
                            <p className="text-xs text-muted-foreground">{currentQuestion.subtext}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Rate this:</span>
                              <span className="text-primary font-bold">
                                {postActivityData.superBehaviours.braveOnBall[currentQuestion.key as keyof typeof postActivityData.superBehaviours.braveOnBall]}/10
                              </span>
                            </div>
                            <Slider
                              value={[postActivityData.superBehaviours.braveOnBall[currentQuestion.key as keyof typeof postActivityData.superBehaviours.braveOnBall]]}
                              onValueChange={(value) => setPostActivityData(prev => ({
                                ...prev,
                                superBehaviours: {
                                  ...prev.superBehaviours,
                                  braveOnBall: {
                                    ...prev.superBehaviours.braveOnBall,
                                    [currentQuestion.key]: value[0]
                                  }
                                }
                              }))}
                              max={10}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          
                          <Button 
                            onClick={() => {
                              setSuperBehaviorSteps(prev => ({ ...prev, braveOnBall: prev.braveOnBall + 1 }));
                              if (currentStep === 3) {
                                toast({
                                  title: "Brave on the Ball Complete!",
                                  description: `Average score: ${((postActivityData.superBehaviours.braveOnBall.question1 + postActivityData.superBehaviours.braveOnBall.question2 + postActivityData.superBehaviours.braveOnBall.question3 + postActivityData.superBehaviours.braveOnBall.question4) / 4).toFixed(1)}/10`,
                                });
                              }
                            }}
                            className="w-full"
                          >
                            {currentStep === 3 ? 'Complete Brave on the Ball' : 'Next Question'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-success/10 border border-success/30 rounded-xl">
                         <div className="flex items-center gap-2 text-sm font-medium text-success mb-2">
                           <CustomIcon type="good" size="sm" />
                           <span>Completed!</span>
                         </div>
                        <p className="text-xs text-muted-foreground">Final score: {average}/10</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setSuperBehaviorSteps(prev => ({ ...prev, braveOnBall: 0 }))}
                        >
                          Redo
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Brave off the Ball */}
              {(() => {
                const behaviorData = [
                  { key: 'question1', text: 'How often did you show for the ball or move into space?', subtext: '(1 = I hid or waited, 10 = I was always available and active)' },
                  { key: 'question2', text: 'How much intent did you show when trying to get involved?', subtext: '(1 = Passive movements, 10 = Sharp, purposeful movements)' },
                  { key: 'question3', text: 'Did you keep moving even when things weren\'t going well?', subtext: '(1 = I gave up a bit, 10 = I kept trying no matter what)' },
                  { key: 'question4', text: 'Did you create good angles and options for your teammates?', subtext: '(1 = Rarely, 10 = Constantly helped the team with my positioning)' }
                ];
                const currentStep = superBehaviorSteps.braveOffBall;
                const currentQuestion = behaviorData[currentStep];
                const isComplete = currentStep >= 4;
                const average = isComplete ? ((postActivityData.superBehaviours.braveOffBall.question1 + postActivityData.superBehaviours.braveOffBall.question2 + postActivityData.superBehaviours.braveOffBall.question3 + postActivityData.superBehaviours.braveOffBall.question4) / 4).toFixed(1) : null;
                const canStart = superBehaviorSteps.braveOnBall >= 4;

                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <CustomIcon type="brain" size="lg" />
                      <h3 className="text-lg font-bold">Brave off the Ball</h3>
                      {isComplete && (
                        <span className="ml-auto text-primary font-bold">
                          Avg: {average}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Getting into the game, showing for the ball, staying involved</p>
                    
                    {!canStart ? (
                      <div className="p-4 bg-muted/20 rounded-xl text-center">
                        <p className="text-sm text-muted-foreground">Complete "Brave on the Ball" first</p>
                      </div>
                    ) : !isComplete ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-muted-foreground">Question {currentStep + 1} of 4</span>
                          <div className="flex gap-1">
                            {[0, 1, 2, 3].map((step) => (
                              <div
                                key={step}
                                className={`w-2 h-2 rounded-full ${
                                  step <= currentStep ? 'bg-primary' : 'bg-muted'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-4 p-4 bg-muted/20 rounded-xl">
                          <div>
                            <p className="text-sm font-medium mb-1">{currentQuestion.text}</p>
                            <p className="text-xs text-muted-foreground">{currentQuestion.subtext}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Rate this:</span>
                              <span className="text-primary font-bold">
                                {postActivityData.superBehaviours.braveOffBall[currentQuestion.key as keyof typeof postActivityData.superBehaviours.braveOffBall]}/10
                              </span>
                            </div>
                            <Slider
                              value={[postActivityData.superBehaviours.braveOffBall[currentQuestion.key as keyof typeof postActivityData.superBehaviours.braveOffBall]]}
                              onValueChange={(value) => setPostActivityData(prev => ({
                                ...prev,
                                superBehaviours: {
                                  ...prev.superBehaviours,
                                  braveOffBall: {
                                    ...prev.superBehaviours.braveOffBall,
                                    [currentQuestion.key]: value[0]
                                  }
                                }
                              }))}
                              max={10}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          
                          <Button 
                            onClick={() => {
                              setSuperBehaviorSteps(prev => ({ ...prev, braveOffBall: prev.braveOffBall + 1 }));
                              if (currentStep === 3) {
                                toast({
                                  title: "Brave off the Ball Complete!",
                                  description: `Average score: ${((postActivityData.superBehaviours.braveOffBall.question1 + postActivityData.superBehaviours.braveOffBall.question2 + postActivityData.superBehaviours.braveOffBall.question3 + postActivityData.superBehaviours.braveOffBall.question4) / 4).toFixed(1)}/10`,
                                });
                              }
                            }}
                            className="w-full"
                          >
                            {currentStep === 3 ? 'Complete Brave off the Ball' : 'Next Question'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-success/10 border border-success/30 rounded-xl">
                         <div className="flex items-center gap-2 text-sm font-medium text-success mb-2">
                           <CustomIcon type="good" size="sm" />
                           <span>Completed!</span>
                         </div>
                        <p className="text-xs text-muted-foreground">Final score: {average}/10</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setSuperBehaviorSteps(prev => ({ ...prev, braveOffBall: 0 }))}
                        >
                          Redo
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Electric */}
              {(() => {
                const behaviorData = [
                  { key: 'question1', text: 'How much energy did you bring to the game today?', subtext: '(1 = Very flat, 10 = Full of energy the whole time)' },
                  { key: 'question2', text: 'How quick were your reactions during the game?', subtext: '(1 = Slow to react, 10 = Switched on and alert)' },
                  { key: 'question3', text: 'How fast and sharp were your decisions?', subtext: '(1 = I delayed or hesitated, 10 = I made fast, confident choices)' },
                  { key: 'question4', text: 'Did you move with speed and urgency when the team needed it?', subtext: '(1 = I jogged or walked a lot, 10 = I exploded into actions)' }
                ];
                const currentStep = superBehaviorSteps.electric;
                const currentQuestion = behaviorData[currentStep];
                const isComplete = currentStep >= 4;
                const average = isComplete ? ((postActivityData.superBehaviours.electric.question1 + postActivityData.superBehaviours.electric.question2 + postActivityData.superBehaviours.electric.question3 + postActivityData.superBehaviours.electric.question4) / 4).toFixed(1) : null;
                const canStart = superBehaviorSteps.braveOffBall >= 4;

                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <CustomIcon type="trophy" size="lg" />
                      <h3 className="text-lg font-bold">Electric</h3>
                      {isComplete && (
                        <span className="ml-auto text-primary font-bold">
                          Avg: {average}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Energy, speed, quick reactions, intensity</p>
                    
                    {!canStart ? (
                      <div className="p-4 bg-muted/20 rounded-xl text-center">
                        <p className="text-sm text-muted-foreground">Complete "Brave off the Ball" first</p>
                      </div>
                    ) : !isComplete ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-muted-foreground">Question {currentStep + 1} of 4</span>
                          <div className="flex gap-1">
                            {[0, 1, 2, 3].map((step) => (
                              <div
                                key={step}
                                className={`w-2 h-2 rounded-full ${
                                  step <= currentStep ? 'bg-primary' : 'bg-muted'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-4 p-4 bg-muted/20 rounded-xl">
                          <div>
                            <p className="text-sm font-medium mb-1">{currentQuestion.text}</p>
                            <p className="text-xs text-muted-foreground">{currentQuestion.subtext}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Rate this:</span>
                              <span className="text-primary font-bold">
                                {postActivityData.superBehaviours.electric[currentQuestion.key as keyof typeof postActivityData.superBehaviours.electric]}/10
                              </span>
                            </div>
                            <Slider
                              value={[postActivityData.superBehaviours.electric[currentQuestion.key as keyof typeof postActivityData.superBehaviours.electric]]}
                              onValueChange={(value) => setPostActivityData(prev => ({
                                ...prev,
                                superBehaviours: {
                                  ...prev.superBehaviours,
                                  electric: {
                                    ...prev.superBehaviours.electric,
                                    [currentQuestion.key]: value[0]
                                  }
                                }
                              }))}
                              max={10}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          
                          <Button 
                            onClick={() => {
                              setSuperBehaviorSteps(prev => ({ ...prev, electric: prev.electric + 1 }));
                              if (currentStep === 3) {
                                toast({
                                  title: "Electric Complete!",
                                  description: `Average score: ${((postActivityData.superBehaviours.electric.question1 + postActivityData.superBehaviours.electric.question2 + postActivityData.superBehaviours.electric.question3 + postActivityData.superBehaviours.electric.question4) / 4).toFixed(1)}/10`,
                                });
                              }
                            }}
                            className="w-full"
                          >
                            {currentStep === 3 ? 'Complete Electric' : 'Next Question'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-success/10 border border-success/30 rounded-xl">
                         <div className="flex items-center gap-2 text-sm font-medium text-success mb-2">
                           <CustomIcon type="good" size="sm" />
                           <span>Completed!</span>
                         </div>
                        <p className="text-xs text-muted-foreground">Final score: {average}/10</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setSuperBehaviorSteps(prev => ({ ...prev, electric: 0 }))}
                        >
                          Redo
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Aggressive */}
              {(() => {
                const behaviorData = [
                  { key: 'question1', text: 'How often did you go into 1v1 duels or physical challenges?', subtext: '(1 = Avoided them, 10 = Went into everything)' },
                  { key: 'question2', text: 'When you pressed or challenged, how committed were you?', subtext: '(1 = Soft / hesitant, 10 = 100% effort every time)' },
                  { key: 'question3', text: 'How often did you win your battles or at least make it difficult?', subtext: '(1 = Lost most or backed out, 10 = Made it a real fight every time)' },
                  { key: 'question4', text: 'How much did you enjoy competing and fighting for the ball?', subtext: '(1 = Didn\'t enjoy it, 10 = Loved the challenge and looked for it)' }
                ];
                const currentStep = superBehaviorSteps.aggressive;
                const currentQuestion = behaviorData[currentStep];
                const isComplete = currentStep >= 4;
                const average = isComplete ? ((postActivityData.superBehaviours.aggressive.question1 + postActivityData.superBehaviours.aggressive.question2 + postActivityData.superBehaviours.aggressive.question3 + postActivityData.superBehaviours.aggressive.question4) / 4).toFixed(1) : null;
                const canStart = superBehaviorSteps.electric >= 4;

                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <CustomIcon type="target" size="lg" />
                      <h3 className="text-lg font-bold">Aggressive</h3>
                      {isComplete && (
                        <span className="ml-auto text-primary font-bold">
                          Avg: {average}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Competing, pressing, tackling, 1v1 duels</p>
                    
                    {!canStart ? (
                      <div className="p-4 bg-muted/20 rounded-xl text-center">
                        <p className="text-sm text-muted-foreground">Complete "Electric" first</p>
                      </div>
                    ) : !isComplete ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-muted-foreground">Question {currentStep + 1} of 4</span>
                          <div className="flex gap-1">
                            {[0, 1, 2, 3].map((step) => (
                              <div
                                key={step}
                                className={`w-2 h-2 rounded-full ${
                                  step <= currentStep ? 'bg-primary' : 'bg-muted'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-4 p-4 bg-muted/20 rounded-xl">
                          <div>
                            <p className="text-sm font-medium mb-1">{currentQuestion.text}</p>
                            <p className="text-xs text-muted-foreground">{currentQuestion.subtext}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Rate this:</span>
                              <span className="text-primary font-bold">
                                {postActivityData.superBehaviours.aggressive[currentQuestion.key as keyof typeof postActivityData.superBehaviours.aggressive]}/10
                              </span>
                            </div>
                            <Slider
                              value={[postActivityData.superBehaviours.aggressive[currentQuestion.key as keyof typeof postActivityData.superBehaviours.aggressive]]}
                              onValueChange={(value) => setPostActivityData(prev => ({
                                ...prev,
                                superBehaviours: {
                                  ...prev.superBehaviours,
                                  aggressive: {
                                    ...prev.superBehaviours.aggressive,
                                    [currentQuestion.key]: value[0]
                                  }
                                }
                              }))}
                              max={10}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          
                          <Button 
                            onClick={() => {
                              setSuperBehaviorSteps(prev => ({ ...prev, aggressive: prev.aggressive + 1 }));
                              if (currentStep === 3) {
                                toast({
                                  title: "Aggressive Complete!",
                                  description: `Average score: ${((postActivityData.superBehaviours.aggressive.question1 + postActivityData.superBehaviours.aggressive.question2 + postActivityData.superBehaviours.aggressive.question3 + postActivityData.superBehaviours.aggressive.question4) / 4).toFixed(1)}/10`,
                                });
                              }
                            }}
                            className="w-full"
                          >
                            {currentStep === 3 ? 'Complete Aggressive' : 'Next Question'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-success/10 border border-success/30 rounded-xl">
                         <div className="flex items-center gap-2 text-sm font-medium text-success mb-2">
                           <CustomIcon type="good" size="sm" />
                           <span>Completed!</span>
                         </div>
                        <p className="text-xs text-muted-foreground">Final score: {average}/10</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setSuperBehaviorSteps(prev => ({ ...prev, aggressive: 0 }))}
                        >
                          Redo
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })()}
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

      {/* Mindset Support Flow Modal */}
      {showMindsetFlow && worryData && (
        <MindsetSupportFlow
          worryReason={worryData.reason}
          onComplete={handleMindsetFlowComplete}
          onClose={handleMindsetFlowClose}
        />
      )}
    </div>
  );
}
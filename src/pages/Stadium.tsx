import { useState, useEffect } from "react";
import { Play, CheckCircle, Clock, Target, Heart, Brain, Activity, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import NewActivity from "@/components/Stadium/NewActivity";
import ActivityForm from "@/components/Stadium/ActivityForm";

interface PreGameActivity {
  id: string;
  name: string;
  type: 'scale' | 'checklist' | 'video' | 'audio' | 'text';
  completed: boolean;
  points: number;
  required?: boolean;
}

interface PostGameReflection {
  mood: number | null;
  moodText: string;
  confidence: number;
  focus: number;
  mistakes: number;
  performance: number;
  workRate: number;
  behaviours: {
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

const moodOptions = [
  { emoji: "😢", label: "Sad", value: 1 },
  { emoji: "😕", label: "Not Great", value: 2 },
  { emoji: "😐", label: "Okay", value: 3 },
  { emoji: "😊", label: "Good", value: 4 },
  { emoji: "😁", label: "Amazing", value: 5 },
];

const defaultPreGameActivities: PreGameActivity[] = [
  { id: "confidence", name: "Confidence Scale", type: "scale", completed: false, points: 5, required: true },
  { id: "kit", name: "Kit Check", type: "checklist", completed: false, points: 5 },
  { id: "yoga", name: "Yoga/Stretch Video", type: "video", completed: false, points: 25 },
  { id: "visualisation", name: "Visualisation Audio", type: "audio", completed: false, points: 25 },
  { id: "breathing", name: "Breathing Exercise", type: "checklist", completed: false, points: 5 },
  { id: "intention", name: "Set Intention", type: "text", completed: false, points: 10 },
];

export default function Stadium() {
  const { toast } = useToast();
  
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<any>(null);
  const [preGameActivities, setPreGameActivities] = useState<PreGameActivity[]>(defaultPreGameActivities);
  const [confidenceLevel, setConfidenceLevel] = useState<number>(5);
  const [intention, setIntention] = useState("");
  const [postGameData, setPostGameData] = useState<PostGameReflection>({
    mood: null,
    moodText: "",
    confidence: 5,
    focus: 5,
    mistakes: 5,
    performance: 5,
    workRate: 5,
    behaviours: {
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

  useEffect(() => {
    console.log('[KidMindset] Stadium page loaded');
    loadTodayData();
  }, []);

  const loadTodayData = () => {
    const today = new Date().toDateString();
    
    // Load pre-game data
    const savedPreGame = localStorage.getItem(`kidmindset_pregame_${today}`);
    if (savedPreGame) {
      setPreGameActivities(JSON.parse(savedPreGame));
    }

    // Load post-game data
    const savedPostGame = localStorage.getItem(`kidmindset_postgame_${today}`);
    if (savedPostGame) {
      setPostGameData(JSON.parse(savedPostGame));
    }
  };

  const handleConfidenceSubmit = () => {
    const today = new Date().toDateString();
    
    const updatedActivities = preGameActivities.map(activity => 
      activity.id === "confidence" 
        ? { ...activity, completed: true }
        : activity
    );
    
    setPreGameActivities(updatedActivities);
    localStorage.setItem(`kidmindset_pregame_${today}`, JSON.stringify(updatedActivities));
    
    // Award points (handled by parent component)
    console.log('[KidMindset] Confidence scale completed:', confidenceLevel);
    
    toast({
      title: "Confidence recorded! +5 points",
      description: `You rated your confidence as ${confidenceLevel}/10`,
    });
  };

  const handleActivityComplete = (activityId: string) => {
    const today = new Date().toDateString();
    
    const updatedActivities = preGameActivities.map(activity => 
      activity.id === activityId 
        ? { ...activity, completed: true }
        : activity
    );
    
    setPreGameActivities(updatedActivities);
    localStorage.setItem(`kidmindset_pregame_${today}`, JSON.stringify(updatedActivities));
    
    const activity = preGameActivities.find(a => a.id === activityId);
    console.log('[KidMindset] Activity completed:', activityId);
    
    toast({
      title: `${activity?.name} completed! +${activity?.points} points`,
      description: "Great preparation work!",
    });
  };

  const handleIntentionSubmit = () => {
    if (!intention.trim()) return;
    
    const wordCount = intention.trim().split(/\s+/).length;
    const points = wordCount * 2;
    
    handleActivityComplete("intention");
    
    console.log('[KidMindset] Intention set:', intention, 'Words:', wordCount);
    
    toast({
      title: `Intention set! +${points} points`,
      description: `${wordCount} words written`,
    });
  };

  const handlePostGameMoodSubmit = (moodValue: number) => {
    const updatedData = { ...postGameData, mood: moodValue };
    setPostGameData(updatedData);
    
    const today = new Date().toDateString();
    localStorage.setItem(`kidmindset_postgame_${today}`, JSON.stringify(updatedData));
    
    console.log('[KidMindset] Post-game mood submitted:', moodValue);
    
    toast({
      title: "Mood recorded! +5 points",
      description: "Thanks for sharing how you're feeling",
    });
  };

  const handleReflectionSave = () => {
    const today = new Date().toDateString();
    localStorage.setItem(`kidmindset_postgame_${today}`, JSON.stringify(postGameData));
    
    // Calculate points for journal entries
    const totalWords = Object.values(postGameData.journalPrompts)
      .join(' ')
      .trim()
      .split(/\s+/)
      .length;
    const points = totalWords * 2;
    
    console.log('[KidMindset] Post-game reflection saved, words:', totalWords);
    
    toast({
      title: `Reflection saved! +${points} points`,
      description: "Great job reflecting on your performance",
    });
  };

  const getPreGameProgress = () => {
    const completed = preGameActivities.filter(a => a.completed).length;
    return (completed / preGameActivities.length) * 100;
  };

  const handleNewActivitySubmit = (activity: { name: string; type: string; date: Date }) => {
    setCurrentActivity(activity);
    setShowNewActivity(false);
    setShowActivityForm(true);
  };

  const handleActivityFormComplete = () => {
    setShowActivityForm(false);
    setCurrentActivity(null);
  };

  if (showNewActivity) {
    return (
      <NewActivity
        onSubmit={handleNewActivitySubmit}
        onCancel={() => setShowNewActivity(false)}
      />
    );
  }

  if (showActivityForm && currentActivity) {
    return (
      <ActivityForm
        activity={currentActivity}
        onComplete={handleActivityFormComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              🏟️ Stadium
            </h1>
            <p className="text-muted-foreground">
              Prepare for your game and reflect afterwards
            </p>
          </div>
          <Button
            onClick={() => setShowNewActivity(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            <Plus className="w-4 h-4" />
            New Activity
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pre-game" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pre-game" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Pre-Game
          </TabsTrigger>
          <TabsTrigger value="post-game" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Post-Game
          </TabsTrigger>
        </TabsList>

        {/* Pre-Game Routine */}
        <TabsContent value="pre-game" className="space-y-6">
          {/* Progress Overview */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Pre-Game Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-muted rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getPreGameProgress()}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {preGameActivities.filter(a => a.completed).length} of {preGameActivities.length} activities completed
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
              {!preGameActivities.find(a => a.id === "confidence")?.completed ? (
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
                  <Button 
                    onClick={handleConfidenceSubmit}
                    className="w-full"
                  >
                    Record Confidence
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                  <p className="font-medium text-success">Confidence recorded!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Checklist */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Preparation Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {preGameActivities.filter(a => a.id !== "confidence").map((activity) => (
                <div
                  key={activity.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200",
                    activity.completed 
                      ? "bg-success/10 border-success/30" 
                      : "bg-card border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {activity.completed ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className={cn(
                        "font-medium",
                        activity.completed && "text-success"
                      )}>
                        {activity.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        +{activity.points} points
                      </p>
                    </div>
                  </div>

                  {!activity.completed && activity.id === "intention" ? (
                    <div className="flex gap-2 min-w-0 flex-1 max-w-xs">
                      <Input
                        placeholder="Set your intention..."
                        value={intention}
                        onChange={(e) => setIntention(e.target.value)}
                        className="flex-1 min-w-0"
                      />
                      <Button
                        onClick={handleIntentionSubmit}
                        size="sm"
                        disabled={!intention.trim()}
                      >
                        Set
                      </Button>
                    </div>
                  ) : !activity.completed && (
                    <Button
                      onClick={() => handleActivityComplete(activity.id)}
                      size="sm"
                    >
                      {activity.type === "video" || activity.type === "audio" ? "Watch/Listen" : "Complete"}
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Post-Game Reflection */}
        <TabsContent value="post-game" className="space-y-6">
          {/* Mood Check */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">How do you feel after the game?</CardTitle>
            </CardHeader>
            <CardContent>
              {postGameData.mood === null ? (
                <div className="grid grid-cols-5 gap-2">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => handlePostGameMoodSubmit(mood.value)}
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
                    {moodOptions.find(m => m.value === postGameData.mood)?.emoji}
                  </span>
                  <p className="text-sm text-muted-foreground">Mood recorded!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Ratings */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Rate Your Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: "confidence", label: "Confidence", icon: Brain },
                { key: "focus", label: "Focus", icon: Target },
                { key: "performance", label: "Overall Performance", icon: Activity },
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{label}</span>
                    <span className="ml-auto text-primary font-bold">
                      {key === "confidence" ? postGameData.confidence : 
                       key === "focus" ? postGameData.focus : 
                       postGameData.performance}/10
                    </span>
                  </div>
                  <Slider
                    value={[key === "confidence" ? postGameData.confidence : 
                           key === "focus" ? postGameData.focus : 
                           postGameData.performance]}
                    onValueChange={(value) => setPostGameData(prev => ({
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

          {/* Journal Prompts */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Reflection Journal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  What went well today?
                </label>
                <Textarea
                  placeholder="Share what you did well..."
                  value={postGameData.journalPrompts.wentWell}
                  onChange={(e) => setPostGameData(prev => ({
                    ...prev,
                    journalPrompts: { ...prev.journalPrompts, wentWell: e.target.value }
                  }))}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  What could you improve next time?
                </label>
                <Textarea
                  placeholder="Think about areas for growth..."
                  value={postGameData.journalPrompts.couldImprove}
                  onChange={(e) => setPostGameData(prev => ({
                    ...prev,
                    journalPrompts: { ...prev.journalPrompts, couldImprove: e.target.value }
                  }))}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  What affected your performance and how?
                </label>
                <Textarea
                  placeholder="Reflect on external factors..."
                  value={postGameData.journalPrompts.whatAffected}
                  onChange={(e) => setPostGameData(prev => ({
                    ...prev,
                    journalPrompts: { ...prev.journalPrompts, whatAffected: e.target.value }
                  }))}
                  className="min-h-[80px]"
                />
              </div>

              <Button onClick={handleReflectionSave} className="w-full">
                Save Reflection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
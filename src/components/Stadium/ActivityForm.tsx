import { useState, useEffect } from "react";
import { CheckCircle, Clock, Target, Heart, Brain, Activity, Play, Music, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Activity {
  name: string;
  type: string;
  date: Date;
}

interface PreActivityItem {
  id: string;
  name: string;
  completed: boolean;
  points: number;
}

interface PostActivityReflection {
  mood: number | null;
  workRate: number;
  confidence: number;
  mistakes: number;
  focus: number;
  superBehaviours: {
    braveOnBall: boolean;
    braveOffBall: boolean;
    aggressive: boolean;
    electric: boolean;
  };
  journalPrompts: {
    wentWell: string;
    couldImprove: string;
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
  { id: "yoga-stretch", name: "Yoga / Stretch", completed: false, points: 15 },
  { id: "visualisation", name: "Visualisation", completed: false, points: 15 },
  { id: "breathing", name: "Breathing", completed: false, points: 10 },
];

export default function ActivityForm({ activity, onComplete }: ActivityFormProps) {
  const { toast } = useToast();
  
  const [confidenceLevel, setConfidenceLevel] = useState<number>(5);
  const [intention, setIntention] = useState("");
  const [preActivityItems, setPreActivityItems] = useState<PreActivityItem[]>(defaultPreActivityItems);
  const [postActivityData, setPostActivityData] = useState<PostActivityReflection>({
    mood: null,
    workRate: 5,
    confidence: 5,
    mistakes: 5,
    focus: 5,
    superBehaviours: {
      braveOnBall: false,
      braveOffBall: false,
      aggressive: false,
      electric: false,
    },
    journalPrompts: {
      wentWell: "",
      couldImprove: "",
    },
  });

  const activityKey = `${activity.name.replace(/\s+/g, '_')}_${activity.date.toDateString()}`;

  useEffect(() => {
    loadActivityData();
  }, [activityKey]);

  const loadActivityData = () => {
    const savedPreActivity = localStorage.getItem(`custom_pre_${activityKey}`);
    if (savedPreActivity) {
      const data = JSON.parse(savedPreActivity);
      setPreActivityItems(data.items || defaultPreActivityItems);
      setConfidenceLevel(data.confidence || 5);
      setIntention(data.intention || "");
    }

    const savedPostActivity = localStorage.getItem(`custom_post_${activityKey}`);
    if (savedPostActivity) {
      setPostActivityData(JSON.parse(savedPostActivity));
    }
  };

  const handleConfidenceSubmit = () => {
    const data = {
      items: preActivityItems,
      confidence: confidenceLevel,
      intention,
      confidenceCompleted: true,
    };
    
    localStorage.setItem(`custom_pre_${activityKey}`, JSON.stringify(data));
    
    toast({
      title: "Confidence recorded! +5 points",
      description: `You rated your confidence as ${confidenceLevel}/10`,
    });
  };

  const handleItemComplete = (itemId: string) => {
    const updatedItems = preActivityItems.map(item => 
      item.id === itemId ? { ...item, completed: true } : item
    );
    
    setPreActivityItems(updatedItems);
    
    const data = {
      items: updatedItems,
      confidence: confidenceLevel,
      intention,
    };
    
    localStorage.setItem(`custom_pre_${activityKey}`, JSON.stringify(data));
    
    const item = preActivityItems.find(i => i.id === itemId);
    toast({
      title: `${item?.name} completed! +${item?.points} points`,
      description: "Great preparation work!",
    });
  };

  const handleIntentionSubmit = () => {
    if (!intention.trim()) return;
    
    const wordCount = intention.trim().split(/\s+/).length;
    const points = wordCount * 2;
    
    const data = {
      items: preActivityItems,
      confidence: confidenceLevel,
      intention,
      intentionCompleted: true,
    };
    
    localStorage.setItem(`custom_pre_${activityKey}`, JSON.stringify(data));
    
    toast({
      title: `Intention set! +${points} points`,
      description: `${wordCount} words written`,
    });
  };

  const handlePostActivityMoodSubmit = (moodValue: number) => {
    const updatedData = { ...postActivityData, mood: moodValue };
    setPostActivityData(updatedData);
    
    localStorage.setItem(`custom_post_${activityKey}`, JSON.stringify(updatedData));
    
    toast({
      title: "Mood recorded! +5 points",
      description: "Thanks for sharing how you're feeling",
    });
  };

  const handleReflectionSave = () => {
    localStorage.setItem(`custom_post_${activityKey}`, JSON.stringify(postActivityData));
    
    const totalWords = Object.values(postActivityData.journalPrompts)
      .join(' ')
      .trim()
      .split(/\s+/)
      .length;
    const points = totalWords * 2;
    
    toast({
      title: `Reflection saved! +${points} points`,
      description: "Great job reflecting on your performance",
    });
  };

  const getPreActivityProgress = () => {
    const completed = preActivityItems.filter(item => item.completed).length;
    return (completed / preActivityItems.length) * 100;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={onComplete}
          className="mb-4"
        >
          ← Back to Stadium
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
          </TabsTrigger>
          <TabsTrigger value="post-activity" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Post-Activity
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
                {preActivityItems.filter(item => item.completed).length} of {preActivityItems.length} activities completed
              </p>
            </CardContent>
          </Card>

          {/* Confidence Scale */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Confidence Rating (1-10)
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
                <Button 
                  onClick={handleConfidenceSubmit}
                  className="w-full"
                >
                  Record Confidence
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Pre-Activity Checklist</CardTitle>
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
                        {item.name}
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
              <CardTitle className="text-lg">Set Your Intention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="What do you want to focus on today?"
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                className="w-full"
              />
              <Button
                onClick={handleIntentionSubmit}
                disabled={!intention.trim()}
                className="w-full"
              >
                Set Intention
              </Button>
            </CardContent>
          </Card>

          {/* Tools Section */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Tools & Resources</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="flex items-center gap-2 h-auto p-4">
                <Video className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Video</p>
                  <p className="text-xs text-muted-foreground">Training clips</p>
                </div>
              </Button>
              <Button variant="outline" className="flex items-center gap-2 h-auto p-4">
                <Music className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Audio</p>
                  <p className="text-xs text-muted-foreground">Meditation</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Post-Activity */}
        <TabsContent value="post-activity" className="space-y-6">
          {/* Mood Check */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">How do you feel after the activity?</CardTitle>
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

          {/* Performance Ratings */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Rate Your Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: "workRate", label: "Work Rate", icon: Activity },
                { key: "confidence", label: "Confidence", icon: Brain },
                { key: "focus", label: "Focus", icon: Target },
                { key: "mistakes", label: "Mistake Management", icon: CheckCircle },
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
              <CardTitle className="text-lg">Super-Behaviours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "braveOnBall", label: "Brave on the Ball" },
                { key: "braveOffBall", label: "Brave off the Ball" },
                { key: "aggressive", label: "Aggressive" },
                { key: "electric", label: "Electric" },
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
                  value={postActivityData.journalPrompts.wentWell}
                  onChange={(e) => setPostActivityData(prev => ({
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
                  value={postActivityData.journalPrompts.couldImprove}
                  onChange={(e) => setPostActivityData(prev => ({
                    ...prev,
                    journalPrompts: { ...prev.journalPrompts, couldImprove: e.target.value }
                  }))}
                  className="min-h-[80px]"
                />
              </div>

              <Button 
                onClick={handleReflectionSave}
                className="w-full"
              >
                Save Reflection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface OneToOnePreFormProps {
  activity: {
    name: string;
    type: string;
    date: Date;
  };
  onComplete: (preData: any) => void;
  onBack: () => void;
}

const topicOptions = [
  "Ball striking",
  "1v1 moves",
  "First touch",
  "Passing",
  "Finishing",
  "Crossing",
  "Shooting",
  "Dribbling",
  "Defending",
  "Other"
];

const focusCueOptions = [
  "Head over ball",
  "Lock ankle",
  "First touch away",
  "Scan before receive",
  "Body shape",
  "Weight of pass",
  "Follow through",
  "Plant foot position",
  "Keep possession",
  "Quick decision"
];

export default function OneToOnePreForm({ activity, onComplete, onBack }: OneToOnePreFormProps) {
  const [topicPractised, setTopicPractised] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [sessionGoal, setSessionGoal] = useState("");
  const [focusCues, setFocusCues] = useState<string[]>([]);
  const [coachPresent, setCoachPresent] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(60);

  const handleTopicChange = (value: string) => {
    setTopicPractised(value);
    if (value !== "Other") {
      setCustomTopic("");
    }
  };

  const toggleFocusCue = (cue: string) => {
    setFocusCues(prev => 
      prev.includes(cue) 
        ? prev.filter(c => c !== cue)
        : [...prev, cue]
    );
  };

  const removeFocusCue = (cue: string) => {
    setFocusCues(prev => prev.filter(c => c !== cue));
  };

  const handleSubmit = () => {
    const finalTopic = topicPractised === "Other" ? customTopic : topicPractised;
    
    if (!finalTopic.trim() || !sessionGoal.trim()) return;

    const preData = {
      one_to_one: {
        topic_practised: finalTopic,
        session_goal: sessionGoal,
        focus_cues: focusCues,
        coach_present: coachPresent,
        duration_minutes: durationMinutes
      }
    };

    onComplete(preData);
  };

  const isFormValid = () => {
    const finalTopic = topicPractised === "Other" ? customTopic : topicPractised;
    return finalTopic.trim() && sessionGoal.trim();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">One-to-One (Technical)</h1>
            <p className="text-sm text-muted-foreground">{activity.name}</p>
          </div>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Session Planning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Topic */}
            <div className="space-y-2">
              <Label>Topic</Label>
              <Select value={topicPractised} onValueChange={handleTopicChange}>
                <SelectTrigger>
                  <SelectValue placeholder="What will you work on?" />
                </SelectTrigger>
                <SelectContent>
                  {topicOptions.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {topicPractised === "Other" && (
                <Input
                  placeholder="Enter custom topic"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>

            {/* Session Goal */}
            <div className="space-y-2">
              <Label htmlFor="session-goal">Session goal</Label>
              <Input
                id="session-goal"
                placeholder="e.g. 20 clean instep strikes, 5× successful feints"
                value={sessionGoal}
                onChange={(e) => setSessionGoal(e.target.value)}
              />
            </div>

            {/* Focus Cues */}
            <div className="space-y-3">
              <Label>Focus cues</Label>
              <div className="grid grid-cols-2 gap-2">
                {focusCueOptions.map((cue) => (
                  <Button
                    key={cue}
                    variant={focusCues.includes(cue) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFocusCue(cue)}
                    className="text-xs h-8"
                  >
                    {cue}
                  </Button>
                ))}
              </div>
              {focusCues.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {focusCues.map((cue) => (
                    <Badge key={cue} variant="secondary" className="text-xs">
                      {cue}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFocusCue(cue)}
                        className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>


            {/* Coach Present */}
            <div className="flex items-center justify-between">
              <Label htmlFor="coach-present">Coach present?</Label>
              <Switch
                id="coach-present"
                checked={coachPresent}
                onCheckedChange={setCoachPresent}
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                min={15}
                max={180}
              />
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={!isFormValid()}
              className="w-full"
              size="lg"
            >
              Start Session
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
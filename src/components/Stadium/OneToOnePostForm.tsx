import { useState } from "react";
import { ArrowLeft, CheckCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OneToOnePostFormProps {
  activity: {
    name: string;
    type: string;
    date: Date;
  };
  preData: any;
  onComplete: (postData: any) => void;
  onBack: () => void;
}

const ratingLabels = {
  work_rate: "Work rate",
  performance: "Performance", 
  confidence_during_session: "Confidence",
  enjoyment: "Enjoyment",
  focus_concentration: "Focus"
};

export default function OneToOnePostForm({ activity, preData, onComplete, onBack }: OneToOnePostFormProps) {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState({
    work_rate: [5],
    performance: [5],
    confidence_during_session: [5],
    enjoyment: [5],
    focus_concentration: [5]
  });

  const [whatYouWorkedOn, setWhatYouWorkedOn] = useState(
    preData?.one_to_one?.topic_practised || ""
  );
  const [whatWentWell, setWhatWentWell] = useState("");
  const [whatToImproveNext, setWhatToImproveNext] = useState("");
  const [coachFeedback, setCoachFeedback] = useState("");
  const [goalAchieved, setGoalAchieved] = useState(false);

  const handleRatingChange = (key: keyof typeof ratings, value: number[]) => {
    setRatings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = () => {
    const postData = {
      one_to_one: {
        ratings: {
          work_rate: ratings.work_rate[0],
          performance: ratings.performance[0],
          confidence_during_session: ratings.confidence_during_session[0],
          enjoyment: ratings.enjoyment[0],
          focus_concentration: ratings.focus_concentration[0]
        },
        what_you_worked_on: whatYouWorkedOn,
        what_went_well: whatWentWell,
        what_to_improve_next: whatToImproveNext,
        coach_feedback: coachFeedback,
        goal_achieved: goalAchieved,
        evidence_media_urls: []
      }
    };

    onComplete(postData);
    
    // Navigate to confidence check with performance and confidence data
    navigate('/confidence-check', { 
      state: { 
        performanceRating: preData?.ratings?.performance || 0,
        confidenceRating: ratings.confidence_during_session[0]
      }
    });
  };

  const isFormValid = () => {
    return whatYouWorkedOn.trim() && whatWentWell.trim();
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
            <h1 className="text-lg font-semibold">Session Complete!</h1>
            <p className="text-sm text-muted-foreground">{activity.name}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Ratings */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">How did it go?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(ratingLabels).map(([key, label]) => (
                <div key={key} className="space-y-3">
                  <Label>{label}</Label>
                  <div className="px-3">
                    <Slider
                      value={ratings[key as keyof typeof ratings]}
                      onValueChange={(value) => handleRatingChange(key as keyof typeof ratings, value)}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>1</span>
                      <span className="font-medium">{ratings[key as keyof typeof ratings][0]}</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Session Details */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="worked-on">Worked on</Label>
                <Input
                  id="worked-on"
                  value={whatYouWorkedOn}
                  onChange={(e) => setWhatYouWorkedOn(e.target.value)}
                  placeholder="What did you focus on?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="went-well">Went well</Label>
                <Textarea
                  id="went-well"
                  value={whatWentWell}
                  onChange={(e) => setWhatWentWell(e.target.value)}
                  placeholder="What went really well in this session?"
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="improve-next">Improve next</Label>
                <Textarea
                  id="improve-next"
                  value={whatToImproveNext}
                  onChange={(e) => setWhatToImproveNext(e.target.value)}
                  placeholder="What would you like to work on next time?"
                  className="min-h-[80px]"
                />
              </div>

              {preData?.one_to_one?.coach_present && (
                <div className="space-y-2">
                  <Label htmlFor="coach-feedback">Coach notes</Label>
                  <Textarea
                    id="coach-feedback"
                    value={coachFeedback}
                    onChange={(e) => setCoachFeedback(e.target.value)}
                    placeholder="Any feedback from your coach?"
                    className="min-h-[60px]"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="goal-achieved">Hit your goal?</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="goal-achieved"
                    checked={goalAchieved}
                    onCheckedChange={setGoalAchieved}
                  />
                  {goalAchieved && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
              </div>

              {preData?.one_to_one?.session_goal && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Your goal was:</p>
                  <p className="text-sm text-muted-foreground">{preData.one_to_one.session_goal}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className="w-full"
            size="lg"
          >
            Complete Session 🎉
          </Button>
        </div>
      </div>
    </div>
  );
}
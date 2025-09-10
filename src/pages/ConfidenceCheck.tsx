import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Check, X, RotateCcw, Save, Share2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
interface CheckItem {
  key: string;
  label: string;
}
interface Section {
  title: string;
  items: CheckItem[];
}
const sections: Section[] = [{
  title: "Preparation",
  items: [{
    key: "prep_yoga",
    label: "Yoga/stretch done?"
  }, {
    key: "prep_breathing",
    label: "Breathing done?"
  }, {
    key: "prep_visual",
    label: "Visualisation done?"
  }]
}, {
  title: "Plan",
  items: [{
    key: "plan_super_behaviours",
    label: "Picked Super Behaviours before playing?"
  }, {
    key: "plan_reminder",
    label: "Reminded myself of game plan?"
  }]
}, {
  title: "Know Who You Are",
  items: [{
    key: "worth_perfect",
    label: "Reminded \"I don't need to be perfect\"?"
  }, {
    key: "worth_strengths",
    label: "Trusted my strengths/technique?"
  }, {
    key: "worth_good_anyway",
    label: "Knew I'm still a good player even on a bad day?"
  }]
}, {
  title: "Beating My Mind (ANTs)",
  items: [{
    key: "ants_notice",
    label: "Noticed negative thoughts?"
  }, {
    key: "ants_selftalk",
    label: "Used self-talk to reset?"
  }, {
    key: "ants_no_freeze",
    label: "Didn't let thoughts freeze me?"
  }]
}, {
  title: "Dealing with Challenges",
  items: [{
    key: "challenges_keep_going",
    label: "Kept going when it got hard?"
  }, {
    key: "challenges_reset_fast",
    label: "Reset quickly after a mistake?"
  }, {
    key: "challenges_behaviours",
    label: "Stayed focused on behaviours?"
  }]
}];
const totalItems = sections.reduce((acc, section) => acc + section.items.length, 0);
export default function ConfidenceCheck() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { performanceRating?: number; confidenceRating?: number } | null;
  
  const performanceRating = state?.performanceRating || 0;
  const confidenceRating = state?.confidenceRating || 0;
  
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const stats = useMemo(() => {
    const yesCount = Object.values(answers).filter(Boolean).length;
    const confidencePct = Math.round(yesCount / totalItems * 100);
    const nervesPct = 100 - confidencePct;
    const sectionScores = sections.map(section => {
      const sectionYes = section.items.filter(item => answers[item.key]).length;
      return {
        title: section.title,
        score: sectionYes,
        total: section.items.length
      };
    });
    let badge = "Needs prep";
    if (confidencePct >= 70) badge = "Ready";else if (confidencePct >= 40) badge = "Almost";
    return {
      yesCount,
      confidencePct,
      nervesPct,
      sectionScores,
      badge
    };
  }, [answers]);
  const handleToggle = (key: string, checked: boolean) => {
    setAnswers(prev => ({
      ...prev,
      [key]: checked
    }));
    if (checked && notes[key]) {
      setNotes(prev => {
        const newNotes = {
          ...prev
        };
        delete newNotes[key];
        return newNotes;
      });
    }
  };
  const handleNoteChange = (key: string, value: string) => {
    setNotes(prev => ({
      ...prev,
      [key]: value
    }));
  };
  const handleReset = () => {
    setAnswers({});
    setNotes({});
  };
  const handleSave = () => {
    console.log('Saving data:', {
      answers,
      notes,
      stats
    });
    // TODO: Save to Supabase
  };
  const handleShare = () => {
    console.log('Sharing with coach:', {
      answers,
      notes,
      stats
    });
    // TODO: Implement share functionality
  };

  const handleBackClick = () => {
    navigate('/stadium');
  };
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Confidence Check </h1>
            <p className="text-muted-foreground">
              Tick 'Yes' when you did it today. Your confidence grows. Your nerves shrink.
            </p>
          </div>

          {/* Performance and Confidence Bars */}
          {(performanceRating > 0 || confidenceRating > 0) && (
            <div className="space-y-4 mb-6 p-4 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Today's Activity Results
              </h3>
              
              {performanceRating > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Performance Rating: {performanceRating}/10
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      How you performed today
                    </Badge>
                  </div>
                  <Progress value={performanceRating * 10} className="h-4 [&>div]:bg-blue-500" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your performance level during the activity
                  </p>
                </div>
              )}
              
              {confidenceRating > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Confidence During Activity: {confidenceRating}/10
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      How confident you felt
                    </Badge>
                  </div>
                  <Progress value={confidenceRating * 10} className="h-4 [&>div]:bg-green-500" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your confidence level during the session
                  </p>
                </div>
              )}
              
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Compare these with your preparation confidence below
                </p>
              </div>
            </div>
          )}

          {/* Progress Bars */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Confidence: {stats.confidencePct}%
              </span>
              <Badge variant={stats.confidencePct >= 70 ? "default" : stats.confidencePct >= 40 ? "secondary" : "destructive"} className="animate-pulse">
                {stats.badge}
              </Badge>
            </div>
            <Progress value={stats.confidencePct} className="h-6 transition-all duration-300 ease-out [&>div]:bg-lime-500" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Nerves: {stats.nervesPct}%
              </span>
              <span className="text-xs text-muted-foreground">
                Nerves drop as you prepare and stick to your behaviours
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-6 transition-all duration-300 ease-out">
              <div className="h-6 bg-destructive rounded-full transition-all duration-300 ease-out" style={{
              width: `${stats.nervesPct}%`
            }} />
            </div>

            {/* Section Chips */}
            <div className="flex flex-wrap gap-2 justify-center">
              {stats.sectionScores.map((section, index) => <Badge key={index} variant="outline" className="text-xs transition-all duration-200">
                  {section.title} {section.score}/{section.total}
                </Badge>)}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
        {sections.map((section, sectionIndex) => <div key={sectionIndex} className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              {section.title}
              <Badge variant="secondary" className="text-xs">
                {stats.sectionScores[sectionIndex].score}/{stats.sectionScores[sectionIndex].total}
              </Badge>
            </h2>
            
            <div className="space-y-4">
              {section.items.map(item => {
            const isChecked = answers[item.key] || false;
            const showNote = !isChecked && notes[item.key] !== undefined;
            return <div key={item.key} className={cn("bg-card border border-border rounded-lg p-4 transition-all duration-200", isChecked && "border-green-500 bg-green-50/50 dark:bg-green-950/20")}>
                    <div className="flex items-center justify-between gap-4">
                      <label htmlFor={item.key} className="flex-1 text-base font-medium text-foreground cursor-pointer">
                        {item.label}
                      </label>
                      
                      <div className="flex items-center gap-3">
                        {isChecked ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-500" />}
                        
                        <Switch id={item.key} checked={isChecked} onCheckedChange={checked => handleToggle(item.key, checked)} className="transition-all duration-200" />
                      </div>
                    </div>

                    {/* Why? Note input */}
                    {!isChecked && <div className="mt-3 pt-3 border-t border-border">
                        <label className="text-sm text-muted-foreground mb-2 block">
                          Why not? (optional)
                        </label>
                        <Input value={notes[item.key] || ''} onChange={e => handleNoteChange(item.key, e.target.value)} placeholder="Quick note..." className="text-sm" />
                      </div>}
                  </div>;
          })}
            </div>
          </div>)}
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save
            </Button>
            
            <Button variant="secondary" onClick={handleShare} className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share with Coach
            </Button>
          </div>
        </div>
      </div>
    </div>;
}
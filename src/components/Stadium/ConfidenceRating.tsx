import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface ConfidenceRatingProps {
  ratings: {
    excited: number;
    nervous: number;
    bodyReady: number;
    believeWell: number;
  };
  onRatingsChange: (ratings: {
    excited: number;
    nervous: number;
    bodyReady: number;
    believeWell: number;
  }) => void;
  showAverage?: boolean;
}

const questions = [
  {
    key: 'excited' as const,
    question: 'How excited are you to play today?',
    description: 'Rate your excitement level from 1 (not excited at all) to 10 (extremely excited)'
  },
  {
    key: 'nervous' as const,
    question: 'How nervous or calm do you feel before activity?',
    description: 'Rate how you feel from 1 (very nervous) to 10 (very calm)'
  },
  {
    key: 'bodyReady' as const,
    question: 'How ready does your body feel to play today?',
    description: 'Rate your physical readiness from 1 (not ready) to 10 (fully ready)'
  },
  {
    key: 'believeWell' as const,
    question: 'How much do you believe that you can do well today?',
    description: 'Rate your belief in your ability from 1 (no confidence) to 10 (complete confidence)'
  }
];

export default function ConfidenceRating({
  ratings,
  onRatingsChange,
  showAverage = false
}: ConfidenceRatingProps) {
  const handleRatingChange = (questionKey: keyof typeof ratings, value: number) => {
    const newRatings = {
      ...ratings,
      [questionKey]: value
    };
    onRatingsChange(newRatings);
  };

  const calculateAverage = () => {
    const values = Object.values(ratings);
    const sum = values.reduce((acc, val) => acc + val, 0);
    return Math.round((sum / values.length) * 10) / 10;
  };

  const getSliderColor = (value: number) => {
    if (value >= 8) return 'bg-success';
    if (value >= 6) return 'bg-warning';
    return 'bg-destructive';
  };

  const average = calculateAverage();

  return (
    <div className="space-y-6">
      <Card className="shadow-soft border-primary/20">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-bold text-primary">
            Confidence Check-in
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Answer each question using the 1-10 scale
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((q, index) => (
            <div key={q.key} className="space-y-3">
              <div className="space-y-1">
                <h4 className="font-medium text-foreground">
                  {index + 1}. {q.question}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {q.description}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">1</span>
                  <span className="text-sm font-semibold text-primary">
                    {ratings[q.key]}/10
                  </span>
                  <span className="text-xs text-muted-foreground">10</span>
                </div>
                
                <div className="px-2">
                  <Slider
                    value={[ratings[q.key]]}
                    onValueChange={(value) => handleRatingChange(q.key, value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className={cn(
                      "transition-all duration-200",
                      `[&_.slider-range]:${getSliderColor(ratings[q.key])}`
                    )}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          ))}
          
          {showAverage && (
            <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Your Average Confidence Level
                </p>
                <p className={cn(
                  "text-2xl font-bold",
                  average >= 7 ? "text-success" : average >= 5 ? "text-warning" : "text-destructive"
                )}>
                  {average}/10
                </p>
                {average < 7 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    We'll help you work through any worries
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
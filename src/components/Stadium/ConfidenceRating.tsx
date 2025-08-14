import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
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
const questions = [{
  key: 'excited' as const,
  question: 'How excited are you to play today?',
  description: 'Rate your excitement level from 1 (not excited at all) to 10 (extremely excited)'
}, {
  key: 'nervous' as const,
  question: 'How nervous or calm do you feel before activity?',
  description: 'Rate how you feel from 1 (very nervous) to 10 (very calm)'
}, {
  key: 'bodyReady' as const,
  question: 'How ready does your body feel to play today?',
  description: 'Rate your physical readiness from 1 (not ready) to 10 (fully ready)'
}, {
  key: 'believeWell' as const,
  question: 'How much do you believe that you can do well today?',
  description: 'Rate your belief in your ability from 1 (no confidence) to 10 (complete confidence)'
}];
export default function ConfidenceRating({
  ratings,
  onRatingsChange,
  showAverage = false
}: ConfidenceRatingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
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
    return Math.round(sum / values.length * 10) / 10;
  };
  const getSliderColor = (value: number) => {
    if (value >= 8) return 'bg-success';
    if (value >= 6) return 'bg-warning';
    return 'bg-destructive';
  };
  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };
  const handlePrevious = () => {
    if (showResults) {
      setShowResults(false);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  const progress = (currentStep + (showResults ? 1 : 0)) / (questions.length + (showAverage ? 1 : 0)) * 100;
  const average = calculateAverage();
  if (showResults && showAverage) {
    return <div className="space-y-6">
        <Card className="shadow-soft border-primary/20">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-bold text-primary">
              Confidence Check-in Complete!
            </CardTitle>
            <Progress value={100} className="w-full mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Your Average Confidence Level
                </p>
                <p className={cn("text-2xl font-bold", average >= 7 ? "text-success" : average >= 5 ? "text-warning" : "text-destructive")}>
                  {average}/10
                </p>
                {average < 7 && <p className="text-xs text-muted-foreground mt-2">
                    We'll help you work through any worries
                  </p>}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrevious} className="flex-1">
                Back to Questions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>;
  }
  const currentQuestion = questions[currentStep];
  return <div className="space-y-6">
      <Card className="shadow-soft border-primary/20">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-bold text-primary">Let’s build your confidence 
First we will check how you are feeling</CardTitle>
          <p className="text-sm text-muted-foreground">
            Question {currentStep + 1} of {questions.length}
          </p>
          <Progress value={progress} className="w-full mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="space-y-1">
              <h4 className="font-medium text-foreground text-center">
                {currentStep + 1}. {currentQuestion.question}
              </h4>
              <p className="text-xs text-muted-foreground text-center">
                {currentQuestion.description}
              </p>
            </div>
            
            <div className="space-y-4 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">1</span>
                <span className="text-lg font-bold text-primary">
                  {ratings[currentQuestion.key]}/10
                </span>
                <span className="text-xs text-muted-foreground">10</span>
              </div>
              
              <div className="px-2">
                <Slider value={[ratings[currentQuestion.key]]} onValueChange={value => handleRatingChange(currentQuestion.key, value[0])} max={10} min={1} step={1} className={cn("transition-all duration-200", `[&_.slider-range]:${getSliderColor(ratings[currentQuestion.key])}`)} />
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0} className="flex-1">
              Previous
            </Button>
            <Button onClick={handleNext} className="flex-1">
              {currentStep === questions.length - 1 ? 'Complete' : 'Next Question'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>;
}
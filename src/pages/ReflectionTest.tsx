import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useChildData } from '@/hooks/useChildData';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const reflectionQuestions = [
  {
    key: 'self_worth',
    title: 'Self-Worth & Identity',
    question: 'How did you feel about yourself during this activity?'
  },
  {
    key: 'goals_planning',
    title: 'Goals & Planning',
    question: 'How did you handle your preparation and goals?'
  },
  {
    key: 'preparation_autonomy',
    title: 'Preparation & Autonomy',
    question: 'How independent were you in getting ready?'
  },
  {
    key: 'focus_behaviours',
    title: 'Focus & Behaviors',
    question: 'How well did you stay focused and in control?'
  },
  {
    key: 'beating_mind',
    title: 'Beating Your Mind',
    question: 'How did you handle negative thoughts or doubts?'
  },
  {
    key: 'dealing_failure',
    title: 'Dealing with Setbacks',
    question: 'How did you respond to mistakes or challenges?'
  }
];

const answerOptions = [
  {
    value: 'level_1',
    text: 'I felt like I wasn\'t good enough...',
    emoji: '🔴',
    color: 'text-destructive'
  },
  {
    value: 'level_2',
    text: 'I tried not to, but I still let the outcomes affect how I see myself.',
    emoji: '🟡',
    color: 'text-warning'
  },
  {
    value: 'level_3',
    text: 'I reminded myself that mistakes don\'t define me – with some help.',
    emoji: '🔵',
    color: 'text-blue-600'
  },
  {
    value: 'level_4',
    text: 'I knew my performance didn\'t change who I am.',
    emoji: '🟢',
    color: 'text-success'
  }
];

export default function ReflectionTest() {
  const { childId, loading } = useChildData();
  const { toast } = useToast();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleResponse = (questionKey: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionKey]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < reflectionQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!childId) {
      toast({
        title: "Error",
        description: "Child ID not found",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare data for insertion
      const reflectionData = Object.entries(responses).map(([questionKey, selectedOption]) => {
        const option = answerOptions.find(opt => opt.value === selectedOption);
        return {
          child_id: childId,
          question_key: questionKey,
          selected_option: `${option?.emoji} ${option?.text}` || selectedOption
        };
      });

      // Insert all responses
      const { error } = await supabase
        .from('mindset_reflections_test')
        .insert(reflectionData);

      if (error) throw error;

      setIsComplete(true);
      toast({
        title: "Success!",
        description: "Your reflection has been saved.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error saving reflection:', error);
      toast({
        title: "Error",
        description: "Failed to save your reflection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-4xl mb-4">🌟</div>
            <h2 className="text-2xl font-bold mb-4">Thank you, legend!</h2>
            <p className="text-muted-foreground mb-6">
              Your honest reflection helps you grow stronger. Keep being awesome!
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = reflectionQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === reflectionQuestions.length - 1;
  const canProceed = responses[question.key];
  const allQuestionsAnswered = reflectionQuestions.every(q => responses[q.key]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-lg">
            Hey legend — this isn't about how well you played. It's about how <em>you felt</em>. Take a moment and answer honestly:
          </CardTitle>
          <div className="w-full bg-muted rounded-full h-2 mt-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / reflectionQuestions.length) * 100}%` }}
            />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Question {currentQuestion + 1} of {reflectionQuestions.length}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">{question.title}</h3>
            <p className="text-muted-foreground mb-4">{question.question}</p>
          </div>

          <RadioGroup
            value={responses[question.key] || ''}
            onValueChange={(value) => handleResponse(question.key, value)}
            className="space-y-4"
          >
            {answerOptions.map((option) => (
              <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  <div className="flex items-start space-x-2">
                    <span className="text-lg">{option.emoji}</span>
                    <span className={`${option.color} font-medium`}>
                      {option.text}
                    </span>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={!allQuestionsAnswered || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Complete Reflection'
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed}
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

export const ResilienceTracker = () => {
  const [challenge, setChallenge] = useState('');
  const [initialReaction, setInitialReaction] = useState('');
  const [learningPoints, setLearningPoints] = useState('');
  const [resilienceRating, setResilienceRating] = useState([5]);
  const [nextSteps, setNextSteps] = useState('');
  const [bounceBackPlan, setBounceBackPlan] = useState('');
  const { toast } = useToast();

  const saveResilience = () => {
    toast({
      title: "Resilience Saved",
      description: "Your resilience reflection has been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">6</Badge>
            <div>
              <CardTitle className="text-red-400">DEALING WITH CHALLENGES</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Building Resilience
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-accent/50 p-4 rounded-lg border-l-4 border-red-500">
            <p className="font-semibold text-red-400">Core Principle:</p>
            <p className="text-lg">"How do you react when things don't go your way?"</p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Recent Challenge or Setback</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Describe a recent challenge, mistake, or disappointing result
            </p>
            <Textarea
              placeholder="What happened? What was the challenge or setback?"
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div>
            <h3 className="font-semibold mb-3">Initial Reaction</h3>
            <p className="text-sm text-muted-foreground mb-3">
              How did you first react? What emotions did you feel?
            </p>
            <Textarea
              placeholder="My first reaction was... I felt..."
              value={initialReaction}
              onChange={(e) => setInitialReaction(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div>
            <h3 className="font-semibold mb-3">Rate Your Resilience Response</h3>
            <p className="text-sm text-muted-foreground mb-3">
              How well did you handle this challenge? (1 = Very Poorly, 10 = Excellently)
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Resilience Response</span>
                <span className="text-lg font-bold">{resilienceRating[0]}/10</span>
              </div>
              <Slider
                value={resilienceRating}
                onValueChange={setResilienceRating}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">What I Learned</h3>
            <p className="text-sm text-muted-foreground mb-3">
              What can you learn from this experience? How can it help you grow?
            </p>
            <Textarea
              placeholder="From this experience, I learned..."
              value={learningPoints}
              onChange={(e) => setLearningPoints(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div>
            <h3 className="font-semibold mb-3">Next Steps</h3>
            <p className="text-sm text-muted-foreground mb-3">
              What specific actions will you take moving forward?
            </p>
            <Textarea
              placeholder="To move forward, I will..."
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div>
            <h3 className="font-semibold mb-3">Bounce-Back Plan</h3>
            <p className="text-sm text-muted-foreground mb-3">
              How will you handle similar challenges in the future?
            </p>
            <Textarea
              placeholder="Next time I face a similar challenge, I will..."
              value={bounceBackPlan}
              onChange={(e) => setBounceBackPlan(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Resilience Principles:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Failures are learning opportunities</li>
              <li>• Focus on what you can control</li>
              <li>• Every setback is a setup for a comeback</li>
              <li>• Mental toughness is built through adversity</li>
            </ul>
          </div>

          <Button onClick={saveResilience} className="w-full">
            Save My Resilience Reflection
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
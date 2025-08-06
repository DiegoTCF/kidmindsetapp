import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export const ANTsTracker = () => {
  const [negativeTrigger, setNegativeTrigger] = useState('');
  const [automaticThought, setAutomaticThought] = useState('');
  const [alternativeThought, setAlternativeThought] = useState('');
  const [positiveAffirmations, setPositiveAffirmations] = useState(['']);
  const [copingStrategies, setCopingStrategies] = useState(['']);
  const { toast } = useToast();

  const addAffirmation = () => {
    setPositiveAffirmations([...positiveAffirmations, '']);
  };

  const updateAffirmation = (index: number, value: string) => {
    const updated = [...positiveAffirmations];
    updated[index] = value;
    setPositiveAffirmations(updated);
  };

  const addStrategy = () => {
    setCopingStrategies([...copingStrategies, '']);
  };

  const updateStrategy = (index: number, value: string) => {
    const updated = [...copingStrategies];
    updated[index] = value;
    setCopingStrategies(updated);
  };

  const saveANTs = () => {
    toast({
      title: "ANTs Progress Saved",
      description: "Your mind ANTs tracking has been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">5</Badge>
            <div>
              <CardTitle className="text-yellow-400">BEATING YOUR MIND ANTs</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                The Thinking Trap
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-accent/50 p-4 rounded-lg border-l-4 border-yellow-500">
            <p className="font-semibold text-yellow-400">Core Principle:</p>
            <p className="text-lg">"Beat the voice that says you can't do it"</p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Identify the Trigger</h3>
            <p className="text-sm text-muted-foreground mb-3">
              What situation or thought triggered negative thinking today?
            </p>
            <Textarea
              placeholder="Describe the situation that triggered negative thoughts..."
              value={negativeTrigger}
              onChange={(e) => setNegativeTrigger(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div>
            <h3 className="font-semibold mb-3">Catch the ANT (Automatic Negative Thought)</h3>
            <p className="text-sm text-muted-foreground mb-3">
              What was the specific negative thought that came to mind?
            </p>
            <Textarea
              placeholder="The negative thought was..."
              value={automaticThought}
              onChange={(e) => setAutomaticThought(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div>
            <h3 className="font-semibold mb-3">Challenge & Replace</h3>
            <p className="text-sm text-muted-foreground mb-3">
              What's a more balanced, realistic thought to replace the ANT?
            </p>
            <Textarea
              placeholder="A more balanced thought would be..."
              value={alternativeThought}
              onChange={(e) => setAlternativeThought(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div>
            <h3 className="font-semibold mb-3">Positive Affirmations</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Build your arsenal of positive self-talk
            </p>
            {positiveAffirmations.map((affirmation, index) => (
              <Input
                key={index}
                placeholder="I am... / I can... / I will..."
                value={affirmation}
                onChange={(e) => updateAffirmation(index, e.target.value)}
                className="mb-3"
              />
            ))}
            <Button variant="outline" onClick={addAffirmation} className="w-full">
              Add Affirmation
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Coping Strategies</h3>
            <p className="text-sm text-muted-foreground mb-3">
              What strategies help you deal with negative thoughts?
            </p>
            {copingStrategies.map((strategy, index) => (
              <Input
                key={index}
                placeholder="When I have negative thoughts, I will..."
                value={strategy}
                onChange={(e) => updateStrategy(index, e.target.value)}
                className="mb-3"
              />
            ))}
            <Button variant="outline" onClick={addStrategy} className="w-full">
              Add Strategy
            </Button>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">ANT Busting Techniques:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Stop and identify the thought</li>
              <li>• Question: "Is this thought helpful or true?"</li>
              <li>• Replace with a balanced perspective</li>
              <li>• Practice positive self-talk daily</li>
            </ul>
          </div>

          <Button onClick={saveANTs} className="w-full">
            Squash Those ANTs!
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
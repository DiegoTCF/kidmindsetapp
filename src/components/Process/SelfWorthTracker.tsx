import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export const SelfWorthTracker = () => {
  const [reflection, setReflection] = useState('');
  const [positiveThoughts, setPositiveThoughts] = useState(['']);
  const { toast } = useToast();

  const addPositiveThought = () => {
    setPositiveThoughts([...positiveThoughts, '']);
  };

  const updatePositiveThought = (index: number, value: string) => {
    const updated = [...positiveThoughts];
    updated[index] = value;
    setPositiveThoughts(updated);
  };

  const saveProgress = () => {
    toast({
      title: "Progress Saved",
      description: "Your self-worth reflection has been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">1</Badge>
            <div>
              <CardTitle className="text-cyan-400">KNOW WHO YOU ARE</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Separating Self-Worth
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-accent/50 p-4 rounded-lg border-l-4 border-cyan-500">
            <p className="font-semibold text-cyan-400">Core Principle:</p>
            <p className="text-lg">"A bad day doesn't reflect who I am"</p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Daily Self-Worth Reflection</h3>
            <Textarea
              placeholder="Reflect on your identity today. What defines you beyond your performance? What are your core values and strengths?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div>
            <h3 className="font-semibold mb-3">Positive Identity Statements</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Write positive statements about who you are as a person (not just as a player)
            </p>
            {positiveThoughts.map((thought, index) => (
              <Textarea
                key={index}
                placeholder="I am..."
                value={thought}
                onChange={(e) => updatePositiveThought(index, e.target.value)}
                className="mb-3"
              />
            ))}
            <Button variant="outline" onClick={addPositiveThought} className="w-full">
              Add Another Statement
            </Button>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Remember:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Your worth isn't determined by your performance</li>
              <li>• Bad days are temporary, your character is permanent</li>
              <li>• You are more than just a football player</li>
              <li>• Your effort and attitude matter more than results</li>
            </ul>
          </div>

          <Button onClick={saveProgress} className="w-full">
            Save My Reflection
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
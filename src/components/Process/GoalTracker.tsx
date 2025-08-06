import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

export const GoalTracker = () => {
  const [shortTermGoals, setShortTermGoals] = useState(['']);
  const [longTermGoals, setLongTermGoals] = useState(['']);
  const [weeklyTargets, setWeeklyTargets] = useState([
    { text: '', completed: false }
  ]);
  const { toast } = useToast();

  const addGoal = (type: 'short' | 'long') => {
    if (type === 'short') {
      setShortTermGoals([...shortTermGoals, '']);
    } else {
      setLongTermGoals([...longTermGoals, '']);
    }
  };

  const updateGoal = (type: 'short' | 'long', index: number, value: string) => {
    if (type === 'short') {
      const updated = [...shortTermGoals];
      updated[index] = value;
      setShortTermGoals(updated);
    } else {
      const updated = [...longTermGoals];
      updated[index] = value;
      setLongTermGoals(updated);
    }
  };

  const addWeeklyTarget = () => {
    setWeeklyTargets([...weeklyTargets, { text: '', completed: false }]);
  };

  const updateWeeklyTarget = (index: number, field: 'text' | 'completed', value: string | boolean) => {
    const updated = [...weeklyTargets];
    updated[index] = { ...updated[index], [field]: value };
    setWeeklyTargets(updated);
  };

  const saveGoals = () => {
    toast({
      title: "Goals Saved",
      description: "Your goals and targets have been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">2</Badge>
            <div>
              <CardTitle className="text-yellow-400">SET GOALS</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Know What You Want
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-accent/50 p-4 rounded-lg border-l-4 border-yellow-500">
            <p className="font-semibold text-yellow-400">Core Principle:</p>
            <p className="text-lg">"Know what you want"</p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Short-Term Goals (1-3 months)</h3>
            {shortTermGoals.map((goal, index) => (
              <Input
                key={index}
                placeholder="Enter a short-term goal..."
                value={goal}
                onChange={(e) => updateGoal('short', index, e.target.value)}
                className="mb-3"
              />
            ))}
            <Button variant="outline" onClick={() => addGoal('short')} className="w-full">
              Add Short-Term Goal
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Long-Term Goals (6+ months)</h3>
            {longTermGoals.map((goal, index) => (
              <Input
                key={index}
                placeholder="Enter a long-term goal..."
                value={goal}
                onChange={(e) => updateGoal('long', index, e.target.value)}
                className="mb-3"
              />
            ))}
            <Button variant="outline" onClick={() => addGoal('long')} className="w-full">
              Add Long-Term Goal
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-3">This Week's Targets</h3>
            {weeklyTargets.map((target, index) => (
              <div key={index} className="flex items-center gap-3 mb-3">
                <Checkbox
                  checked={target.completed}
                  onCheckedChange={(checked) => updateWeeklyTarget(index, 'completed', checked as boolean)}
                />
                <Input
                  placeholder="Weekly target..."
                  value={target.text}
                  onChange={(e) => updateWeeklyTarget(index, 'text', e.target.value)}
                  className={target.completed ? 'line-through opacity-60' : ''}
                />
              </div>
            ))}
            <Button variant="outline" onClick={addWeeklyTarget} className="w-full">
              Add Weekly Target
            </Button>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Goal Setting Tips:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Make goals specific and measurable</li>
              <li>• Focus on process goals, not just outcome goals</li>
              <li>• Break big goals into smaller steps</li>
              <li>• Review and adjust goals regularly</li>
            </ul>
          </div>

          <Button onClick={saveGoals} className="w-full">
            Save My Goals
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
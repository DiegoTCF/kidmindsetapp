import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

export const RoutineTracker = () => {
  const [preGameRoutine, setPreGameRoutine] = useState([
    { task: '', completed: false }
  ]);
  const [trainingRoutine, setTrainingRoutine] = useState([
    { task: '', completed: false }
  ]);
  const [dailyHabits, setDailyHabits] = useState([
    { habit: '', completed: false }
  ]);
  const { toast } = useToast();

  const addRoutineItem = (type: 'pregame' | 'training' | 'daily') => {
    if (type === 'pregame') {
      setPreGameRoutine([...preGameRoutine, { task: '', completed: false }]);
    } else if (type === 'training') {
      setTrainingRoutine([...trainingRoutine, { task: '', completed: false }]);
    } else {
      setDailyHabits([...dailyHabits, { habit: '', completed: false }]);
    }
  };

  const updateRoutineItem = (type: 'pregame' | 'training' | 'daily', index: number, field: 'task' | 'habit' | 'completed', value: string | boolean) => {
    if (type === 'pregame') {
      const updated = [...preGameRoutine];
      updated[index] = { ...updated[index], [field]: value };
      setPreGameRoutine(updated);
    } else if (type === 'training') {
      const updated = [...trainingRoutine];
      updated[index] = { ...updated[index], [field]: value };
      setTrainingRoutine(updated);
    } else {
      const updated = [...dailyHabits];
      updated[index] = { ...updated[index], [field]: value };
      setDailyHabits(updated);
    }
  };

  const saveRoutines = () => {
    toast({
      title: "Routines Saved",
      description: "Your routines and habits have been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">3</Badge>
            <div>
              <CardTitle className="text-purple-400">PREPARATION & HABITS</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Autonomy Through Routine
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-accent/50 p-4 rounded-lg border-l-4 border-purple-500">
            <p className="font-semibold text-purple-400">Core Principle:</p>
            <p className="text-lg">"Trust your routine"</p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Pre-Game Routine</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Build a consistent routine you can rely on before matches
            </p>
            {preGameRoutine.map((item, index) => (
              <div key={index} className="flex items-center gap-3 mb-3">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={(checked) => updateRoutineItem('pregame', index, 'completed', checked as boolean)}
                />
                <Input
                  placeholder="Pre-game routine step..."
                  value={item.task}
                  onChange={(e) => updateRoutineItem('pregame', index, 'task', e.target.value)}
                  className={item.completed ? 'line-through opacity-60' : ''}
                />
              </div>
            ))}
            <Button variant="outline" onClick={() => addRoutineItem('pregame')} className="w-full">
              Add Pre-Game Step
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Training Routine</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Consistent preparation for training sessions
            </p>
            {trainingRoutine.map((item, index) => (
              <div key={index} className="flex items-center gap-3 mb-3">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={(checked) => updateRoutineItem('training', index, 'completed', checked as boolean)}
                />
                <Input
                  placeholder="Training routine step..."
                  value={item.task}
                  onChange={(e) => updateRoutineItem('training', index, 'task', e.target.value)}
                  className={item.completed ? 'line-through opacity-60' : ''}
                />
              </div>
            ))}
            <Button variant="outline" onClick={() => addRoutineItem('training')} className="w-full">
              Add Training Step
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Daily Habits</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Small daily actions that build towards your goals
            </p>
            {dailyHabits.map((item, index) => (
              <div key={index} className="flex items-center gap-3 mb-3">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={(checked) => updateRoutineItem('daily', index, 'completed', checked as boolean)}
                />
                <Input
                  placeholder="Daily habit..."
                  value={item.habit}
                  onChange={(e) => updateRoutineItem('daily', index, 'habit', e.target.value)}
                  className={item.completed ? 'line-through opacity-60' : ''}
                />
              </div>
            ))}
            <Button variant="outline" onClick={() => addRoutineItem('daily')} className="w-full">
              Add Daily Habit
            </Button>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Routine Benefits:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Reduces anxiety and nerves</li>
              <li>• Creates consistency in performance</li>
              <li>• Builds confidence through preparation</li>
              <li>• Develops autonomy and self-reliance</li>
            </ul>
          </div>

          <Button onClick={saveRoutines} className="w-full">
            Save My Routines
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
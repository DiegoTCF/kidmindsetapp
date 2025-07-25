import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Goal {
  id: string;
  outcome_goal: string;
  process_goals: string[];
  progress: number;
  completed_process_goals: number[];
  created_at: string;
  updated_at: string;
}

interface GoalCardProps {
  goal: Goal;
  onUpdate: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onUpdate }) => {
  const { toast } = useToast();

  const updateGoal = async (updates: Partial<Goal>) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', goal.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      });
    }
  };

  const toggleProcessGoal = async (index: number) => {
    const isCompleted = goal.completed_process_goals.includes(index);
    let newCompleted: number[];

    if (isCompleted) {
      newCompleted = goal.completed_process_goals.filter(i => i !== index);
    } else {
      newCompleted = [...goal.completed_process_goals, index];
    }

    const newProgress = Math.round((newCompleted.length / goal.process_goals.length) * 100);

    await updateGoal({
      completed_process_goals: newCompleted,
      progress: newProgress,
    });
  };

  const deleteGoal = async () => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goal.id);

      if (error) throw error;
      onUpdate();
      toast({
        title: "Success",
        description: "Goal deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-bold text-foreground pr-4">
            {goal.outcome_goal}
          </CardTitle>
          <Button
            onClick={deleteGoal}
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-bold text-foreground">{goal.progress}%</span>
          </div>
          <Progress value={goal.progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <h4 className="font-bold text-foreground">Process Goals:</h4>
        <div className="space-y-2">
          {goal.process_goals.map((processGoal, index) => (
            <div key={index} className="flex items-center space-x-3">
              <Checkbox
                id={`process-${goal.id}-${index}`}
                checked={goal.completed_process_goals.includes(index)}
                onCheckedChange={() => toggleProcessGoal(index)}
                className="border-border"
              />
              <label
                htmlFor={`process-${goal.id}-${index}`}
                className={`text-sm cursor-pointer flex-1 ${
                  goal.completed_process_goals.includes(index)
                    ? 'line-through text-muted-foreground'
                    : 'text-foreground'
                }`}
              >
                {processGoal}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
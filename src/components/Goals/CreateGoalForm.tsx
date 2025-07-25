import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateGoalFormProps {
  onGoalCreated: () => void;
}

export const CreateGoalForm: React.FC<CreateGoalFormProps> = ({ onGoalCreated }) => {
  const [outcomeGoal, setOutcomeGoal] = useState('');
  const [processGoals, setProcessGoals] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const addProcessGoal = () => {
    setProcessGoals([...processGoals, '']);
  };

  const removeProcessGoal = (index: number) => {
    if (processGoals.length > 1) {
      setProcessGoals(processGoals.filter((_, i) => i !== index));
    }
  };

  const updateProcessGoal = (index: number, value: string) => {
    const updated = [...processGoals];
    updated[index] = value;
    setProcessGoals(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Input validation and sanitization
    const sanitizedOutcome = outcomeGoal.trim().slice(0, 500);
    if (!sanitizedOutcome) {
      toast({
        title: "Error",
        description: "Please enter an outcome goal",
        variant: "destructive",
      });
      return;
    }

    const validProcessGoals = processGoals
      .filter(goal => goal.trim() !== '')
      .map(goal => goal.trim().slice(0, 200));
      
    if (validProcessGoals.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one process goal",
        variant: "destructive",
      });
      return;
    }
    
    if (validProcessGoals.length > 10) {
      toast({
        title: "Error",
        description: "Maximum 10 process goals allowed",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase.from('goals').insert({
        user_id: user.id,
        outcome_goal: sanitizedOutcome,
        process_goals: validProcessGoals,
        progress: 0,
        completed_process_goals: [],
      });

      if (error) throw error;

      // Reset form
      setOutcomeGoal('');
      setProcessGoals(['']);
      onGoalCreated();

      toast({
        title: "Success",
        description: "Goal created successfully!",
      });
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full bg-card border-border">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">Create New Goal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="outcome-goal" className="text-sm font-bold text-foreground">
              Outcome Goal
            </Label>
            <Textarea
              id="outcome-goal"
              placeholder="What do you want to achieve? (e.g., Score 15 goals this season)"
              value={outcomeGoal}
              onChange={(e) => setOutcomeGoal(e.target.value)}
              className="min-h-[80px] resize-none bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold text-foreground">Process Goals</Label>
              <Button
                type="button"
                onClick={addProcessGoal}
                variant="outline"
                size="sm"
                className="border-border text-foreground hover:bg-accent"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Step
              </Button>
            </div>
            
            <div className="space-y-3">
              {processGoals.map((goal, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder={`Step ${index + 1} (e.g., Practice shooting 30 minutes daily)`}
                    value={goal}
                    onChange={(e) => updateProcessGoal(index, e.target.value)}
                    className="flex-1 bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                  {processGoals.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeProcessGoal(index)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full font-bold bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? 'Creating...' : 'CREATE GOAL'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
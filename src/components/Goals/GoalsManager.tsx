import React, { useState, useEffect } from 'react';
import { CreateGoalForm } from './CreateGoalForm';
import { GoalCard } from './GoalCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Goal {
  id: string;
  user_id: string;
  outcome_goal: string;
  process_goals: string[];
  progress: number;
  completed_process_goals: number[];
  created_at: string;
  updated_at: string;
}

export const GoalsManager: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGoals((data || []).map(goal => ({
        ...goal,
        process_goals: Array.isArray(goal.process_goals) ? goal.process_goals.filter((item): item is string => typeof item === 'string') : []
      })));
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: "Error",
        description: "Failed to load goals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();

    // Set up real-time subscription
    const channel = supabase
      .channel('goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals'
        },
        () => {
          fetchGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Goal Setting</h1>
        <p className="text-muted-foreground">Set your outcome goals and break them down into actionable steps</p>
      </div>

      <CreateGoalForm onGoalCreated={fetchGoals} />

      {goals.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Your Goals</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onUpdate={fetchGoals} />
            ))}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No goals set yet. Create your first goal above!
          </p>
        </div>
      )}
    </div>
  );
};
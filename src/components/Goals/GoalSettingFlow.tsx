import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useChildData } from '@/hooks/useChildData';
import { ArrowLeft, ArrowRight, Brain, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OUTCOME_EXAMPLES = [
  'I want to sign for an academy',
  'I want to score more goals this season', 
  'I want to get into the starting XI',
  'I want to make the representative/district team',
  'I want to win the league with my team',
  'I want to get a scholarship',
  'I want to play for my country',
  'I want to get scouted by professional clubs'
];

const MINDSET_EXAMPLES = [
  'I want to learn how to deal with ANTs',
  'I want to feel less nervous during matches',
  'I want to be more confident on the ball',
  'I want to stop worrying about what others think',
  'I want to bounce back faster from setbacks/mistakes',
  'I want to stay focused during pressure moments',
  'I want to believe in myself more',
  'I want to overcome fear of failure'
];

const SKILL_EXAMPLES = [
  'I want to win more tackles',
  'I want to improve my finishing',
  'I want to get faster',
  'I want to get better first touch',
  'I want to get better ball control',
  'I want to improve in 1v1s',
  'I want to improve my passing accuracy',
  'I want to improve my weak foot'
];

interface GoalInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  examples: string[];
  placeholder: string;
}

const GoalInput: React.FC<GoalInputProps> = ({ label, value, onChange, examples, placeholder }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={label} className="text-sm font-medium">{label}</Label>
        <Textarea
          id={label}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 min-h-[120px]"
        />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2">Examples to inspire you:</p>
        <div className="flex flex-wrap gap-2">
          {examples.map((example, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="cursor-pointer hover:bg-primary/10 hover:border-primary text-xs"
              onClick={() => {
                const newValue = value ? value + '\n' + example : example;
                onChange(newValue);
              }}
            >
              {example}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

interface Goal {
  id: string;
  goal_type: string;
  goal_text: string;
  created_at: string;
}

export const GoalSettingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [outcomeGoals, setOutcomeGoals] = useState('');
  const [mindsetGoals, setMindsetGoals] = useState('');
  const [skillGoals, setSkillGoals] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showANTSuggestion, setShowANTSuggestion] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [savedGoals, setSavedGoals] = useState<Goal[]>([]);
  const [existingGoals, setExistingGoals] = useState<Goal[]>([]);
  const [showExistingGoals, setShowExistingGoals] = useState(true);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { childId, loading: childDataLoading } = useChildData();
  
  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Fetch existing goals on component mount
  useEffect(() => {
    if (!childDataLoading) {
      fetchExistingGoals();
    }
  }, [childId, childDataLoading]);

  const fetchExistingGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use child_goals table when childId is available, user_goals otherwise  
      const isChildContext = !!childId;
      const effectiveId = childId || user.id;

      let goals;
      if (isChildContext) {
        const { data, error } = await supabase
          .from('child_goals')
          .select('*')
          .eq('child_id', effectiveId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching child goals:', error);
          return;
        }
        goals = data;
      } else {
        const { data, error } = await supabase
          .from('user_goals')
          .select('*')
          .eq('user_id', effectiveId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching user goals:', error);
          return;
        }
        goals = data;
      }

      setExistingGoals(goals || []);
    } catch (error) {
      console.error('Error fetching existing goals:', error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use child_goals table when childId is available, user_goals otherwise
      const isChildContext = !!childId;

      let error;
      if (isChildContext) {
        ({ error } = await supabase
          .from('child_goals')
          .delete()
          .eq('id', goalId));
      } else {
        ({ error } = await supabase
          .from('user_goals')
          .delete()
          .eq('id', goalId));
      }

      if (error) {
        console.error('Error deleting goal:', error);
        toast({
          title: "Error",
          description: "Failed to delete goal. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Goal Deleted",
        description: "The goal has been removed successfully."
      });

      // Refresh the goals list
      await fetchExistingGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error", 
        description: "Failed to delete goal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const parseGoals = (goalText: string): string[] => {
    return goalText
      .split('\n')
      .map(goal => goal.trim())
      .filter(goal => goal.length > 0);
  };

  const saveGoals = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Use child_goals table when childId is available, user_goals otherwise
      const isChildContext = !!childId;
      const effectiveId = childId || user.id;

      // Parse goals from text input
      const outcomeGoalsList = parseGoals(outcomeGoals);
      const mindsetGoalsList = parseGoals(mindsetGoals);
      const skillGoalsList = parseGoals(skillGoals);

      // Clear existing goals and insert new ones
      if (isChildContext) {
        await supabase.from('child_goals').delete().eq('child_id', effectiveId);

        const allGoals = [
          ...outcomeGoalsList.map(goal => ({
            child_id: effectiveId,
            goal_type: 'outcome',
            goal_text: goal
          })),
          ...mindsetGoalsList.map(goal => ({
            child_id: effectiveId,
            goal_type: 'mindset', 
            goal_text: goal
          })),
          ...skillGoalsList.map(goal => ({
            child_id: effectiveId,
            goal_type: 'skill',
            goal_text: goal
          }))
        ];
        
        if (allGoals.length > 0) {
          const { error } = await supabase.from('child_goals').insert(allGoals);
          if (error) throw error;
        }
      } else {
        await supabase.from('user_goals').delete().eq('user_id', effectiveId);

        const allGoals = [
          ...outcomeGoalsList.map(goal => ({
            user_id: effectiveId,
            goal_type: 'outcome',
            goal_text: goal
          })),
          ...mindsetGoalsList.map(goal => ({
            user_id: effectiveId,
            goal_type: 'mindset', 
            goal_text: goal
          })),
          ...skillGoalsList.map(goal => ({
            user_id: effectiveId,
            goal_type: 'skill',
            goal_text: goal
          }))
        ];
        
        if (allGoals.length > 0) {
          const { error } = await supabase.from('user_goals').insert(allGoals);
          if (error) throw error;
        }
      }
      
      toast({
        title: "🎉 Goals Created!",
        description: "Your amazing goals have been saved successfully!"
      });

      // Show ANT suggestion if mindset goals contain ANT-related content
      if (mindsetGoals.toLowerCase().includes('ant')) {
        setShowANTSuggestion(true);
      }

      // Fetch and display created goals
      let goals;
      if (isChildContext) {
        const { data } = await supabase
          .from('child_goals')
          .select('*')
          .eq('child_id', effectiveId)
          .order('created_at', { ascending: false });
        goals = data;
      } else {
        const { data } = await supabase
          .from('user_goals')
          .select('*')
          .eq('user_id', effectiveId)
          .order('created_at', { ascending: false });
        goals = data;
      }
        
      if (goals) {
        setSavedGoals(goals);
        setShowResults(true);
      }

      // Refresh existing goals
      await fetchExistingGoals();

      // Reset form
      setCurrentStep(1);
      setOutcomeGoals('');
      setMindsetGoals('');
      setSkillGoals('');
    } catch (error) {
      console.error('Error saving goals:', error);
      toast({
        title: "Error",
        description: "Failed to save goals. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "🏆 STEP 1 - What's your BIG dream this year?";
      case 2:
        return "🧠 STEP 2 - What do you want to get better at mentally?";
      case 3:
        return "⚽ STEP 3 - What do you want to improve on during matches / training?";
      case 4:
        return "✅ STEP 4 - Review Your Amazing Goals!";
      default:
        return "";
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return outcomeGoals.trim().length > 0;
      case 2:
        return mindsetGoals.trim().length > 0;
      case 3:
        return skillGoals.trim().length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <GoalInput
            label="Write your big dreams and outcome goals:"
            value={outcomeGoals}
            onChange={setOutcomeGoals}
            examples={OUTCOME_EXAMPLES}
            placeholder="What are your big dreams this year? Write one goal per line..."
          />
        );
      case 2:
        return (
          <GoalInput
            label="Write what you want to improve mentally:"
            value={mindsetGoals}
            onChange={setMindsetGoals}
            examples={MINDSET_EXAMPLES}
            placeholder="What mindset goals do you want to work on? Write one goal per line..."
          />
        );
      case 3:
        return (
          <GoalInput
            label="Write your skill improvement goals:"
            value={skillGoals}
            onChange={setSkillGoals}
            examples={SKILL_EXAMPLES}
            placeholder="What skills do you want to improve? Write one goal per line..."
          />
        );
      case 4:
        const outcomeGoalsList = parseGoals(outcomeGoals);
        const mindsetGoalsList = parseGoals(mindsetGoals);
        const skillGoalsList = parseGoals(skillGoals);
        
        return (
          <div className="space-y-6">
            {outcomeGoalsList.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">🏆 Outcome Goals</h3>
                <div className="space-y-2">
                  {outcomeGoalsList.map((goal, index) => (
                    <Badge key={index} variant="secondary" className="mr-2 mb-2">
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {mindsetGoalsList.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">🧠 Mindset Goals</h3>
                <div className="space-y-2">
                  {mindsetGoalsList.map((goal, index) => (
                    <Badge key={index} variant="secondary" className="mr-2 mb-2">
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {skillGoalsList.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">⚽ Skill Goals</h3>
                <div className="space-y-2">
                  {skillGoalsList.map((goal, index) => (
                    <Badge key={index} variant="secondary" className="mr-2 mb-2">
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const goalTypeLabels = {
    outcome: 'Outcome Goals',
    mindset: 'Mindset Goals',
    skill: 'Skill Goals'
  };

  const goalTypeIcons = {
    outcome: '🏆',
    mindset: '🧠',
    skill: '⚽'
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Goal Setting</h1>
        <Progress value={progress} className="max-w-md mx-auto" />
        <p className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</p>
      </div>

      {/* Existing Goals Display */}
      {showExistingGoals && existingGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Current Goals</CardTitle>
            <CardDescription>
              Goals you've already set. You can delete them or create new ones below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {['outcome', 'mindset', 'skill'].map(type => {
              const typeGoals = existingGoals.filter(g => g.goal_type === type);
              if (typeGoals.length === 0) return null;

              return (
                <div key={type}>
                  <h4 className="font-semibold mb-2 text-primary">
                    {goalTypeIcons[type as keyof typeof goalTypeIcons]} {goalTypeLabels[type as keyof typeof goalTypeLabels]}
                  </h4>
                  <div className="space-y-2">
                    {typeGoals.map(goal => (
                      <div key={goal.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">{goal.goal_text}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteGoal(goal.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <Button
              variant="outline"
              onClick={() => setShowExistingGoals(false)}
              className="mt-4"
            >
              Hide Current Goals
            </Button>
          </CardContent>
        </Card>
      )}

      {!showExistingGoals && existingGoals.length > 0 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowExistingGoals(true)}
          >
            Show My Current Goals ({existingGoals.length})
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{getStepTitle()}</CardTitle>
          <CardDescription>
            {currentStep < 4 ? 'Write your goals below. Click examples to add them quickly:' : 'Review your goals and create them!'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStepContent()}

          <div className="flex justify-between items-center pt-6">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
              
              <Button
                variant="ghost"
                onClick={() => {
                  setCurrentStep(1);
                  setOutcomeGoals('');
                  setMindsetGoals('');
                  setSkillGoals('');
                }}
              >
                Start Over
              </Button>
            </div>

            <div>
              {currentStep < 4 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canProceed()}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={saveGoals}
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? 'Creating...' : 'CREATE MY GOALS!'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ANT Suggestion Modal/Card */}
      {showANTSuggestion && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              🐜 Ready to Meet Your Silly ANT?
            </CardTitle>
            <CardDescription>
              Since you want to learn about ANTs (Automatic Negative Thoughts), 
              why not complete your ANT profile next?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Understanding your ANTs will help you achieve your mindset goals faster!
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowANTSuggestion(false)}
                className="bg-primary hover:bg-primary/90"
              >
                Meet My ANT! 🐜
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowANTSuggestion(false)}
              >
                Maybe Later
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {showResults && savedGoals.length > 0 && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-400">
              🎉 Your Goals Created Successfully!
            </CardTitle>
            <CardDescription>
              Created on {new Date(savedGoals[0]?.created_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {['outcome', 'mindset', 'skill'].map(type => {
              const typeGoals = savedGoals.filter(g => g.goal_type === type);
              if (typeGoals.length === 0) return null;

              return (
                <div key={type}>
                  <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">
                    {goalTypeIcons[type as keyof typeof goalTypeIcons]} {goalTypeLabels[type as keyof typeof goalTypeLabels]}
                  </h4>
                  <div className="space-y-1">
                    {typeGoals.map(goal => (
                      <Badge key={goal.id} variant="secondary" className="mr-2 mb-1">
                        {goal.goal_text}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
            <Button
              variant="outline"
              onClick={() => setShowResults(false)}
              className="mt-4"
            >
              Hide Results
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

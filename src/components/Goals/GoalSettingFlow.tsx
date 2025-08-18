import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useChildData } from '@/hooks/useChildData';
import { ArrowLeft, ArrowRight, Brain, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const OUTCOME_GOALS = ['I want to sign for an academy', 'I want to score more goals this season', 'I want to get into the starting XI', 'I want to make the representative/district team', 'I want to win the league with my team', 'I want to get a scholarship', 'I want to play for my country', 'I want to get scouted by professional clubs', 'I want to win player of the season', 'I want to play up an age group', 'I want to get into the academy\'s first team', 'I want to earn a professional contract', 'I want to play at a higher level', 'I want to be the top scorer', 'I want to win a tournament or league title', 'I want to get selected for trials'];
const MINDSET_GOALS = ['I want to learn how to deal with ANTs', 'I want to feel less nervous during matches', 'I want to feel less nervous BEFORE matches', 'I want to be more confident on the ball', 'I want to stop worrying about what others think', 'I want to bounce back faster from setbacks/mistakes', 'I want to stay focused during pressure moments', 'I want to believe in myself more', 'I want to overcome fear of failure', 'I want to stay calm under pressure', 'I want to trust my abilities', 'I want to stop negative self-talk', 'I want to be mentally stronger', 'I want to enjoy playing more', 'I want to handle coach feedback better', 'I want to stop comparing myself to others', 'I want to be more resilient'];
const SKILL_GOALS = ['I want to win more tackles', 'I want to improve my finishing', 'I want to get faster', 'I want to get better first touch', 'I want to get better ball control', 'I want to improve in 1v1s', 'I want to improve my passing accuracy', 'I want to improve my weak foot', 'I want to improve my defending', 'I want to improve my dribbling', 'I want to improve my positioning'];
interface GoalSelectionProps {
  goals: string[];
  selectedGoals: string[];
  onToggle: (goal: string) => void;
}
const GoalSelection: React.FC<GoalSelectionProps> = ({
  goals,
  selectedGoals,
  onToggle
}) => {
  return <div className="grid gap-3 md:grid-cols-2">
      {goals.map(goal => <div key={goal} onClick={() => onToggle(goal)} className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedGoals.includes(goal) ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'}`}>
          <p className="text-sm font-medium">{goal}</p>
        </div>)}
    </div>;
};
export const GoalSettingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOutcomeGoals, setSelectedOutcomeGoals] = useState<string[]>([]);
  const [selectedMindsetGoals, setSelectedMindsetGoals] = useState<string[]>([]);
  const [selectedSkillGoals, setSelectedSkillGoals] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showANTSuggestion, setShowANTSuggestion] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [savedGoals, setSavedGoals] = useState<Array<{
    id: string;
    goal_type: string;
    goal_text: string;
    created_at: string;
  }>>([]);
  const [existingGoals, setExistingGoals] = useState<Array<{
    id: string;
    goal_type: string;
    goal_text: string;
    created_at: string;
  }>>([]);
  const [showExistingGoals, setShowExistingGoals] = useState(true);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const { childId, loading: childDataLoading } = useChildData();
  const totalSteps = 4;
  const progress = currentStep / totalSteps * 100;

  // Fetch existing goals on component mount
  useEffect(() => {
    if (!childDataLoading) {
      fetchExistingGoals();
    }
  }, [childId, childDataLoading]);
  const fetchExistingGoals = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user || childDataLoading) return;
      
      // Use the effective user ID (child ID if admin in player view, otherwise user ID)
      const effectiveUserId = childId || user.id;
      
      const {
        data: goals
      } = await supabase.from('user_goals').select('*').eq('user_id', effectiveUserId).order('created_at', {
        ascending: false
      });
      if (goals) {
        setExistingGoals(goals);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };
  const deleteGoal = async (goalId: string) => {
    try {
      const {
        error
      } = await supabase.from('user_goals').delete().eq('id', goalId);
      if (error) throw error;
      toast({
        title: "Goal Deleted",
        description: "Your goal has been removed successfully."
      });

      // Refresh existing goals
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
  const toggleGoal = (goal: string, type: 'outcome' | 'mindset' | 'skill') => {
    if (type === 'outcome') {
      setSelectedOutcomeGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]);
    } else if (type === 'mindset') {
      setSelectedMindsetGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]);
    } else {
      setSelectedSkillGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]);
    }
  };
  const saveGoals = async () => {
    setIsSubmitting(true);
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Use the effective user ID (child ID if admin in player view, otherwise user ID)
      const effectiveUserId = childId || user.id;

      // Clear existing goals
      await supabase.from('user_goals').delete().eq('user_id', effectiveUserId);

      // Insert new goals
      const allGoals = [...selectedOutcomeGoals.map(goal => ({
        user_id: effectiveUserId,
        goal_type: 'outcome',
        goal_text: goal
      })), ...selectedMindsetGoals.map(goal => ({
        user_id: effectiveUserId,
        goal_type: 'mindset',
        goal_text: goal
      })), ...selectedSkillGoals.map(goal => ({
        user_id: effectiveUserId,
        goal_type: 'skill',
        goal_text: goal
      }))];
      if (allGoals.length > 0) {
        const {
          error
        } = await supabase.from('user_goals').insert(allGoals);
        if (error) throw error;
      }
      toast({
        title: "🎉 Goals Created!",
        description: "Your amazing goals have been saved successfully!"
      });

      // Show ANT suggestion if mindset goals were selected
      if (selectedMindsetGoals.some(goal => goal.includes('ANT'))) {
        setShowANTSuggestion(true);
      }

      // Fetch and display created goals
      const {
        data: goals
      } = await supabase.from('user_goals').select('*').eq('user_id', effectiveUserId).order('created_at', {
        ascending: false
      });
      if (goals) {
        setSavedGoals(goals);
        setShowResults(true);
      }

      // Refresh existing goals
      await fetchExistingGoals();

      // Reset form
      setCurrentStep(1);
      setSelectedOutcomeGoals([]);
      setSelectedMindsetGoals([]);
      setSelectedSkillGoals([]);
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
        return selectedOutcomeGoals.length > 0;
      case 2:
        return selectedMindsetGoals.length > 0;
      case 3:
        return selectedSkillGoals.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <GoalSelection goals={OUTCOME_GOALS} selectedGoals={selectedOutcomeGoals} onToggle={goal => toggleGoal(goal, 'outcome')} />;
      case 2:
        return <GoalSelection goals={MINDSET_GOALS} selectedGoals={selectedMindsetGoals} onToggle={goal => toggleGoal(goal, 'mindset')} />;
      case 3:
        return <GoalSelection goals={SKILL_GOALS} selectedGoals={selectedSkillGoals} onToggle={goal => toggleGoal(goal, 'skill')} />;
      case 4:
        return <div className="space-y-6">
            {selectedOutcomeGoals.length > 0 && <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">🏆 Outcome Goals</h3>
                <div className="space-y-2">
                  {selectedOutcomeGoals.map((goal, index) => <Badge key={index} variant="secondary" className="mr-2 mb-2">
                      {goal}
                    </Badge>)}
                </div>
              </div>}

            {selectedMindsetGoals.length > 0 && <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">🧠 Mindset Goals</h3>
                <div className="space-y-2">
                  {selectedMindsetGoals.map((goal, index) => <Badge key={index} variant="secondary" className="mr-2 mb-2">
                      {goal}
                    </Badge>)}
                </div>
              </div>}

            {selectedSkillGoals.length > 0 && <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">⚽ Skill Goals</h3>
                <div className="space-y-2">
                  {selectedSkillGoals.map((goal, index) => <Badge key={index} variant="secondary" className="mr-2 mb-2">
                      {goal}
                    </Badge>)}
                </div>
              </div>}
          </div>;
      default:
        return null;
    }
  };
  return <div className="space-y-6 bg-sky-400">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Goal Setting</h1>
        <Progress value={progress} className="max-w-md mx-auto" />
        <p className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</p>
      </div>

      {/* Existing Goals Display */}
      {showExistingGoals && existingGoals.length > 0 && <Card>
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
          const icons = {
            outcome: '🏆',
            mindset: '🧠',
            skill: '⚽'
          };
          const labels = {
            outcome: 'Outcome Goals',
            mindset: 'Mindset Goals',
            skill: 'Skill Goals'
          };
          return <div key={type}>
                  <h4 className="font-semibold mb-2 text-primary">
                    {icons[type]} {labels[type]}
                  </h4>
                  <div className="space-y-2">
                    {typeGoals.map(goal => <div key={goal.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">{goal.goal_text}</span>
                        <Button variant="ghost" size="sm" onClick={() => deleteGoal(goal.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>)}
                  </div>
                </div>;
        })}
            <Button variant="outline" onClick={() => setShowExistingGoals(false)} className="mt-4">
              Hide Current Goals
            </Button>
          </CardContent>
        </Card>}

      {!showExistingGoals && existingGoals.length > 0 && <div className="text-center">
          <Button variant="outline" onClick={() => setShowExistingGoals(true)}>
            Show My Current Goals ({existingGoals.length})
          </Button>
        </div>}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{getStepTitle()}</CardTitle>
          <CardDescription>
            {currentStep < 4 ? 'Select all that apply:' : 'Review your goals and create them!'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStepContent()}

          <div className="flex justify-between items-center pt-6">
            <div className="flex gap-2">
              {currentStep > 1 && <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>}
              
              <Button variant="ghost" onClick={() => {
              setCurrentStep(1);
              setSelectedOutcomeGoals([]);
              setSelectedMindsetGoals([]);
              setSelectedSkillGoals([]);
            }}>
                Start Over
              </Button>
            </div>

            <div>
              {currentStep < 4 ? <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!canProceed()}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button> : <Button onClick={saveGoals} disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                  {isSubmitting ? 'Creating...' : 'CREATE MY GOALS!'}
                </Button>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ANT Suggestion Modal/Card */}
      {showANTSuggestion && <Card className="border-primary bg-primary/5">
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
              <Button onClick={() => setShowANTSuggestion(false)} className="bg-primary hover:bg-primary/90">
                Meet My ANT! 🐜
              </Button>
              <Button variant="outline" onClick={() => setShowANTSuggestion(false)}>
                Maybe Later
              </Button>
            </div>
          </CardContent>
        </Card>}

      {/* Results Display */}
      {showResults && savedGoals.length > 0 && <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
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
          const icons = {
            outcome: '🏆',
            mindset: '🧠',
            skill: '⚽'
          };
          const labels = {
            outcome: 'Outcome Goals',
            mindset: 'Mindset Goals',
            skill: 'Skill Goals'
          };
          return <div key={type}>
                  <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">
                    {icons[type]} {labels[type]}
                  </h4>
                  <div className="space-y-1">
                    {typeGoals.map(goal => <Badge key={goal.id} variant="secondary" className="mr-2 mb-1">
                        {goal.goal_text}
                      </Badge>)}
                  </div>
                </div>;
        })}
            <Button variant="outline" onClick={() => setShowResults(false)} className="mt-4">
              Hide Results
            </Button>
          </CardContent>
        </Card>}
    </div>;
};
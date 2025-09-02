import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Save, RotateCcw, TrendingUp, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface CoreSkillsEvaluationProps {
  childId: string;
  childName: string;
}

interface CoreSkillEvaluation {
  id?: string;
  self_worth_level?: number;
  goals_planning_level?: number;
  preparation_autonomy_level?: number;
  focus_behaviours_level?: number;
  beating_mind_level?: number;
  dealing_failure_level?: number;
  coach_notes?: string;
  evaluation_date?: string;
  updated_at?: string;
  created_at?: string;
}

const CORE_SKILLS = [
  {
    key: 'self_worth_level' as const,
    title: '1. Know Who You Are (Self-Worth)',
    levels: [
      {
        level: 1,
        title: 'Struggle',
        description: 'Child ties worth to performance → bad day = "I\'m not good."',
        color: 'bg-destructive'
      },
      {
        level: 2,
        title: 'Emerging',
        description: 'Sometimes separates self from results but still takes mistakes personally.',
        color: 'bg-warning'
      },
      {
        level: 3,
        title: 'Supported',
        description: 'With reminders, can say "a bad day doesn\'t define me."',
        color: 'bg-primary'
      },
      {
        level: 4,
        title: 'Independent',
        description: 'Fully separates identity from performance, steady self-belief.',
        color: 'bg-success'
      }
    ]
  },
  {
    key: 'goals_planning_level' as const,
    title: '2. Set Goals / Have a Plan',
    levels: [
      {
        level: 1,
        title: 'Struggle',
        description: 'No clear goals or match plan… plays "on autopilot."',
        color: 'bg-destructive'
      },
      {
        level: 2,
        title: 'Emerging',
        description: 'Has vague goals but forgets or abandons them in pressure.',
        color: 'bg-warning'
      },
      {
        level: 3,
        title: 'Supported',
        description: 'Needs coach/parent to remind of goals before games.',
        color: 'bg-primary'
      },
      {
        level: 4,
        title: 'Independent',
        description: 'Sets own goals, clear plan, self-motivated.',
        color: 'bg-success'
      }
    ]
  },
  {
    key: 'preparation_autonomy_level' as const,
    title: '3. Preparation / Autonomy / Habits',
    levels: [
      {
        level: 1,
        title: 'Struggle',
        description: 'Relies on others to prepare (kit, warm-up, reminders).',
        color: 'bg-destructive'
      },
      {
        level: 2,
        title: 'Emerging',
        description: 'Sometimes prepares but inconsistent.',
        color: 'bg-warning'
      },
      {
        level: 3,
        title: 'Supported',
        description: 'Prepares when guided or reminded.',
        color: 'bg-primary'
      },
      {
        level: 4,
        title: 'Independent',
        description: 'Independent routines, trusts process, fully prepared alone.',
        color: 'bg-success'
      }
    ]
  },
  {
    key: 'focus_behaviours_level' as const,
    title: '4. Focus on Super Behaviours',
    levels: [
      {
        level: 1,
        title: 'Struggle',
        description: 'Obsessed with outcome (winning, scoring) → loses focus when things go wrong.',
        color: 'bg-destructive'
      },
      {
        level: 2,
        title: 'Emerging',
        description: 'Sometimes remembers behaviours but drifts back to results-focus.',
        color: 'bg-warning'
      },
      {
        level: 3,
        title: 'Supported',
        description: 'Can focus on behaviours with reminders.',
        color: 'bg-primary'
      },
      {
        level: 4,
        title: 'Independent',
        description: 'Locks onto behaviours/process under pressure, regardless of score.',
        color: 'bg-success'
      }
    ]
  },
  {
    key: 'beating_mind_level' as const,
    title: '5. Beating Your Mind (ANTs / Thinking Traps)',
    levels: [
      {
        level: 1,
        title: 'Struggle',
        description: 'Negative self-talk dominates: "I can\'t do it."',
        color: 'bg-destructive'
      },
      {
        level: 2,
        title: 'Emerging',
        description: 'Recognises negative thoughts but can\'t shift them alone.',
        color: 'bg-warning'
      },
      {
        level: 3,
        title: 'Supported',
        description: 'With support, can reframe thoughts.',
        color: 'bg-primary'
      },
      {
        level: 4,
        title: 'Independent',
        description: 'Identifies & replaces ANTs automatically, strong positive inner voice.',
        color: 'bg-success'
      }
    ]
  },
  {
    key: 'dealing_failure_level' as const,
    title: '6. Dealing with Failure & Challenges',
    levels: [
      {
        level: 1,
        title: 'Struggle',
        description: 'One mistake = total collapse, sulking, quitting.',
        color: 'bg-destructive'
      },
      {
        level: 2,
        title: 'Emerging',
        description: 'Sometimes bounces back but fragile, takes time to recover.',
        color: 'bg-warning'
      },
      {
        level: 3,
        title: 'Supported',
        description: 'Can recover quicker when reminded.',
        color: 'bg-primary'
      },
      {
        level: 4,
        title: 'Independent',
        description: 'Resilient → reacts, resets, and continues without external support.',
        color: 'bg-success'
      }
    ]
  }
];

export default function CoreSkillsEvaluation({ childId, childName }: CoreSkillsEvaluationProps) {
  const { toast } = useToast();
  const [evaluation, setEvaluation] = useState<CoreSkillEvaluation>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadEvaluation();
  }, [childId]);

  const loadEvaluation = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('core_skill_evaluations')
        .select('*')
        .eq('child_id', childId)
        .eq('evaluation_date', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // Ignore "no rows" error
        throw error;
      }

      if (data) {
        setEvaluation(data);
      } else {
        // Initialize with empty evaluation for today
        setEvaluation({});
      }
    } catch (error) {
      console.error('Error loading evaluation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load current evaluation',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLevelChange = (skillKey: keyof CoreSkillEvaluation, level: number) => {
    setEvaluation(prev => ({
      ...prev,
      [skillKey]: level
    }));
    setHasChanges(true);
  };

  const handleNotesChange = (notes: string) => {
    setEvaluation(prev => ({
      ...prev,
      coach_notes: notes
    }));
    setHasChanges(true);
  };

  const saveEvaluation = async () => {
    setSaving(true);
    try {
      const { data: adminUser } = await supabase.auth.getUser();
      if (!adminUser.user) throw new Error('Not authenticated');

      const today = new Date().toISOString().split('T')[0];
      
      const evaluationData = {
        child_id: childId,
        admin_id: adminUser.user.id,
        evaluation_date: today,
        self_worth_level: evaluation.self_worth_level || null,
        goals_planning_level: evaluation.goals_planning_level || null,
        preparation_autonomy_level: evaluation.preparation_autonomy_level || null,
        focus_behaviours_level: evaluation.focus_behaviours_level || null,
        beating_mind_level: evaluation.beating_mind_level || null,
        dealing_failure_level: evaluation.dealing_failure_level || null,
        coach_notes: evaluation.coach_notes || null
      };

      const { data, error } = await supabase
        .from('core_skill_evaluations')
        .upsert(evaluationData, { 
          onConflict: 'child_id,evaluation_date'
        })
        .select()
        .single();

      if (error) throw error;

      setEvaluation(data);
      setHasChanges(false);
      
      toast({
        title: 'Evaluation Saved',
        description: `Core skills evaluation for ${childName} has been saved successfully.`
      });
    } catch (error) {
      console.error('Error saving evaluation:', error);
      toast({
        title: 'Error',
        description: 'Failed to save evaluation. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const resetEvaluation = () => {
    setEvaluation({});
    setHasChanges(true);
  };

  const calculateOverallProgress = () => {
    const values = CORE_SKILLS.map(skill => evaluation[skill.key] || 0).filter(v => v > 0);
    if (values.length === 0) return 0;
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.round((average / 4) * 100);
  };

  const getSkillColor = (level: number) => {
    if (level === 4) return 'text-success';
    if (level === 3) return 'text-blue-600';
    if (level === 2) return 'text-warning';
    if (level === 1) return 'text-destructive';
    return 'text-muted-foreground';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading evaluation...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="shadow-soft border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Core Skill Evaluation
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Rate {childName}'s growth across the 6 pillars of mindset development
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {calculateOverallProgress()}%
              </div>
              <p className="text-xs text-muted-foreground">Overall Progress</p>
            </div>
          </div>
          {calculateOverallProgress() > 0 && (
            <Progress value={calculateOverallProgress()} className="w-full mt-3" />
          )}
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Last Updated Date Box */}
          {evaluation.updated_at && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium text-sm">Last updated on:</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-800">
                    <span className="font-semibold">
                      {new Date(evaluation.updated_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      {new Date(evaluation.updated_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* New Evaluation Notice */}
          {!evaluation.updated_at && (
            <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium text-sm">New Evaluation</span>
                  </div>
                  <span className="text-emerald-800 text-sm">
                    Start evaluating {childName}'s core skills development
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Mobile View */}
          <div className="block md:hidden space-y-4">
            {CORE_SKILLS.map((skill) => (
              <Card key={skill.key} className="border border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    {skill.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {skill.levels.map((levelInfo) => (
                    <div key={levelInfo.level} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id={`${skill.key}-${levelInfo.level}`}
                          name={skill.key}
                          checked={evaluation[skill.key] === levelInfo.level}
                          onChange={() => handleLevelChange(skill.key, levelInfo.level)}
                          className="w-4 h-4"
                        />
                        <Label 
                          htmlFor={`${skill.key}-${levelInfo.level}`}
                          className="text-sm font-medium cursor-pointer flex items-center gap-2"
                        >
                          <Badge variant={levelInfo.level === evaluation[skill.key] ? 'default' : 'outline'} 
                                 className={cn(levelInfo.color, 'text-white')}>
                            Level {levelInfo.level} - {levelInfo.title}
                          </Badge>
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground pl-6">
                        {levelInfo.description}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold min-w-[220px]">Core Skill</th>
                    <th className="text-center p-4 font-semibold text-destructive min-w-[200px]">
                      Level 1 - Struggle
                    </th>
                    <th className="text-center p-4 font-semibold text-warning min-w-[200px]">
                      Level 2 - Emerging
                    </th>
                    <th className="text-center p-4 font-semibold text-blue-600 min-w-[200px]">
                      Level 3 - Supported
                    </th>
                    <th className="text-center p-4 font-semibold text-success min-w-[200px]">
                      Level 4 - Independent
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {CORE_SKILLS.map((skill, index) => (
                    <tr key={skill.key} className={cn("border-b", index % 2 === 0 ? "bg-muted/20" : "")}>
                      <td className="p-4 font-medium align-top">
                        <div className="sticky top-0">
                          {skill.title}
                        </div>
                      </td>
                      {skill.levels.map((levelInfo) => (
                        <td key={levelInfo.level} className="p-4 align-top">
                          <div className="space-y-3">
                            <div className="flex justify-center">
                              <input
                                type="radio"
                                id={`${skill.key}-${levelInfo.level}`}
                                name={skill.key}
                                checked={evaluation[skill.key] === levelInfo.level}
                                onChange={() => handleLevelChange(skill.key, levelInfo.level)}
                                className="w-5 h-5 cursor-pointer"
                              />
                            </div>
                            <div className="text-xs text-muted-foreground leading-relaxed px-1">
                              {levelInfo.description}
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual Summary */}
          {Object.values(evaluation).some(v => v) && (
            <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Current Assessment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CORE_SKILLS.map((skill) => {
                    const level = evaluation[skill.key];
                    if (!level) return null;
                    
                    return (
                      <div key={skill.key} className="space-y-2">
                        <h4 className="font-medium text-sm">{skill.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn("text-xs", getSkillColor(level))}>
                            Level {level}
                          </Badge>
                          <Progress value={(level / 4) * 100} className="flex-1 h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Coach Notes */}
          <div className="space-y-2">
            <Label htmlFor="coach-notes" className="text-sm font-medium">
              Coach's Notes (Optional)
            </Label>
            <Textarea
              id="coach-notes"
              placeholder="Add any additional observations, specific examples, or notes about the player's development..."
              value={evaluation.coach_notes || ''}
              onChange={(e) => handleNotesChange(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              onClick={saveEvaluation}
              disabled={saving || !hasChanges}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Evaluation'}
            </Button>
            
            <Button
              onClick={resetEvaluation}
              variant="outline"
              disabled={saving}
              className="flex-1 sm:flex-none"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {evaluation.evaluation_date && (
            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              Last evaluated: {new Date(evaluation.evaluation_date).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
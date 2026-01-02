import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Target, TrendingUp, Calendar, AlertCircle, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Json } from '@/integrations/supabase/types';

interface CoreSkillsResult {
  id: string;
  created_at: string;
  know_who_you_are_score: number;
  set_goals_score: number;
  preparation_score: number;
  focus_behaviours_score: number;
  beating_mind_score: number;
  dealing_with_failure_score: number;
  overall_score: number;
  raw_answers: Json;
}

interface AdminCoreSkillsResultsProps {
  childId: string;
  childName: string;
}

const getScoreLabel = (score: number) => {
  if (score >= 85) return { emoji: '🟢', label: 'Independent', color: 'bg-green-100 text-green-800' };
  if (score >= 70) return { emoji: '🔴', label: 'Supported', color: 'bg-destructive/10 text-destructive' };
  if (score >= 50) return { emoji: '🟡', label: 'Emerging', color: 'bg-yellow-100 text-yellow-800' };
  return { emoji: '🔴', label: 'Struggling', color: 'bg-red-100 text-red-800' };
};

const getScoreEmoji = (score: number) => {
  if (score >= 85) return '🟢';
  if (score >= 70) return '🟠';
  if (score >= 50) return '🟡';
  return '🔴';
};

const skillLabels = {
  know_who_you_are_score: 'Self-Worth',
  set_goals_score: 'Goals/Planning',
  preparation_score: 'Preparation',
  focus_behaviours_score: 'Focus Behaviours',
  beating_mind_score: 'Beating Mind',
  dealing_with_failure_score: 'Dealing with Failure'
};

// Map skill IDs from raw_answers to display names and questions
const skillDetails: Record<string, { title: string; questions: { id: string; text: string; options: { score: number; text: string }[] }[] }> = {
  know_who_you_are: {
    title: '1. Know Who You Are (Self-Worth)',
    questions: [
      { id: 'q1', text: 'After a bad game, how have you felt recently?', options: [
        { score: 25, text: "I feel like I'm not a good player anymore." },
        { score: 50, text: "I take mistakes hard & sometimes doubt my abilities." },
        { score: 75, text: "I need help to be reminded that a bad game doesn't define me." },
        { score: 100, text: "Bad day or good day, I'm still a good player." }
      ]},
      { id: 'q2', text: 'How do you feel after making a mistake in a game?', options: [
        { score: 25, text: "I'm not good at this." },
        { score: 50, text: "I try, but sometimes I say 'I can't.'" },
        { score: 75, text: "I know it doesn't define me — but I need a reminder." },
        { score: 100, text: "It's fine, one mistake doesn't define me." }
      ]},
      { id: 'q3', text: 'When judging your performances lately, what do you focus on?', options: [
        { score: 25, text: "I judge based on results only." },
        { score: 50, text: "I try, but sometimes I say 'I can't.'" },
        { score: 75, text: "I need reminding of the good things I did." },
        { score: 100, text: "Bad day or good day, I'm still a good player." }
      ]},
      { id: 'q4', text: 'After a bad performance, what do you tell yourself?', options: [
        { score: 25, text: "Maybe I'm not good enough." },
        { score: 50, text: "I try, but sometimes I say 'I can't.'" },
        { score: 75, text: "It's not the end of the world (when someone tells me)." },
        { score: 100, text: "Bad day or good day, I'm still a good player." }
      ]}
    ]
  },
  set_goals: {
    title: '2. Set Goals / Have a Plan',
    questions: [
      { id: 'q1', text: 'Before your games lately, have you had a plan?', options: [
        { score: 25, text: "I don't set goals, I just play." },
        { score: 50, text: "I set goals sometimes but forget them." },
        { score: 75, text: "I set goals if someone reminds me." },
        { score: 100, text: "I set my own goals and remember them." }
      ]},
      { id: 'q2', text: 'When things go wrong in a game, what do you think?', options: [
        { score: 25, text: "This isn't working." },
        { score: 50, text: "I'll try harder." },
        { score: 75, text: "I'll try my behaviours (if someone tells me)." },
        { score: 100, text: "I'll trust my plan and focus on behaviours." }
      ]},
      { id: 'q3', text: 'Do you visualise success before performing?', options: [
        { score: 25, text: "No, I don't think about it." },
        { score: 50, text: "Sometimes I try to." },
        { score: 75, text: "Yes, if a coach/parent reminds me." },
        { score: 100, text: "Yes, it's part of my routine." }
      ]},
      { id: 'q4', text: 'Who sets your goals?', options: [
        { score: 25, text: "I don't really have goals." },
        { score: 50, text: "I set some goals but forget them." },
        { score: 75, text: "Someone else (coach/parent)." },
        { score: 100, text: "I set them myself." }
      ]}
    ]
  },
  preparation: {
    title: '3. Prepare to Perform',
    questions: [
      { id: 'q1', text: 'Do you prepare mentally before performing?', options: [
        { score: 25, text: "I don't prepare at all." },
        { score: 50, text: "I try but often forget." },
        { score: 75, text: "I prepare if someone reminds me." },
        { score: 100, text: "I have my own preparation routine." }
      ]},
      { id: 'q2', text: 'How do you feel before performing?', options: [
        { score: 25, text: "Nervous and unprepared." },
        { score: 50, text: "A bit anxious but okay." },
        { score: 75, text: "I get ready if guided." },
        { score: 100, text: "I feel ready and excited." }
      ]},
      { id: 'q3', text: 'Do you do breathing exercises?', options: [
        { score: 25, text: "No, I don't know how." },
        { score: 50, text: "I try sometimes." },
        { score: 75, text: "Yes, if I know someone will check me." },
        { score: 100, text: "Yes, it's part of my routine." }
      ]},
      { id: 'q4', text: 'Do you prepare physically?', options: [
        { score: 25, text: "No preparation needed." },
        { score: 50, text: "Basic warm-up sometimes." },
        { score: 75, text: "If guided, I do it." },
        { score: 100, text: "Yes, I warm up properly myself." }
      ]}
    ]
  },
  focus_control: {
    title: '4. Focus on What You Control',
    questions: [
      { id: 'q1', text: 'What do you focus on during the game?', options: [
        { score: 25, text: "Results and what others think." },
        { score: 50, text: "Mix of results and behaviours." },
        { score: 75, text: "Behaviours, if reminded." },
        { score: 100, text: "My behaviours and effort." }
      ]},
      { id: 'q2', text: 'When you make a mistake, what do you think?', options: [
        { score: 25, text: "That was terrible." },
        { score: 50, text: "I need to do better." },
        { score: 75, text: "Focus on my behaviours (if someone reminds me)." },
        { score: 100, text: "Focus on the next play and my behaviours." }
      ]},
      { id: 'q3', text: 'During challenges, where is your focus?', options: [
        { score: 25, text: "On the problem or outcome." },
        { score: 50, text: "Mix of problem and solution." },
        { score: 75, text: "Behaviours if someone guides me." },
        { score: 100, text: "Always on my behaviours." }
      ]},
      { id: 'q4', text: 'How do you handle pressure situations?', options: [
        { score: 25, text: "I get overwhelmed." },
        { score: 50, text: "I try to stay calm." },
        { score: 75, text: "Refocus on behaviours when reminded." },
        { score: 100, text: "I automatically focus on my behaviours." }
      ]}
    ]
  },
  beat_mind: {
    title: '5. Beat Your Mind (ANTs)',
    questions: [
      { id: 'q1', text: 'Can you change negative thoughts when they come up?', options: [
        { score: 25, text: "No, they're too strong." },
        { score: 50, text: "Sometimes I can." },
        { score: 75, text: "I could change it with help." },
        { score: 100, text: "Yes, I can change them myself." }
      ]},
      { id: 'q2', text: 'How quickly did you catch negative thoughts in your last game?', options: [
        { score: 25, text: "I didn't notice them." },
        { score: 50, text: "I noticed some of them." },
        { score: 75, text: "I changed it when someone reminded me." },
        { score: 100, text: "I caught them quickly myself." }
      ]},
      { id: 'q3', text: 'What do you say to yourself to refocus?', options: [
        { score: 25, text: "Stop being stupid." },
        { score: 50, text: "Come on, concentrate." },
        { score: 75, text: "Come on, focus (if told)." },
        { score: 100, text: "Focus on my behaviours." }
      ]},
      { id: 'q4', text: 'After a mistake, what is your self-talk like?', options: [
        { score: 25, text: "I'm useless." },
        { score: 50, text: "That was bad." },
        { score: 75, text: "I'll recover (if reminded)." },
        { score: 100, text: "Next play, trust my behaviours." }
      ]}
    ]
  },
  deal_challenges: {
    title: '6. Deal with Challenges',
    questions: [
      { id: 'q1', text: 'How do you handle setbacks during a game?', options: [
        { score: 25, text: "I give up or get frustrated." },
        { score: 50, text: "I try to keep going." },
        { score: 75, text: "I recovered if someone reminded me." },
        { score: 100, text: "I bounce back quickly myself." }
      ]},
      { id: 'q2', text: 'When things get tough, do you keep going?', options: [
        { score: 25, text: "I usually give up." },
        { score: 50, text: "I try but struggle." },
        { score: 75, text: "I kept going if someone pushed me." },
        { score: 100, text: "I keep going because I trust my plan." }
      ]},
      { id: 'q3', text: 'How did you feel after your last poor performance?', options: [
        { score: 25, text: "Terrible about myself." },
        { score: 50, text: "Disappointed but okay." },
        { score: 75, text: "Better if someone comforted me." },
        { score: 100, text: "I tried my best, I'll learn from this." }
      ]},
      { id: 'q4', text: 'How quickly do you reset after mistakes?', options: [
        { score: 25, text: "I dwell on them." },
        { score: 50, text: "It takes a while." },
        { score: 75, text: "I reset if told to." },
        { score: 100, text: "I reset by myself and continued." }
      ]}
    ]
  }
};

export default function AdminCoreSkillsResults({ childId, childName }: AdminCoreSkillsResultsProps) {
  const [results, setResults] = useState<CoreSkillsResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'radar' | 'trend'>('radar');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResults();
  }, [childId]);

  const loadResults = async () => {
    if (!childId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // First, get the user_id for this child through the parents table
      const { data: childData, error: childError } = await supabase
        .from('children')
        .select('parent_id')
        .eq('id', childId)
        .single();

      if (childError) throw childError;

      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .select('user_id')
        .eq('id', childData.parent_id)
        .single();

      if (parentError) throw parentError;

      // Now fetch the core skills results for this user
      const { data, error: resultsError } = await supabase
        .from('core_skills_results')
        .select('*')
        .eq('user_id', parentData.user_id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (resultsError) throw resultsError;
      setResults(data || []);
    } catch (err) {
      console.error('Error loading core skills results:', err);
      setError('Failed to load assessment results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">Loading {childName}'s self-assessment results...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-soft">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            {childName}'s Self-Assessment Results
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-muted-foreground mb-4">
            {childName} hasn't completed any self-assessments yet
          </div>
          <p className="text-sm text-muted-foreground">
            The player can access the self-assessment from their Progress page
          </p>
        </CardContent>
      </Card>
    );
  }

  const latestResult = results[0];
  const scoreInfo = getScoreLabel(latestResult.overall_score);

  // Prepare radar chart data
  const radarData = Object.entries(skillLabels).map(([key, label]) => ({
    skill: label,
    score: latestResult[key as keyof CoreSkillsResult] as number,
    fullMark: 100
  }));

  // Prepare trend chart data
  const trendData = results.slice().reverse().map((result) => ({
    date: format(new Date(result.created_at), 'MMM dd'),
    overall: result.overall_score,
    'Self-Worth': result.know_who_you_are_score,
    'Goals/Planning': result.set_goals_score,
    'Preparation': result.preparation_score,
    'Focus Behaviours': result.focus_behaviours_score,
    'Beating Mind': result.beating_mind_score,
    'Dealing with Failure': result.dealing_with_failure_score
  }));

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            {childName}'s Self-Assessment Results
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'radar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('radar')}
            >
              Current
            </Button>
            <Button
              variant={viewMode === 'trend' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('trend')}
              disabled={results.length < 2}
            >
              Trends
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Latest Score Summary */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Latest Self-Assessment</span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(latestResult.created_at), 'MMM dd, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold">{Math.round(latestResult.overall_score)}%</div>
            <Badge className={scoreInfo.color}>
              {scoreInfo.emoji} {scoreInfo.label}
            </Badge>
            {results.length > 1 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                {results.length} assessments completed
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        {viewMode === 'radar' ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tickCount={5}
                  tick={{ fontSize: 10 }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="overall" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  name="Overall Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Individual Skills Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
          {Object.entries(skillLabels).map(([key, label]) => {
            const score = latestResult[key as keyof CoreSkillsResult] as number;
            const skillInfo = getScoreLabel(score);
            
            return (
              <div key={key} className="p-3 bg-card border rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">{label}</div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{Math.round(score)}%</span>
                  <span className="text-lg">{skillInfo.emoji}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Question Answers */}
        <DetailedAnswers rawAnswers={latestResult.raw_answers} />

        {/* Assessment History */}
        {results.length > 1 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Assessment History
            </h4>
            <div className="space-y-2">
              {results.slice(1, 6).map((result) => (
                <div key={result.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                  <span>{format(new Date(result.created_at), 'MMM dd, yyyy')}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{Math.round(result.overall_score)}%</span>
                    <span>{getScoreLabel(result.overall_score).emoji}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Component to display detailed question answers
function DetailedAnswers({ rawAnswers }: { rawAnswers: Json }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!rawAnswers || typeof rawAnswers !== 'object') return null;

  const answers = rawAnswers as Record<string, Record<string, number>>;

  const getAnswerText = (skillId: string, questionId: string, score: number): string => {
    const skill = skillDetails[skillId];
    if (!skill) return `Score: ${score}`;
    
    const question = skill.questions.find(q => q.id === questionId);
    if (!question) return `Score: ${score}`;
    
    const option = question.options.find(o => o.score === score);
    return option?.text || `Score: ${score}`;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-6">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            View Detailed Answers
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 space-y-6">
        {Object.entries(skillDetails).map(([skillId, skill]) => {
          const skillAnswers = answers[skillId];
          if (!skillAnswers) return null;

          return (
            <div key={skillId} className="border rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-3">{skill.title}</h4>
              <div className="space-y-3">
                {skill.questions.map((question) => {
                  const score = skillAnswers[question.id];
                  if (score === undefined) return null;

                  const answerText = getAnswerText(skillId, question.id, score);
                  const emoji = getScoreEmoji(score);

                  return (
                    <div key={question.id} className="bg-muted/30 p-3 rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">{question.text}</p>
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{emoji}</span>
                        <p className="text-sm font-medium">{answerText}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}

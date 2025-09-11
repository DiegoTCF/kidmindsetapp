import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, RotateCcw, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  text: string;
  options: {
    emoji: string;
    text: string;
    score: number;
  }[];
}

interface Skill {
  id: string;
  title: string;
  questions: Question[];
}

const skills: Skill[] = [
  {
    id: 'know_who_you_are',
    title: '1. Know Who You Are (Self-Worth)',
    questions: [
      {
        id: 'q1',
        text: 'After a bad game, how have you felt recently?',
        options: [
          { emoji: '🔴', text: "I feel like I'm not a good player anymore.", score: 25 },
          { emoji: '🟡', text: "I take mistakes hard & sometimes doubt my abilities.", score: 50 },
          { emoji: '🔴', text: "I need help to be reminded that a bad game doesn't define me.", score: 75 },
          { emoji: '🟢', text: "\"Bad day or good day, I'm still a good player.\"", score: 100 }
        ]
      },
      {
        id: 'q2',
        text: 'How do you feel after making a mistake in a game?',
        options: [
          { emoji: '🔴', text: "\"I'm not good at this.\"", score: 25 },
          { emoji: '🟡', text: "\"I try, but sometimes I say 'I can't.'\"", score: 50 },
          { emoji: '🔴', text: "\"I know it doesn't define me — but I need a reminder from coaches or parents.\"", score: 75 },
          { emoji: '🟢', text: "\"It's fine, one mistake doesn't define me.\"", score: 100 }
        ]
      },
      {
        id: 'q3',
        text: 'When judging your performances lately, what do you focus on?',
        options: [
          { emoji: '🔴', text: "\"I judge based on results only.\"", score: 25 },
          { emoji: '🟡', text: "\"I try, but sometimes I say 'I can't.'\"", score: 50 },
          { emoji: '🔴', text: "\"I need reminding of the good things I did, and to remember my behaviours.\"", score: 75 },
          { emoji: '🟢', text: "\"Bad day or good day, I'm still a good player.\"", score: 100 }
        ]
      },
      {
        id: 'q4',
        text: 'After a bad performance, what do you tell yourself?',
        options: [
          { emoji: '🔴', text: "\"Maybe I'm not good enough.\"", score: 25 },
          { emoji: '🟡', text: "\"I try, but sometimes I say 'I can't.'\"", score: 50 },
          { emoji: '🔴', text: "\"It's not the end of the world\" (when someone tells me).", score: 75 },
          { emoji: '🟢', text: "\"Bad day or good day, I'm still a good player.\"", score: 100 }
        ]
      }
    ]
  },
  {
    id: 'set_goals',
    title: '2. Set Goals / Have a Plan',
    questions: [
      {
        id: 'q1',
        text: 'Before your games lately, have you had a plan?',
        options: [
          { emoji: '🔴', text: "I don't set goals, I just play.", score: 25 },
          { emoji: '🟡', text: "I set goals sometimes but forget them.", score: 50 },
          { emoji: '🔴', text: "I set goals if someone reminds me.", score: 75 },
          { emoji: '🟢', text: "I set my own goals and remember them.", score: 100 }
        ]
      },
      {
        id: 'q2',
        text: 'When things go wrong in a game, what do you think?',
        options: [
          { emoji: '🔴', text: "\"This isn't working.\"", score: 25 },
          { emoji: '🟡', text: "\"I'll try harder.\"", score: 50 },
          { emoji: '🔴', text: "\"I'll try my behaviours\" (if someone tells me).", score: 75 },
          { emoji: '🟢', text: "\"I'll trust my plan and focus on behaviours.\"", score: 100 }
        ]
      },
      {
        id: 'q3',
        text: 'Do you visualise success before performing?',
        options: [
          { emoji: '🔴', text: "No, I don't think about it.", score: 25 },
          { emoji: '🟡', text: "Sometimes I try to.", score: 50 },
          { emoji: '🔴', text: "Yes, if a coach/parent reminds me.", score: 75 },
          { emoji: '🟢', text: "Yes, it's part of my routine.", score: 100 }
        ]
      },
      {
        id: 'q4',
        text: 'Who sets your goals?',
        options: [
          { emoji: '🔴', text: "I don't really have goals.", score: 25 },
          { emoji: '🟡', text: "I set some goals but forget them.", score: 50 },
          { emoji: '🔴', text: "Someone else (coach/parent).", score: 75 },
          { emoji: '🟢', text: "I set them myself.", score: 100 }
        ]
      }
    ]
  },
  {
    id: 'prepare',
    title: '3. Prepare to Perform',
    questions: [
      {
        id: 'q1',
        text: 'Do you prepare mentally before performing?',
        options: [
          { emoji: '🔴', text: "I don't prepare at all.", score: 25 },
          { emoji: '🟡', text: "I try but often forget.", score: 50 },
          { emoji: '🔴', text: "I prepare if someone reminds me.", score: 75 },
          { emoji: '🟢', text: "I have my own preparation routine.", score: 100 }
        ]
      },
      {
        id: 'q2',
        text: 'How do you feel before performing?',
        options: [
          { emoji: '🔴', text: "Nervous and unprepared.", score: 25 },
          { emoji: '🟡', text: "A bit anxious but okay.", score: 50 },
          { emoji: '🔴', text: "I get ready if guided.", score: 75 },
          { emoji: '🟢', text: "I feel ready and excited.", score: 100 }
        ]
      },
      {
        id: 'q3',
        text: 'Do you do breathing exercises?',
        options: [
          { emoji: '🔴', text: "No, I don't know how.", score: 25 },
          { emoji: '🟡', text: "I try sometimes.", score: 50 },
          { emoji: '🔴', text: "Yes, if I know someone will check me.", score: 75 },
          { emoji: '🟢', text: "Yes, it's part of my routine.", score: 100 }
        ]
      },
      {
        id: 'q4',
        text: 'Do you prepare physically?',
        options: [
          { emoji: '🔴', text: "No preparation needed.", score: 25 },
          { emoji: '🟡', text: "Basic warm-up sometimes.", score: 50 },
          { emoji: '🔴', text: "If guided, I do it.", score: 75 },
          { emoji: '🟢', text: "Yes, I warm up properly myself.", score: 100 }
        ]
      }
    ]
  },
  {
    id: 'focus_control',
    title: '4. Focus on What You Control',
    questions: [
      {
        id: 'q1',
        text: 'What do you focus on during the game?',
        options: [
          { emoji: '🔴', text: "Results and what others think.", score: 25 },
          { emoji: '🟡', text: "Mix of results and behaviours.", score: 50 },
          { emoji: '🔴', text: "Behaviours, if reminded.", score: 75 },
          { emoji: '🟢', text: "My behaviours and effort.", score: 100 }
        ]
      },
      {
        id: 'q2',
        text: 'When you make a mistake, what do you think?',
        options: [
          { emoji: '🔴', text: "\"That was terrible.\"", score: 25 },
          { emoji: '🟡', text: "\"I need to do better.\"", score: 50 },
          { emoji: '🔴', text: "\"Focus on my behaviours\" (if someone reminds me).", score: 75 },
          { emoji: '🟢', text: "\"Focus on the next play and my behaviours.\"", score: 100 }
        ]
      },
      {
        id: 'q3',
        text: 'During challenges, where is your focus?',
        options: [
          { emoji: '🔴', text: "On the problem or outcome.", score: 25 },
          { emoji: '🟡', text: "Mix of problem and solution.", score: 50 },
          { emoji: '🔴', text: "Behaviours if someone guides me.", score: 75 },
          { emoji: '🟢', text: "Always on my behaviours.", score: 100 }
        ]
      },
      {
        id: 'q4',
        text: 'How do you handle pressure situations?',
        options: [
          { emoji: '🔴', text: "I get overwhelmed.", score: 25 },
          { emoji: '🟡', text: "I try to stay calm.", score: 50 },
          { emoji: '🔴', text: "Refocus on behaviours when reminded.", score: 75 },
          { emoji: '🟢', text: "I automatically focus on my behaviours.", score: 100 }
        ]
      }
    ]
  },
  {
    id: 'beat_mind',
    title: '5. Beat Your Mind (ANTs)',
    questions: [
      {
        id: 'q1',
        text: 'Can you change negative thoughts when they come up?',
        options: [
          { emoji: '🔴', text: "No, they're too strong.", score: 25 },
          { emoji: '🟡', text: "Sometimes I can.", score: 50 },
          { emoji: '🔴', text: "I could change it with help.", score: 75 },
          { emoji: '🟢', text: "Yes, I can change them myself.", score: 100 }
        ]
      },
      {
        id: 'q2',
        text: 'How quickly did you catch negative thoughts in your last game?',
        options: [
          { emoji: '🔴', text: "I didn't notice them.", score: 25 },
          { emoji: '🟡', text: "I noticed some of them.", score: 50 },
          { emoji: '🔴', text: "I changed it when someone reminded me.", score: 75 },
          { emoji: '🟢', text: "I caught them quickly myself.", score: 100 }
        ]
      },
      {
        id: 'q3',
        text: 'What do you say to yourself to refocus?',
        options: [
          { emoji: '🔴', text: "\"Stop being stupid.\"", score: 25 },
          { emoji: '🟡', text: "\"Come on, concentrate.\"", score: 50 },
          { emoji: '🔴', text: "\"Come on, focus\" (if told).", score: 75 },
          { emoji: '🟢', text: "\"Focus on my behaviours.\"", score: 100 }
        ]
      },
      {
        id: 'q4',
        text: 'After a mistake, what is your self-talk like?',
        options: [
          { emoji: '🔴', text: "\"I'm useless.\"", score: 25 },
          { emoji: '🟡', text: "\"That was bad.\"", score: 50 },
          { emoji: '🔴', text: "\"I'll recover\" (if reminded).", score: 75 },
          { emoji: '🟢', text: "\"Next play, trust my behaviours.\"", score: 100 }
        ]
      }
    ]
  },
  {
    id: 'deal_challenges',
    title: '6. Deal with Challenges',
    questions: [
      {
        id: 'q1',
        text: 'How do you handle setbacks during a game?',
        options: [
          { emoji: '🔴', text: "I give up or get frustrated.", score: 25 },
          { emoji: '🟡', text: "I try to keep going.", score: 50 },
          { emoji: '🔴', text: "I recovered if someone reminded me.", score: 75 },
          { emoji: '🟢', text: "I bounce back quickly myself.", score: 100 }
        ]
      },
      {
        id: 'q2',
        text: 'When things get tough, do you keep going?',
        options: [
          { emoji: '🔴', text: "I usually give up.", score: 25 },
          { emoji: '🟡', text: "I try but struggle.", score: 50 },
          { emoji: '🔴', text: "I kept going if someone pushed me.", score: 75 },
          { emoji: '🟢', text: "I keep going because I trust my plan.", score: 100 }
        ]
      },
      {
        id: 'q3',
        text: 'How did you feel after your last poor performance?',
        options: [
          { emoji: '🔴', text: "Terrible about myself.", score: 25 },
          { emoji: '🟡', text: "Disappointed but okay.", score: 50 },
          { emoji: '🔴', text: "Better if someone comforted me.", score: 75 },
          { emoji: '🟢', text: "\"I tried my best, I'll learn from this.\"", score: 100 }
        ]
      },
      {
        id: 'q4',
        text: 'How quickly do you reset after mistakes?',
        options: [
          { emoji: '🔴', text: "I dwell on them.", score: 25 },
          { emoji: '🟡', text: "It takes a while.", score: 50 },
          { emoji: '🔴', text: "I reset if told to.", score: 75 },
          { emoji: '🟢', text: "I reset by myself and continued.", score: 100 }
        ]
      }
    ]
  }
];

const getScoreLabel = (score: number) => {
  if (score >= 85) return { emoji: '🟢', label: 'Independent', color: 'bg-green-100 text-green-800' };
  if (score >= 70) return { emoji: '🔵', label: 'Supported', color: 'bg-blue-100 text-blue-800' };
  if (score >= 50) return { emoji: '🟡', label: 'Emerging', color: 'bg-yellow-100 text-yellow-800' };
  return { emoji: '🔴', label: 'Struggling', color: 'bg-red-100 text-red-800' };
};

export default function CoreSkillsSelfAssessment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Record<string, number>>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<Record<string, number> | null>(null);

  const currentSkill = skills[currentSkillIndex];
  const currentQuestion = currentSkill.questions[currentQuestionIndex];
  const totalQuestions = skills.length * 4;
  const answeredQuestions = Object.values(answers).reduce((acc, skill) => acc + Object.keys(skill).length, 0);
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleAnswer = (score: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentSkill.id]: {
        ...prev[currentSkill.id],
        [currentQuestion.id]: score
      }
    }));
  };

  const goToNext = () => {
    if (currentQuestionIndex < currentSkill.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentSkillIndex < skills.length - 1) {
      setCurrentSkillIndex(currentSkillIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      // Assessment complete
      calculateAndSubmitResults();
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSkillIndex > 0) {
      setCurrentSkillIndex(currentSkillIndex - 1);
      setCurrentQuestionIndex(skills[currentSkillIndex - 1].questions.length - 1);
    }
  };

  const calculateAndSubmitResults = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Calculate scores for each skill
      const skillScores: Record<string, number> = {};
      let totalScore = 0;

      skills.forEach(skill => {
        const skillAnswers = answers[skill.id] || {};
        const scores = Object.values(skillAnswers);
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        skillScores[skill.id] = Math.round(average * 100) / 100;
        totalScore += average;
      });

      const overallScore = Math.round((totalScore / skills.length) * 100) / 100;

      // Submit to database
      const { error } = await supabase
        .from('core_skills_results')
        .insert({
          user_id: user.id,
          know_who_you_are_score: skillScores.know_who_you_are,
          set_goals_score: skillScores.set_goals,
          preparation_score: skillScores.preparation,
          focus_behaviours_score: skillScores.focus_behaviours,
          beating_mind_score: skillScores.beating_mind,
          dealing_with_failure_score: skillScores.dealing_with_failure,
          overall_score: overallScore,
          raw_answers: answers
        });

      if (error) throw error;

      setResults(skillScores);
      setIsCompleted(true);
      
      toast({
        title: "Assessment Complete! 🎉",
        description: "Your results have been saved successfully.",
      });

    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast({
        title: "Error",
        description: "Failed to save your assessment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAssessment = () => {
    setCurrentSkillIndex(0);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsCompleted(false);
    setResults(null);
  };

  const isQuestionAnswered = answers[currentSkill.id]?.[currentQuestion.id] !== undefined;
  const canGoNext = isQuestionAnswered;
  const isLastQuestion = currentSkillIndex === skills.length - 1 && currentQuestionIndex === currentSkill.questions.length - 1;

  if (isCompleted && results) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏆</div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Assessment Complete!</h1>
            <p className="text-muted-foreground">Here are your Core Skills results</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {skills.map((skill) => {
              const score = results[skill.id];
              const scoreInfo = getScoreLabel(score);
              
              return (
                <Card key={skill.id} className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg">{skill.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold">{score}%</span>
                      <Badge className={cn("text-sm", scoreInfo.color)}>
                        {scoreInfo.emoji} {scoreInfo.label}
                      </Badge>
                    </div>
                    <Progress value={score} className="h-3" />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              Overall Score: {results ? Math.round(Object.values(results).reduce((sum, score) => sum + score, 0) / Object.values(results).length) : 0}%
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button onClick={resetAssessment} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Take Again
              </Button>
              <Button onClick={() => navigate('/progress')}>
                View Progress History
              </Button>
              <Button onClick={() => navigate('/dna')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Core Skills
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dna')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Core Skills Assessment</h1>
              <p className="text-sm text-muted-foreground">
                Question {answeredQuestions + 1} of {totalQuestions}
              </p>
            </div>
          </div>
          
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Question */}
        <Card className="shadow-soft mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {currentSkill.title}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {currentQuestionIndex + 1} of {currentSkill.questions.length}
              </span>
            </div>
            <CardTitle className="text-lg leading-relaxed">
              {currentQuestion.text}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = answers[currentSkill.id]?.[currentQuestion.id] === option.score;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option.score)}
                    className={cn(
                      "w-full p-4 text-left rounded-lg border transition-all duration-200",
                      "hover:border-primary hover:bg-muted/50",
                      isSelected 
                        ? "border-primary bg-primary/10 shadow-sm" 
                        : "border-border bg-card"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">{option.emoji}</span>
                      <span className="text-sm leading-relaxed">{option.text}</span>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-primary ml-auto flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={goToPrevious}
            disabled={currentSkillIndex === 0 && currentQuestionIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <Button 
            onClick={goToNext}
            disabled={!canGoNext || isSubmitting}
          >
            {isSubmitting ? (
              "Submitting..."
            ) : isLastQuestion ? (
              "Complete Assessment"
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
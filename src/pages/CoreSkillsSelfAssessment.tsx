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
          { emoji: '🔵', text: "I need help to be reminded that a bad game doesn't define me.", score: 75 },
          { emoji: '🟢', text: "I believe I'm still the same good player, no matter what happens.", score: 100 }
        ]
      },
      {
        id: 'q2',
        text: 'When you\'ve had a tough session or match recently, what did you think?',
        options: [
          { emoji: '🔴', text: "\"I'm not good enough… maybe I'll never be.\"", score: 25 },
          { emoji: '🟡', text: "\"I know I can do better, but that really got to me.\"", score: 50 },
          { emoji: '🔵', text: "\"I know it doesn't define me — but I need a reminder from coaches or parents.\"", score: 75 },
          { emoji: '🟢', text: "\"It's just one session. I learn from it and move on.\"", score: 100 }
        ]
      },
      {
        id: 'q3',
        text: 'How do you know if you\'ve had a good game?',
        options: [
          { emoji: '🔴', text: "\"Only if I scored or won the game.\"", score: 25 },
          { emoji: '🟡', text: "\"Mostly by the result, but I try to remember it's not just that.\"", score: 50 },
          { emoji: '🔵', text: "\"I need reminding of the good things I did, and to remember my behaviours.\"", score: 75 },
          { emoji: '🟢', text: "\"I focus on how I behaved & my own actions and effort regardless of the outcome.\"", score: 100 }
        ]
      },
      {
        id: 'q4',
        text: 'What have you told yourself on bad days lately?',
        options: [
          { emoji: '🔴', text: "\"Maybe I'm not good enough & feel like quitting.\"", score: 25 },
          { emoji: '🟡', text: "\"I try, but sometimes I say 'I can't.'\"", score: 50 },
          { emoji: '🔵', text: "\"It's not the end of the world\" (when someone tells me).", score: 75 },
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
          { emoji: '🔵', text: "I set goals if someone reminds me.", score: 75 },
          { emoji: '🟢', text: "I set my own goals and remember them.", score: 100 }
        ]
      },
      {
        id: 'q2',
        text: 'What have you thought before recent matches?',
        options: [
          { emoji: '🔴', text: "\"I'll just see what happens.\"", score: 25 },
          { emoji: '🟡', text: "\"I want to do well\" but with no clear plan.", score: 50 },
          { emoji: '🔵', text: "\"I'll try my behaviours\" (if someone tells me).", score: 75 },
          { emoji: '🟢', text: "\"I know my plan and what behaviours to show.\"", score: 100 }
        ]
      },
      {
        id: 'q3',
        text: 'In difficult moments recently, have you remembered your plan?',
        options: [
          { emoji: '🔴', text: "No, I just freeze or forget.", score: 25 },
          { emoji: '🟡', text: "Sometimes, but I lose it when pressured.", score: 50 },
          { emoji: '🔵', text: "Yes, if a coach/parent reminds me.", score: 75 },
          { emoji: '🟢', text: "Yes, I stick to my plan myself.", score: 100 }
        ]
      },
      {
        id: 'q4',
        text: 'Who made your goals recently?',
        options: [
          { emoji: '🔴', text: "Nobody.", score: 25 },
          { emoji: '🟡', text: "I sometimes do, but not clearly.", score: 50 },
          { emoji: '🔵', text: "Someone else (coach/parent).", score: 75 },
          { emoji: '🟢', text: "I do, and I stick to them.", score: 100 }
        ]
      }
    ]
  },
  {
    id: 'preparation',
    title: '3. Preparation / Autonomy / Habits',
    questions: [
      {
        id: 'q1',
        text: 'How have you gotten ready before sessions?',
        options: [
          { emoji: '🔴', text: "I need others to remind me (kit, warm-up, etc.).", score: 25 },
          { emoji: '🟡', text: "I sometimes prepare but not always.", score: 50 },
          { emoji: '🔵', text: "I prepare if someone reminds me.", score: 75 },
          { emoji: '🟢', text: "I prepare fully on my own.", score: 100 }
        ]
      },
      {
        id: 'q2',
        text: 'On game days recently…',
        options: [
          { emoji: '🔴', text: "I wait for others to organise me.", score: 25 },
          { emoji: '🟡', text: "I prepare sometimes but forget things.", score: 50 },
          { emoji: '🔵', text: "I get ready if guided.", score: 75 },
          { emoji: '🟢', text: "I have my own routine and stick to it.", score: 100 }
        ]
      },
      {
        id: 'q3',
        text: 'If no one reminds you, do you still prepare?',
        options: [
          { emoji: '🔴', text: "No, I forget.", score: 25 },
          { emoji: '🟡', text: "Sometimes, but not every time.", score: 50 },
          { emoji: '🔵', text: "Yes, if I know someone will check me.", score: 75 },
          { emoji: '🟢', text: "Yes, I always prepare alone.", score: 100 }
        ]
      },
      {
        id: 'q4',
        text: 'How have your warm-ups been lately?',
        options: [
          { emoji: '🔴', text: "Only if told.", score: 25 },
          { emoji: '🟡', text: "Sometimes I try, but not well.", score: 50 },
          { emoji: '🔵', text: "If guided, I do it.", score: 75 },
          { emoji: '🟢', text: "I warm up by myself, I know my routine.", score: 100 }
        ]
      }
    ]
  },
  {
    id: 'focus_behaviours',
    title: '4. Focus on Super Behaviours',
    questions: [
      {
        id: 'q1',
        text: 'What have you focused on in recent matches?',
        options: [
          { emoji: '🔴', text: "Only the score/winning.", score: 25 },
          { emoji: '🟡', text: "Behaviours sometimes, but I go back to results.", score: 50 },
          { emoji: '🔵', text: "Behaviours, if reminded.", score: 75 },
          { emoji: '🟢', text: "Always behaviours, even under pressure.", score: 100 }
        ]
      },
      {
        id: 'q2',
        text: 'After a mistake recently, what went through your mind?',
        options: [
          { emoji: '🔴', text: "\"We're losing, I'm rubbish.\"", score: 25 },
          { emoji: '🟡', text: "\"I should focus, but I can't stop thinking of results.\"", score: 50 },
          { emoji: '🔵', text: "\"Focus on my behaviours\" (if someone reminds me).", score: 75 },
          { emoji: '🟢', text: "\"Forget results, focus on my behaviours.\"", score: 100 }
        ]
      },
      {
        id: 'q3',
        text: 'When a coach asked about your game, what did you talk about?',
        options: [
          { emoji: '🔴', text: "Only results (goals, score).", score: 25 },
          { emoji: '🟡', text: "Results first, behaviours second.", score: 50 },
          { emoji: '🔵', text: "Behaviours if someone guides me.", score: 75 },
          { emoji: '🟢', text: "Behaviours first, results second.", score: 100 }
        ]
      },
      {
        id: 'q4',
        text: 'In a close game recently, what have you done?',
        options: [
          { emoji: '🔴', text: "Panic about winning/losing.", score: 25 },
          { emoji: '🟡', text: "Try to focus but drift to results.", score: 50 },
          { emoji: '🔵', text: "Refocus on behaviours when reminded.", score: 75 },
          { emoji: '🟢', text: "Lock onto behaviours no matter the score.", score: 100 }
        ]
      }
    ]
  },
  {
    id: 'beating_mind',
    title: '5. Beating Your Mind (ANTs / Thinking Traps)',
    questions: [
      {
        id: 'q1',
        text: 'When you\'ve thought "I can\'t do it," what happened?',
        options: [
          { emoji: '🔴', text: "I believed it and gave up.", score: 25 },
          { emoji: '🟡', text: "I noticed it but couldn't change it.", score: 50 },
          { emoji: '🔵', text: "I could change it with help.", score: 75 },
          { emoji: '🟢', text: "I replaced it with a positive thought.", score: 100 }
        ]
      },
      {
        id: 'q2',
        text: 'If a negative thought came during a game recently…',
        options: [
          { emoji: '🔴', text: "It controlled me.", score: 25 },
          { emoji: '🟡', text: "I saw it but still froze.", score: 50 },
          { emoji: '🔵', text: "I changed it when someone reminded me.", score: 75 },
          { emoji: '🟢', text: "I flipped it into something positive.", score: 100 }
        ]
      },
      {
        id: 'q3',
        text: 'What have you said to yourself under pressure lately?',
        options: [
          { emoji: '🔴', text: "\"I can't.\"", score: 25 },
          { emoji: '🟡', text: "\"Maybe I can, maybe not.\"", score: 50 },
          { emoji: '🔵', text: "\"Come on, focus\" (if told).", score: 75 },
          { emoji: '🟢', text: "\"I can handle this.\"", score: 100 }
        ]
      },
      {
        id: 'q4',
        text: 'After a mistake recently, what did you think?',
        options: [
          { emoji: '🔴', text: "\"I'm rubbish.\"", score: 25 },
          { emoji: '🟡', text: "\"I might recover… but probably not.\"", score: 50 },
          { emoji: '🔵', text: "\"I'll recover\" (if reminded).", score: 75 },
          { emoji: '🟢', text: "\"Reset, next action, I'm fine.\"", score: 100 }
        ]
      }
    ]
  },
  {
    id: 'dealing_with_failure',
    title: '6. Dealing with Failure & Challenges',
    questions: [
      {
        id: 'q1',
        text: 'After a mistake recently, what did you do?',
        options: [
          { emoji: '🔴', text: "I collapsed, sulked, or gave up.", score: 25 },
          { emoji: '🟡', text: "I recovered, but slowly and weakly.", score: 50 },
          { emoji: '🔵', text: "I recovered if someone reminded me.", score: 75 },
          { emoji: '🟢', text: "I reset quickly by myself.", score: 100 }
        ]
      },
      {
        id: 'q2',
        text: 'In tough recent matches, how did you react?',
        options: [
          { emoji: '🔴', text: "I gave up.", score: 25 },
          { emoji: '🟡', text: "I tried again, but felt fragile.", score: 50 },
          { emoji: '🔵', text: "I kept going if someone pushed me.", score: 75 },
          { emoji: '🟢', text: "I kept going no matter what.", score: 100 }
        ]
      },
      {
        id: 'q3',
        text: 'After losing recently, how did you feel?',
        options: [
          { emoji: '🔴', text: "Angry, sulky, worthless.", score: 25 },
          { emoji: '🟡', text: "Sad, but slowly moved on.", score: 50 },
          { emoji: '🔵', text: "Better if someone comforted me.", score: 75 },
          { emoji: '🟢', text: "Bounced back, ready for the next game.", score: 100 }
        ]
      },
      {
        id: 'q4',
        text: 'When things have gone wrong lately…',
        options: [
          { emoji: '🔴', text: "I stopped trying.", score: 25 },
          { emoji: '🟡', text: "I tried, but struggled.", score: 50 },
          { emoji: '🔵', text: "I reset if told to.", score: 75 },
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
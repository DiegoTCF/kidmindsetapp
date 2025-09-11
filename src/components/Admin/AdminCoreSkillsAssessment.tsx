import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, CheckCircle, Eye, RotateCcw } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  answers: {
    text: string;
    score: number;
    emoji: string;
    color: string;
  }[];
}

interface Skill {
  id: number;
  name: string;
  questions: Question[];
}

interface AdminCoreSkillsAssessmentProps {
  childId: string;
  childName: string;
}

const AdminCoreSkillsAssessment: React.FC<AdminCoreSkillsAssessmentProps> = ({ childId, childName }) => {
  const { toast } = useToast();
  const [currentSkill, setCurrentSkill] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [skillScores, setSkillScores] = useState<Record<number, number>>({});
  const [existingAssessment, setExistingAssessment] = useState<any>(null);
  const [showRetakeDialog, setShowRetakeDialog] = useState(false);

  const skills: Skill[] = [
    {
      id: 1,
      name: "Know Who You Are (Self-Worth)",
      questions: [
        {
          id: "1_1",
          text: "After a bad game, how do you feel about yourself?",
          answers: [
            { text: "I feel like I'm not a good player anymore.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "I know I'm still okay, but I take mistakes hard.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "I remind myself a bad game doesn't define me (if someone tells me).", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "I believe I'm still the same good player, no matter what happens.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "1_2",
          text: "When you make a mistake, what do you think?",
          answers: [
            { text: "\"I'm rubbish.\"", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "\"I know I'm better, but this mistake hurts.\"", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "\"It's fine, one mistake doesn't define me\" (if someone reminds me).", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "\"I know it doesn't define me — but I need a reminder from coaches or parents.\"", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "1_3",
          text: "How would you judge your performances lately?",
          answers: [
            { text: "By results only.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "Sometimes by effort, but mostly results.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "By effort and behaviours, if someone reminds me.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "By effort and behaviours (I remind myself).", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "1_4",
          text: "What do you tell yourself after a bad performance?",
          answers: [
            { text: "\"I'm not good enough.\"", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "\"Maybe I'm not good enough.\"", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "\"It's not the end of the world\" (when someone tells me).", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "\"Bad day or good day, I'm still a good player.\"", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        }
      ]
    },
    {
      id: 2,
      name: "Set Goals / Have a Plan",
      questions: [
        {
          id: "2_1",
          text: "Before a game, do you set a plan?",
          answers: [
            { text: "I don't set goals, I just play.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "I set goals sometimes but forget them.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "I set goals if someone reminds me.", score: 3, emoji: "🔴", color: "text-destructive" },
            { text: "I set my own goals and remember them.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "2_2",
          text: "What's your reaction when things go wrong?",
          answers: [
            { text: "\"I give up easily.\"", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "\"I struggle but keep trying.\"", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "\"I'll try my behaviours\" (if someone tells me).", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "\"I'll trust my plan and focus on behaviours.\"", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "2_3",
          text: "Do you visualise success before performing?",
          answers: [
            { text: "No, I don't think about it.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "Sometimes, but not consistently.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "Yes, if a coach/parent reminds me.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "Yes, it's part of my routine.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "2_4",
          text: "Who sets your goals?",
          answers: [
            { text: "No one sets goals for me.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "Goals are unclear or forgotten.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "Someone else (coach/parent).", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "I set them myself.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        }
      ]
    },
    {
      id: 3,
      name: "Prepare to Perform",
      questions: [
        {
          id: "3_1",
          text: "Do you prepare mentally before performing?",
          answers: [
            { text: "I don't prepare at all.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "I try to prepare but often forget.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "I prepare if someone reminds me.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "I have my own preparation routine.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "3_2",
          text: "How do you feel before performing?",
          answers: [
            { text: "I feel anxious and unprepared.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "I feel nervous but try to cope.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "I get ready if guided.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "I feel ready and excited.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "3_3",
          text: "Do you do breathing exercises?",
          answers: [
            { text: "No, I don't know any.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "Sometimes, but I forget.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "Yes, if I know someone will check me.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "Yes, it's part of my routine.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "3_4",
          text: "Do you prepare physically?",
          answers: [
            { text: "No, I just turn up.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "I do basic warm-up if reminded.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "If guided, I do it.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "Yes, I warm up properly myself.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        }
      ]
    },
    {
      id: 4,
      name: "Focus on What You Control",
      questions: [
        {
          id: "4_1",
          text: "What do you focus on during the game?",
          answers: [
            { text: "Results and what others think.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "Mix of results and behaviours.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "Behaviours, if reminded.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "My behaviours and effort.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "4_2",
          text: "When you make a mistake, what do you think?",
          answers: [
            { text: "\"I'm terrible at this.\"", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "\"Why do I always mess up?\"", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "\"Focus on my behaviours\" (if someone reminds me).", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "\"Focus on the next play and my behaviours.\"", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "4_3",
          text: "During challenges, where's your focus?",
          answers: [
            { text: "On results and what might go wrong.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "Mixed between results and behaviours.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "Behaviours if someone guides me.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "Always on my behaviours.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "4_4",
          text: "How do you handle pressure situations?",
          answers: [
            { text: "I panic and lose focus completely.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "I try to stay calm but often lose focus.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "Refocus on behaviours when reminded.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "I automatically focus on my behaviours.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        }
      ]
    },
    {
      id: 5,
      name: "Beat Your Mind (ANTs)",
      questions: [
        {
          id: "5_1",
          text: "Can you change negative thoughts?",
          answers: [
            { text: "No, they're too strong.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "Sometimes, but it's really hard.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "I can change it with help.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "Yes, I can change them myself.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "5_2",
          text: "How quickly do you catch negative thoughts?",
          answers: [
            { text: "I don't notice them at all.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "I notice them but can't stop them.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "I change it when someone reminds me.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "I catch them quickly myself.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "5_3",
          text: "What do you say to refocus?",
          answers: [
            { text: "Nothing, I stay stuck in negativity.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "I try but struggle to refocus.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "\"Come on, focus\" (if told).", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "\"Focus on my behaviours.\"", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "5_4",
          text: "After a mistake, what's your self-talk?",
          answers: [
            { text: "\"I'm useless.\"", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "\"I keep messing up.\"", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "\"I'll recover\" (if reminded).", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "\"Next play, trust my behaviours.\"", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        }
      ]
    },
    {
      id: 6,
      name: "Deal with Challenges",
      questions: [
        {
          id: "6_1",
          text: "How do you handle setbacks?",
          answers: [
            { text: "I give up or get frustrated.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "I get frustrated but eventually try again.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "I recover if someone reminds me.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "I bounce back quickly myself.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "6_2",
          text: "When things get tough, do you keep going?",
          answers: [
            { text: "I give up immediately.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "I struggle but sometimes quit.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "I keep going if someone pushes me.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "I keep going because I trust my plan.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "6_3",
          text: "How do you feel after a poor performance?",
          answers: [
            { text: "Devastated and can't get over it.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "Really down and it affects me for days.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "Better if someone comforts me.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "\"I tried my best, I'll learn from this.\"", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "6_4",
          text: "How quickly do you reset after mistakes?",
          answers: [
            { text: "I dwell on mistakes for a long time.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "I eventually move on but it takes time.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "I reset if told to.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "I reset by myself and continue.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        }
      ]
    }
  ];

  // Check for existing assessment when component mounts
  useEffect(() => {
    const checkExistingAssessment = async () => {
      if (!childId) return;

      const { data, error } = await supabase
        .from('core_skills_assessments')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error checking existing assessment:', error);
        return;
      }

      if (data && data.length > 0) {
        setExistingAssessment(data[0]);
        setShowRetakeDialog(true);
      }
    };

    checkExistingAssessment();
  }, [childId]);

  const handleStartNewAssessment = () => {
    setExistingAssessment(null);
    setShowRetakeDialog(false);
    setAnswers({});
    setCurrentSkill(0);
    setShowResults(false);
    setSkillScores({});
  };

  const handleViewExistingResults = () => {
    if (existingAssessment) {
      const convertScore = (score: number) => {
        if (score > 4) return score;
        return Math.round(((score - 1) / 3) * 100);
      };

      const scores: Record<number, number> = {
        1: convertScore(existingAssessment.skill_1_score),
        2: convertScore(existingAssessment.skill_2_score),
        3: convertScore(existingAssessment.skill_3_score),
        4: convertScore(existingAssessment.skill_4_score),
        5: convertScore(existingAssessment.skill_5_score),
        6: convertScore(existingAssessment.skill_6_score),
      };
      setSkillScores(scores);
      setAnswers(existingAssessment.raw_answers || {});
      setShowResults(true);
      setShowRetakeDialog(false);
    }
  };

  const getLevelLabel = (score: number) => {
    if (score >= 0 && score <= 24) return { label: "🔴 Struggle", color: "text-red-500" };
    if (score >= 25 && score <= 49) return { label: "🟡 Emerging", color: "text-yellow-500" };
    if (score >= 50 && score <= 74) return { label: "🔵 Supported", color: "text-blue-500" };
    if (score >= 75 && score <= 100) return { label: "🟢 Independent", color: "text-green-500" };
    return { label: "N/A", color: "text-gray-500" };
  };

  const calculateSkillScore = (skillId: number) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return 0;

    const skillAnswers = skill.questions.map(q => answers[q.id]).filter(Boolean);
    if (skillAnswers.length === 0) return 0;

    const average = skillAnswers.reduce((sum, score) => sum + score, 0) / skillAnswers.length;
    const percentageScore = ((average - 1) / 3) * 100;
    return Math.max(0, Math.min(100, Math.round(percentageScore)));
  };

  const isSkillComplete = (skillId: number) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return false;
    return skill.questions.every(q => answers[q.id]);
  };

  const canProceedToNext = () => {
    return isSkillComplete(skills[currentSkill].id);
  };

  const allSkillsComplete = () => {
    return skills.every(skill => isSkillComplete(skill.id));
  };

  const handleNext = () => {
    if (currentSkill < skills.length - 1) {
      setCurrentSkill(currentSkill + 1);
    } else if (allSkillsComplete()) {
      const scores: Record<number, number> = {};
      skills.forEach(skill => {
        scores[skill.id] = calculateSkillScore(skill.id);
      });
      setSkillScores(scores);
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentSkill > 0) {
      setCurrentSkill(currentSkill - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('core_skills_assessments')
        .insert({
          child_id: childId,
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          skill_1_score: skillScores[1],
          skill_2_score: skillScores[2],
          skill_3_score: skillScores[3],
          skill_4_score: skillScores[4],
          skill_5_score: skillScores[5],
          skill_6_score: skillScores[6],
          raw_answers: answers
        });

      if (error) throw error;

      toast({
        title: "Assessment Saved",
        description: `Core Skills Assessment for ${childName} saved successfully!`
      });

      // Reset form
      setAnswers({});
      setCurrentSkill(0);
      setShowResults(false);
      setSkillScores({});

    } catch (error) {
      console.error('Error saving assessment:', error);
      toast({
        title: "Error",
        description: "Failed to save assessment",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show retake dialog if there's an existing assessment
  if (showRetakeDialog && existingAssessment) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-lg">Previous Assessment Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            {childName} has already completed a Core Skills Assessment on{' '}
            {new Date(existingAssessment.created_at).toLocaleDateString()}.
          </p>
          <div className="space-y-2">
            <Button onClick={handleViewExistingResults} className="w-full" variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View Previous Results
            </Button>
            <Button onClick={handleStartNewAssessment} className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Take New Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show results view
  if (showResults) {
    const overallScore = Math.round(
      Object.values(skillScores).reduce((sum, score) => sum + score, 0) / skills.length
    );
    const overallLevel = getLevelLabel(overallScore);

    return (
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Assessment Results for {childName}</CardTitle>
            <div className="mt-4">
              <div className={`text-4xl font-bold ${overallLevel.color} mb-2`}>
                {overallScore}%
              </div>
              <div className={`text-lg ${overallLevel.color}`}>
                {overallLevel.label}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {skills.map((skill) => {
            const score = skillScores[skill.id] || 0;
            const level = getLevelLabel(score);
            
            return (
              <Card key={skill.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{skill.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${level.color} mb-1`}>
                      {score}%
                    </div>
                    <div className={`text-sm ${level.color}`}>
                      {level.label}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-4 justify-center">
          <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
            {isSubmitting ? "Saving..." : "Save Assessment"}
          </Button>
          <Button onClick={handleStartNewAssessment} variant="outline" size="lg">
            Take New Assessment
          </Button>
        </div>
      </div>
    );
  }

  // Main assessment interface
  const currentSkillData = skills[currentSkill];
  const progressPercentage = ((currentSkill + 1) / skills.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            Skill {currentSkill + 1} of {skills.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Current skill */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl text-center">
            {currentSkillData.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentSkillData.questions.map((question, index) => (
            <div key={question.id} className="space-y-4">
              <h3 className="font-medium">
                {index + 1}. {question.text}
              </h3>
              
              <RadioGroup
                value={answers[question.id]?.toString() || ""}
                onValueChange={(value) => {
                  setAnswers(prev => ({
                    ...prev,
                    [question.id]: parseInt(value)
                  }));
                }}
                className="space-y-2"
              >
                {question.answers.map((answer) => (
                  <div key={answer.score} className="flex items-center space-x-2">
                    <RadioGroupItem value={answer.score.toString()} id={`${question.id}_${answer.score}`} />
                    <Label 
                      htmlFor={`${question.id}_${answer.score}`}
                      className={`flex-1 cursor-pointer p-2 rounded border hover:bg-accent/50 ${answers[question.id] === answer.score ? 'bg-accent border-primary' : 'border-border'}`}
                    >
                      <span className="mr-2">{answer.emoji}</span>
                      {answer.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          onClick={handlePrevious}
          disabled={currentSkill === 0}
          variant="outline"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          {canProceedToNext() ? (
            <span className="text-green-600 flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              Skill Complete
            </span>
          ) : (
            <span>Answer all questions to proceed</span>
          )}
        </div>

        <Button
          onClick={handleNext}
          disabled={!canProceedToNext()}
        >
          {currentSkill === skills.length - 1 ? "View Results" : "Next"}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default AdminCoreSkillsAssessment;
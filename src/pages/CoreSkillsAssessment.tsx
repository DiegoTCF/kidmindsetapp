import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle, ArrowLeft } from 'lucide-react';

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

const CoreSkillsAssessment = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [children, setChildren] = useState<any[]>([]);
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
            { text: "I remind myself a bad game doesn't define me (if someone tells me).", score: 3, emoji: "🔴", color: "text-destructive" },
            { text: "I believe I'm still the same good player, no matter what happens.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "1_2",
          text: "When you make a mistake, what do you think?",
          answers: [
            { text: "\"I'm rubbish.\"", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "\"I know I'm better, but this mistake hurts.\"", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "\"It's fine, one mistake doesn't define me\" (if someone reminds me).", score: 3, emoji: "🔴", color: "text-destructive" },
            { text: "\"I know it doesn't define me — but I need a reminder from coaches or parents.\"", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "1_3",
          text: "How would you judge your performances lately?",
          answers: [
            { text: "By effort and behaviours, if someone reminds me.", score: 3, emoji: "🔴", color: "text-destructive" },
            { text: "By effort and behaviours (I remind myself).", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "1_4",
          text: "What do you tell yourself after a bad performance?",
          answers: [
            { text: "\"Maybe I'm not good enough.\"", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "\"It's not the end of the world\" (when someone tells me).", score: 3, emoji: "🔴", color: "text-destructive" },
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
            { text: "\"I'll try my behaviours\" (if someone tells me).", score: 3, emoji: "🔴", color: "text-destructive" },
            { text: "\"I'll trust my plan and focus on behaviours.\"", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "2_3",
          text: "Do you visualise success before performing?",
          answers: [
            { text: "Yes, if a coach/parent reminds me.", score: 3, emoji: "🔴", color: "text-destructive" },
            { text: "Yes, it's part of my routine.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "2_4",
          text: "Who sets your goals?",
          answers: [
            { text: "Someone else (coach/parent).", score: 3, emoji: "🔴", color: "text-destructive" },
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
            { text: "I prepare if someone reminds me.", score: 3, emoji: "🔴", color: "text-destructive" },
            { text: "I have my own preparation routine.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "3_2",
          text: "How do you feel before performing?",
          answers: [
            { text: "I get ready if guided.", score: 3, emoji: "🔴", color: "text-destructive" },
            { text: "I feel ready and excited.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "3_3",
          text: "Do you do breathing exercises?",
          answers: [
            { text: "Yes, if I know someone will check me.", score: 3, emoji: "🔴", color: "text-destructive" },
            { text: "Yes, it's part of my routine.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "3_4",
          text: "Do you prepare physically?",
          answers: [
            { text: "If guided, I do it.", score: 3, emoji: "🔴", color: "text-destructive" },
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
            { text: "Behaviours, if reminded.", score: 3, emoji: "🔴", color: "text-destructive" },
            { text: "My behaviours and effort.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "4_2",
          text: "When you make a mistake, what do you think?",
          answers: [
            { text: "\"Focus on my behaviours\" (if someone reminds me).", score: 3, emoji: "🔴", color: "text-destructive" },
            { text: "\"Focus on the next play and my behaviours.\"", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "4_3",
          text: "During challenges, where's your focus?",
          answers: [
            { text: "Behaviours if someone guides me.", score: 3, emoji: "🔴", color: "text-destructive" },
            { text: "Always on my behaviours.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "4_4",
          text: "How do you handle pressure situations?",
          answers: [
            { text: "Refocus on behaviours when reminded.", score: 3, emoji: "🔴", color: "text-destructive" },
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
            { text: "I can change it with help.", score: 3, emoji: "🔴", color: "text-destructive" },
            { text: "Yes, I can change them myself.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "5_2",
          text: "How quickly do you catch negative thoughts?",
          answers: [
            { text: "I change it when someone reminds me.", score: 3, emoji: "🔴", color: "text-destructive" },
            { text: "I catch them quickly myself.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "5_3",
          text: "What do you say to refocus?",
          answers: [
            { text: "\"Come on, focus\" (if told).", score: 3, emoji: "🔴", color: "text-destructive" },
            { text: "\"Focus on my behaviours.\"", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "5_4",
          text: "After a mistake, what's your self-talk?",
          answers: [
            { text: "\"I'll recover\" (if reminded).", score: 3, emoji: "🔴", color: "text-destructive" },
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
            { text: "I recover if someone reminds me.", score: 3, emoji: "🔴", color: "text-destructive" },
            { text: "I bounce back quickly myself.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "6_2",
          text: "When things get tough, do you keep going?",
          answers: [
            { text: "I keep going if someone pushes me.", score: 3, emoji: "🔴", color: "text-destructive" },
            { text: "I keep going because I trust my plan.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "6_3",
          text: "How do you feel after a poor performance?",
          answers: [
            { text: "Better if someone comforts me.", score: 3, emoji: "🔴", color: "text-destructive" },
            { text: "\"I tried my best, I'll learn from this.\"", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "6_4",
          text: "How quickly do you reset after mistakes?",
          answers: [
            { text: "I reset if told to.", score: 3, emoji: "🔴", color: "text-destructive" },
            { text: "I reset by myself and continue.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        }
      ]
    }
  ];

  // Load children when component mounts
  React.useEffect(() => {
    const loadChildren = async () => {
      const { data, error } = await supabase
        .from('children')
        .select('id, name, age')
        .order('name');
      
      if (error) {
        console.error('Error loading children:', error);
        toast({
          title: "Error",
          description: "Failed to load children",
          variant: "destructive"
        });
      } else {
        setChildren(data || []);
      }
    };

    loadChildren();
  }, []);

  // Check for existing assessment when child is selected
  React.useEffect(() => {
    const checkExistingAssessment = async () => {
      if (!selectedChild) {
        setExistingAssessment(null);
        return;
      }

      const { data, error } = await supabase
        .from('core_skills_assessments')
        .select('*')
        .eq('child_id', selectedChild)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error checking existing assessment:', error);
        return;
      }

      if (data && data.length > 0) {
        setExistingAssessment(data[0]);
        setShowRetakeDialog(true);
      } else {
        setExistingAssessment(null);
        setShowRetakeDialog(false);
      }
    };

    checkExistingAssessment();
  }, [selectedChild]);

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
      // Convert existing scores (might be in 0-4 scale) to 0-100 scale
      const convertScore = (score: number) => {
        // If score is already > 4, assume it's already in 0-100 scale
        if (score > 4) return score;
        // Otherwise convert from 1-4 scale to 0-100 scale
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
    if (score >= 50 && score <= 74) return { label: "🔴 Supported", color: "text-destructive" };
    if (score >= 75 && score <= 100) return { label: "🟢 Independent", color: "text-green-500" };
    return { label: "N/A", color: "text-gray-500" };
  };

  const calculateSkillScore = (skillId: number) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return 0;

    const skillAnswers = skill.questions.map(q => answers[q.id]).filter(Boolean);
    if (skillAnswers.length === 0) return 0;

    console.log(`Skill ${skillId} answers:`, skillAnswers);
    const average = skillAnswers.reduce((sum, score) => sum + score, 0) / skillAnswers.length;
    console.log(`Skill ${skillId} average:`, average);
    // Convert 1-4 scale to 0-100 scale properly
    // 1 → 0%, 2 → 33%, 3 → 67%, 4 → 100%
    const percentageScore = ((average - 1) / 3) * 100;
    console.log(`Skill ${skillId} percentage score:`, percentageScore);
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
      // Calculate all skill scores
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
    if (!selectedChild) {
      toast({
        title: "Error",
        description: "Please select a child first",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('core_skills_assessments')
        .insert({
          child_id: selectedChild,
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
        title: "Success",
        description: "Core Skills Assessment saved successfully!"
      });

      // Reset form
      setAnswers({});
      setCurrentSkill(0);
      setShowResults(false);
      setSkillScores({});
      setSelectedChild('');

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

  const progress = ((currentSkill + (showResults ? 1 : 0)) / (skills.length + 1)) * 100;

  if (showResults) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        <div className="text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-3xl font-bold">Assessment Complete!</h1>
          <p className="text-muted-foreground">Review the results below</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Core Skills Assessment Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {skills.map(skill => {
              const score = skillScores[skill.id];
              const level = getLevelLabel(score);
              return (
                <div key={skill.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{skill.name}</h3>
                    <p className={`text-sm font-medium ${level.color}`}>{level.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{score}/100</p>
                    <p className="text-sm text-muted-foreground">percentage score</p>
                  </div>
                </div>
              );
            })}

            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => setShowResults(false)}
                variant="outline"
                className="flex-1"
              >
                Review Answers
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Saving..." : "Save Assessment"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Players
        </Button>
      </div>
      
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-center">Core Skills Assessment</h1>
        <p className="text-center text-muted-foreground">
          Complete assessment for each core skill area
        </p>
        
        {/* Child Selection */}
        {!selectedChild && (
          <Card>
            <CardHeader>
              <CardTitle>Select Child</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a child to assess" />
                </SelectTrigger>
                <SelectContent>
                  {children.map(child => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name} (Age {child.age})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Existing Assessment Dialog */}
        {showRetakeDialog && existingAssessment && (
          <Card>
            <CardHeader>
              <CardTitle>Assessment Already Exists</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                A core skills assessment for this child was completed on{' '}
                {new Date(existingAssessment.created_at).toLocaleDateString()}.
              </p>
              <p className="text-sm text-muted-foreground">
                Would you like to view the existing results or start a new assessment?
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={handleViewExistingResults}
                  variant="outline"
                  className="flex-1"
                >
                  View Existing Results
                </Button>
                <Button
                  onClick={handleStartNewAssessment}
                  className="flex-1"
                >
                  Start New Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedChild && !showRetakeDialog && (
          <>
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Current Skill */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Skill {skills[currentSkill].id} of {skills.length}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {isSkillComplete(skills[currentSkill].id) ? "✅ Complete" : "⏳ In Progress"}
                  </span>
                </CardTitle>
                <h2 className="text-xl font-semibold text-primary">
                  {skills[currentSkill].name}
                </h2>
              </CardHeader>
              <CardContent className="space-y-8">
                {skills[currentSkill].questions.map((question, questionIndex) => (
                  <div key={question.id} className="space-y-4">
                    <h3 className="font-medium text-lg">
                      Question {questionIndex + 1}: {question.text}
                    </h3>
                    
                    <RadioGroup
                      value={answers[question.id]?.toString() || ""}
                      onValueChange={(value) => setAnswers(prev => ({
                        ...prev,
                        [question.id]: parseInt(value)
                      }))}
                      className="space-y-3"
                    >
                      {question.answers.map((answer, answerIndex) => (
                        <div key={answerIndex} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent transition-colors">
                          <RadioGroupItem value={answer.score.toString()} id={`${question.id}_${answerIndex}`} />
                          <Label
                            htmlFor={`${question.id}_${answerIndex}`}
                            className="flex-1 cursor-pointer leading-relaxed"
                          >
                            <span className={`${answer.color} font-medium mr-2`}>
                              {answer.emoji}
                            </span>
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
            <div className="flex justify-between">
              <Button
                onClick={handlePrevious}
                disabled={currentSkill === 0}
                variant="outline"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!canProceedToNext()}
              >
                {currentSkill === skills.length - 1 ? "View Results" : "Next"}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CoreSkillsAssessment;
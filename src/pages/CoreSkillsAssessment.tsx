import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

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
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [children, setChildren] = useState<any[]>([]);
  const [currentSkill, setCurrentSkill] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [skillScores, setSkillScores] = useState<Record<number, number>>({});

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
            { text: "\"It's just a mistake, I can move on. I'm still me.\"", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "1_3",
          text: "How do you judge if you're a good player?",
          answers: [
            { text: "Only if I play well.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "Mostly by results, but I sometimes know it's not everything.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "By effort and behaviours, if someone reminds me.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "By who I am and how I play, not just results.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "1_4",
          text: "What do you say to yourself on bad days?",
          answers: [
            { text: "\"I'm not good.\"", score: 1, emoji: "🔴", color: "text-red-500" },
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
            { text: "I set goals if someone reminds me.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "I set my own goals and remember them.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "2_2",
          text: "How do you think before a match?",
          answers: [
            { text: "\"I'll just see what happens.\"", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "\"I want to do well\" but with no clear plan.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "\"I'll try my behaviours\" (if someone tells me).", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "\"I know my plan and what behaviours to show.\"", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "2_3",
          text: "In tough moments, do you remember your plan?",
          answers: [
            { text: "No, I just freeze or forget.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "Sometimes, but I lose it when pressured.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "Yes, if a coach/parent reminds me.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "Yes, I stick to my plan myself.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "2_4",
          text: "Who makes your match goals?",
          answers: [
            { text: "Nobody.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "I sometimes do, but not clearly.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "Someone else (coach/parent).", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "I do, and I stick to them.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        }
      ]
    },
    {
      id: 3,
      name: "Preparation / Autonomy / Habits",
      questions: [
        {
          id: "3_1",
          text: "Before training, how do you get ready?",
          answers: [
            { text: "I need others to remind me (kit, warm-up, etc.).", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "I sometimes prepare but not always.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "I prepare if someone reminds me.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "I prepare fully on my own.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "3_2",
          text: "When it's game day…",
          answers: [
            { text: "I wait for others to organise me.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "I prepare sometimes but forget things.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "I get ready if guided.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "I have my own routine and stick to it.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "3_3",
          text: "If no one reminds you, do you prepare?",
          answers: [
            { text: "No, I forget.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "Sometimes, but not every time.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "Yes, if I know someone will check me.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "Yes, I always prepare alone.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "3_4",
          text: "How do you warm up?",
          answers: [
            { text: "Only if told.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "Sometimes I try, but not well.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "If guided, I do it.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "I warm up by myself, I know my routine.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        }
      ]
    },
    {
      id: 4,
      name: "Focus on Super Behaviours",
      questions: [
        {
          id: "4_1",
          text: "What do you focus on in matches?",
          answers: [
            { text: "Only the score/winning.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "Behaviours sometimes, but I go back to results.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "Behaviours, if reminded.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "Always behaviours, even under pressure.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "4_2",
          text: "After a mistake, what do you think?",
          answers: [
            { text: "\"We're losing, I'm rubbish.\"", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "\"I should focus, but I can't stop thinking of results.\"", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "\"Focus on my behaviours\" (if someone reminds me).", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "\"Forget results, focus on my behaviours.\"", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "4_3",
          text: "When a coach asks about your performance, what do you talk about?",
          answers: [
            { text: "Only results (goals, score).", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "Results first, behaviours second.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "Behaviours if someone guides me.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "Behaviours first, results second.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "4_4",
          text: "In a close game, what do you do?",
          answers: [
            { text: "Panic about winning/losing.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "Try to focus but drift to results.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "Refocus on behaviours when reminded.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "Lock onto behaviours no matter the score.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        }
      ]
    },
    {
      id: 5,
      name: "Beating Your Mind (ANTs / Thinking Traps)",
      questions: [
        {
          id: "5_1",
          text: "When you think \"I can't do it,\" what happens?",
          answers: [
            { text: "I believe it and give up.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "I notice it but can't change it.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "I can change it with help.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "I replace it with a positive thought.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "5_2",
          text: "If a negative thought comes during a game…",
          answers: [
            { text: "It controls me.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "I see it but still freeze.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "I change it when someone reminds me.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "I flip it into something positive.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "5_3",
          text: "What do you say to yourself under pressure?",
          answers: [
            { text: "\"I can't.\"", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "\"Maybe I can, maybe not.\"", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "\"Come on, focus\" (if told).", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "\"I can handle this.\"", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "5_4",
          text: "After a mistake, how do you think?",
          answers: [
            { text: "\"I'm rubbish.\"", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "\"I might recover… but probably not.\"", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "\"I'll recover\" (if reminded).", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "\"Reset, next action, I'm fine.\"", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        }
      ]
    },
    {
      id: 6,
      name: "Dealing with Failure & Challenges",
      questions: [
        {
          id: "6_1",
          text: "After a mistake, what happens?",
          answers: [
            { text: "I collapse, sulk, or give up.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "I recover, but slowly and weakly.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "I recover if someone reminds me.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "I reset quickly by myself.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "6_2",
          text: "In a tough game, how do you react?",
          answers: [
            { text: "I give up.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "I try again, but fragile.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "I keep going if someone pushes me.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "I keep going no matter what.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "6_3",
          text: "After losing, how do you feel?",
          answers: [
            { text: "Angry, sulky, worthless.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "Sad, but slowly move on.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "Better if someone comforts me.", score: 3, emoji: "🔵", color: "text-blue-500" },
            { text: "Bounce back, ready for the next game.", score: 4, emoji: "🟢", color: "text-green-500" }
          ]
        },
        {
          id: "6_4",
          text: "When things go wrong…",
          answers: [
            { text: "I stop trying.", score: 1, emoji: "🔴", color: "text-red-500" },
            { text: "I try, but struggle.", score: 2, emoji: "🟡", color: "text-yellow-500" },
            { text: "I reset if told to.", score: 3, emoji: "🔵", color: "text-blue-500" },
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

  const getLevelLabel = (score: number) => {
    if (score >= 1.0 && score <= 1.9) return { label: "🔴 Struggle", color: "text-red-500" };
    if (score >= 2.0 && score <= 2.9) return { label: "🟡 Emerging", color: "text-yellow-500" };
    if (score >= 3.0 && score <= 3.9) return { label: "🔵 Supported", color: "text-blue-500" };
    if (score === 4.0) return { label: "🟢 Independent", color: "text-green-500" };
    return { label: "N/A", color: "text-gray-500" };
  };

  const calculateSkillScore = (skillId: number) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return 0;

    const skillAnswers = skill.questions.map(q => answers[q.id]).filter(Boolean);
    if (skillAnswers.length === 0) return 0;

    const average = skillAnswers.reduce((sum, score) => sum + score, 0) / skillAnswers.length;
    return Math.round(average * 10) / 10; // Round to 1 decimal place
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
                    <p className="text-2xl font-bold">{score.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">out of 4.0</p>
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

        {selectedChild && (
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
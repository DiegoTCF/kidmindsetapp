import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Heart, Brain, Shield, Lightbulb, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorryOption {
  id: string;
  text: string;
  icon: React.ReactNode;
}

interface SupportFlow {
  fact: string;
  questions: {
    id: string;
    question: string;
    type: 'yes-no' | 'text';
  }[];
  affirmation: string;
}

interface MindsetSupportFlowProps {
  onComplete: (worryReason: string, answers: Record<string, string>) => void;
  onClose: () => void;
}

const worryOptions: WorryOption[] = [
  {
    id: 'physical-intimidation',
    text: 'The players look good or physically big',
    icon: <Shield className="w-5 h-5" />
  },
  {
    id: 'judgment-worry',
    text: "I'm worried about what people might think",
    icon: <Heart className="w-5 h-5" />
  },
  {
    id: 'mistake-fear',
    text: "I'm scared of making mistakes",
    icon: <Brain className="w-5 h-5" />
  },
  {
    id: 'injury-fear',
    text: "I'm scared of getting hurt",
    icon: <Shield className="w-5 h-5" />
  },
  {
    id: 'performance-pressure',
    text: "I'm feeling pressure to perform",
    icon: <Star className="w-5 h-5" />
  }
];

const supportFlows: Record<string, SupportFlow> = {
  'physical-intimidation': {
    fact: "Did you know? Size doesn't determine skill! Many of the world's best players like Messi, Modric, and Verratti are smaller than average. Football is about technique, intelligence, and heart - not just physical size.",
    questions: [
      { id: 'skills-confidence', question: 'Do you feel confident about your technical skills?', type: 'yes-no' },
      { id: 'speed-advantage', question: 'Can you think of ways your speed or agility might be an advantage?', type: 'text' },
      { id: 'past-success', question: 'Tell me about a time you succeeded against bigger/stronger opponents:', type: 'text' }
    ],
    affirmation: "You have unique strengths that make you special. Size is just one factor - your skill, speed, and intelligence are your superpowers! 🌟"
  },
  'judgment-worry': {
    fact: "Fun fact: Even professional players worry about what others think sometimes! The secret is that most people are focused on their own performance, not judging yours. Those who support you want to see you succeed.",
    questions: [
      { id: 'support-system', question: 'Do you have people cheering for you today?', type: 'yes-no' },
      { id: 'positive-focus', question: 'What would you tell a friend who was worried about the same thing?', type: 'text' },
      { id: 'proud-moment', question: 'What skill or quality are you most proud of in your game?', type: 'text' }
    ],
    affirmation: "You belong on that field! The people who matter are rooting for you. Play with joy and let your personality shine through! ✨"
  },
  'mistake-fear': {
    fact: "Here's the truth: Even Ronaldo and Messi make mistakes in every game! Mistakes are how we learn and grow. The best players don't avoid mistakes - they learn from them quickly and bounce back stronger.",
    questions: [
      { id: 'learning-mindset', question: 'Can you think of mistakes as learning opportunities?', type: 'yes-no' },
      { id: 'recovery-plan', question: 'What will you do if you make a mistake during the game?', type: 'text' },
      { id: 'growth-example', question: 'Tell me about a mistake that helped you improve:', type: 'text' }
    ],
    affirmation: "Mistakes are just stepping stones to greatness! Every mistake is a chance to show your resilience and grow stronger. You've got this! 💪"
  },
  'injury-fear': {
    fact: "Good news: Most football activities have very low injury rates, especially when you're prepared! Your body is designed to move and be active. Proper warm-up and listening to your body keeps you safe.",
    questions: [
      { id: 'preparation-confidence', question: 'Do you feel physically prepared and warmed up?', type: 'yes-no' },
      { id: 'safety-awareness', question: 'What safety rules do you know that help protect players?', type: 'text' },
      { id: 'body-listening', question: 'How will you listen to your body during the activity?', type: 'text' }
    ],
    affirmation: "Your body is strong and capable! Trust in your preparation and play smart. You know how to keep yourself safe while having fun! 🛡️"
  },
  'performance-pressure': {
    fact: "Did you know? Pressure is actually your body getting ready to perform! Champions learn to use this energy positively. Remember, you're here to learn, grow, and have fun - the performance will follow naturally.",
    questions: [
      { id: 'fun-focus', question: 'Can you focus on having fun rather than being perfect?', type: 'yes-no' },
      { id: 'effort-goals', question: 'What effort goals (not outcome goals) can you set for today?', type: 'text' },
      { id: 'pressure-release', question: 'What helps you feel relaxed and enjoy playing?', type: 'text' }
    ],
    affirmation: "You're exactly where you need to be! Focus on effort, learning, and joy. When you play with freedom, your best performance naturally follows! 🎯"
  }
};

export default function MindsetSupportFlow({ onComplete, onClose }: MindsetSupportFlowProps) {
  const [selectedWorry, setSelectedWorry] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState<'selection' | 'flow' | 'affirmation'>('selection');

  const handleWorrySelect = (worryId: string) => {
    setSelectedWorry(worryId);
    setCurrentStep('flow');
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleContinue = () => {
    if (selectedWorry) {
      const flow = supportFlows[selectedWorry];
      const allQuestionsAnswered = flow.questions.every(q => 
        answers[q.id] && answers[q.id].trim().length > 0
      );
      
      if (allQuestionsAnswered) {
        setCurrentStep('affirmation');
      }
    }
  };

  const handleComplete = () => {
    if (selectedWorry) {
      const worryOption = worryOptions.find(w => w.id === selectedWorry);
      onComplete(worryOption?.text || '', answers);
    }
  };

  const selectedFlow = selectedWorry ? supportFlows[selectedWorry] : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-background rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Mindset Support
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          {currentStep === 'selection' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">What's worrying you?</h3>
                <p className="text-muted-foreground text-sm">
                  It's completely normal to feel worried before activities. Let's work through it together!
                </p>
              </div>

              <div className="space-y-3">
                {worryOptions.map((worry) => (
                  <Button
                    key={worry.id}
                    variant="outline"
                    className="w-full h-auto p-4 text-left border-2 hover:border-primary/50 transition-all duration-200"
                    onClick={() => handleWorrySelect(worry.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-primary">
                        {worry.icon}
                      </div>
                      <span className="text-sm font-medium">{worry.text}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'flow' && selectedFlow && (
            <div className="space-y-6">
              {/* Fact */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Did You Know?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/90">{selectedFlow.fact}</p>
                </CardContent>
              </Card>

              {/* Questions */}
              <div className="space-y-4">
                <h4 className="font-semibold">Let's think through this together:</h4>
                {selectedFlow.questions.map((question, index) => (
                  <div key={question.id} className="space-y-2">
                    <label className="text-sm font-medium">
                      {index + 1}. {question.question}
                    </label>
                    {question.type === 'yes-no' ? (
                      <div className="flex gap-2">
                        {['Yes', 'No'].map((option) => (
                          <Button
                            key={option}
                            variant={answers[question.id] === option ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleAnswerChange(question.id, option)}
                            className={cn(
                              "flex-1 transition-all duration-200",
                              answers[question.id] === option && "bg-primary text-primary-foreground"
                            )}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <Textarea
                        placeholder="Type your thoughts here..."
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="min-h-[80px] resize-none"
                      />
                    )}
                  </div>
                ))}
              </div>

              <Button 
                onClick={handleContinue}
                className="w-full bg-primary hover:bg-primary/90"
                disabled={!selectedFlow.questions.every(q => 
                  answers[q.id] && answers[q.id].trim().length > 0
                )}
              >
                Continue
              </Button>
            </div>
          )}

          {currentStep === 'affirmation' && selectedFlow && (
            <div className="space-y-6 text-center">
              <div className="text-6xl mb-4">🌟</div>
              
              <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Remember This:</h3>
                  <p className="text-foreground/90 leading-relaxed">
                    {selectedFlow.affirmation}
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button 
                  onClick={handleComplete}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3"
                >
                  Ready to Continue!
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={onClose}
                  className="w-full"
                >
                  Go Back to Form
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
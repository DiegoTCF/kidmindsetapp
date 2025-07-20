import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { X, Brain, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MindsetSupportFlowProps {
  worryReason: string;
  onComplete: (worryReason: string, answers: Record<string, string>) => void;
  onClose: () => void;
}

interface FlowStep {
  type: 'fact' | 'question' | 'affirmation';
  content: string;
  questionType?: 'yes-no' | 'text';
  questionId?: string;
  yesResponse?: string;
  noResponse?: string;
}

const supportFlows: Record<string, FlowStep[]> = {
  'The players look good or physically big': [
    {
      type: 'fact',
      content: "When your brain sees a threat (like a big or skilful opponent), it switches into survival mode. That means fear, doubt, and hesitation — it wants to avoid the problem to protect you.\nBut here's the thing: you need to be in charge — not your brain."
    },
    {
      type: 'question',
      content: "Have you ever played well at this level before?",
      questionType: 'yes-no',
      questionId: 'played-well-before',
      yesResponse: "There you go — that's proof you've done it before.",
      noResponse: "That's OK. Today can be the first time. Embrace the challenge."
    },
    {
      type: 'question',
      content: "If you didn't care how big or good they were — how would you play today?",
      questionType: 'text',
      questionId: 'play-freely'
    },
    {
      type: 'question',
      content: "If you focused only on yourself and your behaviours — how do you think that would help you?",
      questionType: 'text',
      questionId: 'self-focus'
    },
    {
      type: 'affirmation',
      content: "🧠 Breathe. Relax.\nRepeat: \"You don't need to be perfect or better — you just need to be you, and focus on your actions.\""
    }
  ],
  "I'm worried about what people might think": [
    {
      type: 'fact',
      content: "Your brain is wired to care about fitting in. It hates the idea of rejection or judgment — so it creates fear, even when you're not in danger.\nBut most of the time… people aren't thinking about you at all."
    },
    {
      type: 'question',
      content: "Do you think worrying about what others think makes you play better?",
      questionType: 'yes-no',
      questionId: 'worry-helps',
      yesResponse: "Or does it just make you hesitate and play safe?",
      noResponse: "Exactly. If it doesn't help, drop it."
    },
    {
      type: 'question',
      content: "Have you ever played freely, even with people watching?",
      questionType: 'yes-no',
      questionId: 'played-freely',
      yesResponse: "There's your proof — you can play your game.",
      noResponse: "Maybe today is the first time."
    },
    {
      type: 'question',
      content: "If you only focused on enjoying your football and your behaviours — what would change?",
      questionType: 'text',
      questionId: 'enjoy-focus'
    },
    {
      type: 'affirmation',
      content: "🧠 Breathe. Smile.\nRepeat this affirmation: \"No matter what other people think, say or do — I only focus on my behaviours.\""
    }
  ],
  "I'm scared of making mistakes": [
    {
      type: 'fact',
      content: "The fear of making mistakes feels like danger. But it's not. In fact, mistakes are how you grow.\nEvery confident player you admire makes them too — they just don't freeze because of it."
    },
    {
      type: 'question',
      content: "Do you think avoiding mistakes makes you play better?",
      questionType: 'yes-no',
      questionId: 'avoid-mistakes',
      yesResponse: "Or does it just make you cautious and slow?",
      noResponse: "Then take risks and express yourself — that's how you improve."
    },
    {
      type: 'question',
      content: "Can you remember a time when you made a mistake… but recovered well?",
      questionType: 'yes-no',
      questionId: 'mistake-recovery',
      yesResponse: "That's the mindset — bounce back and go again.",
      noResponse: "That's OK. Today is a chance to practise it."
    },
    {
      type: 'question',
      content: "If you didn't fear mistakes — how brave would you be on the ball today?",
      questionType: 'text',
      questionId: 'brave-no-fear'
    },
    {
      type: 'affirmation',
      content: "🧠 Breathe. Be brave.\nRepeat: \"Mistakes don't define me — my response does.\""
    }
  ],
  "I'm scared of getting hurt": [
    {
      type: 'fact',
      content: "If you're scared of getting hurt, your brain will tell your body to slow down, avoid tackles, and stay safe.\nBut here's the truth: playing half-hearted actually makes injuries more likely — not less."
    },
    {
      type: 'question',
      content: "Do you think holding back keeps you safer?",
      questionType: 'yes-no',
      questionId: 'holding-back',
      yesResponse: "Actually, going in strong and with intention is what protects you.",
      noResponse: "Then trust your body and give your best."
    },
    {
      type: 'question',
      content: "Have you ever gone in with full commitment and come out fine?",
      questionType: 'yes-no',
      questionId: 'full-commitment',
      yesResponse: "There's your evidence — your body is stronger than your brain says.",
      noResponse: "That's OK. Be smart — but be committed."
    },
    {
      type: 'question',
      content: "If you trusted yourself to be aggressive and in control — how would you play today?",
      questionType: 'text',
      questionId: 'aggressive-control'
    },
    {
      type: 'affirmation',
      content: "🧠 Breathe. Lock in.\nRepeat: \"Playing strong is how I stay safe — and play my best.\""
    }
  ],
  "I'm feeling pressure to perform": [
    {
      type: 'fact',
      content: "Science shows that putting pressure on yourself actually makes you play worse. It clutters your mind and tightens your body."
    },
    {
      type: 'question',
      content: "Do you think putting pressure on yourself will help you play better?",
      questionType: 'yes-no',
      questionId: 'pressure-helps',
      yesResponse: "No — in fact, it can make you play worse!",
      noResponse: "Exactly. If it doesn't help, why do it?"
    },
    {
      type: 'question',
      content: "Have you played in important sessions or matches and still done well?",
      questionType: 'yes-no',
      questionId: 'important-games',
      yesResponse: "There you go — you've got evidence. If you've done it before, you can do it again.",
      noResponse: ""
    },
    {
      type: 'question',
      content: "If there was no pressure, and you focused only on your behaviours — how would you play today?",
      questionType: 'text',
      questionId: 'no-pressure-focus'
    },
    {
      type: 'affirmation',
      content: "🧠 Breathe. Focus on yourself and the behaviours you can control.\nRepeat: \"No matter who with, or who against, I focus on my behaviours.\""
    }
  ]
};

export default function MindsetSupportFlow({ worryReason, onComplete, onClose }: MindsetSupportFlowProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResponse, setShowResponse] = useState<string | null>(null);

  const flow = supportFlows[worryReason];
  if (!flow) return null;

  const currentStep = flow[currentStepIndex];
  const isLastStep = currentStepIndex === flow.length - 1;

  const handleYesNoAnswer = (answer: string) => {
    if (currentStep.questionId) {
      setAnswers(prev => ({ ...prev, [currentStep.questionId!]: answer }));
      
      // Show the appropriate response
      const response = answer === 'Yes' ? currentStep.yesResponse : currentStep.noResponse;
      if (response) {
        setShowResponse(response);
      } else {
        // If no response, move to next step immediately
        handleContinue();
      }
    }
  };

  const handleTextAnswer = (text: string) => {
    if (currentStep.questionId) {
      setAnswers(prev => ({ ...prev, [currentStep.questionId!]: text }));
    }
  };

  const handleContinue = () => {
    setShowResponse(null);
    
    if (isLastStep) {
      onComplete(worryReason, answers);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const canContinue = () => {
    if (currentStep.type === 'fact' || currentStep.type === 'affirmation') {
      return true;
    }
    if (currentStep.type === 'question') {
      if (currentStep.questionType === 'yes-no') {
        return currentStep.questionId ? !!answers[currentStep.questionId] : false;
      }
      if (currentStep.questionType === 'text') {
        return currentStep.questionId ? 
          (answers[currentStep.questionId] || '').trim().length > 0 : false;
      }
    }
    return false;
  };

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
        <div className="p-4 space-y-6">
          {currentStep.type === 'fact' && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  FACT
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {currentStep.content}
                </p>
              </CardContent>
            </Card>
          )}

          {currentStep.type === 'question' && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-xl">
                <p className="font-medium text-foreground">
                  {currentStep.content}
                </p>
              </div>

              {currentStep.questionType === 'yes-no' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {['Yes', 'No'].map((option) => (
                      <Button
                        key={option}
                        variant={answers[currentStep.questionId!] === option ? 'default' : 'outline'}
                        className={cn(
                          "flex-1 transition-all duration-200",
                          answers[currentStep.questionId!] === option && "bg-primary text-primary-foreground"
                        )}
                        onClick={() => handleYesNoAnswer(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>

                  {/* Show response */}
                  {showResponse && (
                    <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-xl animate-fade-in">
                      <p className="text-sm font-medium text-accent">
                        → {showResponse}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {currentStep.questionType === 'text' && (
                <Textarea
                  placeholder="Type your thoughts here..."
                  value={answers[currentStep.questionId!] || ''}
                  onChange={(e) => handleTextAnswer(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              )}
            </div>
          )}

          {currentStep.type === 'affirmation' && (
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">🌟</div>
              
              <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
                <CardContent className="p-6">
                  <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
                    {currentStep.content}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Continue Button */}
          <Button 
            onClick={handleContinue}
            className="w-full bg-primary hover:bg-primary/90"
            disabled={!canContinue()}
          >
            {isLastStep ? 'Continue to Activity' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
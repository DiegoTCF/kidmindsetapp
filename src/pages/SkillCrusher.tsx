import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Target, 
  Shield, 
  Users, 
  Zap, 
  Calendar, 
  Clock, 
  Bell,
  Brain,
  MessageSquare,
  Wind,
  Eye,
  Star,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface TrainingSession {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  duration: string;
}

interface MindsetTool {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface SelfTalkOption {
  id: string;
  category: 'motivational' | 'instructional';
  phrase: string;
}

const SkillCrusher: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState({
    days: [] as string[],
    minutesPerSession: 30,
    reminders: false
  });
  const [selectedMindsetTools, setSelectedMindsetTools] = useState<string[]>([]);
  const [showSelfTalkOptions, setShowSelfTalkOptions] = useState(false);
  const [selectedSelfTalkType, setSelectedSelfTalkType] = useState<'motivational' | 'instructional' | ''>('');
  const [selectedSelfTalkPhrases, setSelectedSelfTalkPhrases] = useState<string[]>([]);

  const trainingGoals = [
    'Score More Goals',
    'Defend Better', 
    'Improve 1v1 Attacking',
    'Better Ball Control',
    'Stronger Passing',
    'Win More Headers'
  ];

  const trainingSessions: TrainingSession[] = [
    {
      id: 'shooting',
      name: 'Shooting Practice',
      icon: <Target className="h-6 w-6" />,
      description: 'Target practice and finishing skills',
      duration: '20-40 mins'
    },
    {
      id: 'defending',
      name: 'Defending Drills',
      icon: <Shield className="h-6 w-6" />,
      description: 'Tackle technique and positioning',
      duration: '25-35 mins'
    },
    {
      id: 'onevsone',
      name: '1v1 Training',
      icon: <Users className="h-6 w-6" />,
      description: 'Beat your opponent skills',
      duration: '15-30 mins'
    },
    {
      id: 'ballcontrol',
      name: 'Ball Control',
      icon: <Zap className="h-6 w-6" />,
      description: 'Touch and first touch practice',
      duration: '20-30 mins'
    }
  ];

  const mindsetTools: MindsetTool[] = [
    {
      id: 'selftalk',
      name: 'Self-Talk',
      icon: <MessageSquare className="h-6 w-6" />,
      description: 'Positive inner voice'
    },
    {
      id: 'breathing',
      name: 'Breathing',
      icon: <Wind className="h-6 w-6" />,
      description: 'Stay calm and focused'
    },
    {
      id: 'visualization',
      name: 'Visualization',
      icon: <Eye className="h-6 w-6" />,
      description: 'Picture success in your mind'
    }
  ];

  const selfTalkOptions: SelfTalkOption[] = [
    // Motivational
    { id: 'mot1', category: 'motivational', phrase: "You can do this, you've done it before!" },
    { id: 'mot2', category: 'motivational', phrase: "I am strong and skilled!" },
    { id: 'mot3', category: 'motivational', phrase: "I've got this under control!" },
    { id: 'mot4', category: 'motivational', phrase: "I am confident and ready!" },
    
    // Instructional
    { id: 'inst1', category: 'instructional', phrase: "Keep your head up and look for options" },
    { id: 'inst2', category: 'instructional', phrase: "Take your time, pick your moment" },
    { id: 'inst3', category: 'instructional', phrase: "Stay low and balanced" },
    { id: 'inst4', category: 'instructional', phrase: "Be ready to take the ball at the right distance" }
  ];

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleGoalSelect = (goal: string) => {
    setSelectedGoal(goal);
    setCurrentStep(2);
  };

  const handleSessionToggle = (sessionId: string) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId) 
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const handleDayToggle = (day: string) => {
    setWeeklyPlan(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const handleMindsetToolToggle = (toolId: string) => {
    if (toolId === 'selftalk') {
      setShowSelfTalkOptions(!showSelfTalkOptions);
      if (!showSelfTalkOptions) {
        setSelectedMindsetTools(prev => [...prev, toolId]);
      } else {
        setSelectedMindsetTools(prev => prev.filter(id => id !== toolId));
        setSelectedSelfTalkType('');
        setSelectedSelfTalkPhrases([]);
      }
    } else {
      setSelectedMindsetTools(prev => 
        prev.includes(toolId) 
          ? prev.filter(id => id !== toolId)
          : [...prev, toolId]
      );
    }
  };

  const handleSelfTalkPhraseToggle = (phraseId: string) => {
    setSelectedSelfTalkPhrases(prev => 
      prev.includes(phraseId) 
        ? prev.filter(id => id !== phraseId)
        : [...prev, phraseId]
    );
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      {[1, 2, 3, 4, 5].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            {currentStep > step ? <CheckCircle2 className="h-4 w-4" /> : step}
          </div>
          {step < 5 && (
            <div className={`w-12 h-1 mx-2 ${
              currentStep > step ? 'bg-primary' : 'bg-muted'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <Star className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">What do you want to crush?</CardTitle>
        <p className="text-muted-foreground">Pick the skill you want to improve most</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {trainingGoals.map((goal) => (
            <Button
              key={goal}
              variant="outline"
              className="h-auto p-4 text-left justify-start hover:bg-primary/5 hover:border-primary"
              onClick={() => handleGoalSelect(goal)}
            >
              <Target className="h-5 w-5 mr-3 text-primary" />
              <span className="font-medium">{goal}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Choose Your Training Sessions</CardTitle>
        <p className="text-muted-foreground">Pick the sessions that will help you reach your goal</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {trainingSessions.map((session) => (
            <Card 
              key={session.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedSessions.includes(session.id) ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => handleSessionToggle(session.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    {session.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{session.name}</h3>
                    <p className="text-sm text-muted-foreground">{session.description}</p>
                    <Badge variant="secondary" className="mt-1">{session.duration}</Badge>
                  </div>
                  {selectedSessions.includes(session.id) && (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button 
          className="w-full mt-6" 
          onClick={() => setCurrentStep(3)}
          disabled={selectedSessions.length === 0}
        >
          Next: Plan Your Week
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Plan Your Week</CardTitle>
        <p className="text-muted-foreground">When will you train?</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Training Days
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {weekDays.map((day) => (
              <Button
                key={day}
                variant={weeklyPlan.days.includes(day) ? "default" : "outline"}
                className="h-12"
                onClick={() => handleDayToggle(day)}
              >
                {day.slice(0, 3)}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Minutes Per Session
          </h3>
          <div className="flex gap-2">
            {[15, 20, 30, 45, 60].map((minutes) => (
              <Button
                key={minutes}
                variant={weeklyPlan.minutesPerSession === minutes ? "default" : "outline"}
                onClick={() => setWeeklyPlan(prev => ({ ...prev, minutesPerSession: minutes }))}
              >
                {minutes}m
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3 flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Reminders
          </h3>
          <Button
            variant={weeklyPlan.reminders ? "default" : "outline"}
            onClick={() => setWeeklyPlan(prev => ({ ...prev, reminders: !prev.reminders }))}
            className="w-full"
          >
            {weeklyPlan.reminders ? "Reminders On ✓" : "Turn On Reminders"}
          </Button>
        </div>

        <Button 
          className="w-full" 
          onClick={() => setCurrentStep(4)}
          disabled={weeklyPlan.days.length === 0}
        >
          Next: Mindset Tools
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Choose Your Mindset Tools</CardTitle>
        <p className="text-muted-foreground">Mental skills to boost your performance</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {mindsetTools.map((tool) => (
            <Card 
              key={tool.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedMindsetTools.includes(tool.id) ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => handleMindsetToolToggle(tool.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    {tool.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{tool.name}</h3>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                  {selectedMindsetTools.includes(tool.id) && (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {showSelfTalkOptions && (
          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Self-Talk Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Choose Type:</h4>
                <div className="flex gap-2">
                  <Button
                    variant={selectedSelfTalkType === 'motivational' ? "default" : "outline"}
                    onClick={() => setSelectedSelfTalkType('motivational')}
                  >
                    Motivational
                  </Button>
                  <Button
                    variant={selectedSelfTalkType === 'instructional' ? "default" : "outline"}
                    onClick={() => setSelectedSelfTalkType('instructional')}
                  >
                    Instructional
                  </Button>
                </div>
              </div>

              {selectedSelfTalkType && (
                <div>
                  <h4 className="font-semibold mb-2">
                    {selectedSelfTalkType === 'motivational' ? 'Motivational' : 'Instructional'} Phrases:
                  </h4>
                  <div className="space-y-2">
                    {selfTalkOptions
                      .filter(option => option.category === selectedSelfTalkType)
                      .map((option) => (
                        <Button
                          key={option.id}
                          variant={selectedSelfTalkPhrases.includes(option.id) ? "default" : "outline"}
                          className="w-full text-left justify-start h-auto p-3"
                          onClick={() => handleSelfTalkPhraseToggle(option.id)}
                        >
                          "{option.phrase}"
                        </Button>
                      ))
                    }
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Button 
          className="w-full" 
          onClick={() => setCurrentStep(5)}
        >
          Create My Plan
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  const renderStep5 = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Your Skill Crusher Plan!</CardTitle>
        <p className="text-muted-foreground">Ready to become unstoppable?</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-2 flex items-center">
            <Target className="h-5 w-5 mr-2 text-primary" />
            Goal: {selectedGoal}
          </h3>
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold mb-3">Training Sessions:</h3>
          <div className="space-y-2">
            {selectedSessions.map(sessionId => {
              const session = trainingSessions.find(s => s.id === sessionId);
              return session ? (
                <div key={sessionId} className="flex items-center gap-2 p-2 bg-primary/5 rounded">
                  {session.icon}
                  <span>{session.name}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold mb-3">Weekly Schedule:</h3>
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-4 mb-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Training Days: {weeklyPlan.days.join(', ')}</span>
            </div>
            <div className="flex items-center gap-4">
              <Clock className="h-5 w-5 text-primary" />
              <span>{weeklyPlan.minutesPerSession} minutes per session</span>
            </div>
            {weeklyPlan.reminders && (
              <div className="flex items-center gap-4 mt-2">
                <Bell className="h-5 w-5 text-primary" />
                <span>Reminders enabled</span>
              </div>
            )}
          </div>
        </div>

        {selectedMindsetTools.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold mb-3 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-primary" />
                Mindset Tools:
              </h3>
              <div className="space-y-2">
                {selectedMindsetTools.map(toolId => {
                  const tool = mindsetTools.find(t => t.id === toolId);
                  return tool ? (
                    <div key={toolId} className="flex items-center gap-2 p-2 bg-primary/5 rounded">
                      {tool.icon}
                      <span>{tool.name}</span>
                    </div>
                  ) : null;
                })}
              </div>

              {selectedSelfTalkPhrases.length > 0 && (
                <div className="mt-4 p-4 bg-secondary/20 rounded-lg">
                  <h4 className="font-semibold mb-2">Your Self-Talk Phrases:</h4>
                  <div className="space-y-1">
                    {selectedSelfTalkPhrases.map(phraseId => {
                      const phrase = selfTalkOptions.find(p => p.id === phraseId);
                      return phrase ? (
                        <div key={phraseId} className="text-sm italic">
                          "{phrase.phrase}"
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex gap-4">
          <Button className="flex-1" onClick={() => {
            setCurrentStep(1);
            setSelectedGoal('');
            setSelectedSessions([]);
            setWeeklyPlan({ days: [], minutesPerSession: 30, reminders: false });
            setSelectedMindsetTools([]);
            setShowSelfTalkOptions(false);
            setSelectedSelfTalkType('');
            setSelectedSelfTalkPhrases([]);
          }}>
            Create Another Plan
          </Button>
          <Button variant="outline" className="flex-1">
            Save Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            🏆 The Skill Crusher
          </h1>
          <p className="text-muted-foreground text-lg">
            Build your personal training plan and crush your goals!
          </p>
        </div>

        {renderStepIndicator()}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </div>
    </div>
  );
};

export default SkillCrusher;
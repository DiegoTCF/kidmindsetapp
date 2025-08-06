import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

export const BehaviourTracker = () => {
  const [focusLevel, setFocusLevel] = useState([7]);
  const [effortLevel, setEffortLevel] = useState([7]);
  const [communicationLevel, setCommunicationLevel] = useState([7]);
  const [teamworkLevel, setTeamworkLevel] = useState([7]);
  const [controllableActions, setControllableActions] = useState('');
  const [processGoals, setProcessGoals] = useState('');
  const { toast } = useToast();

  const superBehaviours = [
    { name: 'Focus & Concentration', value: focusLevel, setter: setFocusLevel, color: 'text-green-400' },
    { name: 'Effort & Work Rate', value: effortLevel, setter: setEffortLevel, color: 'text-green-400' },
    { name: 'Communication', value: communicationLevel, setter: setCommunicationLevel, color: 'text-green-400' },
    { name: 'Teamwork', value: teamworkLevel, setter: setTeamworkLevel, color: 'text-green-400' },
  ];

  const saveBehaviours = () => {
    toast({
      title: "Behaviours Saved",
      description: "Your super behaviours tracking has been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">4</Badge>
            <div>
              <CardTitle className="text-green-400">FOCUS ON SUPER BEHAVIOURS</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                What You Can Control
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-accent/50 p-4 rounded-lg border-l-4 border-green-500">
            <p className="font-semibold text-green-400">Core Principle:</p>
            <p className="text-lg">"Focus on what you can control & the process"</p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Rate Your Super Behaviours Today</h3>
            <div className="space-y-6">
              {superBehaviours.map((behaviour) => (
                <div key={behaviour.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className={`font-medium ${behaviour.color}`}>
                      {behaviour.name}
                    </label>
                    <span className="text-lg font-bold">
                      {behaviour.value[0]}/10
                    </span>
                  </div>
                  <Slider
                    value={behaviour.value}
                    onValueChange={behaviour.setter}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">What I Can Control Today</h3>
            <Textarea
              placeholder="List the specific actions and behaviours you can control, regardless of the outcome..."
              value={controllableActions}
              onChange={(e) => setControllableActions(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div>
            <h3 className="font-semibold mb-3">Process Goals for Next Session</h3>
            <Textarea
              placeholder="Set specific process goals (how you want to behave/perform) rather than outcome goals..."
              value={processGoals}
              onChange={(e) => setProcessGoals(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Super Behaviours Focus:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Process over outcome</li>
              <li>• Effort over results</li>
              <li>• Preparation over perfection</li>
              <li>• Growth over glory</li>
            </ul>
          </div>

          <Button onClick={saveBehaviours} className="w-full">
            Save My Behaviours
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
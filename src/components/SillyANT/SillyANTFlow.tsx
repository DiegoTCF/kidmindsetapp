import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useChildData } from '@/hooks/useChildData';

const CORE_BELIEFS = [
  "I'm not good enough",
  "I always make too many mistakes",
  "I have to be perfect",
  "I am not at this level",
  "The coach is always watching for mistakes",
  "If my parents are angry, I've failed",
  "Other players/people probably think I'm rubbish",
  "People will laugh if I get it wrong",
  "Everyone else is better than me",
  "I'm only valuable when I win or standout",
  "If I don't play well, I'm not good enough",
  "I'm behind where I should be by now",
  "I never get picked for the top team because I'm not special",
  "I always mess up in front of people",
  "I have to be the best or I'll let people down",
  "If I don't play amazing, I'll get subbed",
  "One mistake ruins everything",
  "I need to be perfect to stay in the team"
];

const AUTOMATIC_THOUGHTS = [
  "Don't mess this up",
  "You're going to fail",
  "They're better than you",
  "You don't belong at this level",
  "Everyone's watching you fail",
  "You're about to embarrass yourself",
  "The coach thinks you're useless",
  "Your teammates don't trust you",
  "You're too slow for this",
  "You'll never be good enough",
  "This is too hard for you",
  "You're going to let everyone down",
  "The other players are too good",
  "The other players are big"
];

const COPING_MECHANISMS = [
  "Deep breath and focus",
  "Say: I'm brave even if I'm scared",
  "Focus on my behaviors",
  "Remember: I don't need to be perfect",
  "Calm, breathe it's ok",
  "I can learn from mistakes",
  "I trust my training",
  "I belong here",
  "I'll give my best effort",
  "Mistakes help me grow",
  "I'm getting better every day",
  "I believe in myself",
  "Check for the evidence, is it true?"
];

const TRIGGERS = [
  "Before kick-off",
  "In the car on the way",
  "After a mistake",
  "When coach shouts",
  "Tournaments or difficult games",
  "Academy sessions",
  "Trials",
  "All the time",
  "When parents are watching",
  "Training with older players",
  "When I'm on the bench",
  "During the session/drills",
  "During breaks"
];

interface SectionProps {
  title: string;
  options: string[];
  selectedOptions: string[];
  onToggle: (option: string) => void;
}

const Section: React.FC<SectionProps> = ({ title, options, selectedOptions, onToggle }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {options.map((option) => (
          <div
            key={option}
            onClick={() => onToggle(option)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedOptions.includes(option)
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <p className="text-sm font-medium">{option}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SillyANTFlow: React.FC = () => {
  const [selectedBeliefs, setSelectedBeliefs] = useState<string[]>([]);
  const [selectedThoughts, setSelectedThoughts] = useState<string[]>([]);
  const [selectedCoping, setSelectedCoping] = useState<string[]>([]);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [savedANT, setSavedANT] = useState<any>(null);
  const { toast } = useToast();
  const { childId, loading: childDataLoading } = useChildData();

  const toggleOption = (option: string, type: 'beliefs' | 'thoughts' | 'coping' | 'triggers') => {
    const setters = {
      beliefs: setSelectedBeliefs,
      thoughts: setSelectedThoughts,
      coping: setSelectedCoping,
      triggers: setSelectedTriggers
    };

    const getters = {
      beliefs: selectedBeliefs,
      thoughts: selectedThoughts,
      coping: selectedCoping,
      triggers: selectedTriggers
    };

    const currentSelected = getters[type];
    const setter = setters[type];

    setter(prev => 
      prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
    );
  };

  const saveANT = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Use child ID from context (admin player view) or user ID for regular users
      const effectiveUserId = childId || user.id;

      // Clear existing ANT data
      await supabase.from('user_ants').delete().eq('user_id', effectiveUserId);

      // Insert new ANT data
      const { error } = await supabase.from('user_ants').insert({
        user_id: effectiveUserId,
        core_beliefs: selectedBeliefs,
        automatic_thoughts: selectedThoughts,
        coping_mechanisms: selectedCoping,
        triggers: selectedTriggers
      });

      if (error) throw error;

      toast({
        title: "🐜 ANT Squashed!",
        description: "Your Silly ANT profile has been saved successfully!",
      });

      // Fetch and display saved ANT
      const { data: ant } = await supabase
        .from('user_ants')
        .select('*')
        .eq('user_id', effectiveUserId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (ant) {
        setSavedANT(ant);
        setShowResults(true);
      }

      // Reset form
      setSelectedBeliefs([]);
      setSelectedThoughts([]);
      setSelectedCoping([]);
      setSelectedTriggers([]);

    } catch (error) {
      console.error('Error saving ANT:', error);
      toast({
        title: "Error",
        description: "Failed to save your ANT profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasSelections = selectedBeliefs.length > 0 || selectedThoughts.length > 0 || 
                      selectedCoping.length > 0 || selectedTriggers.length > 0;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">🐜 Meet My Silly ANT</h1>
        <p className="text-muted-foreground">
          Understand your Automatic Negative Thoughts and learn how to beat them!
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Section 1: Core Beliefs</CardTitle>
          <CardDescription>
            What does your silly ANT try to make you believe? Pick all that apply!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Section
            title=""
            options={CORE_BELIEFS}
            selectedOptions={selectedBeliefs}
            onToggle={(option) => toggleOption(option, 'beliefs')}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Section 2: Automatic Thoughts</CardTitle>
          <CardDescription>
            What sneaky things does it whisper before or during games?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Section
            title=""
            options={AUTOMATIC_THOUGHTS}
            selectedOptions={selectedThoughts}
            onToggle={(option) => toggleOption(option, 'thoughts')}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Section 3: Beat the ANT</CardTitle>
          <CardDescription>
            What can you do or say to fight back during matches & Training?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Section
            title=""
            options={COPING_MECHANISMS}
            selectedOptions={selectedCoping}
            onToggle={(option) => toggleOption(option, 'coping')}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Section 4: Triggers</CardTitle>
          <CardDescription>
            When does your ANT show up most?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Section
            title=""
            options={TRIGGERS}
            selectedOptions={selectedTriggers}
            onToggle={(option) => toggleOption(option, 'triggers')}
          />
        </CardContent>
      </Card>

      <div className="text-center pt-6">
        <Button
          onClick={saveANT}
          disabled={!hasSelections || isSubmitting}
          size="lg"
          className="bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? 'Squashing...' : 'SQUASH THE ANT! 🐜'}
        </Button>
      </div>

      {hasSelections && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Your ANT Profile Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedBeliefs.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Core Beliefs:</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedBeliefs.map((belief, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {belief}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedThoughts.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Automatic Thoughts:</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedThoughts.map((thought, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {thought}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedCoping.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Coping Mechanisms:</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedCoping.map((coping, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {coping}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedTriggers.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Triggers:</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedTriggers.map((trigger, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {trigger}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {showResults && savedANT && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-400">
              🐜 ANT Successfully Squashed!
            </CardTitle>
            <CardDescription>
              Created on {new Date(savedANT.created_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {savedANT.core_beliefs?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">Core Beliefs:</h4>
                <div className="flex flex-wrap gap-1">
                  {savedANT.core_beliefs.map((belief: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {belief}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {savedANT.automatic_thoughts?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">Automatic Thoughts:</h4>
                <div className="flex flex-wrap gap-1">
                  {savedANT.automatic_thoughts.map((thought: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {thought}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {savedANT.coping_mechanisms?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">Coping Mechanisms:</h4>
                <div className="flex flex-wrap gap-1">
                  {savedANT.coping_mechanisms.map((coping: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {coping}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {savedANT.triggers?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">Triggers:</h4>
                <div className="flex flex-wrap gap-1">
                  {savedANT.triggers.map((trigger: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {trigger}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => setShowResults(false)}
              className="mt-4"
            >
              Hide Results
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
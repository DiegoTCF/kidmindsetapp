import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const POSITIONS = [
  'Goalkeeper',
  'Centre-Back',
  'Full-Back',
  'Defensive Midfielder',
  'Central Midfielder',
  'Attacking Midfielder',
  'Winger',
  'Striker'
];

const PLAYING_STYLES = [
  'Technical',
  'Physical',
  'Creative',
  'Defensive',
  'Box-to-Box',
  'Pace & Power',
  'Clinical Finisher',
  'Playmaker'
];

const PERSONALITY_TRAITS = [
  'Determined',
  'Caring',
  'Student',
  'Humble',
  'Leader',
  'Team Player',
  'Competitive',
  'Resilient',
  'Creative',
  'Analytical'
];

const CORE_VALUES = [
  'Family',
  'Hard Work',
  'Growth',
  'Respect',
  'Integrity',
  'Excellence',
  'Teamwork',
  'Dedication',
  'Perseverance',
  'Honesty'
];

interface PlayerIdentity {
  id?: string;
  primary_position?: string;
  playing_style?: string;
  playing_characteristics?: string;
  personality_traits?: string[];
  interests_hobbies?: string;
  core_values?: string[];
  life_goals?: string;
}

export const IdentityBuilder = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [identity, setIdentity] = useState<PlayerIdentity>({
    personality_traits: [],
    core_values: []
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchIdentity();
    }
  }, [user]);

  const fetchIdentity = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('player_identity')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setIdentity({
          ...data,
          personality_traits: data.personality_traits || [],
          core_values: data.core_values || []
        });
      }
    } catch (error) {
      console.error('Error fetching identity:', error);
      toast({
        title: "Error",
        description: "Failed to load identity data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const identityData = {
        user_id: user.id,
        primary_position: identity.primary_position,
        playing_style: identity.playing_style,
        playing_characteristics: identity.playing_characteristics,
        personality_traits: identity.personality_traits,
        interests_hobbies: identity.interests_hobbies,
        core_values: identity.core_values,
        life_goals: identity.life_goals
      };

      const { error } = await supabase
        .from('player_identity')
        .upsert(identityData, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your identity has been saved successfully."
      });
    } catch (error) {
      console.error('Error saving identity:', error);
      toast({
        title: "Error",
        description: "Failed to save identity",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleTrait = (trait: string, field: 'personality_traits' | 'core_values') => {
    const currentTraits = identity[field] || [];
    const newTraits = currentTraits.includes(trait)
      ? currentTraits.filter(t => t !== trait)
      : [...currentTraits, trait];
    
    setIdentity({ ...identity, [field]: newTraits });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your identity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-pink-500">ON THE PITCH</CardTitle>
          <p className="text-muted-foreground">Your football identity and playing characteristics</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="position">Primary Position</Label>
            <Select
              value={identity.primary_position || ''}
              onValueChange={(value) => setIdentity({ ...identity, primary_position: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your primary position" />
              </SelectTrigger>
              <SelectContent>
                {POSITIONS.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="style">Playing Style</Label>
            <Select
              value={identity.playing_style || ''}
              onValueChange={(value) => setIdentity({ ...identity, playing_style: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your playing style" />
              </SelectTrigger>
              <SelectContent>
                {PLAYING_STYLES.map((style) => (
                  <SelectItem key={style} value={style}>
                    {style}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="characteristics">Playing Characteristics</Label>
            <Textarea
              id="characteristics"
              placeholder="I'm a player who likes to control the tempo of the game. I enjoy both the defensive and attacking phases, always looking to make the right pass and support my teammates. My work rate helps me cover ground and be where the team needs me."
              value={identity.playing_characteristics || ''}
              onChange={(e) => setIdentity({ ...identity, playing_characteristics: e.target.value })}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-blue-500">OFF THE PITCH</CardTitle>
          <p className="text-muted-foreground">Who you are as a person beyond football performance</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Personality Traits</Label>
            <div className="flex flex-wrap gap-2">
              {PERSONALITY_TRAITS.map((trait) => {
                const isSelected = identity.personality_traits?.includes(trait);
                return (
                  <Badge
                    key={trait}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      isSelected 
                        ? "bg-blue-500 hover:bg-blue-600 text-white" 
                        : "hover:bg-blue-100"
                    }`}
                    onClick={() => toggleTrait(trait, 'personality_traits')}
                  >
                    {trait}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests">Interests & Hobbies</Label>
            <Textarea
              id="interests"
              placeholder="I love music production and gaming with friends. I'm also focused on my studies because education is important to my family. I enjoy spending time with my younger sister and helping her with homework."
              value={identity.interests_hobbies || ''}
              onChange={(e) => setIdentity({ ...identity, interests_hobbies: e.target.value })}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-3">
            <Label>Core Values</Label>
            <div className="flex flex-wrap gap-2">
              {CORE_VALUES.map((value) => {
                const isSelected = identity.core_values?.includes(value);
                return (
                  <Badge
                    key={value}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      isSelected 
                        ? "bg-green-500 hover:bg-green-600 text-white" 
                        : "hover:bg-green-100"
                    }`}
                    onClick={() => toggleTrait(value, 'core_values')}
                  >
                    {value}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">Life Goals Beyond Football</Label>
            <Textarea
              id="goals"
              placeholder="I want to become a coach after my playing career and maybe start a football academy in my community. I also want to study sports psychology to understand the mental side of the game better."
              value={identity.life_goals || ''}
              onChange={(e) => setIdentity({ ...identity, life_goals: e.target.value })}
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSave} 
        disabled={saving}
        className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3"
      >
        {saving ? 'SAVING IDENTITY...' : 'SAVE IDENTITY'}
      </Button>
    </div>
  );
};
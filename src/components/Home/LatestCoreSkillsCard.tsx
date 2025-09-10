import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface CoreSkillsResult {
  id: string;
  created_at: string;
  know_who_you_are_score: number;
  set_goals_score: number;
  preparation_score: number;
  focus_behaviours_score: number;
  beating_mind_score: number;
  dealing_with_failure_score: number;
  overall_score: number;
}

const getScoreLabel = (score: number) => {
  if (score >= 85) return { emoji: '🟢', label: 'Independent', color: 'bg-green-100 text-green-800' };
  if (score >= 70) return { emoji: '🔵', label: 'Supported', color: 'bg-blue-100 text-blue-800' };
  if (score >= 50) return { emoji: '🟡', label: 'Emerging', color: 'bg-yellow-100 text-yellow-800' };
  return { emoji: '🔴', label: 'Struggling', color: 'bg-red-100 text-red-800' };
};

const skillLabels = {
  know_who_you_are_score: 'Self-Worth',
  set_goals_score: 'Goals/Planning',
  preparation_score: 'Preparation',
  focus_behaviours_score: 'Focus Behaviours',
  beating_mind_score: 'Beating Mind',
  dealing_with_failure_score: 'Dealing with Failure'
};

// Find the lowest scoring skills to focus on
const getAreasToImprove = (result: CoreSkillsResult, limit = 2) => {
  const scores = Object.entries(skillLabels).map(([key, label]) => ({
    skill: label,
    score: result[key as keyof CoreSkillsResult] as number,
    key
  }));
  
  return scores
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
};

export function LatestCoreSkillsCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [latestResult, setLatestResult] = useState<CoreSkillsResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLatestResult();
  }, [user]);

  const loadLatestResult = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('core_skills_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setLatestResult(data[0]);
      }
    } catch (error) {
      console.error('Error loading latest core skills result:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardContent className="p-4">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-muted h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!latestResult) {
    return (
      <Card className="shadow-soft border-2 border-dashed border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-primary">
            <Target className="w-5 h-5" />
            Core Skills Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Take your first mental skills assessment to see what you're working on.
          </p>
          <Button 
            onClick={() => navigate('/core-skills/self-assessment')}
            className="w-full"
            size="sm"
          >
            Take Assessment 🎯
          </Button>
        </CardContent>
      </Card>
    );
  }

  const scoreInfo = getScoreLabel(latestResult.overall_score);
  const areasToImprove = getAreasToImprove(latestResult);
  const daysSinceAssessment = Math.floor(
    (new Date().getTime() - new Date(latestResult.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Mental Skills
          </CardTitle>
          <Badge className={scoreInfo.color} variant="outline">
            {scoreInfo.emoji} {scoreInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Score</span>
            <span className="text-lg font-bold">{Math.round(latestResult.overall_score)}%</span>
          </div>
          <Progress value={latestResult.overall_score} className="h-2" />
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">
              {daysSinceAssessment === 0 ? 'Today' : 
               daysSinceAssessment === 1 ? 'Yesterday' : 
               `${daysSinceAssessment} days ago`}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(latestResult.created_at), 'MMM dd')}
            </span>
          </div>
        </div>

        {/* Areas to Focus On */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">
            Areas to Focus On:
          </h4>
          <div className="space-y-2">
            {areasToImprove.map((area, index) => (
              <div key={area.key} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-primary">
                    {index + 1}.
                  </span>
                  <span className="text-sm">{area.skill}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{Math.round(area.score)}%</span>
                  <span className="text-lg">{getScoreLabel(area.score).emoji}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/progress')}
            className="flex-1"
          >
            View Progress
          </Button>
          <Button 
            size="sm" 
            onClick={() => navigate('/core-skills/self-assessment')}
            className="flex-1"
          >
            Retake Test
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
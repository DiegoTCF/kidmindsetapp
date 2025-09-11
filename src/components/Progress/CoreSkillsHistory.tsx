import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Target, TrendingUp, Calendar } from 'lucide-react';
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
  if (score >= 70) return { emoji: '🔴', label: 'Supported', color: 'bg-destructive/10 text-destructive' };
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

export function CoreSkillsHistory() {
  const { user } = useAuth();
  const [results, setResults] = useState<CoreSkillsResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'radar' | 'trend'>('radar');

  useEffect(() => {
    loadResults();
  }, [user]);

  const loadResults = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('core_skills_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error loading core skills results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">Loading your assessment history...</div>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Core Skills Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-muted-foreground mb-4">
            No assessments completed yet
          </div>
          <Button onClick={() => window.location.href = '/core-skills/self-assessment'}>
            Take Your First Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  const latestResult = results[0];
  const scoreInfo = getScoreLabel(latestResult.overall_score);

  // Prepare radar chart data
  const radarData = Object.entries(skillLabels).map(([key, label]) => ({
    skill: label,
    score: latestResult[key as keyof CoreSkillsResult] as number,
    fullMark: 100
  }));

  // Prepare trend chart data
  const trendData = results.slice().reverse().map((result, index) => ({
    date: format(new Date(result.created_at), 'MMM dd'),
    overall: result.overall_score,
    'Self-Worth': result.know_who_you_are_score,
    'Goals/Planning': result.set_goals_score,
    'Preparation': result.preparation_score,
    'Focus Behaviours': result.focus_behaviours_score,
    'Beating Mind': result.beating_mind_score,
    'Dealing with Failure': result.dealing_with_failure_score
  }));

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Core Skills Progress
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'radar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('radar')}
            >
              Current
            </Button>
            <Button
              variant={viewMode === 'trend' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('trend')}
              disabled={results.length < 2}
            >
              Trends
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Latest Score Summary */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Latest Assessment</span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(latestResult.created_at), 'MMM dd, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold">{Math.round(latestResult.overall_score)}%</div>
            <Badge className={scoreInfo.color}>
              {scoreInfo.emoji} {scoreInfo.label}
            </Badge>
            {results.length > 1 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                {results.length} assessments completed
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        {viewMode === 'radar' ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tickCount={5}
                  tick={{ fontSize: 10 }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="overall" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  name="Overall Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Individual Skills Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
          {Object.entries(skillLabels).map(([key, label]) => {
            const score = latestResult[key as keyof CoreSkillsResult] as number;
            const skillInfo = getScoreLabel(score);
            
            return (
              <div key={key} className="p-3 bg-card border rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">{label}</div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{Math.round(score)}%</span>
                  <span className="text-lg">{skillInfo.emoji}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Assessment History */}
        {results.length > 1 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Assessment History
            </h4>
            <div className="space-y-2">
              {results.slice(1, 6).map((result) => (
                <div key={result.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                  <span>{format(new Date(result.created_at), 'MMM dd, yyyy')}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{Math.round(result.overall_score)}%</span>
                    <span>{getScoreLabel(result.overall_score).emoji}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
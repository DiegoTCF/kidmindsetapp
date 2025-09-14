import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Star, Plus } from "lucide-react";
import { formatDate } from "date-fns";

interface BestSelfScore {
  id: string;
  score: number;
  created_at: string;
}

export function BestSelfTracker() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scores, setScores] = useState<BestSelfScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasReflection, setHasReflection] = useState(false);

  useEffect(() => {
    if (user) {
      loadBestSelfData();
    }
  }, [user]);

  const loadBestSelfData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Check if user has a best self reflection
      const { data: reflectionData } = await supabase
        .from('best_self_reflections')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      
      setHasReflection(reflectionData && reflectionData.length > 0);

      // Load best self scores
      const { data: scoresData, error } = await supabase
        .from('best_self_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(10);

      if (error) {
        console.error('Error loading best self scores:', error);
        return;
      }

      setScores(scoresData || []);
    } catch (error) {
      console.error('Error loading best self data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = scores.map((score, index) => ({
    week: `W${index + 1}`,
    score: score.score,
    date: score.created_at
  }));

  const averageScore = scores.length > 0 
    ? Math.round(scores.reduce((sum, score) => sum + score.score, 0) / scores.length)
    : 0;

  const latestScore = scores.length > 0 ? scores[scores.length - 1].score : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#eab308";
    if (score >= 40) return "#f97316";
    return "#ef4444";
  };

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Best Self Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasReflection) {
    return (
      <Card className="shadow-soft border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Best Self Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-6">
            <Star className="h-12 w-12 text-primary/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Define Your Best Self</h3>
            <p className="text-muted-foreground mb-4">
              Start by reflecting on what your best version looks like on the pitch.
            </p>
            <Button 
              onClick={() => navigate('/best-self')}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create My Best Self Vision
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (scores.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Best Self Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-6">
            <Star className="h-12 w-12 text-primary/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start Tracking</h3>
            <p className="text-muted-foreground mb-4">
              Complete activities to start tracking how close you are to your best self.
            </p>
            <Button 
              onClick={() => navigate('/stadium')}
              variant="outline"
            >
              Create Activity
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Best Self Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold" style={{ color: getScoreColor(latestScore) }}>
              {latestScore}%
            </div>
            <div className="text-sm text-muted-foreground">Latest Score</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold" style={{ color: getScoreColor(averageScore) }}>
              {averageScore}%
            </div>
            <div className="text-sm text-muted-foreground">Average</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="week" 
                fontSize={12}
              />
              <YAxis 
                domain={[0, 100]}
                fontSize={12}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, 'Best Self Score']}
                labelFormatter={(label) => `Week ${label.slice(1)}`}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="text-center">
          <Button 
            onClick={() => navigate('/best-self')}
            variant="outline"
            size="sm"
          >
            Update Best Self Vision
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
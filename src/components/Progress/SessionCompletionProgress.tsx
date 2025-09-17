import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Calendar, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface SessionCompletionProgressProps {
  childId: string | null;
}

interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  pendingSessions: number;
  completionRate: number;
  weeklyData: Array<{
    week: string;
    completed: number;
    total: number;
    rate: number;
  }>;
}

export function SessionCompletionProgress({ childId }: SessionCompletionProgressProps) {
  const [stats, setStats] = useState<SessionStats>({
    totalSessions: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    pendingSessions: 0,
    completionRate: 0,
    weeklyData: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (childId) {
      loadSessionStats();
    }
  }, [childId]);

  const loadSessionStats = async () => {
    if (!childId) return;

    setLoading(true);
    try {
      const { data: sessions, error } = await supabase
        .from('session_tracking')
        .select('*')
        .eq('child_id', childId)
        .order('session_date', { ascending: false });

      if (error) {
        console.error('Error loading session stats:', error);
        return;
      }

      const totalSessions = sessions?.length || 0;
      const completedSessions = sessions?.filter(s => s.session_status === 'completed').length || 0;
      const cancelledSessions = sessions?.filter(s => s.session_status === 'cancelled').length || 0;
      const pendingSessions = sessions?.filter(s => s.session_status === 'pending').length || 0;
      const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

      // Calculate weekly data for the last 4 weeks
      const weeklyData = [];
      const today = new Date();
      
      for (let i = 0; i < 4; i++) {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - (today.getDay() - 1) - (i * 7)); // Start of week (Monday)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // End of week (Sunday)

        const weekSessions = sessions?.filter(session => {
          const sessionDate = new Date(session.session_date);
          return sessionDate >= weekStart && sessionDate <= weekEnd;
        }) || [];

        const weekCompleted = weekSessions.filter(s => s.session_status === 'completed').length;
        const weekTotal = weekSessions.length;
        const weekRate = weekTotal > 0 ? (weekCompleted / weekTotal) * 100 : 0;

        weeklyData.unshift({
          week: `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
          completed: weekCompleted,
          total: weekTotal,
          rate: weekRate
        });
      }

      setStats({
        totalSessions,
        completedSessions,
        cancelledSessions,
        pendingSessions,
        completionRate,
        weeklyData
      });
    } catch (error) {
      console.error('Error loading session stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Session Completion Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                <CheckCircle className="h-5 w-5" />
                {stats.completedSessions}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
                <Clock className="h-5 w-5" />
                {stats.pendingSessions}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
                <XCircle className="h-5 w-5" />
                {stats.cancelledSessions}
              </div>
              <div className="text-sm text-muted-foreground">Cancelled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                <TrendingUp className="h-5 w-5" />
                {Math.round(stats.completionRate)}%
              </div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Progress Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.weeklyData.map((week, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm">{week.week}</div>
                  <div className="text-xs text-muted-foreground">
                    {week.completed} of {week.total} sessions completed
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${week.rate}%` }}
                    />
                  </div>
                  <div className="text-sm font-medium min-w-[3rem]">
                    {Math.round(week.rate)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => navigate('/schedule')}
              className="h-auto p-4 flex-col"
            >
              <Calendar className="h-5 w-5 mb-2" />
              <span className="font-medium">View Schedule</span>
              <span className="text-xs opacity-90">See weekly sessions</span>
            </Button>
            <Button 
              onClick={() => navigate('/stadium')}
              variant="outline"
              className="h-auto p-4 flex-col"
            >
              <CheckCircle className="h-5 w-5 mb-2" />
              <span className="font-medium">Complete Session</span>
              <span className="text-xs opacity-90">Start new activity</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
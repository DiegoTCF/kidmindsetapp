import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Calendar, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminSessionStatusProps {
  childId: string;
  childName: string;
}

interface SessionData {
  id: string;
  session_date: string;
  day_of_week: string;
  session_status: string;
  activity_name?: string;
  activity_type?: string;
  pre_form_completed: boolean;
  post_form_completed: boolean;
}

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4 text-orange-500" />;
    case 'missed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-yellow-500" />;
  }
};

export function AdminSessionStatus({ childId, childName }: AdminSessionStatusProps) {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRecentSessions();
  }, [childId]);

  const loadRecentSessions = async () => {
    if (!childId) return;

    setLoading(true);
    try {
      // Get sessions from the last 2 weeks
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const { data, error } = await supabase
        .from('session_tracking')
        .select('*')
        .eq('child_id', childId)
        .gte('session_date', twoWeeksAgo.toISOString().split('T')[0])
        .order('session_date', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading sessions:', error);
        return;
      }

      setSessions(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkMissed = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('session_tracking')
        .update({ session_status: 'missed' })
        .eq('id', sessionId);

      if (error) {
        console.error('Error marking session as missed:', error);
        toast({
          title: "Error",
          description: "Failed to update session status",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Session Updated",
        description: "Session marked as missed"
      });

      loadRecentSessions();
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const getStats = () => {
    const total = sessions.length;
    const completed = sessions.filter(s => s.session_status === 'completed').length;
    const pending = sessions.filter(s => s.session_status === 'pending').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, rate };
  };

  const stats = getStats();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Session Status - {childName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4 p-3 bg-muted/20 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{stats.rate}%</div>
            <div className="text-xs text-muted-foreground">Rate</div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Recent Sessions</h4>
          {sessions.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No sessions found</p>
            </div>
          ) : (
            sessions.slice(0, 5).map(session => (
              <div 
                key={session.id} 
                className="flex items-center justify-between p-2 bg-background border rounded-md"
              >
                <div className="flex items-center gap-2 flex-1">
                  <StatusIcon status={session.session_status} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {session.activity_name || 'Scheduled Session'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(session.session_date).toLocaleDateString()} • {session.day_of_week}
                    </div>
                  </div>
                </div>
                
                {session.session_status === 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkMissed(session.id)}
                    className="ml-2"
                  >
                    Mark Missed
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Action Notes */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-800">
              <p className="font-medium mb-1">Admin Note:</p>
              <p>Sessions are automatically tracked when {childName} completes activities. Use "Mark Missed" for sessions that didn't happen.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
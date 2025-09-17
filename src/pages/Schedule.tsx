import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, XCircle, Clock, Calendar, Activity } from "lucide-react";
import { useChildData } from "@/hooks/useChildData";
import { PlayerViewIndicator } from "@/components/layout/PlayerViewIndicator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

interface SessionData {
  id: string;
  session_date: string;
  day_of_week: string;
  session_status: string;
  activity_name?: string;
  activity_type?: string;
  pre_form_completed: boolean;
  post_form_completed: boolean;
  activity_id?: string;
}

const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'cancelled':
      return <XCircle className="h-5 w-5 text-orange-500" />;
    case 'missed':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-yellow-500" />;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'missed':
      return 'Missed';
    default:
      return 'Pending';
  }
};

export default function Schedule() {
  const { childId, loading } = useChildData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const getWeekDates = (offset: number = 0) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (offset * 7)); // Start from Monday
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const loadSessions = async () => {
    if (!childId) return;
    
    setLoadingSessions(true);
    try {
      const weekDates = getWeekDates(weekOffset);
      const startDate = weekDates[0].toISOString().split('T')[0];
      const endDate = weekDates[6].toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('session_tracking')
        .select('*')
        .eq('child_id', childId)
        .gte('session_date', startDate)
        .lte('session_date', endDate)
        .order('session_date', { ascending: true });

      if (error) {
        console.error('Error loading sessions:', error);
        toast({
          title: "Error",
          description: "Failed to load sessions",
          variant: "destructive"
        });
        return;
      }

      setSessions(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('session_tracking')
        .update({ session_status: 'cancelled' })
        .eq('id', sessionId);

      if (error) {
        console.error('Error cancelling session:', error);
        toast({
          title: "Error",
          description: "Failed to cancel session",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Session Cancelled",
        description: "Session has been marked as cancelled"
      });

      loadSessions();
    } catch (error) {
      console.error('Error cancelling session:', error);
    }
  };

  const handleStartPreForm = (session: SessionData) => {
    if (session.activity_id) {
      navigate(`/stadium?startPreForm=${session.activity_id}`);
    } else {
      toast({
        title: "Error",
        description: "No activity found for this session",
        variant: "destructive"
      });
    }
  };

  const handleCompleteNow = (session: SessionData) => {
    if (session.activity_id) {
      navigate(`/stadium?resumeActivity=${session.activity_id}`);
    } else {
      navigate('/stadium');
    }
  };

  useEffect(() => {
    if (childId) {
      loadSessions();
    }
  }, [childId, weekOffset]);

  if (loading || loadingSessions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const weekDates = getWeekDates(weekOffset);
  const today = new Date().toDateString();

  const getSessionForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return sessions.find(session => session.session_date === dateStr);
  };

  const getIncompleSessions = () => {
    return sessions.filter(session => 
      session.session_status === 'pending' && 
      (!session.pre_form_completed || !session.post_form_completed)
    );
  };

  const incompleteSessions = getIncompleSessions();

  return (
    <div className="min-h-screen bg-background p-4">
      <PlayerViewIndicator />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          📅 Weekly Schedule
        </h1>
        <p className="text-muted-foreground">
          Track your training sessions and completion status
        </p>
      </div>

      {/* Incomplete Sessions Alert */}
      {incompleteSessions.length > 0 && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="font-medium mb-2">
              You have {incompleteSessions.length} incomplete session{incompleteSessions.length > 1 ? 's' : ''}:
            </div>
            <div className="space-y-2">
              {incompleteSessions.map(session => (
                <div key={session.id} className="flex items-center justify-between bg-white p-3 rounded-md">
                  <div>
                    <div className="font-medium">{session.activity_name || 'Unknown Activity'}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(session.session_date).toLocaleDateString()} - {session.day_of_week}
                    </div>
                  </div>
                   <div className="flex gap-2">
                     {!session.pre_form_completed ? (
                       <Button
                         size="sm"
                         onClick={() => handleStartPreForm(session)}
                         className="bg-blue-600 hover:bg-blue-700"
                       >
                         Start Pre-Form
                       </Button>
                     ) : (
                       <Button
                         size="sm"
                         onClick={() => handleCompleteNow(session)}
                         className="bg-green-600 hover:bg-green-700"
                       >
                         Complete Now
                       </Button>
                     )}
                     <Button
                       size="sm"
                       variant="outline"
                       onClick={() => handleCancelSession(session.id)}
                     >
                       Mark as Cancelled
                     </Button>
                   </div>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => setWeekOffset(weekOffset - 1)}
        >
          ← Previous Week
        </Button>
        
        <div className="text-center">
          <div className="font-medium">
            {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
          </div>
          {weekOffset === 0 && (
            <div className="text-sm text-muted-foreground">This Week</div>
          )}
        </div>
        
        <Button
          variant="outline"
          onClick={() => setWeekOffset(weekOffset + 1)}
        >
          Next Week →
        </Button>
      </div>

      {/* Weekly Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDates.map((date, index) => {
          const dayName = dayOrder[index];
          const session = getSessionForDate(date);
          const isToday = date.toDateString() === today;
          
          return (
            <Card 
              key={date.toISOString()} 
              className={`${isToday ? 'ring-2 ring-primary' : ''} ${session ? 'bg-muted/30' : ''}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {dayName}
                </CardTitle>
                <div className="text-xs text-muted-foreground">
                  {date.toLocaleDateString()}
                  {isToday && <span className="ml-1 text-primary font-medium">(Today)</span>}
                </div>
              </CardHeader>
              
              <CardContent>
                {session ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={session.session_status} />
                      <span className="text-sm font-medium">
                        {getStatusLabel(session.session_status)}
                      </span>
                    </div>
                    
                     {session.activity_name && (
                       <div className="text-sm mb-3 p-2 bg-muted/50 rounded-md">
                         <div className="font-medium text-foreground">{session.activity_name}</div>
                         <div className="text-muted-foreground text-xs capitalize">{session.activity_type}</div>
                       </div>
                     )}
                     
                     {session.session_status === 'pending' && !session.pre_form_completed && (
                       <div className="pt-2 space-y-1">
                         <Button
                           size="sm"
                           className="w-full"
                           onClick={() => handleStartPreForm(session)}
                         >
                           <Activity className="h-3 w-3 mr-1" />
                           Start Pre-Form
                         </Button>
                         <Button
                           size="sm"
                           variant="outline"
                           className="w-full"
                           onClick={() => handleCancelSession(session.id)}
                         >
                           Cancel
                         </Button>
                       </div>
                     )}
                     
                     {session.session_status === 'pending' && session.pre_form_completed && !session.post_form_completed && (
                       <div className="pt-2 space-y-1">
                         <Button
                           size="sm"
                           className="w-full"
                           onClick={() => handleCompleteNow(session)}
                         >
                           <Activity className="h-3 w-3 mr-1" />
                           Complete Session
                         </Button>
                         <Button
                           size="sm"
                           variant="outline"
                           className="w-full"
                           onClick={() => handleCancelSession(session.id)}
                         >
                           Cancel
                         </Button>
                       </div>
                     )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <div className="text-sm">No session</div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Session Completion Stats */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Weekly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {sessions.filter(s => s.session_status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {sessions.filter(s => s.session_status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {sessions.filter(s => s.session_status === 'cancelled').length}
              </div>
              <div className="text-sm text-muted-foreground">Cancelled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {sessions.filter(s => s.session_status === 'missed').length}
              </div>
              <div className="text-sm text-muted-foreground">Missed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
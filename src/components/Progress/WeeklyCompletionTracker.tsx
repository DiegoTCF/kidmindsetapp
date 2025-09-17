import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { useChildData } from '@/hooks/useChildData';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface WeeklySession {
  day: string;
  activity: string;
  time?: string;
  date: Date;
  status: 'completed' | 'pending' | 'missed' | 'none';
  hasActivity: boolean;
}

export function WeeklyCompletionTracker() {
  const { childId } = useChildData();
  const navigate = useNavigate();
  const [weeklyStatus, setWeeklyStatus] = useState<WeeklySession[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const dayMapping: Record<string, string> = {
    'monday': 'Mon',
    'tuesday': 'Tue', 
    'wednesday': 'Wed',
    'thursday': 'Thu',
    'friday': 'Fri',
    'saturday': 'Sat',
    'sunday': 'Sun'
  };

  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    if (childId) {
      loadWeeklyStatus();
    }
  }, [childId, weekOffset]);

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

  const parseSchedule = (scheduleText: string) => {
    if (!scheduleText) return {};
    
    try {
      let scheduleData;
      if (scheduleText.startsWith('{') || scheduleText.startsWith('[')) {
        scheduleData = JSON.parse(scheduleText);
      } else {
        return {};
      }
      
      const schedule: Record<string, { activity: string; time?: string }> = {};
      
      if (typeof scheduleData === 'object' && !Array.isArray(scheduleData)) {
        Object.entries(scheduleData).forEach(([key, value]) => {
          if (value) {
            let activity = '';
            let time = '';
            
            if (typeof value === 'string') {
              const timePattern = /(\d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?)/i;
              const timeMatch = value.match(timePattern);
              activity = timeMatch ? value.replace(timePattern, '').trim() : value;
              time = timeMatch ? timeMatch[1] : '';
            }
            
            if (activity && activity !== 'null' && activity !== '') {
              schedule[key.toLowerCase()] = { activity, time };
            }
          }
        });
      }
      
      return schedule;
    } catch (error) {
      console.error('Error parsing schedule:', error);
      return {};
    }
  };

  const loadWeeklyStatus = async () => {
    if (!childId) return;
    
    setLoading(true);
    try {
      // Get child's schedule
      const { data: childInfo, error: childError } = await supabase
        .from('children')
        .select('weekly_schedule')
        .eq('id', childId)
        .single();

      if (childError) throw childError;

      const schedule = parseSchedule(childInfo?.weekly_schedule || '');
      const weekDates = getWeekDates(weekOffset);

      // Get session tracking for this week
      const startDate = weekDates[0].toISOString().split('T')[0];
      const endDate = weekDates[6].toISOString().split('T')[0];

      const { data: sessions, error: sessionsError } = await supabase
        .from('session_tracking')
        .select('session_date, session_status, activity_name, pre_form_completed, post_form_completed')
        .eq('child_id', childId)
        .gte('session_date', startDate)
        .lte('session_date', endDate);

      if (sessionsError) throw sessionsError;

      // Build weekly status
      const weeklyStatus: WeeklySession[] = dayOrder.map((day, index) => {
        const date = weekDates[index];
        const scheduledActivity = schedule[day];
        const session = sessions?.find(s => s.session_date === date.toISOString().split('T')[0]);
        
        let status: 'completed' | 'pending' | 'missed' | 'none' = 'none';
        
        if (scheduledActivity) {
          if (session) {
            if (session.session_status === 'completed' || 
                (session.pre_form_completed && session.post_form_completed)) {
              status = 'completed';
            } else if (session.session_status === 'cancelled' || session.session_status === 'missed') {
              status = 'missed';
            } else {
              status = 'pending';
            }
          } else {
            // Check if it's past due
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            date.setHours(0, 0, 0, 0);
            
            if (date < today) {
              status = 'missed';
            } else {
              status = 'pending';
            }
          }
        }

        return {
          day: dayMapping[day] || day.substring(0, 3),
          activity: scheduledActivity?.activity || 'No session',
          time: scheduledActivity?.time,
          date,
          status,
          hasActivity: !!scheduledActivity
        };
      });

      setWeeklyStatus(weeklyStatus);
    } catch (error) {
      console.error('Error loading weekly status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'missed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-muted" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Done';
      case 'missed':
        return 'Missed';
      case 'pending':
        return 'Pending';
      default:
        return 'No session';
    }
  };

  const completedCount = weeklyStatus.filter(s => s.status === 'completed' && s.hasActivity).length;
  const totalScheduled = weeklyStatus.filter(s => s.hasActivity).length;
  const pendingCount = weeklyStatus.filter(s => s.status === 'pending' && s.hasActivity).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Sessions
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setWeekOffset(weekOffset - 1)}
            >
              ←
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setWeekOffset(weekOffset + 1)}
            >
              →
            </Button>
          </div>
        </div>
        {weekOffset === 0 && (
          <div className="text-sm text-muted-foreground">
            This Week • {completedCount}/{totalScheduled} completed
            {pendingCount > 0 && (
              <span className="ml-2 text-yellow-600">• {pendingCount} pending</span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2">
          {weeklyStatus.map((session, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg border ${
                session.hasActivity 
                  ? session.status === 'completed' 
                    ? 'bg-green-50 border-green-200' 
                    : session.status === 'pending'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                  : 'bg-muted/30 border-muted'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(session.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{session.day}</span>
                      {session.time && (
                        <span className="text-xs text-muted-foreground">
                          {session.time}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {session.activity}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${
                    session.status === 'completed' ? 'text-green-600' :
                    session.status === 'pending' ? 'text-yellow-600' :
                    session.status === 'missed' ? 'text-red-600' :
                    'text-muted-foreground'
                  }`}>
                    {getStatusLabel(session.status)}
                  </span>
                  {session.status === 'pending' && session.hasActivity && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate('/stadium')}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {pendingCount > 0 && (
          <div className="pt-3 border-t">
            <Button 
              onClick={() => navigate('/stadium')}
              className="w-full"
            >
              Complete Pending Sessions ({pendingCount})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
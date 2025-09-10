import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ScheduleDay {
  day: string;
  activity: string;
  time?: string;
}

export function WeeklyScheduleCard() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, [user]);

  const loadSchedule = async () => {
    if (!user) return;
    
    try {
      // Get current user's child data including schedule
      const { data: childData, error } = await supabase
        .rpc('get_current_user_child_data');

      if (error) throw error;
      
      if (childData && childData.length > 0) {
        // Get the weekly schedule from children table
        const { data: childInfo, error: childError } = await supabase
          .from('children')
          .select('weekly_schedule')
          .eq('id', childData[0].child_id)
          .single();

        if (childError) throw childError;
        
        setSchedule(childInfo?.weekly_schedule || null);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseSchedule = (scheduleText: string): ScheduleDay[] => {
    if (!scheduleText) return [];
    
    try {
      // Try to parse as JSON first
      let scheduleData;
      if (scheduleText.startsWith('{') || scheduleText.startsWith('[')) {
        scheduleData = JSON.parse(scheduleText);
      } else {
        // If not JSON, try to parse as plain text
        return parseTextSchedule(scheduleText);
      }
      
      const schedule: ScheduleDay[] = [];
      const dayMapping: Record<string, string> = {
        'monday': 'Mon',
        'tuesday': 'Tue', 
        'wednesday': 'Wed',
        'thursday': 'Thu',
        'friday': 'Fri',
        'saturday': 'Sat',
        'sunday': 'Sun'
      };
      
      // Handle different JSON formats
      if (Array.isArray(scheduleData)) {
        // Array format
        scheduleData.forEach(item => {
          if (item.day && item.activity) {
            schedule.push({
              day: dayMapping[item.day.toLowerCase()] || item.day.substring(0, 3),
              activity: item.activity,
              time: item.time
            });
          }
        });
      } else if (typeof scheduleData === 'object') {
        // Object format - keys are days, values are activities
        Object.entries(scheduleData).forEach(([key, value]) => {
          if (value) {
            const dayKey = dayMapping[key.toLowerCase()] || key.substring(0, 3);
            let activity = '';
            let time = '';
            
            if (typeof value === 'string') {
              activity = value;
            } else if (typeof value === 'object' && value !== null) {
              // Handle nested objects
              if ('activity' in value) {
                activity = (value as any).activity;
                time = (value as any).time || '';
              } else {
                // Convert object to string representation
                activity = Object.values(value).join(', ');
              }
            }
            
            // Clean up activity names
            activity = activity.replace(/[{}"]/g, '').replace(/_/g, ' ');
            
            if (activity && activity !== 'null' && activity !== '') {
              schedule.push({
                day: dayKey,
                activity: activity,
                time: time
              });
            }
          }
        });
      }
      
      return schedule;
    } catch (error) {
      console.error('Error parsing schedule JSON:', error);
      // Fallback to text parsing
      return parseTextSchedule(scheduleText);
    }
  };

  const parseTextSchedule = (scheduleText: string): ScheduleDay[] => {
    // Parse the schedule text - assuming format like:
    // "Monday: Training 6pm, Wednesday: Match 7pm, Friday: Training 5:30pm"
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const schedule: ScheduleDay[] = [];
    
    days.forEach(day => {
      // Look for day in the schedule text
      const dayPattern = new RegExp(`${day}:?\\s*([^,\\n]+)`, 'i');
      const match = scheduleText.match(dayPattern);
      
      if (match) {
        const activityText = match[1].trim();
        // Try to extract time from activity text
        const timePattern = /(\d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?)/i;
        const timeMatch = activityText.match(timePattern);
        
        schedule.push({
          day: day.substring(0, 3), // Short day name
          activity: timeMatch ? activityText.replace(timePattern, '').trim() : activityText,
          time: timeMatch ? timeMatch[1] : undefined
        });
      }
    });
    
    return schedule;
  };

  const getCurrentDayActivities = (parsedSchedule: ScheduleDay[]) => {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayName = dayNames[today];
    
    return parsedSchedule.filter(item => item.day === todayName);
  };

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!schedule) {
    return (
      <Card className="shadow-soft border-2 border-dashed border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-5 h-5" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No schedule set up yet. Ask your parent to add your training and match times.
          </p>
        </CardContent>
      </Card>
    );
  }

  const parsedSchedule = parseSchedule(schedule);
  const todayActivities = getCurrentDayActivities(parsedSchedule);
  const hasActivitiesToday = todayActivities.length > 0;

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          This Week
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Today's Activities */}
        {hasActivitiesToday && (
          <div className="p-3 bg-primary/10 rounded-lg border-l-4 border-primary">
            <h4 className="text-sm font-semibold text-primary mb-2">Today</h4>
            {todayActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium">{activity.activity}</span>
                {activity.time && (
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {activity.time}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Weekly Overview */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Weekly Schedule
          </h4>
          {parsedSchedule.length > 0 ? (
            <div className="space-y-2">
              {parsedSchedule.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-primary w-8">
                      {item.day}
                    </span>
                    <span className="text-sm">{item.activity}</span>
                  </div>
                  {item.time && (
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
              {schedule}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
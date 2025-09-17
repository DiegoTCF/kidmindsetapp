import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Edit, Plus, X, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminPlayerView } from '@/hooks/useAdminPlayerView';
import { useAdmin } from '@/hooks/useAdmin';

interface ScheduleDay {
  day: string;
  activity: string;
  time?: string;
}

const activityOptions = [
  'Team Training',
  '1-to-1 Session', 
  'Match',
  'Small Group',
  'Futsal',
  'Skills Training',
  'Fitness Training',
  'Rest Day',
  'Other'
];

const dayOptions = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];

export function WeeklyScheduleCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isAdmin } = useAdmin();
  const { selectedChild, isViewingAsPlayer } = useAdminPlayerView();
  const [schedule, setSchedule] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>('');
  const [childId, setChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Record<string, string>>({});
  const [newActivity, setNewActivity] = useState({ day: '', activity: '', time: '' });
  const [saving, setSaving] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<Record<string, 'completed' | 'cancelled' | null>>({});

  useEffect(() => {
    loadSchedule();
    loadSessionStatus();
  }, [user, selectedChild, isViewingAsPlayer]);

  // Listen for activity completions to refresh status
  useEffect(() => {
    const handleActivityCompleted = () => {
      console.log('[WeeklyScheduleCard] Activity completed event received, refreshing status');
      loadSessionStatus();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('[WeeklyScheduleCard] Page became visible, refreshing status');
        loadSessionStatus();
      }
    };

    window.addEventListener('activityCompleted', handleActivityCompleted);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('activityCompleted', handleActivityCompleted);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadSchedule = async () => {
    if (!user) return;
    
    try {
      let targetChildId: string | null = null;
      let targetPlayerName: string = '';

      // Check if admin is viewing as player
      if (isAdmin && isViewingAsPlayer && selectedChild) {
        console.log('[WeeklyScheduleCard] Admin viewing player:', selectedChild.name);
        targetChildId = selectedChild.id;
        targetPlayerName = selectedChild.name;
      } else {
        // Get current user's child data including schedule
        const { data: childData, error } = await supabase
          .rpc('get_current_user_child_data');

        if (error) throw error;
        
        if (childData && childData.length > 0) {
          const child = childData[0];
          targetChildId = child.child_id;
          targetPlayerName = child.child_name || '';
        }
      }

      if (targetChildId) {
        setPlayerName(targetPlayerName);
        setChildId(targetChildId);
        
        // Get the weekly schedule from children table
        const { data: childInfo, error: childError } = await supabase
          .from('children')
          .select('weekly_schedule')
          .eq('id', targetChildId)
          .single();

        if (childError) throw childError;
        
        const scheduleData = childInfo?.weekly_schedule || null;
        setSchedule(scheduleData);
        
        // Initialize editing schedule
        if (scheduleData) {
          try {
            const parsed = JSON.parse(scheduleData);
            setEditingSchedule(parsed);
          } catch {
            setEditingSchedule({});
          }
        }
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionStatus = async () => {
    if (!childId) return;
    
    try {
      // Get current week's activities - use more inclusive date range
      const today = new Date();
      const startOfWeek = new Date(today);
      // Ensure we get Monday as start of week for consistent behavior
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      console.log('[WeeklyScheduleCard] Loading session status for week:', {
        today: today.toISOString(),
        startOfWeek: startOfWeek.toISOString().split('T')[0],
        endOfWeek: endOfWeek.toISOString().split('T')[0],
        childId
      });

      const { data: activities, error } = await supabase
        .from('activities')
        .select('activity_date, post_activity_completed, pre_activity_completed, activity_name, activity_type')
        .eq('child_id', childId)
        .gte('activity_date', startOfWeek.toISOString().split('T')[0])
        .lte('activity_date', endOfWeek.toISOString().split('T')[0]);

      if (error) {
        console.error('[WeeklyScheduleCard] Error loading activities:', error);
        throw error;
      }

      console.log('[WeeklyScheduleCard] Activities found:', activities);

      // Get session overrides for cancelled sessions
      const { data: overrides, error: overrideError } = await supabase
        .from('schedule_overrides')
        .select('*')
        .eq('child_id', childId)
        .eq('override_type', 'cancelled')
        .gte('override_date', startOfWeek.toISOString().split('T')[0])
        .lte('override_date', endOfWeek.toISOString().split('T')[0]);

      if (overrideError) {
        console.error('[WeeklyScheduleCard] Error loading overrides:', overrideError);
        throw overrideError;
      }

      console.log('[WeeklyScheduleCard] Overrides found:', overrides);

      const status: Record<string, 'completed' | 'cancelled' | null> = {};
      
      // Mark completed sessions - check if both pre and post are completed
      activities?.forEach(activity => {
        console.log('[WeeklyScheduleCard] Checking activity:', {
          name: activity.activity_name,
          date: activity.activity_date,
          pre: activity.pre_activity_completed,
          post: activity.post_activity_completed
        });
        
        if (activity.pre_activity_completed && activity.post_activity_completed) {
          const dayOfWeek = new Date(activity.activity_date).getDay();
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const dayName = dayNames[dayOfWeek];
          console.log('[WeeklyScheduleCard] Marking day as completed:', dayName);
          status[dayName] = 'completed';
        }
      });

      // Mark cancelled sessions
      overrides?.forEach(override => {
        const dayOfWeek = new Date(override.override_date).getDay();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        status[dayNames[dayOfWeek]] = 'cancelled';
      });

      console.log('[WeeklyScheduleCard] Final session status:', status);
      setSessionStatus(status);
    } catch (error) {
      console.error('Error loading session status:', error);
    }
  };

  const handleSessionCancel = async (day: string) => {
    if (!childId) return;
    
    try {
      const today = new Date();
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayIndex = dayNames.indexOf(day.toLowerCase());
      
      // Calculate the date for this day of the current week
      const dayDate = new Date();
      dayDate.setDate(dayDate.getDate() - dayDate.getDay() + dayIndex);

      const { error } = await supabase
        .from('schedule_overrides')
        .insert({
          child_id: childId,
          override_date: dayDate.toISOString().split('T')[0],
          override_type: 'cancelled',
          note: 'Session cancelled by user'
        });

      if (error) throw error;

      // Update local status
      setSessionStatus(prev => ({
        ...prev,
        [day.toLowerCase()]: 'cancelled'
      }));

      toast({
        title: "Session Cancelled",
        description: `${day} session has been marked as cancelled.`
      });
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast({
        title: "Error",
        description: "Failed to cancel session. Please try again.",
        variant: "destructive"
      });
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

  const sortScheduleByDay = (schedule: ScheduleDay[]) => {
    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return schedule.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
  };

  const getCurrentDay = () => {
    const today = new Date().getDay();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayNames[today];
  };

  const handleSaveSchedule = async () => {
    if (!childId) return;
    
    setSaving(true);
    try {
      const scheduleJson = JSON.stringify(editingSchedule);
      
      const { error } = await supabase
        .from('children')
        .update({ weekly_schedule: scheduleJson })
        .eq('id', childId);
        
      if (error) throw error;
      
      setSchedule(scheduleJson);
      setIsEditing(false);
      
      toast({
        title: "Schedule Updated! 🎉",
        description: "Your weekly schedule has been saved successfully."
      });
      
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: "Error",
        description: "Failed to save schedule. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveActivity = (day: string) => {
    const updated = { ...editingSchedule };
    delete updated[day];
    setEditingSchedule(updated);
  };

  const handleAddActivity = () => {
    if (newActivity.day && newActivity.activity) {
      const activityText = newActivity.time 
        ? `${newActivity.activity} ${newActivity.time}`
        : newActivity.activity;
        
      setEditingSchedule(prev => ({
        ...prev,
        [newActivity.day]: activityText
      }));
      
      setNewActivity({ day: '', activity: '', time: '' });
    }
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
            {playerName ? `${playerName}'s Schedule` : 'Weekly Schedule'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            No schedule set up yet. Click "Edit Schedule" to add your training and match times.
          </p>
          <Button onClick={() => setIsEditing(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Create Schedule
          </Button>
        </CardContent>
      </Card>
    );
  }

  const parsedSchedule = parseSchedule(schedule);
  const sortedSchedule = sortScheduleByDay(parsedSchedule);
  const todayActivities = getCurrentDayActivities(parsedSchedule);
  const currentDay = getCurrentDay();
  const hasActivitiesToday = todayActivities.length > 0;

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {playerName ? `${playerName}'s Week` : 'This Week'}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log('[WeeklyScheduleCard] Manual refresh triggered');
                  loadSessionStatus();
                }}
                className="text-xs"
              >
                🔄
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1"
              >
                <Edit className="w-3 h-3" />
                Edit
              </Button>
            </div>
          </div>
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
          {sortedSchedule.length > 0 ? (
            <div className="space-y-2">
              {sortedSchedule.map((item, index) => {
                const dayKey = item.day.toLowerCase() === 'mon' ? 'monday' :
                              item.day.toLowerCase() === 'tue' ? 'tuesday' :
                              item.day.toLowerCase() === 'wed' ? 'wednesday' :
                              item.day.toLowerCase() === 'thu' ? 'thursday' :
                              item.day.toLowerCase() === 'fri' ? 'friday' :
                              item.day.toLowerCase() === 'sat' ? 'saturday' :
                              'sunday';
                const status = sessionStatus[dayKey];
                
                return (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-2 rounded ${
                      item.day === currentDay 
                        ? 'bg-primary/20 border border-primary/30' 
                        : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium w-8 ${
                        item.day === currentDay ? 'text-primary font-bold' : 'text-primary'
                      }`}>
                        {item.day}
                      </span>
                      <span className={`text-sm ${
                        item.day === currentDay ? 'font-medium' : ''
                      }`}>
                        {item.activity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {status === 'completed' && (
                        <Badge variant="default" className="text-xs bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30">
                          ✓ Form Completed
                        </Badge>
                      )}
                      {status === 'cancelled' && (
                        <Badge variant="destructive" className="text-xs">
                          Cancelled
                        </Badge>
                      )}
                      {!status && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6 px-2 text-muted-foreground hover:text-destructive"
                          onClick={() => handleSessionCancel(dayKey)}
                        >
                          Cancel
                        </Button>
                      )}
                      {item.time && (
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
              {schedule}
            </div>
          )}
        </div>

        {/* Edit Schedule Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Weekly Schedule</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Current Activities */}
              <div>
                <h4 className="text-sm font-medium mb-2">Current Activities</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {Object.entries(editingSchedule).map(([day, activity]) => (
                    <div key={day} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <span className="text-sm font-medium capitalize">{day}:</span>
                        <span className="text-sm ml-2">{activity}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveActivity(day)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {Object.keys(editingSchedule).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No activities added yet
                    </p>
                  )}
                </div>
              </div>

              {/* Add New Activity */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Add Activity</h4>
                <div className="space-y-3">
                  <Select value={newActivity.day} onValueChange={(value) => setNewActivity(prev => ({ ...prev, day: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {dayOptions.map(day => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Activity name (e.g. Team Training, Match vs Arsenal)"
                    value={newActivity.activity}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, activity: e.target.value }))}
                  />

                  <Input
                    placeholder="Time (optional) e.g. 6:00pm"
                    value={newActivity.time}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, time: e.target.value }))}
                  />

                  <Button
                    onClick={handleAddActivity}
                    disabled={!newActivity.day || !newActivity.activity}
                    className="w-full"
                    size="sm"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Activity
                  </Button>
                </div>
              </div>

              {/* Save/Cancel */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset editing schedule to current
                    if (schedule) {
                      try {
                        const parsed = JSON.parse(schedule);
                        setEditingSchedule(parsed);
                      } catch {
                        setEditingSchedule({});
                      }
                    }
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveSchedule}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
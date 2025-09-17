import { useState, useEffect } from "react";
import { Calendar, ChevronDown, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useChildData } from "@/hooks/useChildData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NewActivityProps {
  onSubmit: (activity: { 
    name: string; 
    type: string; 
    date: Date;
    isScheduled?: boolean;
    scheduledActivity?: ScheduledActivity;
  }) => void;
  onCancel: () => void;
}

interface ScheduledActivity {
  day: string;
  activity: string;
  time?: string;
}

interface CompletedActivity {
  id: string;
  activity_name: string;
  activity_type: string;
  activity_date: string;
  created_at: string;
}

const activityTypes = [
  { value: "Match", label: "Match" },
  { value: "Training", label: "Training" },
  { value: "1to1", label: "One-to-One (Technical)" },
  { value: "Futsal", label: "Futsal" },
  { value: "Small Group", label: "Small Group" },
  { value: "Other", label: "Other" },
];

export default function NewActivity({ onSubmit, onCancel }: NewActivityProps) {
  const [mode, setMode] = useState<'scheduled' | 'new' | 'link'>('scheduled'); // Default to scheduled
  const [activityType, setActivityType] = useState("");
  const [activityName, setActivityName] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [weeklySchedule, setWeeklySchedule] = useState<ScheduledActivity[]>([]);
  const [selectedScheduledActivity, setSelectedScheduledActivity] = useState<ScheduledActivity | null>(null);
  const [completedActivities, setCompletedActivities] = useState<CompletedActivity[]>([]);
  const [selectedCompletedActivity, setSelectedCompletedActivity] = useState<CompletedActivity | null>(null);
  const { childId } = useChildData();
  const { toast } = useToast();

  const dayMapping: Record<string, string> = {
    'monday': 'Mon',
    'tuesday': 'Tue', 
    'wednesday': 'Wed',
    'thursday': 'Thu',
    'friday': 'Fri',
    'saturday': 'Sat',
    'sunday': 'Sun'
  };

  useEffect(() => {
    if (childId) {
      loadWeeklySchedule();
      loadCompletedActivities();
    }
  }, [childId]);

  const parseSchedule = (scheduleText: string): ScheduledActivity[] => {
    if (!scheduleText) return [];
    
    try {
      let scheduleData;
      if (scheduleText.startsWith('{') || scheduleText.startsWith('[')) {
        scheduleData = JSON.parse(scheduleText);
      } else {
        return [];
      }
      
      const schedule: ScheduledActivity[] = [];
      
      if (typeof scheduleData === 'object' && !Array.isArray(scheduleData)) {
        Object.entries(scheduleData).forEach(([key, value]) => {
          if (value) {
            const dayKey = dayMapping[key.toLowerCase()] || key.substring(0, 3);
            let activity = '';
            let time = '';
            
            if (typeof value === 'string') {
              const timePattern = /(\d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?)/i;
              const timeMatch = value.match(timePattern);
              activity = timeMatch ? value.replace(timePattern, '').trim() : value;
              time = timeMatch ? timeMatch[1] : '';
            }
            
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
      console.error('Error parsing schedule:', error);
      return [];
    }
  };

  const loadWeeklySchedule = async () => {
    if (!childId) return;
    
    try {
      const { data: childInfo, error } = await supabase
        .from('children')
        .select('weekly_schedule')
        .eq('id', childId)
        .single();

      if (error) throw error;
      
      if (childInfo?.weekly_schedule) {
        const parsed = parseSchedule(childInfo.weekly_schedule);
        setWeeklySchedule(parsed);
      }
    } catch (error) {
      console.error('Error loading weekly schedule:', error);
    }
  };

  const loadCompletedActivities = async () => {
    if (!childId) return;
    
    try {
      // Get activities from last 30 days that are completed
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: activities, error } = await supabase
        .from('activities')
        .select('id, activity_name, activity_type, activity_date, created_at')
        .eq('child_id', childId)
        .eq('pre_activity_completed', true)
        .eq('post_activity_completed', true)
        .gte('activity_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('activity_date', { ascending: false });

      if (error) throw error;
      
      // Filter out activities that are already linked to schedule
      const { data: sessions, error: sessionsError } = await supabase
        .from('session_tracking')
        .select('activity_id')
        .eq('child_id', childId)
        .not('activity_id', 'is', null);

      if (sessionsError) throw sessionsError;
      
      const linkedActivityIds = sessions.map(s => s.activity_id);
      const unlinkedActivities = activities.filter(a => !linkedActivityIds.includes(a.id));
      
      setCompletedActivities(unlinkedActivities);
    } catch (error) {
      console.error('Error loading completed activities:', error);
    }
  };

  const handleSubmit = () => {
    if (mode === 'scheduled' && selectedScheduledActivity) {
      onSubmit({
        name: selectedScheduledActivity.activity,
        type: selectedScheduledActivity.activity.toLowerCase().includes('1') || 
              selectedScheduledActivity.activity.toLowerCase().includes('one') ? '1to1' : 'training',
        date: selectedDate,
        isScheduled: true,
        scheduledActivity: selectedScheduledActivity
      });
    } else if (mode === 'new' && activityName.trim() && activityType) {
      onSubmit({
        name: activityName.trim(),
        type: activityType,
        date: selectedDate,
        isScheduled: false
      });
    } else if (mode === 'link' && selectedCompletedActivity) {
      // Handle linking completed activity to schedule
      linkCompletedActivityToSchedule();
    }
  };

  const linkCompletedActivityToSchedule = async () => {
    if (!selectedCompletedActivity || !childId) return;
    
    try {
      const activityDate = new Date(selectedCompletedActivity.activity_date);
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[activityDate.getDay()];

      // Create or update session tracking entry
      const { error } = await supabase.rpc('log_session_status', {
        p_child_id: childId,
        p_session_date: selectedCompletedActivity.activity_date,
        p_status: 'completed',
        p_activity_name: selectedCompletedActivity.activity_name,
        p_activity_type: selectedCompletedActivity.activity_type,
        p_day_of_week: dayName
      });

      if (error) throw error;

      // Update session with activity_id and completion status
      const { error: updateError } = await supabase
        .from('session_tracking')
        .update({ 
          activity_id: selectedCompletedActivity.id,
          pre_form_completed: true,
          post_form_completed: true
        })
        .eq('child_id', childId)
        .eq('session_date', selectedCompletedActivity.activity_date);

      if (updateError) throw updateError;

      toast({
        title: "Activity Linked! 🎉",
        description: `${selectedCompletedActivity.activity_name} has been linked to your schedule`
      });

      onCancel(); // Close the dialog
    } catch (error) {
      console.error('Error linking activity:', error);
      toast({
        title: "Error",
        description: "Failed to link activity to schedule",
        variant: "destructive"
      });
    }
  };

  const isFormValid = () => {
    if (mode === 'scheduled') return selectedScheduledActivity;
    if (mode === 'new') return activityName.trim() && activityType;
    if (mode === 'link') return selectedCompletedActivity;
    return false;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg text-center">
              ⚽ New Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode Selection */}
            <div className="space-y-2">
              <Label>Activity Type</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={mode === 'scheduled' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('scheduled')}
                  className="text-xs"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Scheduled
                </Button>
                <Button
                  variant={mode === 'new' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('new')}
                  className="text-xs"
                >
                  New Activity
                </Button>
                <Button
                  variant={mode === 'link' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('link')}
                  className="text-xs"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Link Past
                </Button>
              </div>
            </div>

            {mode === 'scheduled' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select from your weekly schedule</Label>
                  {weeklySchedule.length > 0 ? (
                    <div className="space-y-2">
                      {weeklySchedule.map((scheduleItem, index) => (
                        <div
                          key={index}
                          className={cn(
                            "p-3 border rounded-md cursor-pointer transition-colors",
                            selectedScheduledActivity === scheduleItem
                              ? "border-primary bg-primary/10"
                              : "border-muted hover:border-primary/50"
                          )}
                          onClick={() => setSelectedScheduledActivity(scheduleItem)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{scheduleItem.activity}</div>
                              <div className="text-sm text-muted-foreground">
                                {scheduleItem.day}
                                {scheduleItem.time && ` • ${scheduleItem.time}`}
                              </div>
                            </div>
                            {selectedScheduledActivity === scheduleItem && (
                              <CheckCircle className="w-4 h-4 text-primary" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      <p>No scheduled activities found.</p>
                      <p className="text-xs mt-1">Set up your weekly schedule on the Home page.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {mode === 'new' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="activity-type">Activity Type</Label>
                  <Select value={activityType} onValueChange={setActivityType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity-name">Give this session a name</Label>
                  <Input
                    id="activity-name"
                    placeholder="I.e. Real Madrid session, Sunday 1to1, U10s Tournament"
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Be specific to help track your progress
                  </p>
                </div>
              </>
            )}

            {mode === 'link' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Link completed activities to your schedule</Label>
                  {completedActivities.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {completedActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className={cn(
                            "p-3 border rounded-md cursor-pointer transition-colors",
                            selectedCompletedActivity?.id === activity.id
                              ? "border-primary bg-primary/10"
                              : "border-muted hover:border-primary/50"
                          )}
                          onClick={() => setSelectedCompletedActivity(activity)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{activity.activity_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(activity.activity_date).toLocaleDateString()} • {activity.activity_type}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                Completed
                              </Badge>
                              {selectedCompletedActivity?.id === activity.id && (
                                <CheckCircle className="w-4 h-4 text-primary" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      <p>No unlinked completed activities found.</p>
                      <p className="text-xs mt-1">Complete some activities first!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(mode === 'scheduled' || mode === 'new') && (
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                      <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date);
                          setIsCalendarOpen(false);
                        }
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!isFormValid()}
                className="flex-1"
              >
                {mode === 'link' ? 'Link Activity' : 'Create Activity'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
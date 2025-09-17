import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useChildData } from "@/hooks/useChildData";
import { supabase } from "@/integrations/supabase/client";

interface NewActivityProps {
  onSubmit: (activity: { 
    name: string; 
    type: string; 
    date: Date;
    scheduledActivity?: ScheduledActivity;
  }) => void;
  onCancel: () => void;
}

interface ScheduledActivity {
  day: string;
  activity: string;
  time?: string;
  date: Date;
  isCompleted?: boolean;
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
  const [weeklySchedule, setWeeklySchedule] = useState<ScheduledActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ScheduledActivity | null>(null);
  const [selectedType, setSelectedType] = useState<string>("");
  const { childId } = useChildData();

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
      loadWeeklyScheduleWithStatus();
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
        // Get current week dates
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Start from Monday
        
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
              // Calculate the date for this day
              const dayIndex = dayOrder.indexOf(key.toLowerCase());
              const sessionDate = new Date(startOfWeek);
              sessionDate.setDate(startOfWeek.getDate() + dayIndex);
              
              schedule.push({
                day: dayKey,
                activity: activity,
                time: time,
                date: sessionDate
              });
            }
          }
        });
      }
      
      return schedule.sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error) {
      console.error('Error parsing schedule:', error);
      return [];
    }
  };

  const loadWeeklyScheduleWithStatus = async () => {
    if (!childId) return;
    
    try {
      // Load schedule
      const { data: childInfo, error } = await supabase
        .from('children')
        .select('weekly_schedule')
        .eq('id', childId)
        .single();

      if (error) throw error;
      
      let schedule: ScheduledActivity[] = [];
      if (childInfo?.weekly_schedule) {
        schedule = parseSchedule(childInfo.weekly_schedule);
      }

      // Check completion status for each scheduled session
      if (schedule.length > 0) {
        const weekDates = schedule.map(s => s.date.toISOString().split('T')[0]);
        
        const { data: sessions, error: sessionsError } = await supabase
          .from('session_tracking')
          .select('session_date, session_status, pre_form_completed, post_form_completed')
          .eq('child_id', childId)
          .in('session_date', weekDates);

        if (!sessionsError && sessions) {
          schedule = schedule.map(item => {
            const session = sessions.find(s => s.session_date === item.date.toISOString().split('T')[0]);
            return {
              ...item,
              isCompleted: session?.session_status === 'completed' || 
                          (session?.pre_form_completed && session?.post_form_completed)
            };
          });
        }
      }
      
      setWeeklySchedule(schedule);
    } catch (error) {
      console.error('Error loading weekly schedule:', error);
    }
  };

  const handleSubmit = () => {
    if (!selectedActivity || !selectedType) return;
    
    onSubmit({
      name: selectedActivity.activity,
      type: selectedType,
      date: selectedActivity.date,
      scheduledActivity: selectedActivity
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg text-center">
              ⚽ Select Your Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {weeklySchedule.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  Choose which scheduled session you want to complete
                </p>
                {weeklySchedule.map((scheduleItem, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-all",
                      selectedActivity === scheduleItem
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-muted hover:border-primary/50 hover:shadow-sm",
                      scheduleItem.isCompleted && "opacity-60"
                    )}
                    onClick={() => {
                      if (!scheduleItem.isCompleted) {
                        setSelectedActivity(scheduleItem);
                        // Auto-detect activity type based on name
                        const activityName = scheduleItem.activity.toLowerCase();
                        if (activityName.includes('1-to-1') || activityName.includes('1to1') || activityName.includes('one-to-one')) {
                          setSelectedType('1to1');
                        } else if (activityName.includes('match')) {
                          setSelectedType('Match');
                        } else if (activityName.includes('futsal')) {
                          setSelectedType('Futsal');
                        } else if (activityName.includes('small group')) {
                          setSelectedType('Small Group');
                        } else {
                          setSelectedType('Training');
                        }
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-primary">
                            {scheduleItem.day}
                          </span>
                          {scheduleItem.time && (
                            <Badge variant="outline" className="text-xs">
                              {scheduleItem.time}
                            </Badge>
                          )}
                          {scheduleItem.isCompleted && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                              ✅ Done
                            </Badge>
                          )}
                        </div>
                        <div className="font-medium">{scheduleItem.activity}</div>
                        <div className="text-xs text-muted-foreground">
                          {scheduleItem.date.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedActivity === scheduleItem && !scheduleItem.isCompleted && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 text-muted-foreground">
                <p>No scheduled sessions found.</p>
                <p className="text-xs mt-2">Set up your weekly schedule on the Home page first.</p>
              </div>
            )}

            {/* Activity Type Selection */}
            {selectedActivity && (
              <div className="space-y-2">
                <Label htmlFor="activity-type">What type of session is this?</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select session type" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose the type that best matches your session
                </p>
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
                disabled={!selectedActivity || selectedActivity.isCompleted || !selectedType}
                className="flex-1"
              >
                Start Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
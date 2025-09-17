import { useState, useEffect } from "react";
import { Calendar, ChevronDown, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useChildData } from "@/hooks/useChildData";
import { supabase } from "@/integrations/supabase/client";

interface NewActivityProps {
  onSubmit: (activity: { 
    name: string; 
    type: string; 
    date: Date;
    scheduledSession?: ScheduleSession;
  }) => void;
  onCancel: () => void;
}

interface ScheduleSession {
  day: string;
  activity: string;
  time?: string;
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
  const [activityType, setActivityType] = useState("");
  const [activityName, setActivityName] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedScheduleSession, setSelectedScheduleSession] = useState<ScheduleSession | null>(null);
  const [scheduleSessions, setScheduleSessions] = useState<ScheduleSession[]>([]);
  const { childId } = useChildData();

  useEffect(() => {
    loadScheduleSessions();
  }, [childId]);

  const loadScheduleSessions = async () => {
    if (!childId) return;
    
    try {
      const { data: child, error } = await supabase
        .from('children')
        .select('weekly_schedule')
        .eq('id', childId)
        .single();

      if (error || !child?.weekly_schedule) return;

      const schedule = JSON.parse(child.weekly_schedule);
      const sessions: ScheduleSession[] = [];
      
      Object.entries(schedule).forEach(([day, activity]) => {
        if (activity) {
          sessions.push({
            day: day.charAt(0).toUpperCase() + day.slice(1),
            activity: activity as string
          });
        }
      });
      
      setScheduleSessions(sessions);
    } catch (error) {
      console.error('Error loading schedule:', error);
    }
  };

  const handleSubmit = () => {
    if (!activityName.trim() || !activityType) return;
    
    const activityData = {
      name: activityName.trim(),
      type: activityType,
      date: selectedDate,
      scheduledSession: selectedScheduleSession || undefined
    };
    
    onSubmit(activityData);
  };

  const isFormValid = activityName.trim() && activityType;

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
            {/* Link to Schedule */}
            {scheduleSessions.length > 0 && (
              <div className="space-y-2">
                <Label>Link to Scheduled Session</Label>
                <div className="p-3 border rounded-lg bg-muted/20">
                  <p className="text-sm text-muted-foreground mb-3">
                    Select a session from your weekly schedule or create a new activity below
                  </p>
                  <div className="space-y-2">
                    {scheduleSessions.map((session, index) => (
                      <Button
                        key={index}
                        variant={selectedScheduleSession?.day === session.day ? "default" : "outline"}
                        className="w-full justify-start h-auto p-3"
                        onClick={() => {
                          setSelectedScheduleSession(session);
                          setActivityName(session.activity);
                          // Auto-detect activity type from session name
                          const sessionLower = session.activity.toLowerCase();
                          if (sessionLower.includes('1to1') || sessionLower.includes('1-to-1')) {
                            setActivityType('1to1');
                          } else if (sessionLower.includes('training')) {
                            setActivityType('Training');
                          } else if (sessionLower.includes('match')) {
                            setActivityType('Match');
                          } else if (sessionLower.includes('futsal')) {
                            setActivityType('Futsal');
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <div className="text-left">
                            <div className="font-medium">{session.day}</div>
                            <div className="text-sm opacity-80">{session.activity}</div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                  {selectedScheduleSession && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => {
                        setSelectedScheduleSession(null);
                        setActivityName("");
                        setActivityType("");
                      }}
                    >
                      Clear Selection
                    </Button>
                  )}
                </div>
              </div>
            )}

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
                disabled={!isFormValid}
                className="flex-1"
              >
                Create Activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
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

interface NewActivityProps {
  onSubmit: (activity: { 
    name: string; 
    type: string; 
    date: Date;
  }) => void;
  onCancel: () => void;
  initialName?: string;
  initialType?: string;
  initialDate?: Date;
}

const activityTypes = [
  { value: "Match", label: "Match" },
  { value: "Training", label: "Training" },
  { value: "1to1", label: "One-to-One (Technical)" },
  { value: "Futsal", label: "Futsal" },
  { value: "Small Group", label: "Small Group" },
  { value: "Other", label: "Other" },
];

export default function NewActivity({ onSubmit, onCancel, initialName = "", initialType = "", initialDate }: NewActivityProps) {
  const [activityType, setActivityType] = useState(initialType);
  const [activityName, setActivityName] = useState(initialName);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { childId } = useChildData();

  const handleSubmit = () => {
    if (!activityName.trim() || !activityType) return;
    
    const activityData = {
      name: activityName.trim(),
      type: activityType,
      date: selectedDate,
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
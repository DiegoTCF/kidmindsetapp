import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle } from "lucide-react";
import { useChildData } from "@/hooks/useChildData";
import { supabase } from "@/integrations/supabase/client";

interface Activity {
  id: string;
  activity_name: string;
  activity_type: string;
  activity_date: string;
  pre_activity_completed: boolean;
  post_activity_completed: boolean;
}

interface WhatsOnTodayProps {
  schedule?: string;
}

export const WhatsOnToday = ({ schedule }: WhatsOnTodayProps) => {
  const { childId } = useChildData();
  const navigate = useNavigate();
  const [todayActivity, setTodayActivity] = useState<Activity | null>(null);
  const [todaySchedule, setTodaySchedule] = useState<string | null>(null);

  useEffect(() => {
    loadTodayData();
  }, [childId, schedule]);

  const loadTodayData = async () => {
    if (!childId) return;

    // Get today's day and scheduled activity
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = dayNames[today.getDay()];
    const todayShort = todayName.substring(0, 3);

    // Parse schedule to find today's activity
    if (schedule) {
      const scheduleLines = schedule.split('\n').filter(line => line.trim());
      const todayLine = scheduleLines.find(line => 
        line.toLowerCase().includes(todayShort) || line.toLowerCase().includes(todayName)
      );
      
      if (todayLine) {
        const activityMatch = todayLine.match(/:\s*(.+)$/);
        if (activityMatch) {
          setTodaySchedule(activityMatch[1].trim());
        }
      }
    }

    // Check if there's already an activity for today
    try {
      const todayDate = today.toISOString().split('T')[0];
      const { data: activities, error } = await supabase
        .from('activities')
        .select('*')
        .eq('child_id', childId)
        .eq('activity_date', todayDate)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error loading today activity:', error);
        return;
      }

      if (activities && activities.length > 0) {
        setTodayActivity(activities[0]);
      }
    } catch (error) {
      console.error('Error loading today activity:', error);
    }
  };

  const handleGoToStadium = () => {
    if (todaySchedule && !todayActivity) {
      // Store scheduled activity for Stadium to pick up
      const scheduledActivity = {
        name: todaySchedule,
        type: 'Match', // Default type
        date: new Date(),
        isScheduled: true
      };
      sessionStorage.setItem('scheduledActivity', JSON.stringify(scheduledActivity));
    }
    navigate('/stadium');
  };

  const getActivityStatus = () => {
    if (todayActivity) {
      if (todayActivity.post_activity_completed) {
        return { status: 'completed', text: 'You have completed your form!', color: 'text-green-600' };
      } else if (todayActivity.pre_activity_completed) {
        return { status: 'in-progress', text: 'In Progress', color: 'text-yellow-600' };
      } else {
        return { status: 'started', text: 'Started', color: 'text-blue-600' };
      }
    }
    return { status: 'pending', text: 'Not Started', color: 'text-gray-600' };
  };

  const activityStatus = getActivityStatus();
  const displayActivity = todayActivity?.activity_name || todaySchedule || 'No activity scheduled';

  return (
    <Card className="w-full shadow-soft">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          What's On Today
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{displayActivity}</h3>
              <p className={`text-sm ${activityStatus.color}`}>
                {activityStatus.text}
              </p>
            </div>
            {activityStatus.status === 'completed' && (
              <CheckCircle className="w-6 h-6 text-green-600" />
            )}
          </div>
          
          <Button
            onClick={handleGoToStadium}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            size="lg"
          >
            {activityStatus.status === 'completed' 
              ? 'View Details' 
              : activityStatus.status === 'in-progress'
              ? 'Continue Activity'
              : 'Go to Stadium'
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
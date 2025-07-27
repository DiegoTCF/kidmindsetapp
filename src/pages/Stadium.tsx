import { useState, useEffect } from "react";
import { Plus, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NewActivity from "@/components/Stadium/NewActivity";
import ActivityForm from "@/components/Stadium/ActivityForm";
import { supabase } from "@/integrations/supabase/client";

interface ActivityData {
  name: string;
  type: string;
  date: Date;
}

interface IncompleteActivity {
  id: string;
  activity_name: string;
  activity_type: string;
  activity_date: string;
  final_score?: string;
  goals_scored?: number;
  assists_made?: number;
  pre_activity_completed: boolean;
  post_activity_completed: boolean;
}

export default function Stadium() {
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<ActivityData | null>(null);
  const [incompleteActivities, setIncompleteActivities] = useState<IncompleteActivity[]>([]);
  const [resumingActivity, setResumingActivity] = useState<IncompleteActivity | null>(null);

  useEffect(() => {
    loadIncompleteActivities();
  }, []);

  // Also reload when component becomes visible again (user returns from other pages)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadIncompleteActivities();
      }
    };

    // Listen for activity deletions from Progress page
    const handleActivityDeleted = (event: CustomEvent) => {
      console.log('Stadium received activityDeleted event:', event.detail);
      if (event.detail.wasIncomplete) {
        // Only reload if the deleted activity was incomplete
        loadIncompleteActivities();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('activityDeleted', handleActivityDeleted as EventListener);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('activityDeleted', handleActivityDeleted as EventListener);
    };
  }, []);

  const loadIncompleteActivities = async () => {
    try {
      const { data: children } = await supabase
        .from('children')
        .select('id')
        .limit(1);
      
      if (children && children.length > 0) {
        const { data: activities } = await supabase
          .from('activities')
          .select('*')
          .eq('child_id', children[0].id)
          .eq('pre_activity_completed', true)
          .eq('post_activity_completed', false)
          .order('created_at', { ascending: false });
        
        if (activities) {
          setIncompleteActivities(activities);
        }
      }
    } catch (error) {
      console.error('Error loading incomplete activities:', error);
    }
  };

  const handleResumeActivity = (activity: IncompleteActivity) => {
    const activityData: ActivityData = {
      name: activity.activity_name,
      type: activity.activity_type,
      date: new Date(activity.activity_date),
    };
    
    setCurrentActivity(activityData);
    setResumingActivity(activity);
    setShowActivityForm(true);
  };

  const handleNewActivitySubmit = (activity: ActivityData) => {
    setCurrentActivity(activity);
    setShowNewActivity(false);
    setShowActivityForm(true);
  };

  const handleActivityFormComplete = () => {
    setShowActivityForm(false);
    setCurrentActivity(null);
    setResumingActivity(null);
    loadIncompleteActivities(); // Reload to update the list
  };

  if (showNewActivity) {
    return (
      <NewActivity
        onSubmit={handleNewActivitySubmit}
        onCancel={() => setShowNewActivity(false)}
      />
    );
  }

  if (showActivityForm && currentActivity) {
    return (
      <ActivityForm
        activity={currentActivity}
        onComplete={handleActivityFormComplete}
        existingActivityId={resumingActivity?.id}
        isResumingActivity={!!resumingActivity}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mb-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              🏟️ Stadium
            </h1>
            <p className="text-muted-foreground">
              Create a new activity to start your football journey
            </p>
          </div>
          
          {/* New Activity Card */}
          <Card className="w-full max-w-md shadow-soft">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                  <Plus className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Ready to Begin?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start by creating a new activity. Choose from matches, training sessions, or custom activities.
                  </p>
                  <Button
                    onClick={() => setShowNewActivity(true)}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                    size="lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    New Activity
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resume Incomplete Activities */}
          {incompleteActivities.length > 0 && (
            <Card className="w-full max-w-md shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 justify-center">
                  🔄 Resume Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Complete your post-activity reflection for these sessions.
                </p>
                <div className="space-y-3">
                  {incompleteActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">⚽</span>
                        <div>
                          <p className="font-medium text-sm">{activity.activity_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.activity_type} • {new Date(activity.activity_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleResumeActivity(activity)}
                        size="sm"
                        className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Resume Post-Match
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tools to Get Ready */}
          <Card className="w-full max-w-md shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 justify-center">
                ⚙️ Tools to Get Ready
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Use these tools to help your mind and body before any activity.
              </p>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 text-left border-2 hover:border-primary/30"
                  disabled
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🧘</span>
                    <div>
                      <p className="font-medium">Yoga Video</p>
                      <p className="text-xs text-muted-foreground">(Coming Soon)</p>
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 text-left border-2 hover:border-primary/30"
                  disabled
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎧</span>
                    <div>
                      <p className="font-medium">Visualisation Audio</p>
                      <p className="text-xs text-muted-foreground">(Coming Soon)</p>
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 text-left border-2 hover:border-primary/30"
                  disabled
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌬️</span>
                    <div>
                      <p className="font-medium">Breathing Audio</p>
                      <p className="text-xs text-muted-foreground">(Coming Soon)</p>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
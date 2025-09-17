import { useState, useEffect } from "react";
import { Plus, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NewActivity from "@/components/Stadium/NewActivity";
import ActivityForm from "@/components/Stadium/ActivityForm";
import OneToOnePreForm from "@/components/Stadium/OneToOnePreForm";
import OneToOnePostForm from "@/components/Stadium/OneToOnePostForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserLogging } from "@/hooks/useUserLogging";
import { useAuth } from "@/hooks/useAuth";
import { useChildData } from "@/hooks/useChildData";
import { PlayerViewIndicator } from "@/components/layout/PlayerViewIndicator";

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
  const { toast } = useToast();
  const { user } = useAuth();
  const { logActivity, logActivityCompletion } = useUserLogging();
  const { childId: currentChildId, loading: childLoading } = useChildData();
  
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<ActivityData | null>(null);
  const [incompleteActivities, setIncompleteActivities] = useState<IncompleteActivity[]>([]);
  const [resumingActivity, setResumingActivity] = useState<IncompleteActivity | null>(null);
  
  // One-to-One flow state
  const [showOneToOnePreForm, setShowOneToOnePreForm] = useState(false);
  const [showOneToOnePostForm, setShowOneToOnePostForm] = useState(false);
  const [oneToOnePreData, setOneToOnePreData] = useState<any>(null);

  useEffect(() => {
    if (currentChildId) {
      loadIncompleteActivities();
    }
  }, [currentChildId]);

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
    if (!currentChildId) return;
    
    try {
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('child_id', currentChildId)
        .eq('pre_activity_completed', true)
        .eq('post_activity_completed', false)
        .order('created_at', { ascending: false });
      
      if (activitiesError) {
        console.error('Error loading incomplete activities:', activitiesError);
        return;
      }
      
      if (activities) {
        setIncompleteActivities(activities);
      }
    } catch (error) {
      console.error('Error loading incomplete activities:', error);
    }
  };

  const handleResumeActivity = async (activity: IncompleteActivity) => {
    const activityData: ActivityData = {
      name: activity.activity_name,
      type: activity.activity_type,
      date: new Date(activity.activity_date),
    };
    
    setCurrentActivity(activityData);
    setResumingActivity(activity);
    
    // For 1to1 activities, load pre-data and go to post form
    if (activity.activity_type === '1to1') {
      try {
        const { data: fullActivity, error } = await supabase
          .from('activities')
          .select('*')
          .eq('id', activity.id)
          .single();
          
        if (fullActivity && fullActivity.pre_activity_data) {
          setOneToOnePreData(fullActivity.pre_activity_data);
          setShowOneToOnePostForm(true);
        } else {
          // Fallback to regular form if no pre-data found
          setShowActivityForm(true);
        }
      } catch (error) {
        console.error('Error loading one-to-one pre-data:', error);
        setShowActivityForm(true);
      }
    } else {
      setShowActivityForm(true);
    }
  };

  const handleNewActivitySubmit = (activity: ActivityData) => {
    setCurrentActivity(activity);
    setShowNewActivity(false);
    
    // Route to One-to-One forms if activity type is 1to1
    if (activity.type === '1to1') {
      setShowOneToOnePreForm(true);
    } else {
      setShowActivityForm(true);
    }
  };

  const handleActivityFormComplete = () => {
    setShowActivityForm(false);
    setCurrentActivity(null);
    setResumingActivity(null);
    
    // Trigger event to update home page schedule status
    window.dispatchEvent(new CustomEvent('activityCompleted'));
    
    loadIncompleteActivities(); // Reload to update the list
  };

  const handleOneToOnePreComplete = async (preData: any) => {
    if (!currentChildId || !currentActivity) return;

    try {
      // Create activity record with pre-data
      const { data: activityRecord, error: activityError } = await supabase
        .from('activities')
        .insert({
          child_id: currentChildId,
          activity_name: currentActivity.name,
          activity_type: '1to1',
          activity_date: currentActivity.date.toISOString().split('T')[0],
          pre_activity_completed: true,
          pre_activity_data: preData,
          points_awarded: 20 // Base points for completing pre-activity
        })
        .select()
        .single();

      if (activityError) {
        console.error('Error creating one-to-one activity:', activityError);
        toast({
          title: "Error",
          description: "Failed to save session data. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Log activity creation
      await logActivity(currentActivity.name, '1to1', currentChildId);

      setOneToOnePreData(preData);
      setShowOneToOnePreForm(false);
      setShowOneToOnePostForm(true);

      toast({
        title: "Session Started! 🎉",
        description: "Great planning! Now complete your technical session."
      });
    } catch (error) {
      console.error('Error handling one-to-one pre completion:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleOneToOnePostComplete = async (postData: any) => {
    if (!currentChildId || !currentActivity) return;

    try {
      // Find the activity record to update
      const { data: activities, error: findError } = await supabase
        .from('activities')
        .select('*')
        .eq('child_id', currentChildId)
        .eq('activity_name', currentActivity.name)
        .eq('activity_type', '1to1')
        .eq('post_activity_completed', false)
        .order('created_at', { ascending: false })
        .limit(1);

      if (findError || !activities || activities.length === 0) {
        console.error('Error finding activity to update:', findError);
        toast({
          title: "Error",
          description: "Could not find session to update. Please try again.",
          variant: "destructive"
        });
        return;
      }

      const activity = activities[0];

      // Calculate points based on ratings and content
      const ratings = postData.one_to_one.ratings;
      const avgRating = (ratings.work_rate + ratings.performance + ratings.confidence_during_session + 
                        ratings.enjoyment + ratings.focus_concentration) / 5;
      
      const wordCount = (postData.one_to_one.what_went_well + postData.one_to_one.what_to_improve_next).split(' ').length;
      const postPoints = Math.round(avgRating * 2) + (wordCount * 2) + (postData.one_to_one.goal_achieved ? 10 : 0) + 15;

      // Update activity with post-data
      const { error: updateError } = await supabase
        .from('activities')
        .update({
          post_activity_completed: true,
          post_activity_data: postData,
          points_awarded: activity.points_awarded + postPoints
        })
        .eq('id', activity.id);

      if (updateError) {
        console.error('Error updating activity:', updateError);
        toast({
          title: "Error",
          description: "Failed to save session reflection. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Create progress entry with specific ratings
      await supabase.from('progress_entries').insert({
        child_id: currentChildId,
        entry_type: 'activity',
        entry_value: {
          activity_id: activity.id,
          phase: 'post_activity',
          ratings: {
            work_rate: ratings.work_rate,
            performance: ratings.performance,
            confidence: ratings.confidence_during_session,
            focus: ratings.focus_concentration
          },
          avg_rating: avgRating,
          goal_achieved: postData.one_to_one.goal_achieved
        },
        entry_date: currentActivity.date.toISOString().split('T')[0],
        points_earned: postPoints,
        activity_id: activity.id
      });

      // Log completion
      await logActivityCompletion(currentActivity.name, 'post', currentChildId);

      toast({
        title: `🎉 Session Complete! +${postPoints} points`,
        description: "Great technical work! Your progress has been saved."
      });

      // Trigger event to update home page schedule status
      window.dispatchEvent(new CustomEvent('activityCompleted'));

      // Reset state
      setShowOneToOnePostForm(false);
      setCurrentActivity(null);
      setOneToOnePreData(null);
      loadIncompleteActivities();
    } catch (error) {
      console.error('Error completing one-to-one session:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleOneToOneBack = () => {
    if (showOneToOnePostForm) {
      setShowOneToOnePostForm(false);
      setShowOneToOnePreForm(true);
    } else {
      setShowOneToOnePreForm(false);
      setCurrentActivity(null);
      setOneToOnePreData(null);
    }
  };

  if (showNewActivity) {
    return (
      <NewActivity
        onSubmit={handleNewActivitySubmit}
        onCancel={() => setShowNewActivity(false)}
      />
    );
  }

  if (showOneToOnePreForm && currentActivity) {
    return (
      <OneToOnePreForm
        activity={currentActivity}
        onComplete={handleOneToOnePreComplete}
        onBack={handleOneToOneBack}
      />
    );
  }

  if (showOneToOnePostForm && currentActivity && oneToOnePreData) {
    return (
      <OneToOnePostForm
        activity={currentActivity}
        preData={oneToOnePreData}
        onComplete={handleOneToOnePostComplete}
        onBack={handleOneToOneBack}
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

  if (childLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <PlayerViewIndicator />
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
                        {activity.activity_type === '1to1' ? 'Complete Session' : 'Resume Post-Match'}
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
                  className="w-full h-auto p-4 text-left border-2 hover:border-primary/30 hover:opacity-80 transition-opacity"
                  onClick={() => {
                    // Force opening in external browser
                    const link = document.createElement('a');
                    link.href = 'https://www.youtube.com/watch?v=3lfBP1OdoG0';
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🧘</span>
                    <div>
                      <p className="font-medium">Start Yoga</p>
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 text-left border-2 hover:border-primary/30 hover:opacity-80 transition-opacity"
                  onClick={() => {
                    // Force opening in external browser
                    const link = document.createElement('a');
                    link.href = 'https://drive.google.com/file/d/12tItFhl7cqpjuPpjDwO_WRHDy_9ZOOK0/view?usp=sharing';
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎧</span>
                    <div>
                      <p className="font-medium">Start Visualisation</p>
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 text-left border-2 hover:border-primary/30 hover:opacity-80 transition-opacity"
                  onClick={() => {
                    // Force opening in external browser
                    const link = document.createElement('a');
                    link.href = 'https://drive.google.com/file/d/1UnpaPW8N4QzZfUTcukITMoaIVPoiZxR4/view?usp=sharing';
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🦁</span>
                    <div>
                      <p className="font-medium">Listen: Face the Lion</p>
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
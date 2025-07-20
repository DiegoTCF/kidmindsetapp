import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CheckCircle, Clock, Trophy, Target, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Activity {
  id: string;
  activity_name: string;
  activity_type: string;
  activity_date: string;
  final_score?: string;
  goals_scored?: number;
  assists_made?: number;
  pre_activity_completed: boolean;
  post_activity_completed: boolean;
  pre_activity_data?: any;
  post_activity_data?: any;
  points_awarded: number;
  created_at: string;
}

interface ActivityLogProps {
  selectedFilter: string;
}

export default function ActivityLog({ selectedFilter }: ActivityLogProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadActivities();
  }, [selectedFilter]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      
      // Get current child ID
      const { data: children } = await supabase
        .from('children')
        .select('id')
        .limit(1);
      
      if (!children || children.length === 0) return;
      
      let query = supabase
        .from('activities')
        .select('*')
        .eq('child_id', children[0].id)
        .order('activity_date', { ascending: false });

      if (selectedFilter !== 'All') {
        query = query.eq('activity_type', selectedFilter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (activity: Activity) => {
    if (activity.post_activity_completed) {
      return <Badge className="bg-success text-success-foreground">Complete</Badge>;
    } else if (activity.pre_activity_completed) {
      return <Badge variant="secondary">Pre Only</Badge>;
    } else {
      return <Badge variant="outline">Incomplete</Badge>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Match':
        return <Trophy className="w-4 h-4" />;
      case 'Training':
        return <Target className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const handleDeleteActivity = async (activityId: string, activityName: string, points: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent opening activity details
    
    try {
      // Optimistically remove from UI first
      setActivities(prev => prev.filter(activity => activity.id !== activityId));
      
      // Delete the activity from database
      const { error: deleteError } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId);

      if (deleteError) {
        // If delete failed, restore the activity in UI
        loadActivities();
        throw deleteError;
      }

      // Update child's points (subtract the deleted activity points)
      const { data: children } = await supabase
        .from('children')
        .select('id, points')
        .limit(1);
        
      if (children && children.length > 0) {
        const newPoints = Math.max(0, children[0].points - points); // Ensure points don't go negative
        
        const { error: pointsError } = await supabase
          .from('children')
          .update({ points: newPoints })
          .eq('id', children[0].id);
          
        if (pointsError) {
          console.error('Error updating points:', pointsError);
          // Don't throw here as the activity was already deleted successfully
        }
      }

      // Close activity detail view if it was the deleted activity
      if (selectedActivity?.id === activityId) {
        setSelectedActivity(null);
      }
      
      toast({
        title: "Activity deleted successfully",
        description: `"${activityName}" has been removed from your log.`,
      });
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        title: "Delete Failed",
        description: "Could not delete the activity. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Loading activities...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedActivity) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Activity Details</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setSelectedActivity(null)}>
              Back to List
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{selectedActivity.activity_name}</h3>
              <p className="text-muted-foreground">
                {selectedActivity.activity_type} • {formatDate(selectedActivity.activity_date)}
              </p>
            </div>
            
            {selectedActivity.activity_type === 'Match' && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                {selectedActivity.final_score && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Final Score</p>
                    <p className="font-semibold">{selectedActivity.final_score}</p>
                  </div>
                )}
                {selectedActivity.goals_scored !== undefined && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Goals</p>
                    <p className="font-semibold">{selectedActivity.goals_scored}</p>
                  </div>
                )}
                {selectedActivity.assists_made !== undefined && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Assists</p>
                    <p className="font-semibold">{selectedActivity.assists_made}</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                {getStatusBadge(selectedActivity)}
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Points Earned</p>
                <p className="font-semibold text-primary">{selectedActivity.points_awarded}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                {selectedActivity.pre_activity_completed ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <Clock className="w-5 h-5 text-muted-foreground" />
                )}
                <span className="text-sm">Pre-Activity</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                {selectedActivity.post_activity_completed ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <Clock className="w-5 h-5 text-muted-foreground" />
                )}
                <span className="text-sm">Post-Activity</span>
              </div>
            </div>
            
            {/* Pre-Activity Details */}
            {selectedActivity.pre_activity_completed && selectedActivity.pre_activity_data && (
              <div className="space-y-2">
                <h4 className="font-medium text-primary">Pre-Activity Answers</h4>
                <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                  {selectedActivity.pre_activity_data.confidence && (
                    <div>
                      <p className="text-sm font-medium">Confidence Level:</p>
                      <p className="text-sm text-muted-foreground">{selectedActivity.pre_activity_data.confidence}/10</p>
                    </div>
                  )}
                  {selectedActivity.pre_activity_data.intention && (
                    <div>
                      <p className="text-sm font-medium">Intention:</p>
                      <p className="text-sm text-muted-foreground">{selectedActivity.pre_activity_data.intention}</p>
                    </div>
                  )}
                  {selectedActivity.pre_activity_data.items && Array.isArray(selectedActivity.pre_activity_data.items) && (
                    <div>
                      <p className="text-sm font-medium">Pre-Activity Items:</p>
                      <div className="space-y-1">
                        {selectedActivity.pre_activity_data.items.map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className={item.completed ? "text-success" : "text-muted-foreground"}>
                              {item.name}
                            </span>
                            <span className="text-primary">+{item.points}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedActivity.pre_activity_data.completedAt && (
                    <div>
                      <p className="text-sm font-medium">Completed At:</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedActivity.pre_activity_data.completedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Post-Activity Details */}
            {selectedActivity.post_activity_completed && selectedActivity.post_activity_data && (
              <div className="space-y-2">
                <h4 className="font-medium text-primary">Post-Activity Reflection & Journal</h4>
                <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                  {/* Mood and Ratings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedActivity.post_activity_data.mood && (
                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-sm font-medium">Mood</p>
                        <p className="text-2xl font-bold text-primary">{selectedActivity.post_activity_data.mood}/5</p>
                      </div>
                    )}
                    {selectedActivity.post_activity_data.confidence && (
                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-sm font-medium">Confidence</p>
                        <p className="text-2xl font-bold text-primary">{selectedActivity.post_activity_data.confidence}/10</p>
                      </div>
                    )}
                    {selectedActivity.post_activity_data.satisfaction && (
                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-sm font-medium">Satisfaction</p>
                        <p className="text-2xl font-bold text-primary">{selectedActivity.post_activity_data.satisfaction}/10</p>
                      </div>
                    )}
                  </div>

                  {/* Journal Entries */}
                  <div className="space-y-4">
                    {selectedActivity.post_activity_data.journalPrompts?.wentWell && (
                      <div className="p-4 bg-background rounded-lg border-l-4 border-success">
                        <p className="text-sm font-medium text-success mb-2">✅ What went well:</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{selectedActivity.post_activity_data.journalPrompts.wentWell}</p>
                      </div>
                    )}
                    
                    {selectedActivity.post_activity_data.journalPrompts?.couldImprove && (
                      <div className="p-4 bg-background rounded-lg border-l-4 border-warning">
                        <p className="text-sm font-medium text-warning mb-2">🔄 What could improve:</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{selectedActivity.post_activity_data.journalPrompts.couldImprove}</p>
                      </div>
                    )}
                    
                    {selectedActivity.post_activity_data.journalPrompts?.whatAffected && (
                      <div className="p-4 bg-background rounded-lg border-l-4 border-accent">
                        <p className="text-sm font-medium text-accent mb-2">🌟 What affected you today:</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{selectedActivity.post_activity_data.journalPrompts.whatAffected}</p>
                      </div>
                    )}
                  </div>

                  {/* Super Behaviour Ratings */}
                  {selectedActivity.post_activity_data.superBehaviours && (
                    <div className="space-y-3">
                      <h5 className="font-medium text-primary">Super Behaviour Ratings</h5>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedActivity.post_activity_data.superBehaviours.braveOnBall && (
                          <div className="text-center p-3 bg-background rounded-lg">
                            <p className="text-sm font-medium">Brave on Ball</p>
                            <p className="text-xl font-bold text-primary">{selectedActivity.post_activity_data.superBehaviours.braveOnBall}/10</p>
                          </div>
                        )}
                        {selectedActivity.post_activity_data.superBehaviours.braveOffBall && (
                          <div className="text-center p-3 bg-background rounded-lg">
                            <p className="text-sm font-medium">Brave off Ball</p>
                            <p className="text-xl font-bold text-primary">{selectedActivity.post_activity_data.superBehaviours.braveOffBall}/10</p>
                          </div>
                        )}
                        {selectedActivity.post_activity_data.superBehaviours.electric && (
                          <div className="text-center p-3 bg-background rounded-lg">
                            <p className="text-sm font-medium">Electric</p>
                            <p className="text-xl font-bold text-primary">{selectedActivity.post_activity_data.superBehaviours.electric}/10</p>
                          </div>
                        )}
                        {selectedActivity.post_activity_data.superBehaviours.aggressive && (
                          <div className="text-center p-3 bg-background rounded-lg">
                            <p className="text-sm font-medium">Aggressive</p>
                            <p className="text-xl font-bold text-primary">{selectedActivity.post_activity_data.superBehaviours.aggressive}/10</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedActivity.post_activity_data.completedAt && (
                    <div className="pt-3 border-t border-muted">
                      <p className="text-xs text-muted-foreground">
                        Completed on: {new Date(selectedActivity.post_activity_data.completedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-lg">Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setSelectedActivity(activity)}
              >
                <div className="flex items-center gap-3">
                  {getActivityIcon(activity.activity_type)}
                  <div>
                    <p className="font-medium">{activity.activity_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.activity_type} • {formatDate(activity.activity_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(activity)}
                  <div className="text-right mr-2">
                    <p className="text-sm font-semibold text-primary">
                      +{activity.points_awarded}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Activity</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{activity.activity_name}"? 
                          This will remove the activity and subtract {activity.points_awarded} points from your total. 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => handleDeleteActivity(activity.id, activity.activity_name, activity.points_awarded, e)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Activity
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            {selectedFilter === 'All' 
              ? "No activities completed yet. Start your first activity in the Stadium!"
              : `No ${selectedFilter} activities found. Try a different filter.`
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
}
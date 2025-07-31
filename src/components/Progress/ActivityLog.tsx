import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CheckCircle, Clock, Trophy, Target, Trash2 } from "lucide-react";
import { CustomIcon } from "@/components/ui/custom-emoji";
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
  worry_reason?: string;
  worry_answers?: any;
}

interface ActivityLogProps {
  selectedFilter: string;
  childId?: string;
}

export default function ActivityLog({ selectedFilter, childId }: ActivityLogProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadActivities();
  }, [selectedFilter, childId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      
      let targetChildId = childId;
      
      // If no childId provided, get current user's child ID using RLS-safe function
      if (!targetChildId) {
        console.log('[ProgressPage] ActivityLog: Getting current user child ID...');
        
        const { data: childIdResult, error: childIdError } = await supabase
          .rpc('get_current_user_child_id');
        
        if (childIdError) {
          console.error('[ProgressPage] ActivityLog: Error getting child ID:', childIdError);
          return;
        }
        
        if (!childIdResult) {
          console.log('[ProgressPage] ActivityLog: No child found for current user');
          return;
        }
        
        targetChildId = childIdResult;
        console.log('[ProgressPage] ActivityLog: Using child ID:', targetChildId);
      }
      
      let query = supabase
        .from('activities')
        .select('*')
        .eq('child_id', targetChildId)
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
    
    // Get the activity data before deletion for notification
    const activityToDelete = activities.find(activity => activity.id === activityId);
    const wasIncomplete = activityToDelete ? !activityToDelete.post_activity_completed : false;
    
    console.log('=== DELETE ACTIVITY DEBUG ===');
    console.log('Activity ID to delete:', activityId);
    console.log('Activity name:', activityName);
    console.log('Activity found in local state:', activityToDelete);
    console.log('Current user auth state:', await supabase.auth.getUser());
    
    try {
      // First, let's verify the activity exists in the database and we can access it
      const { data: verifyActivity, error: verifyError } = await supabase
        .from('activities')
        .select('id, activity_name, child_id')
        .eq('id', activityId)
        .single();
      
      console.log('Verification query result:', { verifyActivity, verifyError });
      
      if (verifyError) {
        console.error('Cannot find activity to delete:', verifyError);
        throw new Error(`Activity not found: ${verifyError.message}`);
      }
      
      if (!verifyActivity) {
        console.error('Activity does not exist in database');
        throw new Error('Activity not found in database');
      }
      
      // Optimistically remove from UI first
      setActivities(prev => prev.filter(activity => activity.id !== activityId));
      
      console.log('Attempting database deletion...');
      
      // Delete the activity from database
      const { error: deleteError, count } = await supabase
        .from('activities')
        .delete({ count: 'exact' })
        .eq('id', activityId);

      console.log('Delete operation result:', { deleteError, count });

      if (deleteError) {
        console.error('Database delete failed:', deleteError);
        console.error('Delete error details:', {
          code: deleteError.code,
          message: deleteError.message,
          details: deleteError.details,
          hint: deleteError.hint
        });
        
        // If delete failed, restore the activity in UI
        loadActivities();
        throw new Error(`Database deletion failed: ${deleteError.message}`);
      }

      if (count === 0) {
        console.warn('No rows were deleted - activity might not exist or user lacks permissions');
        loadActivities();
        throw new Error('No rows were deleted. You may not have permission to delete this activity.');
      }

      console.log('Successfully deleted activity from database. Rows affected:', count);

      // Update child's points (subtract the deleted activity points)
      console.log('Updating child points...');
      const { data: children } = await supabase
        .from('children')
        .select('id, points')
        .limit(1);
        
      if (children && children.length > 0) {
        const newPoints = Math.max(0, children[0].points - points); // Ensure points don't go negative
        console.log('Updating points from', children[0].points, 'to', newPoints);
        
        const { error: pointsError } = await supabase
          .from('children')
          .update({ points: newPoints })
          .eq('id', children[0].id);
          
        if (pointsError) {
          console.error('Error updating points:', pointsError);
          // Don't throw here as the activity was already deleted successfully
        } else {
          console.log('Successfully updated child points to:', newPoints);
        }
      }

      // Close activity detail view if it was the deleted activity
      if (selectedActivity?.id === activityId) {
        setSelectedActivity(null);
      }

      // Force a fresh reload from database to ensure consistency
      setTimeout(() => {
        loadActivities();
      }, 100);

      // Notify Stadium component to reload incomplete activities
      window.dispatchEvent(new CustomEvent('activityDeleted', { 
        detail: { activityId, wasIncomplete }
      }));
      
      console.log('=== DELETE SUCCESS ===');
      
      toast({
        title: "Activity deleted successfully",
        description: `"${activityName}" has been removed from your log.`,
      });
    } catch (error) {
      console.error('=== DELETE FAILED ===');
      console.error('Full error object:', error);
      
      let errorMessage = "Something went wrong while deleting. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Delete Failed",
        description: errorMessage,
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

            {/* Mindset Support Section */}
            {selectedActivity.worry_reason && (
              <div className="space-y-2">
                <h4 className="font-medium text-primary flex items-center gap-2">
                  💙 Mindset Support
                </h4>
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
                  <div>
                    <p className="text-sm font-medium text-primary">Worry:</p>
                    <p className="text-sm text-foreground">{selectedActivity.worry_reason}</p>
                  </div>
                  
                  {selectedActivity.worry_answers && typeof selectedActivity.worry_answers === 'object' && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-primary">Support Session Responses:</p>
                      <div className="space-y-2">
                        {Object.entries(selectedActivity.worry_answers).map(([questionId, answer], index) => (
                          <div key={questionId} className="p-2 bg-background/80 rounded text-sm">
                            <p className="text-foreground/90">{String(answer)}</p>
                          </div>
                        ))}
                      </div>
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
                         <div className="flex items-center gap-2 text-sm font-medium text-success mb-2">
                           <CustomIcon type="good" size="sm" />
                           <span>What went well:</span>
                         </div>
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
                    <div className="space-y-4">
                      <h5 className="font-medium text-primary">Super Behaviour Ratings</h5>
                      <div className="space-y-4">
                        {selectedActivity.post_activity_data.superBehaviours.braveOnBall && (
                          <div className="p-4 bg-background rounded-lg border border-border">
                            <div className="text-center mb-3">
                              <p className="text-sm font-medium">🔥 Brave on Ball</p>
                              <p className="text-2xl font-bold text-primary">
                                {(() => {
                                  const ratings = selectedActivity.post_activity_data.superBehaviours.braveOnBall;
                                  if (typeof ratings === 'object' && ratings.question1 !== undefined) {
                                    const avg = (ratings.question1 + ratings.question2 + ratings.question3 + ratings.question4) / 4;
                                    return `${avg.toFixed(1)}/10`;
                                  }
                                  return `${ratings}/10`;
                                })()}
                              </p>
                            </div>
                            {(() => {
                              const ratings = selectedActivity.post_activity_data.superBehaviours.braveOnBall;
                              if (typeof ratings === 'object' && ratings.question1 !== undefined) {
                                const questions = [
                                  'How often did you try to take players on or play forward?',
                                  'How much intent did you show when doing it — did you really go for it?',
                                  'Did you take risks even when you made mistakes or lost the ball?',
                                  'How much did you play to win your 1v1s, not just avoid losing the ball?'
                                ];
                                return (
                                  <div className="space-y-2">
                                    {questions.map((question, index) => (
                                      <div key={index} className="flex justify-between items-start text-xs">
                                        <span className="flex-1 mr-2">{question}</span>
                                        <span className="font-medium text-primary">
                                          {ratings[`question${index + 1}`]}/10
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        )}
                        
                        {selectedActivity.post_activity_data.superBehaviours.braveOffBall && (
                          <div className="p-4 bg-background rounded-lg border border-border">
                            <div className="text-center mb-3">
                              <p className="text-sm font-medium">🧱 Brave off Ball</p>
                              <p className="text-2xl font-bold text-primary">
                                {(() => {
                                  const ratings = selectedActivity.post_activity_data.superBehaviours.braveOffBall;
                                  if (typeof ratings === 'object' && ratings.question1 !== undefined) {
                                    const avg = (ratings.question1 + ratings.question2 + ratings.question3 + ratings.question4) / 4;
                                    return `${avg.toFixed(1)}/10`;
                                  }
                                  return `${ratings}/10`;
                                })()}
                              </p>
                            </div>
                            {(() => {
                              const ratings = selectedActivity.post_activity_data.superBehaviours.braveOffBall;
                              if (typeof ratings === 'object' && ratings.question1 !== undefined) {
                                const questions = [
                                  'How often did you show for the ball or move into space?',
                                  'How much intent did you show when trying to get involved?',
                                  'Did you keep moving even when things weren\'t going well?',
                                  'Did you create good angles and options for your teammates?'
                                ];
                                return (
                                  <div className="space-y-2">
                                    {questions.map((question, index) => (
                                      <div key={index} className="flex justify-between items-start text-xs">
                                        <span className="flex-1 mr-2">{question}</span>
                                        <span className="font-medium text-primary">
                                          {ratings[`question${index + 1}`]}/10
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        )}
                        
                        {selectedActivity.post_activity_data.superBehaviours.electric && (
                          <div className="p-4 bg-background rounded-lg border border-border">
                            <div className="text-center mb-3">
                              <p className="text-sm font-medium">⚡ Electric</p>
                              <p className="text-2xl font-bold text-primary">
                                {(() => {
                                  const ratings = selectedActivity.post_activity_data.superBehaviours.electric;
                                  if (typeof ratings === 'object' && ratings.question1 !== undefined) {
                                    const avg = (ratings.question1 + ratings.question2 + ratings.question3 + ratings.question4) / 4;
                                    return `${avg.toFixed(1)}/10`;
                                  }
                                  return `${ratings}/10`;
                                })()}
                              </p>
                            </div>
                            {(() => {
                              const ratings = selectedActivity.post_activity_data.superBehaviours.electric;
                              if (typeof ratings === 'object' && ratings.question1 !== undefined) {
                                const questions = [
                                  'How much energy did you bring to the game today?',
                                  'How quick were your reactions during the game?',
                                  'How fast and sharp were your decisions?',
                                  'Did you move with speed and urgency when the team needed it?'
                                ];
                                return (
                                  <div className="space-y-2">
                                    {questions.map((question, index) => (
                                      <div key={index} className="flex justify-between items-start text-xs">
                                        <span className="flex-1 mr-2">{question}</span>
                                        <span className="font-medium text-primary">
                                          {ratings[`question${index + 1}`]}/10
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        )}
                        
                        {selectedActivity.post_activity_data.superBehaviours.aggressive && (
                          <div className="p-4 bg-background rounded-lg border border-border">
                            <div className="text-center mb-3">
                              <p className="text-sm font-medium">💢 Aggressive</p>
                              <p className="text-2xl font-bold text-primary">
                                {(() => {
                                  const ratings = selectedActivity.post_activity_data.superBehaviours.aggressive;
                                  if (typeof ratings === 'object' && ratings.question1 !== undefined) {
                                    const avg = (ratings.question1 + ratings.question2 + ratings.question3 + ratings.question4) / 4;
                                    return `${avg.toFixed(1)}/10`;
                                  }
                                  return `${ratings}/10`;
                                })()}
                              </p>
                            </div>
                            {(() => {
                              const ratings = selectedActivity.post_activity_data.superBehaviours.aggressive;
                              if (typeof ratings === 'object' && ratings.question1 !== undefined) {
                                const questions = [
                                  'How often did you go into 1v1 duels or physical challenges?',
                                  'When you pressed or challenged, how committed were you?',
                                  'How often did you win your battles or at least make it difficult?',
                                  'How much did you enjoy competing and fighting for the ball?'
                                ];
                                return (
                                  <div className="space-y-2">
                                    {questions.map((question, index) => (
                                      <div key={index} className="flex justify-between items-start text-xs">
                                        <span className="flex-1 mr-2">{question}</span>
                                        <span className="font-medium text-primary">
                                          {ratings[`question${index + 1}`]}/10
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                );
                              }
                              return null;
                            })()}
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
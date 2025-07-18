import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Trophy, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      +{activity.points_awarded}
                    </p>
                  </div>
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
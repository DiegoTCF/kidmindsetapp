import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Target, Trophy } from "lucide-react";

interface SubscriptionInfo {
  id: string;
  plan_name: string;
  billing_type: 'fixed' | 'monthly';
  start_date: string;
  end_date: string | null;
  sessions_used_in_period: number;
  sessions_per_period: number;
  total_sessions_used: number;
  current_period_start: string;
  current_period_end: string;
  status: string;
}

export function MySubscriptionCard() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      // Get current user's child ID
      const { data: childData } = await supabase.rpc('get_current_user_child_id');
      
      if (!childData) {
        setLoading(false);
        return;
      }

      // Get active subscription for this child
      const { data, error } = await supabase
        .from('coaching_subscriptions')
        .select(`
          id,
          start_date,
          end_date,
          sessions_used_in_period,
          sessions_per_period,
          total_sessions_used,
          current_period_start,
          current_period_end,
          status,
          coaching_plans:plan_id (name, billing_type)
        `)
        .eq('child_id', childData)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        const planData = data.coaching_plans as any;
        setSubscription({
          id: data.id,
          plan_name: planData?.name || 'Unknown Plan',
          billing_type: planData?.billing_type || 'monthly',
          start_date: data.start_date,
          end_date: data.end_date,
          sessions_used_in_period: data.sessions_used_in_period,
          sessions_per_period: data.sessions_per_period,
          total_sessions_used: data.total_sessions_used,
          current_period_start: data.current_period_start,
          current_period_end: data.current_period_end,
          status: data.status,
        });
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return null; // Don't show anything if no subscription
  }

  const sessionsRemaining = Math.max(0, subscription.sessions_per_period - subscription.sessions_used_in_period);
  const sessionProgress = (subscription.sessions_used_in_period / subscription.sessions_per_period) * 100;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            My Coaching Plan
          </CardTitle>
          <Badge variant="outline" className="capitalize">
            {subscription.billing_type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="font-semibold text-lg">{subscription.plan_name}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <Calendar className="h-3 w-3" />
            Started {format(new Date(subscription.start_date), 'MMM d, yyyy')}
            {subscription.end_date && (
              <span> · Ends {format(new Date(subscription.end_date), 'MMM d, yyyy')}</span>
            )}
          </div>
        </div>

        {subscription.billing_type === 'monthly' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sessions this month</span>
              <span className="font-medium">
                {subscription.sessions_used_in_period} / {subscription.sessions_per_period}
              </span>
            </div>
            <Progress value={sessionProgress} className="h-2" />
            <div className="text-sm text-muted-foreground">
              {sessionsRemaining} session{sessionsRemaining !== 1 ? 's' : ''} remaining
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t">
          <Trophy className="h-4 w-4 text-primary" />
          <span className="text-sm">
            <span className="font-semibold">{subscription.total_sessions_used}</span>
            <span className="text-muted-foreground"> total sessions completed</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

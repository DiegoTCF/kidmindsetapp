import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { CoachingSubscription, CoachingPlan } from "@/pages/ClientManager";

interface EditSubscriptionDialogProps {
  subscription: CoachingSubscription | null;
  plans: CoachingPlan[];
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditSubscriptionDialog({ subscription, plans, onOpenChange, onSuccess }: EditSubscriptionDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [status, setStatus] = useState<'active' | 'paused' | 'ended'>('active');
  const [sessionsPerPeriod, setSessionsPerPeriod] = useState(2);
  const [endDate, setEndDate] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (subscription) {
      setStatus(subscription.status);
      setSessionsPerPeriod(subscription.sessions_per_period);
      setEndDate(subscription.end_date || "");
      setAdminNotes(subscription.admin_notes || "");
    }
  }, [subscription]);

  const handleSubmit = async () => {
    if (!subscription) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('coaching_subscriptions')
        .update({
          status,
          sessions_per_period: sessionsPerPeriod,
          end_date: endDate || null,
          admin_notes: adminNotes || null,
        })
        .eq('id', subscription.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription updated successfully",
      });
      
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!subscription) return null;

  return (
    <Dialog open={!!subscription} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
          <DialogDescription>
            Update subscription for {subscription.child_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 bg-muted rounded-lg space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plan:</span>
              <span className="font-medium">{subscription.plan_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Sessions:</span>
              <span className="font-medium">{subscription.total_sessions_used}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Session:</span>
              <span className="font-medium">
                {subscription.last_session_date 
                  ? format(new Date(subscription.last_session_date), 'MMM d, yyyy')
                  : 'Never'
                }
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as 'active' | 'paused' | 'ended')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sessions per Period</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={sessionsPerPeriod}
              onChange={(e) => setSessionsPerPeriod(parseInt(e.target.value) || 1)}
            />
          </div>

          {subscription.billing_type === 'fixed' && (
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Admin Notes</Label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Any notes about this client..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

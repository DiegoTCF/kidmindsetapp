import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CoachingSubscription } from "@/pages/ClientManager";

interface LogSessionDialogProps {
  subscription: CoachingSubscription | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function LogSessionDialog({ subscription, onOpenChange, onSuccess }: LogSessionDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");

  const isOverLimit = subscription 
    ? subscription.sessions_used_in_period >= subscription.sessions_per_period 
    : false;

  const handleSubmit = async () => {
    if (!subscription) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('log_coaching_session', {
        p_subscription_id: subscription.id,
        p_notes: notes || null,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; over_limit?: boolean };
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to log session');
      }

      toast({
        title: "Session Logged",
        description: result.over_limit 
          ? "Session logged. Warning: This exceeds the period limit!"
          : "Session logged successfully.",
        variant: result.over_limit ? "destructive" : "default",
      });
      
      setNotes("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error logging session:', error);
      toast({
        title: "Error",
        description: "Failed to log session",
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
          <DialogTitle>Log Session</DialogTitle>
          <DialogDescription>
            Record a coaching session for {subscription.child_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Sessions this period:</span>
            <span className="font-mono font-bold">
              {subscription.sessions_used_in_period} / {subscription.sessions_per_period}
            </span>
          </div>

          {isOverLimit && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This client has already used all their sessions for this period. 
                Logging will exceed the limit.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Session Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What was covered in this session..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Logging..." : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Log Session
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

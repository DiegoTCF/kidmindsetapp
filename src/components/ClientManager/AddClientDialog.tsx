import { useState, useEffect } from "react";
import { format, addWeeks, addMonths, startOfMonth, endOfMonth } from "date-fns";
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
import type { CoachingPlan } from "@/pages/ClientManager";

interface Child {
  id: string;
  name: string;
}

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: CoachingPlan[];
  onSuccess: () => void;
}

export function AddClientDialog({ open, onOpenChange, plans, onSuccess }: AddClientDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  
  // Form state
  const [childId, setChildId] = useState("");
  const [planId, setPlanId] = useState("");
  const [sessionsPerPeriod, setSessionsPerPeriod] = useState(2);
  const [periodType, setPeriodType] = useState<'week' | 'month'>('month');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const selectedPlan = plans.find(p => p.id === planId);

  useEffect(() => {
    if (open) {
      loadChildren();
    }
  }, [open]);

  useEffect(() => {
    if (selectedPlan) {
      // Set defaults from plan
      if (selectedPlan.default_sessions_per_period) {
        setSessionsPerPeriod(selectedPlan.default_sessions_per_period);
      }
      
      // Auto-calculate end date for fixed plans
      if (selectedPlan.billing_type === 'fixed' && selectedPlan.default_duration_weeks) {
        const start = new Date(startDate);
        const end = addWeeks(start, selectedPlan.default_duration_weeks);
        setEndDate(format(end, 'yyyy-MM-dd'));
      } else {
        setEndDate("");
      }
    }
  }, [planId, startDate, selectedPlan]);

  const loadChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setChildren(data || []);
    } catch (error) {
      console.error('Error loading children:', error);
    }
  };

  const handleSubmit = async () => {
    if (!childId || !planId) {
      toast({
        title: "Error",
        description: "Please select a player and plan",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const start = new Date(startDate);
      let periodStart: Date;
      let periodEnd: Date;

      if (periodType === 'month') {
        periodStart = startOfMonth(start);
        periodEnd = endOfMonth(start);
      } else {
        periodStart = start;
        periodEnd = addWeeks(start, 1);
      }

      const { error } = await supabase
        .from('coaching_subscriptions')
        .insert({
          child_id: childId,
          plan_id: planId,
          start_date: startDate,
          end_date: selectedPlan?.billing_type === 'fixed' ? endDate : null,
          status: 'active',
          sessions_per_period: sessionsPerPeriod,
          period_type: periodType,
          current_period_start: format(periodStart, 'yyyy-MM-dd'),
          current_period_end: format(periodEnd, 'yyyy-MM-dd'),
          admin_notes: adminNotes || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client added successfully",
      });
      
      // Reset form
      setChildId("");
      setPlanId("");
      setSessionsPerPeriod(2);
      setPeriodType('month');
      setStartDate(format(new Date(), 'yyyy-MM-dd'));
      setEndDate("");
      setAdminNotes("");
      
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Error",
        description: "Failed to add client",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Enroll a player in a coaching plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Player</Label>
            <Select value={childId} onValueChange={setChildId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a player" />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Plan</Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} ({plan.billing_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label>Period Type</Label>
              <Select value={periodType} onValueChange={(v) => setPeriodType(v as 'week' | 'month')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            {selectedPlan?.billing_type === 'fixed' && (
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Admin Notes (optional)</Label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Any notes about this client..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Adding..." : "Add Client"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

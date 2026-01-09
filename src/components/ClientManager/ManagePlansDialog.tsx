import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CoachingPlan } from "@/pages/ClientManager";

interface ManagePlansDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: CoachingPlan[];
  onRefresh: () => void;
}

export function ManagePlansDialog({ open, onOpenChange, plans, onRefresh }: ManagePlansDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CoachingPlan | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [billingType, setBillingType] = useState<'fixed' | 'monthly'>('monthly');
  const [defaultSessions, setDefaultSessions] = useState<number | null>(2);
  const [defaultDuration, setDefaultDuration] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setName("");
    setBillingType('monthly');
    setDefaultSessions(2);
    setDefaultDuration(null);
    setNotes("");
    setEditingPlan(null);
    setShowAddForm(false);
  };

  const startEdit = (plan: CoachingPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setBillingType(plan.billing_type);
    setDefaultSessions(plan.default_sessions_per_period);
    setDefaultDuration(plan.default_duration_weeks);
    setNotes(plan.notes || "");
    setShowAddForm(true);
  };

  const handleSubmit = async () => {
    if (!name) {
      toast({
        title: "Error",
        description: "Plan name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (editingPlan) {
        const { error } = await supabase
          .from('coaching_plans')
          .update({
            name,
            billing_type: billingType,
            default_sessions_per_period: billingType === 'monthly' ? defaultSessions : null,
            default_duration_weeks: billingType === 'fixed' ? defaultDuration : null,
            notes: notes || null,
          })
          .eq('id', editingPlan.id);

        if (error) throw error;
        toast({ title: "Plan updated" });
      } else {
        const { error } = await supabase
          .from('coaching_plans')
          .insert({
            name,
            billing_type: billingType,
            default_sessions_per_period: billingType === 'monthly' ? defaultSessions : null,
            default_duration_weeks: billingType === 'fixed' ? defaultDuration : null,
            notes: notes || null,
          });

        if (error) throw error;
        toast({ title: "Plan created" });
      }
      
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: "Error",
        description: "Failed to save plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      const { error } = await supabase
        .from('coaching_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
      
      toast({ title: "Plan deleted" });
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Error",
        description: error.message.includes('violates foreign key') 
          ? "Cannot delete plan - it's being used by subscriptions"
          : "Failed to delete plan",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Plans</DialogTitle>
          <DialogDescription>
            Create and manage coaching plan templates.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {!showAddForm ? (
            <>
              <div className="space-y-2 mb-4">
                {plans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{plan.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="capitalize text-xs">
                          {plan.billing_type}
                        </Badge>
                        {plan.billing_type === 'monthly' && plan.default_sessions_per_period && (
                          <span className="text-xs text-muted-foreground">
                            {plan.default_sessions_per_period} sessions/period
                          </span>
                        )}
                        {plan.billing_type === 'fixed' && plan.default_duration_weeks && (
                          <span className="text-xs text-muted-foreground">
                            {plan.default_duration_weeks} weeks
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(plan)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(plan.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button onClick={() => setShowAddForm(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add New Plan
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Plan Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Monthly 4 Sessions"
                />
              </div>

              <div className="space-y-2">
                <Label>Billing Type</Label>
                <Select value={billingType} onValueChange={(v) => setBillingType(v as 'fixed' | 'monthly')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly (recurring)</SelectItem>
                    <SelectItem value="fixed">Fixed (one-time program)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {billingType === 'monthly' && (
                <div className="space-y-2">
                  <Label>Default Sessions per Period</Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={defaultSessions || ""}
                    onChange={(e) => setDefaultSessions(parseInt(e.target.value) || null)}
                  />
                </div>
              )}

              {billingType === 'fixed' && (
                <div className="space-y-2">
                  <Label>Default Duration (weeks)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={52}
                    value={defaultDuration || ""}
                    onChange={(e) => setDefaultDuration(parseInt(e.target.value) || null)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Description of this plan..."
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                  {loading ? "Saving..." : (editingPlan ? "Update Plan" : "Create Plan")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

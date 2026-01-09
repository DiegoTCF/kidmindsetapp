import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Settings, AlertTriangle, Clock, TrendingDown } from "lucide-react";
import { ClientManagerTable } from "@/components/ClientManager/ClientManagerTable";
import { AddClientDialog } from "@/components/ClientManager/AddClientDialog";
import { ManagePlansDialog } from "@/components/ClientManager/ManagePlansDialog";
import { useToast } from "@/hooks/use-toast";

export interface CoachingPlan {
  id: string;
  name: string;
  billing_type: 'fixed' | 'monthly';
  default_sessions_per_period: number | null;
  default_duration_weeks: number | null;
  notes: string | null;
}

export interface CoachingSubscription {
  id: string;
  child_id: string;
  plan_id: string;
  start_date: string;
  end_date: string | null;
  status: 'active' | 'paused' | 'ended';
  sessions_per_period: number;
  period_type: 'week' | 'month';
  current_period_start: string;
  current_period_end: string;
  sessions_used_in_period: number;
  total_sessions_used: number;
  last_session_date: string | null;
  admin_notes: string | null;
  // Joined data
  child_name?: string;
  plan_name?: string;
  billing_type?: 'fixed' | 'monthly';
}

export default function ClientManager() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  
  const [subscriptions, setSubscriptions] = useState<CoachingSubscription[]>([]);
  const [plans, setPlans] = useState<CoachingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [managePlansOpen, setManagePlansOpen] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showEndingSoon, setShowEndingSoon] = useState(false);
  const [showLowUsage, setShowLowUsage] = useState(false);

  useEffect(() => {
    if (!adminLoading && isAdmin) {
      loadData();
      autoResetExpiredPeriods();
    }
  }, [adminLoading, isAdmin]);

  const autoResetExpiredPeriods = async () => {
    try {
      const { data, error } = await supabase.rpc('auto_reset_expired_periods');
      if (error) throw error;
      if (data && data > 0) {
        toast({
          title: "Periods Reset",
          description: `${data} subscription period(s) were automatically reset.`,
        });
      }
    } catch (error) {
      console.error('Error auto-resetting periods:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Load plans
      const { data: plansData, error: plansError } = await supabase
        .from('coaching_plans')
        .select('*')
        .order('name');
      
      if (plansError) throw plansError;
      setPlans(plansData as CoachingPlan[]);

      // Load subscriptions with child and plan info
      const { data: subsData, error: subsError } = await supabase
        .from('coaching_subscriptions')
        .select(`
          *,
          children:child_id (name),
          coaching_plans:plan_id (name, billing_type)
        `)
        .order('created_at', { ascending: false });
      
      if (subsError) throw subsError;
      
      const formattedSubs = (subsData || []).map((sub: any) => ({
        ...sub,
        child_name: sub.children?.name || 'Unknown',
        plan_name: sub.coaching_plans?.name || 'Unknown',
        billing_type: sub.coaching_plans?.billing_type || 'monthly',
      }));
      
      setSubscriptions(formattedSubs);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load client data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    navigate('/');
    return null;
  }

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter(sub => {
    if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
    if (typeFilter !== 'all' && sub.billing_type !== typeFilter) return false;
    
    if (showEndingSoon && sub.billing_type === 'fixed' && sub.end_date) {
      const daysUntilEnd = Math.ceil((new Date(sub.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilEnd > 14 || daysUntilEnd < 0) return false;
    }
    
    if (showLowUsage && sub.billing_type === 'monthly') {
      const periodStart = new Date(sub.current_period_start);
      const periodEnd = new Date(sub.current_period_end);
      const today = new Date();
      const periodProgress = (today.getTime() - periodStart.getTime()) / (periodEnd.getTime() - periodStart.getTime());
      if (periodProgress < 0.5 || sub.sessions_used_in_period > 0) return false;
    }
    
    return true;
  });

  // Stats
  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const endingSoonCount = subscriptions.filter(s => {
    if (s.billing_type !== 'fixed' || !s.end_date || s.status !== 'active') return false;
    const daysUntilEnd = Math.ceil((new Date(s.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilEnd <= 14 && daysUntilEnd >= 0;
  }).length;
  const lowUsageCount = subscriptions.filter(s => {
    if (s.billing_type !== 'monthly' || s.status !== 'active') return false;
    const periodStart = new Date(s.current_period_start);
    const periodEnd = new Date(s.current_period_end);
    const today = new Date();
    const periodProgress = (today.getTime() - periodStart.getTime()) / (periodEnd.getTime() - periodStart.getTime());
    return periodProgress >= 0.5 && s.sessions_used_in_period === 0;
  }).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Client Manager</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setManagePlansOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Manage Plans
            </Button>
            <Button onClick={() => setAddClientOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCount}</div>
            </CardContent>
          </Card>
          
          <Card className={endingSoonCount > 0 ? "border-warning" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Ending Soon (14 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{endingSoonCount}</div>
            </CardContent>
          </Card>
          
          <Card className={lowUsageCount > 0 ? "border-destructive" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Low Usage Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{lowUsageCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table */}
        <ClientManagerTable
          subscriptions={filteredSubscriptions}
          plans={plans}
          loading={loading}
          onRefresh={loadData}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          showEndingSoon={showEndingSoon}
          setShowEndingSoon={setShowEndingSoon}
          showLowUsage={showLowUsage}
          setShowLowUsage={setShowLowUsage}
        />

        {/* Dialogs */}
        <AddClientDialog
          open={addClientOpen}
          onOpenChange={setAddClientOpen}
          plans={plans}
          onSuccess={loadData}
        />
        
        <ManagePlansDialog
          open={managePlansOpen}
          onOpenChange={setManagePlansOpen}
          plans={plans}
          onRefresh={loadData}
        />
      </div>
    </div>
  );
}

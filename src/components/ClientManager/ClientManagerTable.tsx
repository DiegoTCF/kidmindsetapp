import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Play, Edit, Eye, AlertTriangle, Clock, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LogSessionDialog } from "./LogSessionDialog";
import { EditSubscriptionDialog } from "./EditSubscriptionDialog";
import type { CoachingSubscription, CoachingPlan } from "@/pages/ClientManager";

interface ClientManagerTableProps {
  subscriptions: CoachingSubscription[];
  plans: CoachingPlan[];
  loading: boolean;
  onRefresh: () => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  showEndingSoon: boolean;
  setShowEndingSoon: (v: boolean) => void;
  showLowUsage: boolean;
  setShowLowUsage: (v: boolean) => void;
}

export function ClientManagerTable({
  subscriptions,
  plans,
  loading,
  onRefresh,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  showEndingSoon,
  setShowEndingSoon,
  showLowUsage,
  setShowLowUsage,
}: ClientManagerTableProps) {
  const { toast } = useToast();
  const [logSessionSub, setLogSessionSub] = useState<CoachingSubscription | null>(null);
  const [editSub, setEditSub] = useState<CoachingSubscription | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-700 border-green-500/30">Active</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">Paused</Badge>;
      case 'ended':
        return <Badge className="bg-muted text-muted-foreground">Ended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAlertBadges = (sub: CoachingSubscription) => {
    const badges = [];
    
    // Ending soon (fixed plans within 14 days)
    if (sub.billing_type === 'fixed' && sub.end_date && sub.status === 'active') {
      const daysUntilEnd = differenceInDays(new Date(sub.end_date), new Date());
      if (daysUntilEnd <= 14 && daysUntilEnd >= 0) {
        badges.push(
          <Badge key="ending" className="bg-orange-500/20 text-orange-700 border-orange-500/30">
            <Clock className="h-3 w-3 mr-1" />
            {daysUntilEnd} days left
          </Badge>
        );
      }
    }
    
    // Low usage (monthly, halfway through period, 0 sessions)
    if (sub.billing_type === 'monthly' && sub.status === 'active') {
      const periodStart = new Date(sub.current_period_start);
      const periodEnd = new Date(sub.current_period_end);
      const today = new Date();
      const periodProgress = (today.getTime() - periodStart.getTime()) / (periodEnd.getTime() - periodStart.getTime());
      
      if (periodProgress >= 0.5 && sub.sessions_used_in_period === 0) {
        badges.push(
          <Badge key="low" className="bg-red-500/20 text-red-700 border-red-500/30">
            <TrendingDown className="h-3 w-3 mr-1" />
            Low usage
          </Badge>
        );
      }
    }
    
    // Over limit
    if (sub.sessions_used_in_period > sub.sessions_per_period) {
      badges.push(
        <Badge key="over" className="bg-purple-500/20 text-purple-700 border-purple-500/30">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Over limit
        </Badge>
      );
    }
    
    return badges;
  };

  const getSessionProgress = (sub: CoachingSubscription) => {
    const percentage = (sub.sessions_used_in_period / sub.sessions_per_period) * 100;
    return Math.min(percentage, 100);
  };

  const getFixedProgress = (sub: CoachingSubscription) => {
    if (!sub.end_date) return 0;
    const start = new Date(sub.start_date);
    const end = new Date(sub.end_date);
    const today = new Date();
    const total = end.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>All Clients</CardTitle>
            <div className="flex flex-wrap items-center gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2">
                <Switch id="ending-soon" checked={showEndingSoon} onCheckedChange={setShowEndingSoon} />
                <Label htmlFor="ending-soon" className="text-sm">Ending Soon</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch id="low-usage" checked={showLowUsage} onCheckedChange={setShowLowUsage} />
                <Label htmlFor="low-usage" className="text-sm">Low Usage</Label>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No clients found. Add your first client to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Alerts</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.child_name}</TableCell>
                      <TableCell>{sub.plan_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {sub.billing_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {sub.billing_type === 'fixed' ? (
                          <div>
                            <div>{format(new Date(sub.start_date), 'MMM d')} - {sub.end_date ? format(new Date(sub.end_date), 'MMM d, yyyy') : 'N/A'}</div>
                          </div>
                        ) : (
                          <div>
                            <div>{format(new Date(sub.current_period_start), 'MMM d')} - {format(new Date(sub.current_period_end), 'MMM d')}</div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">
                          {sub.sessions_used_in_period}/{sub.sessions_per_period}
                        </span>
                        <span className="text-muted-foreground text-xs ml-1">
                          ({sub.total_sessions_used} total)
                        </span>
                      </TableCell>
                      <TableCell className="w-32">
                        <Progress 
                          value={sub.billing_type === 'fixed' ? getFixedProgress(sub) : getSessionProgress(sub)} 
                          className="h-2"
                        />
                      </TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {getAlertBadges(sub)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => setLogSessionSub(sub)}
                            disabled={sub.status !== 'active'}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Log
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditSub(sub)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <LogSessionDialog
        subscription={logSessionSub}
        onOpenChange={(open) => !open && setLogSessionSub(null)}
        onSuccess={onRefresh}
      />

      <EditSubscriptionDialog
        subscription={editSub}
        plans={plans}
        onOpenChange={(open) => !open && setEditSub(null)}
        onSuccess={onRefresh}
      />
    </>
  );
}

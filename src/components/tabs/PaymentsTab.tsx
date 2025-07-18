import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, ExternalLink, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  id: string;
  type: "subscription" | "session" | "academy";
  description: string;
  amount: string;
  date: string;
  status: "paid" | "pending" | "failed";
}

export function PaymentsTab() {
  const { toast } = useToast();
  const [mockPayments] = useState<Payment[]>([
    {
      id: "1",
      type: "subscription",
      description: "KidMindset Premium Monthly",
      amount: "$9.99",
      date: "2024-12-15",
      status: "paid"
    },
    {
      id: "2",
      type: "session",
      description: "1-on-1 Coaching Session",
      amount: "$45.00",
      date: "2024-12-01",
      status: "paid"
    },
    {
      id: "3",
      type: "academy",
      description: "Mindfulness Academy Course",
      amount: "$29.99",
      date: "2024-11-20",
      status: "paid"
    },
    {
      id: "4",
      type: "subscription",
      description: "KidMindset Premium Monthly",
      amount: "$9.99",
      date: "2024-11-15",
      status: "paid"
    }
  ]);

  const getStatusBadge = (status: Payment["status"]) => {
    switch (status) {
      case "paid":
        return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeIcon = (type: Payment["type"]) => {
    switch (type) {
      case "subscription":
        return "🔄";
      case "session":
        return "👥";
      case "academy":
        return "🎓";
      default:
        return "💳";
    }
  };

  const handleCancelSubscription = () => {
    toast({
      title: "Subscription Management",
      description: "This feature will be available soon. Contact support for assistance.",
    });
  };

  const handleBookSession = () => {
    // In production, this would open Calendly
    toast({
      title: "Session Booking",
      description: "Calendly integration coming soon! Contact support to book a session.",
    });
  };

  const handleManageBilling = () => {
    toast({
      title: "Billing Management",
      description: "Stripe billing portal integration coming soon!",
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">KidMindset Premium</h3>
              <p className="text-sm text-muted-foreground">Monthly Plan • $9.99/month</p>
            </div>
            <Badge className="bg-green-100 text-green-800">Active</Badge>
          </div>
          
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Next billing date:</span>
              <span className="font-medium">January 15, 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment method:</span>
              <span className="font-medium">•••• 4242</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleManageBilling} variant="outline" size="sm">
              Manage Billing
            </Button>
            <Button onClick={handleCancelSubscription} variant="outline" size="sm">
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Book 1-on-1 Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Schedule a personalized coaching session with our certified mindfulness experts.
            </p>
            <div className="text-sm mb-4">
              <span className="font-medium">Price: $45.00/session</span>
            </div>
            <Button onClick={handleBookSession} className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              Book Session
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎓 Academy Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Explore our library of structured mindfulness courses designed for children.
            </p>
            <div className="text-sm mb-4">
              <span className="font-medium">Starting at $29.99</span>
            </div>
            <Button variant="outline" className="w-full" disabled>
              Browse Courses (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getTypeIcon(payment.type)}</span>
                  <div>
                    <p className="font-medium text-sm">{payment.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">{payment.amount}</span>
                  {getStatusBadge(payment.status)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Payment Integration Coming Soon</p>
                <p className="text-muted-foreground">
                  Stripe integration for billing management and payment processing will be available in the next update.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
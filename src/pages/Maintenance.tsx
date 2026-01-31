import { Wrench, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Animated background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="relative z-10 max-w-md w-full bg-card/90 backdrop-blur-sm border-border/50">
        <CardContent className="p-8 text-center space-y-6">
          {/* Animated wrench icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <Wrench className="w-10 h-10 text-primary animate-bounce" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground">
            We're improving your Performance Ratings
          </h1>

          {/* Message */}
          <p className="text-muted-foreground text-lg">
            We're working on making things even better for you.
          </p>

          {/* Expected return */}
          <div className="py-4 px-6 bg-secondary/50 rounded-lg">
            <p className="text-foreground font-medium text-xl">
              Back soon
            </p>
          </div>

          {/* Contact support button */}
          <Button
            asChild
            className="w-full gap-2"
            size="lg"
          >
            <a href="mailto:support@theconfidentfootballer.com">
              <Mail className="w-5 h-5" />
              Contact support
            </a>
          </Button>

          {/* Footer note */}
          <p className="text-sm text-muted-foreground">
            Your data is safe and you'll remain logged in.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Maintenance;

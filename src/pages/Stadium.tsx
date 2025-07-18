import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NewActivity from "@/components/Stadium/NewActivity";
import ActivityForm from "@/components/Stadium/ActivityForm";

interface ActivityData {
  name: string;
  type: string;
  date: Date;
  finalScore?: string;
  goalsScored?: number;
  assistsMade?: number;
}

export default function Stadium() {
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<ActivityData | null>(null);

  const handleNewActivitySubmit = (activity: ActivityData) => {
    setCurrentActivity(activity);
    setShowNewActivity(false);
    setShowActivityForm(true);
  };

  const handleActivityFormComplete = () => {
    setShowActivityForm(false);
    setCurrentActivity(null);
  };

  if (showNewActivity) {
    return (
      <NewActivity
        onSubmit={handleNewActivitySubmit}
        onCancel={() => setShowNewActivity(false)}
      />
    );
  }

  if (showActivityForm && currentActivity) {
    return (
      <ActivityForm
        activity={currentActivity}
        onComplete={handleActivityFormComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mb-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              🏟️ Stadium
            </h1>
            <p className="text-muted-foreground">
              Create a new activity to start your football journey
            </p>
          </div>
          
          <Card className="w-full max-w-md shadow-soft">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                  <Plus className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Ready to Begin?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start by creating a new activity. Choose from matches, training sessions, or custom activities.
                  </p>
                  <Button
                    onClick={() => setShowNewActivity(true)}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                    size="lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    New Activity
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
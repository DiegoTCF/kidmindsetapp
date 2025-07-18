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
          
          {/* New Activity Card */}
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

          {/* Tools to Get Ready */}
          <Card className="w-full max-w-md shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 justify-center">
                ⚙️ Tools to Get Ready
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Use these tools to help your mind and body before any activity.
              </p>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 text-left border-2 hover:border-primary/30"
                  disabled
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🧘</span>
                    <div>
                      <p className="font-medium">Yoga Video</p>
                      <p className="text-xs text-muted-foreground">(Coming Soon)</p>
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 text-left border-2 hover:border-primary/30"
                  disabled
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎧</span>
                    <div>
                      <p className="font-medium">Visualisation Audio</p>
                      <p className="text-xs text-muted-foreground">(Coming Soon)</p>
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 text-left border-2 hover:border-primary/30"
                  disabled
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌬️</span>
                    <div>
                      <p className="font-medium">Breathing Audio</p>
                      <p className="text-xs text-muted-foreground">(Coming Soon)</p>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
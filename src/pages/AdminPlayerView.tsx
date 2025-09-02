import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home as HomeIcon, Trophy, TrendingUp, Plus, Target, User, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import { useAdminPlayerView } from '@/hooks/useAdminPlayerView';
import { Navigate } from 'react-router-dom';
import ActivityLog from '@/components/Progress/ActivityLog';
import Charts from '@/components/Progress/Charts';
import BehaviourCharts from '@/components/Progress/BehaviourCharts';
import NewActivity from '@/components/Stadium/NewActivity';
import ActivityForm from '@/components/Stadium/ActivityForm';
import CoreSkillsEvaluation from '@/components/Admin/CoreSkillsEvaluation';

interface Child {
  id: string;
  name: string;
  age: number;
  level: number;
  points: number;
  parent_id: string;
}

interface Parent {
  name: string;
  email: string;
}

interface ActivityData {
  name: string;
  type: string;
  date: Date;
}

export default function AdminPlayerView() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading } = useAdmin();
  const { setPlayerView } = useAdminPlayerView();
  
  const [child, setChild] = useState<Child | null>(null);
  const [parent, setParent] = useState<Parent | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [loadingData, setLoadingData] = useState(true);
  
  // Stadium state
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<ActivityData | null>(null);

  useEffect(() => {
    if (isAdmin && childId) {
      loadChildData();
    }
  }, [isAdmin, childId]);

  const loadChildData = async () => {
    if (!childId) return;
    
    setLoadingData(true);
    try {
      // Verify admin access
      const { data: adminCheck, error: adminError } = await supabase.rpc('is_admin');
      if (adminError || !adminCheck) {
        toast({
          title: 'Access Denied',
          description: 'You do not have administrative privileges.',
          variant: 'destructive'
        });
        navigate('/admin');
        return;
      }

      // Get child data
      const { data: childData, error: childError } = await supabase
        .from('children')
        .select('*')
        .eq('id', childId)
        .single();

      if (childError) {
        console.error('Error loading child data:', childError);
        toast({
          title: 'Error',
          description: 'Failed to load child data',
          variant: 'destructive'
        });
        navigate('/admin');
        return;
      }

      setChild(childData);

      // Set the player view context
      console.log('[AdminPlayerView] Setting player view context for child:', childData);
      setPlayerView(childData, { name: '', email: '' });

      // Get parent data
      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .select('name, user_id')
        .eq('id', childData.parent_id)
        .single();

      if (parentError) {
        console.error('Error loading parent data:', parentError);
        return;
      }

      // Get parent email from profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('user_id', parentData.user_id)
        .single();

      if (!profileError && profileData) {
        const parentInfo = {
          name: parentData.name,
          email: profileData.email
        };
        setParent(parentInfo);
        
        // Update player view context with parent info
        console.log('[AdminPlayerView] Updating player view with parent info:', parentInfo);
        setPlayerView(childData, parentInfo);
      }

    } catch (error) {
      console.error('Error in loadChildData:', error);
      toast({
        title: 'Error',
        description: 'Failed to load child data',
        variant: 'destructive'
      });
      navigate('/admin');
    } finally {
      setLoadingData(false);
    }
  };

  const handleNewActivitySubmit = (activity: ActivityData) => {
    setCurrentActivity(activity);
    setShowNewActivity(false);
    setShowActivityForm(true);
  };

  const handleActivityFormComplete = () => {
    setShowActivityForm(false);
    setCurrentActivity(null);
    toast({
      title: 'Activity Guidance Complete',
      description: 'Activity setup completed for mentorship session.',
    });
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading player view...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Child not found</p>
          <Button onClick={() => navigate('/admin')} className="mt-4">
            Return to Admin
          </Button>
        </div>
      </div>
    );
  }

  if (showNewActivity) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 max-w-4xl">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewActivity(false)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Player View
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">🎯 Mentorship: Activity Setup</h1>
              <p className="text-muted-foreground">Guiding {child.name} through activity creation</p>
            </div>
          </div>
          
          <NewActivity
            onSubmit={handleNewActivitySubmit}
            onCancel={() => setShowNewActivity(false)}
          />
        </div>
      </div>
    );
  }

  if (showActivityForm && currentActivity) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 max-w-4xl">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowActivityForm(false);
                setCurrentActivity(null);
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Player View
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">🎯 Mentorship: Activity Form</h1>
              <p className="text-muted-foreground">Guiding {child.name} through {currentActivity.name}</p>
            </div>
          </div>
          
          <ActivityForm
            activity={currentActivity}
            onComplete={handleActivityFormComplete}
            existingActivityId={undefined}
            isResumingActivity={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header with player info */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/stadium')}
                className="flex items-center gap-2"
              >
                <Trophy className="h-4 w-4" />
                Go to Stadium
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/progress')}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Go to Progress
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/goals')}
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Edit Goals
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dna')}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Edit Identity
              </Button>
            </div>
            <Badge variant="secondary">Mentorship Mode</Badge>
          </div>
          
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-2xl text-white font-bold">
                  {child.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground">{child.name}</h1>
                  <p className="text-muted-foreground">
                    {parent ? `${parent.name} (${parent.email})` : 'Loading parent info...'}
                  </p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-sm">
                      <strong>Level:</strong> {child.level}
                    </span>
                    <span className="text-sm">
                      <strong>Points:</strong> {child.points}
                    </span>
                    <span className="text-sm">
                      <strong>Age:</strong> {child.age}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <HomeIcon className="w-4 h-4" />
              Home
            </TabsTrigger>
            <TabsTrigger value="stadium" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Stadium
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="evaluation" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Core Skills
            </TabsTrigger>
          </TabsList>

          {/* Home Tab */}
          <TabsContent value="home" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HomeIcon className="w-5 h-5" />
                  Player Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-primary/5">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <Trophy className="w-8 h-8 mx-auto text-primary mb-2" />
                          <p className="text-sm text-muted-foreground">Level</p>
                          <p className="text-2xl font-bold">{child.level}</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-accent/5">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <span className="text-2xl block mb-2">⭐</span>
                          <p className="text-sm text-muted-foreground">Points</p>
                          <p className="text-2xl font-bold">{child.points}</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-secondary/5">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <span className="text-2xl block mb-2">🎂</span>
                          <p className="text-sm text-muted-foreground">Age</p>
                          <p className="text-2xl font-bold">{child.age}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Mentorship View:</strong> This is how {child.name} sees their dashboard. 
                      Use this to guide them through their football journey during 1-on-1 sessions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stadium Tab */}
          <TabsContent value="stadium" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🏟️ Activity Center
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-green-800 text-sm">
                      <strong>Mentorship Mode:</strong> Use this to guide {child.name} through creating and completing activities during your session.
                    </p>
                  </div>
                  
                  <Card className="shadow-soft">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                          <Plus className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Guide New Activity</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Help {child.name} set up a new activity for your mentorship session.
                          </p>
                          <Button
                            onClick={() => setShowNewActivity(true)}
                            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                            size="lg"
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            Start Activity Setup
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <p className="text-purple-800 text-sm">
                <strong>Progress Overview:</strong> Monitor {child.name}'s activity history and development patterns.
              </p>
            </div>
            
            <Tabs defaultValue="activities" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="activities">Activity Log</TabsTrigger>
                <TabsTrigger value="behaviours">Super Behaviours</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
              </TabsList>

              <TabsContent value="activities" className="space-y-6">
                <ActivityLog selectedFilter="All" childId={child.id} />
              </TabsContent>

              <TabsContent value="behaviours" className="space-y-6">
                <BehaviourCharts selectedFilter="All" childId={child.id} />
              </TabsContent>

              <TabsContent value="stats" className="space-y-6">
                <Charts selectedFilter="All" childId={child.id} />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Core Skills Evaluation Tab */}
          <TabsContent value="evaluation" className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
              <p className="text-emerald-800 text-sm">
                <strong>Core Skills Assessment:</strong> Evaluate {child.name}'s development across the 6 pillars of mindset coaching.
              </p>
            </div>
            
            <CoreSkillsEvaluation 
              childId={child.id} 
              childName={child.name} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
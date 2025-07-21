import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserCog, ArrowLeft, User, Trophy, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ActivityLog from '@/components/Progress/ActivityLog';
import Charts from '@/components/Progress/Charts';
import BehaviourCharts from '@/components/Progress/BehaviourCharts';

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  name?: string;
  phone?: string;
  role?: string;
}

interface Child {
  id: string;
  name: string;
  age: number;
  level: number;
  points: number;
  parent_id: string;
}

type ViewMode = 'users' | 'children' | 'progress';

export default function Admin() {
  const { isAdmin, loading } = useAdmin();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('users');
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    setLoadingData(true);
    try {
      // Get profiles with auth users data via RPC
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Get parents data  
      const { data: parentsData, error: parentsError } = await supabase
        .from('parents')
        .select('*');

      if (parentsError) throw parentsError;

      // Get user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine the data
      const combinedUsers = profilesData.map(profile => {
        const parent = parentsData.find(p => p.user_id === profile.user_id);
        const role = rolesData.find(r => r.user_id === profile.user_id);
        
        return {
          id: profile.user_id,
          email: profile.email,
          created_at: profile.created_at,
          name: parent?.name,
          phone: parent?.phone,
          role: role?.role || 'user'
        };
      });

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive'
      });
    } finally {
      setLoadingData(false);
    }
  };

  const loadChildren = async (userId: string) => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', (await supabase
          .from('parents')
          .select('id')
          .eq('user_id', userId)
          .single()).data?.id);

      if (error) throw error;
      setChildren(data || []);
      setViewMode('children');
    } catch (error) {
      console.error('Error loading children:', error);
      toast({
        title: 'Error',
        description: 'Failed to load children',
        variant: 'destructive'
      });
    } finally {
      setLoadingData(false);
    }
  };

  const promoteToAdmin = async (userId: string, userEmail: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: userId, 
          role: 'admin' 
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${userEmail} promoted to admin`,
      });

      await loadUsers();
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to promote user to admin',
        variant: 'destructive'
      });
    }
  };

  const viewChildProgress = (child: Child) => {
    setSelectedChild(child);
    setViewMode('progress');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            {viewMode !== 'users' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (viewMode === 'progress') {
                    setViewMode('children');
                    setSelectedChild(null);
                  } else {
                    setViewMode('users');
                    setChildren([]);
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          
          {/* Breadcrumb */}
          <div className="text-sm text-muted-foreground">
            {viewMode === 'users' && 'User Management'}
            {viewMode === 'children' && 'Children Management'}
            {viewMode === 'progress' && selectedChild && `${selectedChild.name}'s Progress`}
          </div>
        </div>

        {/* Users View */}
        {viewMode === 'users' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading users...</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {users.map((user) => (
                      <Card key={user.id} className="border border-border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                {user.role || 'user'}
                              </Badge>
                            </div>
                            {user.role !== 'admin' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => promoteToAdmin(user.id, user.email)}
                              >
                                <UserCog className="h-3 w-3 mr-1" />
                                Make Admin
                              </Button>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <p className="font-medium text-sm">{user.email}</p>
                            {user.name && <p className="text-sm text-muted-foreground">{user.name}</p>}
                            {user.phone && <p className="text-xs text-muted-foreground">{user.phone}</p>}
                            <p className="text-xs text-muted-foreground">
                              Joined: {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <Button
                            className="w-full mt-3"
                            variant="outline"
                            size="sm"
                            onClick={() => loadChildren(user.id)}
                          >
                            View Children
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Children View */}
        {viewMode === 'children' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Children ({children.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading children...</p>
                  </div>
                ) : children.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No children found for this user.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {children.map((child) => (
                      <Card key={child.id} className="border border-border">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <h3 className="font-medium">{child.name}</h3>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">Age:</span>
                                <span>{child.age}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Trophy className="h-3 w-3 text-muted-foreground" />
                                <span>Level {child.level}</span>
                              </div>
                              <div className="flex items-center gap-1 col-span-2">
                                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                <span>{child.points} points</span>
                              </div>
                            </div>
                            
                            <Button
                              className="w-full"
                              variant="outline"
                              size="sm"
                              onClick={() => viewChildProgress(child)}
                            >
                              View Progress
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress View */}
        {viewMode === 'progress' && selectedChild && (
          <div className="space-y-6">
            {/* Child Info Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {selectedChild.name}'s Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="text-2xl font-bold">{selectedChild.age}</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Level</p>
                    <p className="text-2xl font-bold">{selectedChild.level}</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Points</p>
                    <p className="text-2xl font-bold">{selectedChild.points}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Components - reusing existing components */}
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityLog selectedFilter="All" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Behaviour Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <BehaviourCharts selectedFilter="All" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Statistics & Charts</CardTitle>
                </CardHeader>
                <CardContent>
                  <Charts selectedFilter="All" />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
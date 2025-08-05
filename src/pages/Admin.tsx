import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { useUserLogging } from '@/hooks/useUserLogging';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserCog, ArrowLeft, User, Trophy, TrendingUp, Shield, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ActivityLog from '@/components/Progress/ActivityLog';
import Charts from '@/components/Progress/Charts';
import BehaviourCharts from '@/components/Progress/BehaviourCharts';
import AdminNotifications from '@/components/Admin/AdminNotifications';
import SessionNotes from '@/components/Admin/SessionNotes';
import { ContentUpload } from '@/components/Content/ContentUpload';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const { user } = useAuth();
  const { logAdminAccess } = useUserLogging();
  const { toast } = useToast();
  
  // Check if current user is the superadmin using database function
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  useEffect(() => {
    const checkSuperAdmin = async () => {
      if (!user) {
        setIsSuperAdmin(false);
        return;
      }
      try {
        const { data, error } = await supabase.rpc('get_superadmin_email');
        if (error) {
          console.error('Error getting superadmin email:', error);
          // Fallback to hardcoded check
          setIsSuperAdmin(user.email === 'pagliusodiego@gmail.com');
        } else {
          setIsSuperAdmin(user.email === data);
        }
      } catch (error) {
        console.error('Error in superadmin check:', error);
        // Fallback to hardcoded check
        setIsSuperAdmin(user.email === 'pagliusodiego@gmail.com');
      }
    };
    checkSuperAdmin();
  }, [user]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('users');
  const [loadingData, setLoadingData] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    user: UserProfile | null;
  }>({ open: false, user: null });

  useEffect(() => {
    if (isAdmin) {
      logAdminAccess(); // Log admin access
      loadUsers();
    }
  }, [isAdmin, logAdminAccess]);

  const loadUsers = async () => {
    setLoadingData(true);
    try {
      // CRITICAL: Always verify admin permissions before any data access
      const { data: adminCheck, error: adminError } = await supabase.rpc('is_admin');
      
      if (adminError || !adminCheck) {
        console.error('[AdminPanel] Admin check failed - redirecting:', adminError);
        toast({
          title: 'Access Denied',
          description: 'You do not have administrative privileges.',
          variant: 'destructive'
        });
        // Force redirect to grown-up zone
        window.location.href = '/grown-up';
        return;
      }

      // Get ALL users including those without profiles
      // This will show users who signed up but haven't completed profile setup
      const { data: allUsersData, error: allUsersError } = await supabase.rpc('admin_get_all_users');

      if (allUsersError) {
        console.error('[AdminPanel] Failed to get all users:', allUsersError);
        // Fall back to profiles-only view
        const { data: profilesData } = await supabase.from('profiles').select('*');
        
        if (!profilesData) {
          toast({
            title: 'Error',
            description: 'Failed to load user data.',
            variant: 'destructive'
          });
          return;
        }
        
        // Continue with profiles only
        const { data: parentsData } = await supabase.from('parents').select('*');
        const { data: rolesData } = await supabase.from('user_roles').select('*');
        
        const combinedUsers = profilesData.map(profile => {
          const parent = parentsData?.find(p => p.user_id === profile.user_id);
          const role = rolesData?.find(r => r.user_id === profile.user_id);
          
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
        return;
      }

      // Get supplementary data for all users
      const { data: parentsData } = await supabase.from('parents').select('*');
      const { data: rolesData } = await supabase.from('user_roles').select('*');
      const { data: profilesData } = await supabase.from('profiles').select('*');

      // Process all users data
      const usersArray = Array.isArray(allUsersData) ? allUsersData : [];
      
      const combinedUsers = usersArray.map((user: any) => {
        const parent = parentsData?.find(p => p.user_id === user.id);
        const role = rolesData?.find(r => r.user_id === user.id);
        const profile = profilesData?.find(p => p.user_id === user.id);
        
        return {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          name: parent?.name,
          phone: parent?.phone,
          role: role?.role || 'user',
          has_profile: !!profile
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
    // Loading children for user
    setLoadingData(true);
    try {
      // CRITICAL: Always verify admin permissions before any data access
      const { data: adminCheck, error: adminError } = await supabase.rpc('is_admin');
      console.log('[AdminPanel] Admin check result:', adminCheck);

      if (adminError || !adminCheck) {
        console.error('[AdminPanel] Admin check failed - redirecting:', adminError);
        toast({
          title: 'Access Denied',
          description: 'You do not have administrative privileges.',
          variant: 'destructive'
        });
        // Force redirect to grown-up zone
        window.location.href = '/grown-up';
        return;
      }

      // First get the parent record (now guaranteed unique) - RLS will enforce admin-only access
      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .select('id, name, user_id')
        .eq('user_id', userId)
        .single();

      console.log('[AdminPanel] Parent query result:', { parentData, parentError });

      if (parentError) {
        console.error('[AdminPanel] Error loading parent:', parentError);
        if (parentError.code === 'PGRST001') {
          console.error('[AdminPanel] RLS violation - access denied:', parentError);
          toast({
            title: 'Access Denied',
            description: 'Insufficient permissions to view parent data.',
            variant: 'destructive'
          });
          window.location.href = '/grown-up';
          return;
        }
        if (parentError.code === 'PGRST116') {
          console.log('[AdminPanel] No parent found for user:', userId);
          setChildren([]);
          setViewMode('children');
          toast({
            title: 'No Parent Found',
            description: 'This user does not have a parent profile set up.',
            variant: 'default'
          });
          return;
        }
        throw parentError;
      }

      if (!parentData) {
        console.log('[AdminPanel] No parent found for user:', userId);
        setChildren([]);
        setViewMode('children');
        toast({
          title: 'No Parent Found',
          description: 'This user does not have a parent profile set up.',
          variant: 'default'
        });
        return;
      }

      console.log('[AdminPanel] Found parent:', parentData);

      // Now get the children for this parent - RLS will enforce admin-only access
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', parentData.id);

      console.log('[AdminPanel] Children query result:', { childrenData, childrenError });

      if (childrenError) {
        console.error('[AdminPanel] Error loading children:', childrenError);
        if (childrenError.code === 'PGRST001') {
          console.error('[AdminPanel] RLS violation - access denied:', childrenError);
          toast({
            title: 'Access Denied',
            description: 'Insufficient permissions to view children data.',
            variant: 'destructive'
          });
          window.location.href = '/grown-up';
          return;
        }
        throw childrenError;
      }

      console.log('[AdminPanel] Successfully loaded children:', childrenData);
      setChildren(childrenData || []);
      setViewMode('children');

      if (!childrenData || childrenData.length === 0) {
        toast({
          title: 'No Children Found',
          description: `${parentData.name || 'This parent'} has no children registered.`,
          variant: 'default'
        });
      }

    } catch (error) {
      console.error('[AdminPanel] Error in loadChildren:', error);
      toast({
        title: 'Error',
        description: `Failed to load children: ${error.message || 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setLoadingData(false);
    }
  };

  const promoteToAdmin = async (userId: string, userEmail: string) => {
    try {
      // CRITICAL: Verify admin permissions before promoting anyone
      const { data: adminCheck, error: adminError } = await supabase.rpc('is_admin');
      
      if (adminError || !adminCheck) {
        console.error('[AdminPanel] Admin check failed - not authorized to promote users:', adminError);
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to promote users.',
          variant: 'destructive'
        });
        return;
      }

      const { error } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: userId, 
          role: 'admin' 
        });

      if (error) {
        if (error.code === 'PGRST001') {
          console.error('[AdminPanel] RLS violation - access denied:', error);
          toast({
            title: 'Access Denied',
            description: 'Insufficient permissions to modify user roles.',
            variant: 'destructive'
          });
          window.location.href = '/grown-up';
          return;
        }
        throw error;
      }

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

  const deleteUser = async (user: UserProfile) => {
    try {
      // Deleting user
      
      const { data, error } = await supabase.rpc('admin_delete_user', {
        target_user_id: user.id
      });

      if (error) {
        console.error('[AdminPanel] Error deleting user:', error);
        throw error;
      }

      const result = data as { success: boolean; error?: string; details?: any };
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to delete user');
      }

      toast({
        title: 'Success',
        description: `User ${user.email} and all associated data deleted successfully`,
      });

      // Reload users list
      await loadUsers();

      // User deleted successfully
    } catch (error) {
      console.error('[AdminPanel] Error in deleteUser:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive'
      });
    }
  };

  const openDeleteDialog = (user: UserProfile) => {
    setDeleteDialog({ open: true, user });
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
    return <Navigate to="/grown-up" replace state={{ accessDenied: true }} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header with Navigation */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            {viewMode === 'progress' && selectedChild ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setViewMode('children');
                  setSelectedChild(null);
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Children
              </Button>
            ) : viewMode === 'children' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setViewMode('users');
                  setChildren([]);
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Users
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <Badge variant="default" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Admin
              </Badge>
            </div>
          </div>
          
          {/* Breadcrumb */}
          <div className="text-sm text-muted-foreground">
            {viewMode === 'users' && 'User Management'}
            {viewMode === 'children' && 'Children Management'}
            {viewMode === 'progress' && selectedChild && `${selectedChild.name}'s Progress`}
          </div>
        </div>

        {/* Admin Notifications */}
        <AdminNotifications className="mb-6" />

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
                    {users.map((userProfile) => (
                       <Card key={userProfile.id} className="border border-border">
                         <CardContent className="p-4">
                           <div className="flex items-start justify-between mb-3">
                             <div className="flex items-center gap-2">
                               <User className="h-4 w-4 text-muted-foreground" />
                               <Badge variant={userProfile.role === 'admin' ? 'default' : 'secondary'}>
                                 {userProfile.role || 'user'}
                               </Badge>
                             </div>
                             <div className="flex items-center gap-2">
                               {userProfile.role !== 'admin' && isSuperAdmin && (
                                 <Button
                                   size="sm"
                                   variant="outline"
                                   onClick={() => promoteToAdmin(userProfile.id, userProfile.email)}
                                 >
                                   <UserCog className="h-3 w-3 mr-1" />
                                   Make Admin
                                 </Button>
                               )}
                               {isSuperAdmin && user?.id !== userProfile.id && (
                                 <Button
                                   size="sm"
                                   variant="outline"
                                   onClick={() => openDeleteDialog(userProfile)}
                                   className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                 >
                                   <Trash2 className="h-3 w-3" />
                                 </Button>
                               )}
                             </div>
                           </div>
                           
                           <div className="space-y-2">
                             <p className="font-medium text-sm">{userProfile.email}</p>
                             {userProfile.name && <p className="text-sm text-muted-foreground">{userProfile.name}</p>}
                             {userProfile.phone && <p className="text-xs text-muted-foreground">{userProfile.phone}</p>}
                             <p className="text-xs text-muted-foreground">
                               Joined: {new Date(userProfile.created_at).toLocaleDateString()}
                             </p>
                           </div>
                           
                           <Button
                             className="w-full mt-3"
                             variant="outline"
                             size="sm"
                             onClick={() => loadChildren(userProfile.id)}
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

            {/* Progress Tabs */}
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="activity">Activity Log</TabsTrigger>
                <TabsTrigger value="behaviour">Behaviour</TabsTrigger>
                <TabsTrigger value="charts">Statistics</TabsTrigger>
                <TabsTrigger value="content">📚 Content</TabsTrigger>
                <TabsTrigger value="sessions" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Session Notes
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="activity" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Log</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ActivityLog selectedFilter="All" childId={selectedChild.id} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="behaviour" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Behaviour Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BehaviourCharts selectedFilter="All" childId={selectedChild.id} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="charts" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Statistics & Charts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Charts selectedFilter="All" childId={selectedChild.id} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ContentUpload />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sessions" className="mt-6">
                <SessionNotes child={selectedChild} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Delete User Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, user: null })}
        title="Delete User"
        description={
          deleteDialog.user
            ? `Are you sure you want to permanently delete ${deleteDialog.user.email}? This will delete all associated data including children, activities, progress entries, and cannot be undone.`
            : ''
        }
        confirmText="Delete User"
        variant="destructive"
        onConfirm={() => {
          if (deleteDialog.user) {
            deleteUser(deleteDialog.user);
          }
        }}
      />
    </div>
  );
}
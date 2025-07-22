import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, User, Activity, Check, CheckCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminNotification {
  id: string;
  notification_type: 'user_signup' | 'activity_created';
  title: string;
  message: string;
  related_user_email?: string;
  related_child_name?: string;
  related_activity_name?: string;
  is_read: boolean;
  created_at: string;
}

interface AdminNotificationsProps {
  className?: string;
}

export default function AdminNotifications({ className }: AdminNotificationsProps) {
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  console.log('[AdminNotifications] Component initialized, isAdmin:', isAdmin);

  useEffect(() => {
    if (isAdmin) {
      loadNotifications();
    }
  }, [isAdmin]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      console.log('[AdminNotifications] Loading notifications...');
      
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(showAll ? 100 : 10);

      if (error) {
        console.error('[AdminNotifications] Error loading notifications:', error);
        throw error;
      }

      console.log('[AdminNotifications] Loaded notifications:', data);
      setNotifications(data?.map(item => ({
        ...item,
        notification_type: item.notification_type as 'user_signup' | 'activity_created'
      })) || []);
    } catch (error) {
      console.error('[AdminNotifications] Error in loadNotifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      console.log('[AdminNotifications] Marking notification as read:', notificationId);
      
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('[AdminNotifications] Error marking as read:', error);
        throw error;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );

      console.log('[AdminNotifications] Notification marked as read successfully');
    } catch (error) {
      console.error('[AdminNotifications] Error in markAsRead:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive'
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      console.log('[AdminNotifications] Marking all notifications as read');
      
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      
      if (unreadIds.length === 0) {
        toast({
          title: 'Info',
          description: 'All notifications are already read',
        });
        return;
      }

      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .in('id', unreadIds);

      if (error) {
        console.error('[AdminNotifications] Error marking all as read:', error);
        throw error;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );

      toast({
        title: 'Success',
        description: `Marked ${unreadIds.length} notifications as read`,
      });

      console.log('[AdminNotifications] All notifications marked as read successfully');
    } catch (error) {
      console.error('[AdminNotifications] Error in markAllAsRead:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive'
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'user_signup':
        return <User className="h-4 w-4" />;
      case 'activity_created':
        return <Activity className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'user_signup':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'activity_created':
        return 'bg-green-500/10 text-green-600 border-green-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  if (!isAdmin) {
    return null;
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Admin Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={markAllAsRead}
                className="flex items-center gap-1"
              >
                <CheckCheck className="h-3 w-3" />
                Mark All Read
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : 'Show All'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <BellOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-all ${
                  notification.is_read 
                    ? 'bg-muted/50 border-muted' 
                    : 'bg-background border-border shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-1.5 rounded-full ${getNotificationColor(notification.notification_type)}`}>
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium text-sm ${notification.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {notification.title}
                      </h4>
                      <p className={`text-xs mt-1 ${notification.is_read ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                        {notification.message}
                      </p>
                      {(notification.related_user_email || notification.related_child_name || notification.related_activity_name) && (
                        <div className="mt-2 text-xs">
                          {notification.related_user_email && (
                            <Badge variant="outline" className="mr-1 text-xs">
                              {notification.related_user_email}
                            </Badge>
                          )}
                          {notification.related_child_name && (
                            <Badge variant="outline" className="mr-1 text-xs">
                              {notification.related_child_name}
                            </Badge>
                          )}
                          {notification.related_activity_name && (
                            <Badge variant="outline" className="mr-1 text-xs">
                              {notification.related_activity_name}
                            </Badge>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!notification.is_read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAsRead(notification.id)}
                      className="flex items-center gap-1 h-6 px-2"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
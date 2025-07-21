import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface LogActionParams {
  actionType: string;
  actionDetails?: Record<string, any>;
  pageLocation?: string;
  childId?: string;
}

export const useUserLogging = () => {
  const { user } = useAuth();

  const logAction = useCallback(async ({
    actionType,
    actionDetails = {},
    pageLocation,
    childId
  }: LogActionParams) => {
    if (!user) {
      console.warn('[UserLogging] No authenticated user, skipping log');
      return null;
    }

    try {
      // Add additional context to action details
      const enhancedDetails = {
        ...actionDetails,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        ...(!pageLocation && { pageLocation: window.location.pathname }),
      };

      console.log(`[UserLogging] Logging action: ${actionType}`, enhancedDetails);

      const { data, error } = await supabase.rpc('log_user_action', {
        action_type_param: actionType,
        action_details_param: enhancedDetails,
        page_location_param: pageLocation || window.location.pathname,
        child_id_param: childId || null
      });

      if (error) {
        console.error('[UserLogging] Failed to log action:', error);
        return null;
      }

      console.log(`[UserLogging] Successfully logged action: ${actionType}`, data);
      return data;
    } catch (error) {
      console.error('[UserLogging] Error logging action:', error);
      return null;
    }
  }, [user]);

  // Convenience methods for common actions
  const logNavigation = useCallback((from: string, to: string) => {
    return logAction({
      actionType: 'navigation',
      actionDetails: { from, to },
      pageLocation: to
    });
  }, [logAction]);

  const logActivity = useCallback((activityName: string, activityType: string, childId?: string) => {
    return logAction({
      actionType: 'activity_created',
      actionDetails: { activityName, activityType },
      pageLocation: '/stadium',
      childId
    });
  }, [logAction]);

  const logActivityCompletion = useCallback((activityName: string, stage: 'pre' | 'post', childId?: string) => {
    return logAction({
      actionType: 'activity_completion',
      actionDetails: { activityName, stage },
      pageLocation: '/stadium',
      childId
    });
  }, [logAction]);

  const logLogin = useCallback(() => {
    return logAction({
      actionType: 'user_login',
      actionDetails: { loginTime: new Date().toISOString() },
      pageLocation: '/auth'
    });
  }, [logAction]);

  const logLogout = useCallback(() => {
    return logAction({
      actionType: 'user_logout',
      actionDetails: { logoutTime: new Date().toISOString() }
    });
  }, [logAction]);

  const logProgressView = useCallback((childId?: string) => {
    return logAction({
      actionType: 'progress_viewed',
      actionDetails: { viewTime: new Date().toISOString() },
      pageLocation: '/progress',
      childId
    });
  }, [logAction]);

  const logProfileAccess = useCallback(() => {
    return logAction({
      actionType: 'profile_accessed',
      actionDetails: { accessTime: new Date().toISOString() },
      pageLocation: '/profile'
    });
  }, [logAction]);

  const logAdminAccess = useCallback(() => {
    return logAction({
      actionType: 'admin_panel_accessed',
      actionDetails: { accessTime: new Date().toISOString() },
      pageLocation: '/admin'
    });
  }, [logAction]);

  const logError = useCallback((errorType: string, errorMessage: string, pageLocation?: string) => {
    return logAction({
      actionType: 'error_occurred',
      actionDetails: { errorType, errorMessage, errorTime: new Date().toISOString() },
      pageLocation
    });
  }, [logAction]);

  return {
    logAction,
    logNavigation,
    logActivity,
    logActivityCompletion,
    logLogin,
    logLogout,
    logProgressView,
    logProfileAccess,
    logAdminAccess,
    logError
  };
};
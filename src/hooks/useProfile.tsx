import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useChildData } from './useChildData';
import { useAdmin } from './useAdmin';
import { useAdminPlayerView } from './useAdminPlayerView';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  role: string | null;
  strengths: string[] | null;
  help_team: string[] | null;
  created_at: string;
  updated_at: string;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  refetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { childId, loading: childDataLoading } = useChildData();
  const { isAdmin } = useAdmin();
  const { isViewingAsPlayer, selectedChild } = useAdminPlayerView();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user?.id || childDataLoading) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Use selected player's ID if admin is viewing as player, otherwise use child ID or user ID
    const effectiveUserId = (isAdmin && isViewingAsPlayer && selectedChild) 
      ? selectedChild.id 
      : (isAdmin && childId) 
        ? childId 
        : user.id;
    
    console.log('[useProfile] Fetching profile - user.id:', user.id, 'childId:', childId, 'isAdmin:', isAdmin, 'effectiveUserId:', effectiveUserId);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', effectiveUserId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const refetchProfile = async () => {
    setLoading(true);
    await fetchProfile();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) return;

    // Use selected player's ID if admin is viewing as player, otherwise use child ID or user ID
    const effectiveUserId = (isAdmin && isViewingAsPlayer && selectedChild) 
      ? selectedChild.id 
      : (isAdmin && childId) 
        ? childId 
        : user.id;
    
    console.log('[useProfile] Updating profile - user.id:', user.id, 'childId:', childId, 'isAdmin:', isAdmin, 'effectiveUserId:', effectiveUserId);

    try {
      // First try to update, if no rows affected then insert
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ 
          user_id: effectiveUserId,
          email: `user_${effectiveUserId}@placeholder.com`,
          ...updates 
        }, { 
          onConflict: 'user_id' 
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!childDataLoading) {
      fetchProfile();
    }
  }, [user?.id, childId, childDataLoading, isViewingAsPlayer, selectedChild?.id]);

  return (
    <ProfileContext.Provider value={{ profile, loading, refetchProfile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
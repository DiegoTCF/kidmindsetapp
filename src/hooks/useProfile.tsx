import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useChildData } from './useChildData';

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user?.id || childDataLoading) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Use child ID from context (admin player view) or user ID for regular users
    const effectiveUserId = childId || user.id;
    
    console.log('[useProfile] Fetching profile - user.id:', user.id, 'childId:', childId, 'effectiveUserId:', effectiveUserId);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', effectiveUserId)
        .single();

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

    // Always use the actual user ID for profiles table, regardless of admin player view
    console.log('[useProfile] Updating profile - user.id:', user.id, 'childId:', childId);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
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
  }, [user?.id, childId, childDataLoading]);

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
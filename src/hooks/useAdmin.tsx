import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
  checkAdmin: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  loading: true,
  checkAdmin: async () => {},
});

export const useAdmin = () => useContext(AdminContext);

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider = ({ children }: AdminProviderProps) => {
  const { user, session } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = async () => {
    if (!user || !session) {
      console.log('[RLS Check] useAdmin - No user or session, setting admin to false');
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    console.log('[RLS Check] useAdmin - Checking admin status for user:', user.id);
    try {
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        console.error('[RLS Check] useAdmin - Error checking admin status:', error);
        if (error.code === 'PGRST116' || error.message?.includes('permission')) {
          console.warn('[RLS Check] Permission denied for admin check - RLS working correctly');
        }
        setIsAdmin(false);
      } else {
        console.log('[RLS Check] useAdmin - Admin check result:', data);
        setIsAdmin(data || false);
      }
    } catch (error) {
      console.error('[RLS Check] useAdmin - Exception in admin check:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // useAdmin effect triggered
    checkAdmin();
  }, [user, session]);

  return (
    <AdminContext.Provider value={{ isAdmin, loading, checkAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};
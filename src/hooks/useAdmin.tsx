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
      console.log('[useAdmin] No user or session, setting admin to false');
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    console.log('[useAdmin] Checking admin status for user:', user.email);
    try {
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        console.error('[useAdmin] Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        console.log('[useAdmin] Admin check result:', data);
        setIsAdmin(data || false);
      }
    } catch (error) {
      console.error('[useAdmin] Error in admin check:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[useAdmin] useEffect triggered, user:', user?.email, 'session:', !!session);
    checkAdmin();
  }, [user, session]);

  return (
    <AdminContext.Provider value={{ isAdmin, loading, checkAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};
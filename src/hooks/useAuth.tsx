import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthFix] Setting up auth state listener');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[AuthFix] Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle profile creation after email confirmation
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if this is a new signup that needs profile creation
          const pendingData = localStorage.getItem('pendingSignupData');
          if (pendingData) {
            console.log('[AuthFix] Processing pending signup data');
            setTimeout(async () => {
              try {
                const signupData = JSON.parse(pendingData);
                
                // Create profile
                const { error: profileError } = await supabase
                  .from('profiles')
                  .insert({
                    user_id: session.user.id,
                    email: session.user.email!,
                  });

                if (profileError) {
                  console.log('[AuthFix] Profile creation error:', profileError.message);
                }

                // Create parent record
                const { data: parentData, error: parentError } = await supabase
                  .from('parents')
                  .insert({
                    user_id: session.user.id,
                    name: signupData.parentName,
                    phone: '',
                    payment_status: 'pending',
                    pin: signupData.pin,
                  })
                  .select('id')
                  .single();

                if (parentError) {
                  console.log('[AuthFix] Parent creation error:', parentError.message);
                  return;
                }

                // Calculate level number from string
                const levelMap: { [key: string]: number } = {
                  'grassroots': 1,
                  'dev_centres': 2,
                  'academy': 3
                };

                // Create child record
                const { error: childError } = await supabase
                  .from('children')
                  .insert({
                    parent_id: parentData.id,
                    name: signupData.childName,
                    age: signupData.childAge,
                    level: levelMap[signupData.childLevel] || 1,
                    weekly_schedule: JSON.stringify(signupData.weeklySchedule),
                    points: 0,
                  });

                if (childError) {
                  console.log('[AuthFix] Child creation error:', childError.message);
                } else {
                  console.log('[AuthFix] Profile setup completed successfully');
                  // Clear the pending data
                  localStorage.removeItem('pendingSignupData');
                }
              } catch (error) {
                console.log('[AuthFix] Error processing signup data:', error);
              }
            }, 0);
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AuthFix] Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    console.log('[AuthFlow] Signing out user');
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
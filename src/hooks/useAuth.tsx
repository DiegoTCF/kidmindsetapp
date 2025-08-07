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
      async (event, session) => {
        // Remove sensitive logging for security
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle profile creation for anonymous or signed in users
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if this is a new signup that needs profile creation
          const pendingData = localStorage.getItem('pendingSignupData');
          if (pendingData && !session.user.is_anonymous) {
            // Processing pending signup data
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

                // Create child record - ALWAYS start with level 1 and 0 points
                const { error: childError } = await supabase
                  .from('children')
                  .insert({
                    parent_id: parentData.id,
                    name: signupData.childName,
                    age: signupData.childAge,
                    level: 1,
                    weekly_schedule: JSON.stringify(signupData.weeklySchedule),
                    points: 0,
                  });

                if (childError) {
                  console.log('[AuthFix] Child creation error:', childError.message);
                } else {
                  console.log('[AuthFix] Profile setup completed successfully');
                  localStorage.removeItem('pendingSignupData');
                }
              } catch (error) {
                console.log('[AuthFix] Error processing signup data:', error);
              }
            }, 100);
          } else if (session.user.is_anonymous) {
            // Create demo data for anonymous users - check if already exists
            console.log('[AuthFix] Creating demo data for anonymous user');
            setTimeout(async () => {
              try {
                // Check if profile already exists
                const { data: existingProfile } = await supabase
                  .from('profiles')
                  .select('id')
                  .eq('user_id', session.user.id)
                  .single();
                
                if (existingProfile) {
                  console.log('[AuthFix] Demo profile already exists, skipping creation');
                  return;
                }

                // Create profile
                const { error: profileError } = await supabase
                  .from('profiles')
                  .insert({
                    user_id: session.user.id,
                    email: `demo-${session.user.id}@example.com`,
                  });

                if (profileError) {
                  console.log('[AuthFix] Demo profile creation error:', profileError.message);
                }

                // Create parent record
                const { data: parentData, error: parentError } = await supabase
                  .from('parents')
                  .insert({
                    user_id: session.user.id,
                    name: 'Demo Parent',
                    phone: '',
                    payment_status: 'pending',
                    pin: '1234',
                  })
                  .select('id')
                  .single();

                if (parentError) {
                  console.log('[AuthFix] Demo parent creation error:', parentError.message);
                  return;
                }

                // Create child record - ALWAYS start with level 1 and 0 points
                const { error: childError } = await supabase
                  .from('children')
                  .insert({
                    parent_id: parentData.id,
                    name: 'Demo Player',
                    age: 10,
                    level: 1,
                    weekly_schedule: JSON.stringify({}),
                    points: 0,
                  });

                if (childError) {
                  console.log('[AuthFix] Demo child creation error:', childError.message);
                } else {
                  console.log('[AuthFix] Demo profile setup completed successfully');
                }
              } catch (error) {
                console.log('[AuthFix] Error creating demo data:', error);
              }
            }, 100);
          }
        }
        
        setLoading(false);
      }
    );

    // Check for existing session first
    const initializeAuth = async () => {
      try {
        console.log('[AuthFix] Checking for existing session...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Existing session found
          setSession(session);
          setUser(session.user);
          setLoading(false);
        } else {
          // No session found - redirect to auth page instead of creating anonymous user
          console.log('[AuthFix] No session found, user needs to sign in');
          if (window.location.pathname !== '/auth') {
            window.location.href = '/auth';
          }
          setLoading(false);
        }
      } catch (error) {
        console.log('[AuthFix] Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();
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
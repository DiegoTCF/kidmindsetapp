import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BestSelfReflection {
  ball_with_me?: string;
  ball_without_me?: string;
  behaviour?: string;
  body_language?: string;
  noticed_by_others?: string;
}

export function BestSelfReminder() {
  console.log('[BestSelfReminder] Component rendering...');
  
  const { user } = useAuth();
  const [bestSelfReflection, setBestSelfReflection] = useState<BestSelfReflection | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('[BestSelfReminder] Component rendered, user:', user);

  useEffect(() => {
    async function loadBestSelfReflection() {
      if (!user?.id) {
        console.log('[BestSelfReminder] No user_id:', user);
        setLoading(false);
        return;
      }
      
      console.log('[BestSelfReminder] Loading best self reflection for user:', user.id);
      
      try {
        const { data, error } = await supabase
          .from('best_self_reflections')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        console.log('[BestSelfReminder] Best self reflection data:', data, 'error:', error);
        
        if (data) {
          setBestSelfReflection(data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading best self reflection:', error);
        setLoading(false);
      }
    }

    loadBestSelfReflection();
  }, [user?.id]);

  console.log('[BestSelfReminder] Rendering state:', { loading, bestSelfReflection });

  if (loading) {
    return (
      <div className="bg-black/80 border border-white/20 rounded-lg p-3 mb-4">
        <h4 className="font-bold text-white mb-2">⭐ Best Version of Me</h4>
        <p className="text-sm text-white/80">Loading...</p>
      </div>
    );
  }

  if (!bestSelfReflection) {
    return (
      <div className="bg-black/80 border border-white/20 rounded-lg p-3 mb-4">
        <h4 className="font-bold text-white mb-2">⭐ Best Version of Me</h4>
        <p className="text-sm text-white/80">Create your Best Self vision to see it here</p>
      </div>
    );
  }

  return (
    <div className="bg-black/80 border border-white/20 rounded-lg p-3 mb-4">
      <h4 className="font-bold text-white mb-2">⭐ Best Version of Me</h4>
      {bestSelfReflection.ball_with_me && (
        <p className="text-sm text-white"><strong>With ball:</strong> {bestSelfReflection.ball_with_me}</p>
      )}
      {bestSelfReflection.ball_without_me && (
        <p className="text-sm text-white"><strong>Without ball:</strong> {bestSelfReflection.ball_without_me}</p>
      )}
      {bestSelfReflection.behaviour && (
        <p className="text-sm text-white"><strong>Behavior:</strong> {bestSelfReflection.behaviour}</p>
      )}
    </div>
  );
}
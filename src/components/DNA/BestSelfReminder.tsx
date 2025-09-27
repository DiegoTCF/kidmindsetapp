import { useProfile } from "@/hooks/useProfile";
import { useChildData } from "@/hooks/useChildData";
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
  const { profile } = useProfile();
  const { childId } = useChildData();
  const [bestSelfReflection, setBestSelfReflection] = useState<BestSelfReflection | null>(null);

  useEffect(() => {
    async function loadBestSelfReflection() {
      if (!profile?.user_id) return;
      
      try {
        const { data } = await supabase
          .from('best_self_reflections')
          .select('*')
          .eq('user_id', profile.user_id)
          .single();
        
        if (data) {
          setBestSelfReflection(data);
        }
      } catch (error) {
        console.error('Error loading best self reflection:', error);
      }
    }

    loadBestSelfReflection();
  }, [profile?.user_id]);

  if (!bestSelfReflection) {
    return null;
  }

  return (
    <div className="bg-white/10 border border-white/20 rounded-lg p-3 mb-4">
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
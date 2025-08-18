import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminPlayerView } from './useAdminPlayerView';
import { useAdmin } from './useAdmin';

export function useChildData() {
  const [childId, setChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { getEffectiveChildId, isViewingAsPlayer } = useAdminPlayerView();
  const { isAdmin } = useAdmin();

  useEffect(() => {
    const loadChildId = async () => {
      setLoading(true);
      try {
        // If admin is viewing as a player, use that child ID
        if (isAdmin && isViewingAsPlayer) {
          const effectiveChildId = getEffectiveChildId();
          setChildId(effectiveChildId);
          setLoading(false);
          return;
        }

        // Otherwise, get the current user's child ID
        const { data: currentChildId, error } = await supabase
          .rpc('get_current_user_child_id');
        
        if (error) {
          console.error('Error getting child ID:', error);
          setChildId(null);
        } else {
          setChildId(currentChildId);
        }
      } catch (error) {
        console.error('Error loading child data:', error);
        setChildId(null);
      } finally {
        setLoading(false);
      }
    };

    loadChildId();
  }, [isAdmin, isViewingAsPlayer, getEffectiveChildId]);

  return { childId, loading };
}

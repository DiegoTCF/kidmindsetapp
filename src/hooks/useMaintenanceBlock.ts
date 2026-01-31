import { useCallback } from "react";
import { isMaintenanceMode, MAINTENANCE_MESSAGE } from "@/config/maintenance";
import { useToast } from "@/hooks/use-toast";

interface MaintenanceBlockResult {
  isBlocked: boolean;
  message: string;
}

/**
 * Hook to block write operations during maintenance mode
 * 
 * Usage:
 * const { blockIfMaintenance, isMaintenanceActive } = useMaintenanceBlock();
 * 
 * const handleSave = async () => {
 *   if (blockIfMaintenance()) return;
 *   // proceed with save...
 * };
 */
export function useMaintenanceBlock() {
  const { toast } = useToast();

  const isMaintenanceActive = isMaintenanceMode();

  const blockIfMaintenance = useCallback((): boolean => {
    if (isMaintenanceMode()) {
      toast({
        title: "Maintenance in progress",
        description: MAINTENANCE_MESSAGE,
        variant: "destructive",
      });
      return true;
    }
    return false;
  }, [toast]);

  const getBlockResult = useCallback((): MaintenanceBlockResult => {
    const blocked = isMaintenanceMode();
    return {
      isBlocked: blocked,
      message: blocked ? MAINTENANCE_MESSAGE : '',
    };
  }, []);

  return {
    blockIfMaintenance,
    isMaintenanceActive,
    getBlockResult,
    maintenanceMessage: MAINTENANCE_MESSAGE,
  };
}

import { ReactNode, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isMaintenanceMode, isRouteAllowedDuringMaintenance } from "@/config/maintenance";

interface MaintenanceGuardProps {
  children: ReactNode;
}

/**
 * MaintenanceGuard - Redirects users to /maintenance when maintenance mode is enabled
 * 
 * Allowed routes during maintenance:
 * - /auth (login/logout)
 * - /maintenance
 * - /support
 */
export function MaintenanceGuard({ children }: MaintenanceGuardProps) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isMaintenanceMode() && !isRouteAllowedDuringMaintenance(location.pathname)) {
      navigate('/maintenance', { replace: true });
    }
  }, [location.pathname, navigate]);

  // If in maintenance mode and not on allowed route, don't render children
  // (the useEffect will redirect, but this prevents flash of content)
  if (isMaintenanceMode() && !isRouteAllowedDuringMaintenance(location.pathname)) {
    return null;
  }

  return <>{children}</>;
}

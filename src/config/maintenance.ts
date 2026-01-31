/**
 * Maintenance Mode Configuration
 * 
 * Toggle MAINTENANCE_MODE via environment variable VITE_MAINTENANCE_MODE
 * or by setting MAINTENANCE_ENABLED directly in this file.
 * 
 * Environment variable takes precedence over the hardcoded value.
 */

// Hardcoded fallback - change to true to enable maintenance mode
const MAINTENANCE_ENABLED = false;

// Check environment variable first, fallback to hardcoded value
export const isMaintenanceMode = (): boolean => {
  // Check for environment variable (Vite style)
  const envValue = import.meta.env.VITE_MAINTENANCE_MODE;
  
  if (envValue !== undefined) {
    return envValue === 'true' || envValue === '1';
  }
  
  return MAINTENANCE_ENABLED;
};

// Routes that are allowed during maintenance mode
// Currently only /maintenance itself is allowed - blocks everything including login
export const MAINTENANCE_ALLOWED_ROUTES = [
  '/maintenance',
];

// Check if a route is allowed during maintenance
export const isRouteAllowedDuringMaintenance = (pathname: string): boolean => {
  return MAINTENANCE_ALLOWED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
};

// Maintenance mode message for API responses
export const MAINTENANCE_MESSAGE = 'Maintenance in progress. Please try again later.';

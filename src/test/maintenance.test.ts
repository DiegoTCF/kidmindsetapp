import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isMaintenanceMode, isRouteAllowedDuringMaintenance, MAINTENANCE_ALLOWED_ROUTES } from "@/config/maintenance";

describe("Maintenance Mode Configuration", () => {
  const originalEnv = import.meta.env;

  beforeEach(() => {
    // Reset env before each test
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("isRouteAllowedDuringMaintenance", () => {
    it("should allow /auth route", () => {
      expect(isRouteAllowedDuringMaintenance("/auth")).toBe(true);
    });

    it("should allow /maintenance route", () => {
      expect(isRouteAllowedDuringMaintenance("/maintenance")).toBe(true);
    });

    it("should allow /support route", () => {
      expect(isRouteAllowedDuringMaintenance("/support")).toBe(true);
    });

    it("should allow nested auth routes", () => {
      expect(isRouteAllowedDuringMaintenance("/auth/callback")).toBe(true);
      expect(isRouteAllowedDuringMaintenance("/auth/reset-password")).toBe(true);
    });

    it("should block other routes", () => {
      expect(isRouteAllowedDuringMaintenance("/")).toBe(false);
      expect(isRouteAllowedDuringMaintenance("/home")).toBe(false);
      expect(isRouteAllowedDuringMaintenance("/profile")).toBe(false);
      expect(isRouteAllowedDuringMaintenance("/stadium")).toBe(false);
      expect(isRouteAllowedDuringMaintenance("/progress")).toBe(false);
      expect(isRouteAllowedDuringMaintenance("/admin")).toBe(false);
    });

    it("should have correct allowed routes defined", () => {
      expect(MAINTENANCE_ALLOWED_ROUTES).toContain("/auth");
      expect(MAINTENANCE_ALLOWED_ROUTES).toContain("/maintenance");
      expect(MAINTENANCE_ALLOWED_ROUTES).toContain("/support");
    });
  });

  describe("Route blocking logic", () => {
    const blockedRoutes = [
      "/",
      "/home",
      "/home-test",
      "/profile",
      "/stadium",
      "/progress",
      "/goals",
      "/dna",
      "/admin",
      "/admin/player/123",
      "/admin/clients",
      "/identity",
      "/journey",
      "/tools",
      "/performance",
      "/core-skills/assessment",
      "/core-skills/self-assessment",
    ];

    blockedRoutes.forEach((route) => {
      it(`should block route: ${route}`, () => {
        expect(isRouteAllowedDuringMaintenance(route)).toBe(false);
      });
    });

    const allowedRoutes = ["/auth", "/maintenance", "/support"];

    allowedRoutes.forEach((route) => {
      it(`should allow route: ${route}`, () => {
        expect(isRouteAllowedDuringMaintenance(route)).toBe(true);
      });
    });
  });
});

describe("MaintenanceGuard redirect logic", () => {
  it("should redirect blocked routes to /maintenance when mode is active", () => {
    // This tests the logic that the MaintenanceGuard component uses
    const mockIsMaintenanceMode = true;
    const testRoute = "/home";
    
    const shouldRedirect = mockIsMaintenanceMode && !isRouteAllowedDuringMaintenance(testRoute);
    expect(shouldRedirect).toBe(true);
  });

  it("should not redirect allowed routes when mode is active", () => {
    const mockIsMaintenanceMode = true;
    const testRoute = "/auth";
    
    const shouldRedirect = mockIsMaintenanceMode && !isRouteAllowedDuringMaintenance(testRoute);
    expect(shouldRedirect).toBe(false);
  });

  it("should not redirect any routes when mode is inactive", () => {
    const mockIsMaintenanceMode = false;
    const testRoute = "/home";
    
    const shouldRedirect = mockIsMaintenanceMode && !isRouteAllowedDuringMaintenance(testRoute);
    expect(shouldRedirect).toBe(false);
  });
});

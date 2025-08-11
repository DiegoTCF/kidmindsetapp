import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Home from "./pages/Home";
import Stadium from "./pages/Stadium";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import Goals from "./pages/Goals";

import GrownUpZone from "./pages/GrownUpZone";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { useAuth } from "./hooks/useAuth";
import { AdminProvider } from "./hooks/useAdmin";
import PlayerIdentity from "./pages/PlayerIdentity";
import DNAYou from "./pages/DNAYou";

const queryClient = new QueryClient();

// Define ProtectedRoute as a separate component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Main App component
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AdminProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth route */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Main app routes with navigation - protected */}
              <Route path="/" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Home />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/stadium" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Stadium />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/progress" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Progress />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/goals" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Goals />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/dna" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PlayerIdentity />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/dna/you" element={
                <ProtectedRoute>
                  <AppLayout>
                    <DNAYou />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Grown Up Zone - no navigation - protected */}
              <Route path="/grown-up" element={
                <ProtectedRoute>
                  <AppLayout hideNavigation>
                    <GrownUpZone />
                  </AppLayout>
                </ProtectedRoute>
              } />

              {/* Admin route - no navigation */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AdminProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

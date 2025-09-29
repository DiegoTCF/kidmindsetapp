import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./hooks/useAuth";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Stadium from "./pages/Stadium";
import Progress from "./pages/Progress";
import Goals from "./pages/Goals";
import Profile from "./pages/Profile";
import PlayerIdentity from "./pages/PlayerIdentity";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminProvider } from "./hooks/useAdmin";
import { ProfileProvider } from "./hooks/useProfile";
import { AdminPlayerViewProvider } from "./hooks/useAdminPlayerView";

const queryClient = new QueryClient();

// Protected Route Component
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

// App Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      
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
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App Component
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AdminPlayerViewProvider>
            <AdminProvider>
              <ProfileProvider>
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
                <Toaster />
                <Sonner />
              </ProfileProvider>
            </AdminProvider>
          </AdminPlayerViewProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
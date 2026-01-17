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
import ClientManager from "./pages/ClientManager";
import AdminPlayerView from "./pages/AdminPlayerView";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { useAuth } from "./hooks/useAuth";
import { AdminProvider } from "./hooks/useAdmin";
import { ProfileProvider } from "./hooks/useProfile";
import { AdminPlayerViewProvider } from "./hooks/useAdminPlayerView";
import PlayerIdentity from "./pages/PlayerIdentity";
import DNAYou from "./pages/DNAYou";
import DNAYouQuiz from "./pages/DNAYouQuiz";
import ReflectionTest from "./pages/ReflectionTest";
import ConfidenceCheck from "./pages/ConfidenceCheck";
import CoreSkillsAssessment from "./pages/CoreSkillsAssessment";
import CoreSkillsSelfAssessment from "./pages/CoreSkillsSelfAssessment";
import { BestSelf } from "./components/mindset/BestSelf";
import TestProfileFlow from "./pages/TestProfileFlow";
import HomeTest from "./pages/HomeTest";
import Performance from "./pages/Performance";
import Tools from "./pages/Tools";
import Identity from "./pages/Identity";
import Journey from "./pages/Journey";

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
        <AdminPlayerViewProvider>
          <AdminProvider>
            <ProfileProvider>
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
              {/* DISABLED: DNA You pages - uncomment to reactivate
              <Route path="/dna/you" element={
                <ProtectedRoute>
                  <AppLayout>
                    <DNAYou />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/dna/you/quiz" element={
                <ProtectedRoute>
                  <AppLayout>
                    <DNAYouQuiz />
                  </AppLayout>
                </ProtectedRoute>
              } />
              */}
              
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

              {/* Admin Player View route - no navigation */}
              <Route path="/admin/player/:childId" element={
                <ProtectedRoute>
                  <AdminPlayerView />
                </ProtectedRoute>
              } />

              {/* Client Manager route - admin only, no navigation */}
              <Route path="/admin/clients" element={
                <ProtectedRoute>
                  <ClientManager />
                </ProtectedRoute>
              } />

              {/* Reflection Test route - with navigation */}
              <Route path="/reflection-test" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ReflectionTest />
                  </AppLayout>
                </ProtectedRoute>
              } />

              {/* Confidence Check route - with navigation */}
              <Route path="/confidence-check" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ConfidenceCheck />
                  </AppLayout>
                </ProtectedRoute>
              } />

              {/* Core Skills Assessment route - admin only, no navigation */}
              <Route path="/core-skills/assessment" element={
                <ProtectedRoute>
                  <CoreSkillsAssessment />
                </ProtectedRoute>
              } />

              {/* Core Skills Self Assessment route - player access, with navigation */}
              <Route path="/core-skills/self-assessment" element={
                <ProtectedRoute>
                  <CoreSkillsSelfAssessment />
                </ProtectedRoute>
              } />

              {/* Best Self route - with navigation */}
              <Route path="/best-self" element={
                <ProtectedRoute>
                  <AppLayout>
                    <BestSelf />
                  </AppLayout>
                </ProtectedRoute>
              } />

              {/* Test Profile Flow route - for preview only */}
              <Route path="/test-profile-flow" element={<TestProfileFlow />} />

              {/* Test Home Page - diamond layout */}
              <Route path="/home-test" element={
                <ProtectedRoute>
                  <HomeTest />
                </ProtectedRoute>
              } />

              {/* Performance Page - combined progress + stadium */}
              <Route path="/performance" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Performance />
                  </AppLayout>
                </ProtectedRoute>
              } />

              {/* Tools Page */}
              <Route path="/tools" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Tools />
                  </AppLayout>
                </ProtectedRoute>
              } />

              {/* Identity Page - Tabbed DNA + Best Self */}
              <Route path="/identity" element={
                <ProtectedRoute>
                  <Identity />
                </ProtectedRoute>
              } />

              {/* Journey Page - Player Tasks */}
              <Route path="/journey" element={
                <ProtectedRoute>
                  <Journey />
                </ProtectedRoute>
              } />

              {/* Profile Page */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Profile />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
            </ProfileProvider>
          </AdminProvider>
        </AdminPlayerViewProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

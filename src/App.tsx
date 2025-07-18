import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Home from "./pages/Home";
import Stadium from "./pages/Stadium";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import GrownUpZone from "./pages/GrownUpZone";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Main app routes with navigation */}
          <Route path="/" element={
            <AppLayout>
              <Home />
            </AppLayout>
          } />
          <Route path="/stadium" element={
            <AppLayout>
              <Stadium />
            </AppLayout>
          } />
          <Route path="/progress" element={
            <AppLayout>
              <Progress />
            </AppLayout>
          } />
          <Route path="/profile" element={
            <AppLayout>
              <Profile />
            </AppLayout>
          } />
          
          {/* Grown Up Zone - no navigation */}
          <Route path="/grown-up" element={
            <AppLayout hideNavigation>
              <GrownUpZone />
            </AppLayout>
          } />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

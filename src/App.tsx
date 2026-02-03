import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import StarryBackground from '@/components/StarryBackground';
import BottomNavigation from '@/components/BottomNavigation';
import MiniPlayer from '@/components/MiniPlayer';
import FullscreenPlayer from '@/components/FullscreenPlayer';
import LoadingScreen from '@/components/LoadingScreen';
import AdminPanel from '@/components/AdminPanel';
import Auth from '@/pages/Auth';
import Home from '@/pages/Home';
import Search from '@/pages/Search';
import Library from '@/pages/Library';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, isLoading } = useAuth();
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StarryBackground />
      
      <div className="relative z-10 min-h-screen">
        <Routes>
          <Route
            path="/auth"
            element={user ? <Navigate to="/" replace /> : <Auth />}
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <Library />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>

        {user && (
          <>
            <MiniPlayer />
            <BottomNavigation />
            <FullscreenPlayer onSecretGesture={() => setShowAdminPanel(true)} />
            <AdminPanel
              isOpen={showAdminPanel}
              onClose={() => setShowAdminPanel(false)}
            />
          </>
        )}
      </div>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <PlayerProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </PlayerProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

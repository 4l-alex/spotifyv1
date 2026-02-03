import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlayerProvider } from '@/contexts/PlayerContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import StarryBackground from '@/components/StarryBackground';
import BottomNavigation from '@/components/BottomNavigation';
import MiniPlayer from '@/components/MiniPlayer';
import FullscreenPlayer from '@/components/FullscreenPlayer';
import AdminPanel from '@/components/AdminPanel';
import Home from '@/pages/Home';
import Search from '@/pages/Search';
import Library from '@/pages/Library';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function AppRoutes() {
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  return (
    <>
      <StarryBackground />
      
      <div className="relative z-10 min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/library" element={<Library />} />
          <Route path="/profile" element={<Profile onOpenAdmin={() => setShowAdminPanel(true)} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <MiniPlayer />
        <BottomNavigation />
        <FullscreenPlayer />
        <AdminPanel
          isOpen={showAdminPanel}
          onClose={() => setShowAdminPanel(false)}
        />
      </div>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <PlayerProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </PlayerProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;

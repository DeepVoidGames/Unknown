import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Collection from "./pages/Collection";
import Packs from "./pages/Packs";
import Settings from "./pages/Settings";
import Dimension from "./pages/Dimension";
import Upgrades from "./pages/Upgrades";
import NotFound from "./pages/NotFound";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { GAME_CONFIG, calculateCurrentIncome } from "@/config/gameConfig";
import { initGA, trackPageView } from "@/lib/analytics";
import { useLocation } from "react-router-dom";

const queryClient = new QueryClient();

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
};

const App = () => {
  const offlineProcessed = useRef(false);

  useEffect(() => {
    initGA();
  }, []);

  // Offline income calculation — runs once on mount
  useEffect(() => {
    if (offlineProcessed.current) return;
    offlineProcessed.current = true;

    const state = useGameStore.getState();
    const elapsed = Math.min(
      (Date.now() - state.lastSaved) / 1000,
      GAME_CONFIG.MAX_OFFLINE_SECONDS,
    );

    if (elapsed > 10) {
      const incomePerSecond = calculateCurrentIncome(state);
      const earned = Math.floor(incomePerSecond * elapsed);

      if (earned > 0) {
        state.updateSeeds(earned);
        toast.success(`Welcome back!`, {
          description: `You earned ${formatCurrency(earned)} Mega Seeds while away (${Math.floor(elapsed / 60)} min).`,
        });
      }
    }
  }, []);

  // Idle tick — every 1s
  useEffect(() => {
    const interval = setInterval(() => {
      const state = useGameStore.getState();
      const incomePerSecond = calculateCurrentIncome(state);

      if (incomePerSecond > 0) {
        state.updateSeeds(incomePerSecond);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnalyticsTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/packs" element={<Packs />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/dimension" element={<Dimension />} />
            <Route path="/upgrades" element={<Upgrades />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

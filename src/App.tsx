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
import Splicer from "./pages/Splicer";
import NotFound from "./pages/NotFound";

import { useEffect, useRef } from "react";
import { useGameStore, calculateCurrentIncome, getGameState } from "@/store/gameStore";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { GAME_CONFIG } from "@/config/gameConfig";
import { initGA, trackPageView } from "@/lib/analytics";
import { useLocation } from "react-router-dom";
import { AutoOpenManager } from "@/components/game/AutoOpenManager";
import { cloudLoad, cloudSave } from "./lib/api";

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

  // Initial Cloud Sync
  useEffect(() => {
    const sync = async () => {
      const cloudRes = await cloudLoad();
      if (!cloudRes.success) {
        console.warn("Initial sync: Server is offline, will try again later.");
        return;
      }

      const localState = useGameStore.getState();
      const cloudState = cloudRes.data;

      if (cloudState) {
        if (cloudState.lastSaved > localState.lastSaved) {
          // Cloud is newer
          const confirmLoad = window.confirm("A newer save was found on the Central Finite Curve. Load it?");
          if (confirmLoad) {
            useGameStore.setState(cloudState);
            toast.success("Cloud save loaded!");
          }
        } else if (localState.lastSaved > cloudState.lastSaved) {
          // Local is newer, upload it
          const stateToSave = getGameState(localState);
          const saveRes = await cloudSave(stateToSave);
          if (saveRes && saveRes.success) {
            localState.setLastCloudSave(Date.now());
            console.log("Local save synced to cloud (initial)");
          }
        }
      } else {
        // No cloud save exists, create first one
        const stateToSave = getGameState(localState);
        const saveRes = await cloudSave(stateToSave);
        if (saveRes && saveRes.success) {
          localState.setLastCloudSave(Date.now());
          console.log("First cloud save created");
        }
      }
    };
    // Small delay to let hydrate finish
    setTimeout(sync, 2000);
  }, []);

  // Cloud Auto-Save — every 60s
  useEffect(() => {
    const interval = setInterval(async () => {
      const state = useGameStore.getState();
      const stateToSave = getGameState(state);
      const res = await cloudSave(stateToSave);
      if (res && res.success) {
        state.setLastCloudSave(Date.now());
        console.log("Cloud auto-save successful");
      }
    }, 60000);
    return () => clearInterval(interval);
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
        <AutoOpenManager />
        <BrowserRouter>
          <AnalyticsTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/packs" element={<Packs />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/dimension" element={<Dimension />} />
            <Route path="/upgrades" element={<Upgrades />} />
            <Route path="/splicer" element={<Splicer />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

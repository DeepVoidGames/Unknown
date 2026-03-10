import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { Header } from "@/components/game/Header";
import { PortalArea } from "@/components/game/PortalArea";
import { CollectionTab } from "@/components/game/CollectionTab";
import { Footer } from "@/components/game/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Map, Beaker } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { GAME_CONFIG, calculateCurrentIncome } from "@/config/gameConfig";

const Index = () => {
  const offlineProcessed = useRef(false);

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
    <div className="min-h-screen bg-background">
      <Header />
      <PortalArea />

      <div className="flex justify-center py-6 bg-muted/20 border-y border-border gap-4 flex-wrap">
        <Link to="/packs">
          <Button
            size="lg"
            className="font-display font-bold gap-3 px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
          >
            <Package className="w-5 h-5" />
            Portal Shop
          </Button>
        </Link>
        <Link to="/dimension">
          <Button
            variant="secondary"
            size="lg"
            className="font-display font-bold gap-3 px-8 shadow-lg shadow-secondary/20 hover:shadow-secondary/40 transition-all"
          >
            <Map className="w-5 h-5" />
            Dimension Rift
          </Button>
        </Link>
        <Link to="/upgrades">
          <Button
            variant="outline"
            size="lg"
            className="font-display font-bold gap-3 px-8 shadow-lg transition-all border-primary/20 hover:border-primary/40 hover:bg-primary/10 hover:text-white"
          >
            <Beaker className="w-5 h-5 text-primary" />
            Rick's Lab
          </Button>
        </Link>
      </div>

      <CollectionTab />
      <Footer />
    </div>
  );
};

export default Index;

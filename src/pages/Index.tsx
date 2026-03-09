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

const MAX_OFFLINE_SECONDS = 24 * 60 * 60; // 24h

const Index = () => {
  const offlineProcessed = useRef(false);

  // Offline income calculation — runs once on mount
  useEffect(() => {
    if (offlineProcessed.current) return;
    offlineProcessed.current = true;

    const state = useGameStore.getState();
    const elapsed = Math.min(
      (Date.now() - state.lastSaved) / 1000,
      MAX_OFFLINE_SECONDS,
    );

    if (elapsed > 10) {
      const activeIncome = state.activeSlots.reduce(
        (sum, slot) => sum + (slot?.income ?? 0),
        0,
      );
      const inactiveCards = state.inventory.filter(
        (c) => !state.activeSlots.some((s) => s?.id === c.id),
      ).length;
      const bonus = 1 + inactiveCards / 100;
      
      // Apply Upgrade Multiplier (5% per level)
      const upgradeBonus = 1 + (state.upgrades.seeds * 0.05);
      
      const earned = Math.floor(activeIncome * bonus * upgradeBonus * elapsed);
      if (earned > 0) {
        state.updateSeeds(earned);
        toast.success(`Welcome back!`, {
          description: `You earned ${earned.toLocaleString()} Mega Seeds while away (${Math.floor(elapsed / 60)} min).`,
        });
      }
    }
  }, []);

  // Idle tick — every 1s
  useEffect(() => {
    const interval = setInterval(() => {
      const state = useGameStore.getState();
      const activeIncome = state.activeSlots.reduce(
        (sum, slot) => sum + (slot?.income ?? 0),
        0,
      );
      const inactiveCards = state.inventory.filter(
        (c) => !state.activeSlots.some((s) => s?.id === c.id),
      ).length;
      const bonus = 1 + inactiveCards / 100;
      
      // Apply Upgrade Multiplier (5% per level)
      const upgradeBonus = 1 + (state.upgrades.seeds * 0.05);
      
      const earned = activeIncome * bonus * upgradeBonus;
      if (earned > 0) {
        state.updateSeeds(earned);
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
            className="font-display font-bold gap-3 px-8 shadow-lg hover:bg-primary/5 transition-all border-primary/20"
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

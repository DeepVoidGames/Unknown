import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { Header } from "@/components/game/Header";
import { PortalArea } from "@/components/game/PortalArea";
import { CollectionTab } from "@/components/game/CollectionTab";
import { Footer } from "@/components/game/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
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
      const earned = Math.floor(activeIncome * bonus * elapsed);
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
      const earned = activeIncome * bonus;
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

      <div className="flex justify-center py-6 bg-muted/20 border-y border-border">
        <Link to="/packs">
          <Button
            size="lg"
            className="font-display font-bold gap-3 px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
          >
            <Package className="w-5 h-5" />
            Go to Portal Shop
          </Button>
        </Link>
      </div>

      <CollectionTab />
      <Footer />
    </div>
  );
};

export default Index;

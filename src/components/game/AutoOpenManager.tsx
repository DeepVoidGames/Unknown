import { useEffect, useCallback, useRef } from "react";
import { useGameStore, resolveCardStats } from "@/store/gameStore";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import packs from "@/data/packs.json";

export function AutoOpenManager() {
  const isAutoOpenActive = useGameStore((s) => s.isAutoOpenActive);
  const activePackId = useGameStore((s) => s.activePackId);
  const autoOpenHistory = useGameStore((s) => s.autoOpenHistory);
  const stopAutoOpen = useGameStore((s) => s.stopAutoOpen);
  const addToAutoOpenHistory = useGameStore((s) => s.addToAutoOpenHistory);
  
  const buyPack = useGameStore((s) => s.buyPack);
  const addCards = useGameStore((s) => s.addCards);
  const inventory = useGameStore((s) => s.inventory);
  const maxInventory = useGameStore((s) => s.maxInventory);
  
  const autoOpenTimerRef = useRef<NodeJS.Timeout | null>(null);

  const performAutoOpen = useCallback(() => {
    if (!activePackId) return;
    
    const pack = packs.find((p) => p.id === activePackId);
    if (!pack) {
      stopAutoOpen();
      return;
    }
    
    const state = useGameStore.getState();
    
    // Check conditions
    if (state.seeds < pack.cost) {
      toast.error("Out of Mega Seeds!", { description: "Auto-open stopped." });
      stopAutoOpen();
      return;
    }

    if (state.inventory.length >= state.maxInventory) {
      toast.error("Inventory Full!", { description: "Auto-open stopped." });
      stopAutoOpen();
      return;
    }

    const newCards = buyPack(activePackId);
    if (newCards) {
      addCards(newCards);
      addToAutoOpenHistory(newCards);
      
      // Schedule next open - slowed down to 1.2s for better visibility
      autoOpenTimerRef.current = setTimeout(performAutoOpen, 1200);
    } else {
      stopAutoOpen();
    }
  }, [activePackId, buyPack, addCards, stopAutoOpen, addToAutoOpenHistory]);

  useEffect(() => {
    if (isAutoOpenActive) {
      // Start the loop if not already running
      if (!autoOpenTimerRef.current) {
        performAutoOpen();
      }
    } else {
      // Clear timer if stopped
      if (autoOpenTimerRef.current) {
        clearTimeout(autoOpenTimerRef.current);
        autoOpenTimerRef.current = null;
      }
    }

    return () => {
      if (autoOpenTimerRef.current) {
        clearTimeout(autoOpenTimerRef.current);
        autoOpenTimerRef.current = null;
      }
    };
  }, [isAutoOpenActive, performAutoOpen]);

  if (!isAutoOpenActive || !activePackId) return null;

  const activePack = packs.find(p => p.id === activePackId);
  if (!activePack) return null;

  return (
    <div className="fixed bottom-24 right-6 z-[60] w-72 animate-in slide-in-from-right-10 duration-500">
      <div className="bg-card border-2 border-primary/40 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
         <div className="bg-primary/20 p-3 flex items-center justify-between border-b border-primary/30">
           <div className="flex items-center gap-2">
             <Loader2 className="w-4 h-4 text-primary animate-spin" />
             <span className="font-display font-bold text-xs tracking-wider uppercase">Auto-Opening</span>
           </div>
           <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-destructive/20" onClick={stopAutoOpen}>
             <X className="w-4 h-4" />
           </Button>
         </div>
         
         <div className="p-4 space-y-4">
           <div className="flex justify-between items-center text-[10px] uppercase font-bold text-muted-foreground">
             <span>{activePack.name}</span>
             <span>{formatCurrency(activePack.cost)}</span>
           </div>
           
           <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
             {autoOpenHistory.length === 0 && (
               <p className="text-center text-xs text-muted-foreground py-4 italic">Stabilizing portal...</p>
             )}
             {autoOpenHistory.map((card, i) => {
               const stats = resolveCardStats(card);
               return (
                 <div key={card.id + i} className="flex items-center gap-3 p-2 bg-muted/40 rounded-lg border border-border/50 animate-in slide-in-from-top-2 duration-300">
                   <img 
                     src={stats.character.customImage || `https://rickandmortyapi.com/api/character/avatar/${stats.character.avatarId}.jpeg`} 
                     className="w-8 h-8 rounded-md object-cover border border-primary/30"
                     alt=""
                   />
                   <div className="flex-1 min-w-0">
                     <p className="text-[10px] font-bold truncate">{stats.character.name}</p>
                     <div className="flex gap-1">
                       {card.types.map(t => (
                         <span key={t} className="text-[6px] px-1 rounded-sm bg-primary/20 text-primary-foreground font-bold">{t}</span>
                       ))}
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="text-[8px] font-bold text-primary">+{stats.income}</p>
                   </div>
                 </div>
               );
             })}
           </div>
           
           <div className="pt-2 border-t border-border flex justify-between items-center">
             <div className="text-[10px]">
               <span className="text-muted-foreground uppercase mr-1">Inventory:</span>
               <span className={inventory.length >= maxInventory ? "text-red-500" : "text-primary"}>
                 {inventory.length}/{maxInventory}
               </span>
             </div>
             <Button size="sm" variant="destructive" className="h-7 text-[10px] font-bold" onClick={stopAutoOpen}>
               STOP
             </Button>
           </div>
         </div>
      </div>
    </div>
  );
}

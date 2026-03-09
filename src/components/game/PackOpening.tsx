import { useState, useEffect } from 'react';
import { useGameStore, GameCard as CardType } from '@/store/gameStore';
import { GameCard } from './GameCard';
import { Button } from '@/components/ui/button';
import { Package, Sparkles, X, ChevronRight, Lock } from 'lucide-react';
import { toast } from 'sonner';
import packs from '@/data/packs.json';

interface PackOpeningProps {
  packId: string;
}

export function PackOpening({ packId }: PackOpeningProps) {
  const seeds = useGameStore((s) => s.seeds);
  const inventory = useGameStore((s) => s.inventory);
  const maxInventory = useGameStore((s) => s.maxInventory);
  const buyPack = useGameStore((s) => s.buyPack);
  const addCards = useGameStore((s) => s.addCards);
  const isUnlocked = useGameStore((s) => s.isPackUnlocked(packId));

  const pack = packs.find(p => p.id === packId);

  const [isOpen, setIsOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [revealedCards, setRevealedCards] = useState<CardType[]>([]);
  const [showCards, setShowCards] = useState<number[]>([]);
  const [portalVibration, setPortalVibration] = useState(0);

  useEffect(() => {
    if (isOpening) {
      const interval = setInterval(() => {
        setPortalVibration(v => (v + 1) % 5);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isOpening]);

  if (!pack) return null;

  const handleBuyPack = () => {
    if (!isUnlocked) {
      toast.error('Portal Locked!', {
        description: 'Reach higher dimension levels to unlock this portal.',
      });
      return;
    }

    if (inventory.length >= maxInventory) {
      toast.error('Inventory Full!', {
        description: 'Sell some cards to make room for new ones.',
      });
      return;
    }

    if (seeds < pack.cost) {
      toast.error('Not enough Mega Seeds!');
      return;
    }

    const newCards = buyPack(pack.id);
    if (newCards) {
      setIsOpen(true);
      setIsOpening(true);
      setRevealedCards(newCards);
      setShowCards([]);
      
      setTimeout(() => {
        setIsOpening(false);
      }, 2000);
    }
  };

  const revealCard = (index: number) => {
    if (showCards.includes(index)) return;
    setShowCards((prev) => [...prev, index]);

    if (showCards.length + 1 === pack.cardCount) {
      addCards(revealedCards);
    }
  };

  const closePortal = () => {
    if (showCards.length < pack.cardCount) {
      addCards(revealedCards);
    }
    setIsOpen(false);
    setRevealedCards([]);
    setShowCards([]);
  };

  const getUnlockRequirement = (id: string) => {
    if (id === 'mega') return 'Dimension Lvl 10';
    if (id === 'silver-rift') return 'Dimension Lvl 25';
    if (id === 'alchemists-portal') return 'Dimension Lvl 50';
    if (id === 'void-breach') return 'Dimension Lvl 100';
    return null;
  };

  const colorClass = pack.id === 'mega' ? 'text-blue-400' : pack.id === 'central-finite-curve' ? 'text-purple-400' : 'text-primary';
  const borderClass = pack.id === 'mega' ? 'border-blue-500/50' : pack.id === 'central-finite-curve' ? 'border-purple-500/50' : 'border-primary/50';

  return (
    <div className={`p-6 rounded-2xl bg-card border ${borderClass} flex flex-col md:flex-row items-center gap-6 group transition-all ${!isUnlocked ? 'grayscale opacity-60' : 'hover:bg-muted/10'}`}>
      <div className="relative">
        <div className={`w-24 h-24 rounded-3xl bg-muted/20 flex items-center justify-center relative shadow-2xl overflow-hidden`}>
          <Package className={`w-12 h-12 ${colorClass} ${isUnlocked && 'group-hover:scale-110'} transition-transform`} />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-50" />
          {!isUnlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
               <Lock className="w-8 h-8 text-white/80" />
            </div>
          )}
        </div>
        {pack.id !== 'standard' && isUnlocked && (
           <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
        )}
      </div>

      <div className="flex-1 space-y-2 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2">
          <h3 className="font-display text-xl font-bold">{pack.name}</h3>
          {!isUnlocked && (
            <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-red-500/40">
              Unlock at {getUnlockRequirement(pack.id)}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground font-body max-w-xs">{pack.description}</p>
        
        <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
          {Object.entries(pack.weights)
            .filter(([_, chance]) => (chance as number) > 0)
            .map(([type, chance]) => (
              <div key={type} className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/40 border border-border/50">
                 <span className="text-[8px] font-bold uppercase opacity-60 tracking-tighter">{type}</span>
                 <span className="text-[10px] font-display font-bold text-foreground">{(chance as number * 100).toFixed(0)}%</span>
              </div>
            ))}
          {pack.combineChance > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
               <span className="text-[8px] font-bold uppercase text-primary tracking-tighter">Merge</span>
               <span className="text-[10px] font-display font-bold text-primary">{(pack.combineChance * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>
      </div>

      <Button 
        onClick={handleBuyPack} 
        disabled={seeds < pack.cost || !isUnlocked}
        className="font-display font-bold min-w-[140px] shadow-xl"
        variant={!isUnlocked ? 'outline' : 'default'}
      >
        {!isUnlocked ? 'LOCKED' : `Buy for ${pack.cost.toLocaleString()}`}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-2xl p-6 overflow-hidden">
          {/* Background Portal FX */}
          <div className={`absolute inset-0 opacity-20 pointer-events-none transition-all duration-1000 ${isOpening ? 'scale-150' : 'scale-100'}`}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary blur-[120px] animate-pulse" />
          </div>

          <div className="relative w-full max-w-6xl flex flex-col items-center">
            {isOpening ? (
              <div 
                className="flex flex-col items-center gap-8 animate-in zoom-in duration-300"
                style={{ transform: `translate(${portalVibration}px, ${portalVibration}px)` }}
              >
                <div className="relative">
                   <div className="absolute inset-0 blur-3xl bg-primary/40 animate-pulse" />
                   <div className="w-56 h-72 bg-gradient-to-b from-primary/20 to-primary/60 rounded-3xl border-4 border-primary shadow-[0_0_100px_rgba(var(--primary),0.6)] flex items-center justify-center relative overflow-hidden">
                      <Package className="w-24 h-24 text-white animate-bounce drop-shadow-2xl" />
                      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,transparent,rgba(0,0,0,0.5))]" />
                   </div>
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-4xl font-display font-bold text-primary tracking-[0.2em] animate-pulse">
                    STABILIZING RIFT
                  </h2>
                  <p className="text-muted-foreground font-body text-sm">Accessing Rick's Secret Stash...</p>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-12 animate-in fade-in duration-1000">
                <div className="text-center space-y-2">
                  <h2 className="text-4xl font-display font-bold text-foreground">
                    {showCards.length === pack.cardCount ? 'ENTITY ACQUIRED' : 'MANIFESTING...'}
                  </h2>
                  <p className="text-muted-foreground">Click to stabilize the interdimensional form</p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                  {revealedCards.map((card, i) => (
                    <div key={i} className="relative">
                      {showCards.includes(i) ? (
                        <div className="animate-in flip-in-y duration-700">
                          <GameCard card={card} />
                        </div>
                      ) : (
                        <button
                          onClick={() => revealCard(i)}
                          className="w-44 h-64 bg-gradient-to-br from-muted/80 to-muted-foreground/10 rounded-2xl border-2 border-border/50 flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-all hover:scale-105 group relative overflow-hidden shadow-2xl"
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary),0.1),transparent)] group-hover:opacity-100 opacity-0 transition-opacity" />
                          <div className="w-14 h-14 rounded-full bg-background/50 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-inner">
                            <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                          </div>
                          <span className="text-[10px] font-display font-bold text-muted-foreground tracking-[0.3em] uppercase group-hover:text-primary">DECRYPT</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {showCards.length === pack.cardCount && (
                  <Button 
                    onClick={closePortal} 
                    size="lg" 
                    className="font-display font-bold px-16 py-8 text-xl shadow-2xl animate-in slide-in-from-bottom-8"
                  >
                    RETURN TO CITADEL
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

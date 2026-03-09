import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/game/Header";
import { Footer } from "@/components/game/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Map, ArrowLeft, Sword, Trophy, History, Zap } from "lucide-react";
import { useGameStore, GameCard as GameCardType } from "@/store/gameStore";
import { GameCard } from "@/components/game/GameCard";
import { toast } from "sonner";

const Dimension = () => {
  const { 
    seeds, 
    inventory, 
    isDimensionActive, 
    dimensionLevel, 
    maxDimensionLevel,
    startDimension,
    nextDimensionLevel,
    resetDimension,
    generateRandomCard
  } = useGameStore();

  const [enemyCard, setEnemyCard] = useState<GameCardType | null>(null);
  const [isFighting, setIsFighting] = useState(false);

  // Find player's strongest card
  const playerStrongestCard = useMemo(() => {
    if (inventory.length === 0) return null;
    return [...inventory].sort((a, b) => b.power - a.power)[0];
  }, [inventory]);

  // Generate enemy when level changes or dimension starts
  useEffect(() => {
    if (isDimensionActive && !enemyCard) {
      const randomEnemy = generateRandomCard({ "COMMON": 0.6, "RARE": 0.3, "HOLO": 0.08, "FULL_ART": 0.02 }, 0.1);
      // Scale enemy power based on dimension level
      const scaleFactor = 1 + (dimensionLevel - 1) * 0.25;
      randomEnemy.power = Math.floor(randomEnemy.power * scaleFactor);
      setEnemyCard(randomEnemy);
    }
  }, [isDimensionActive, dimensionLevel, enemyCard, generateRandomCard]);

  const handleStart = () => {
    if (seeds < 1000) {
      toast.error("Not enough Mega Seeds!", {
        description: "You need 1000 Mega Seeds to stabilize the portal."
      });
      return;
    }
    if (startDimension()) {
      toast.success("Portal Stabilized!", {
        description: "Entering the unknown dimension..."
      });
    }
  };

  const handleFight = () => {
    if (!playerStrongestCard || !enemyCard) return;

    setIsFighting(true);
    
    // Simulate a brief delay for "animation"
    setTimeout(() => {
      if (playerStrongestCard.power >= enemyCard.power) {
        const { bonus, milestoneUnlocked } = nextDimensionLevel();
        
        if (milestoneUnlocked) {
          toast.success(`MILESTONE REACHED!`, {
            description: `You unlocked: ${milestoneUnlocked}!`,
            duration: 5000,
          });
        } else if (bonus > 0) {
          toast.success(`Victory! Level ${dimensionLevel} cleared.`, {
            description: `Milestone Bonus: +${bonus} Mega Seeds!`
          });
        } else {
          toast.success(`Victory! Level ${dimensionLevel} cleared.`);
        }
        
        setEnemyCard(null);
      } else {
        const reward = dimensionLevel * 500;
        toast.error(`Defeat! You reached level ${dimensionLevel}.`, {
          description: `Final Reward: ${reward} Mega Seeds.`
        });
        resetDimension(reward);
        setEnemyCard(null);
      }
      setIsFighting(false);
    }, 1500); // Extended for slower animation
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Top Bar Info */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Map className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl">Dimension Rift</h1>
                <p className="text-xs text-muted-foreground">Current Level: {isDimensionActive ? dimensionLevel : "Inactive"}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-bold">Best: Lvl {maxDimensionLevel}</span>
              </div>
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Return
                </Button>
              </Link>
            </div>
          </div>

          {!isDimensionActive ? (
            /* LOBBY VIEW */
            <div className="flex flex-col items-center justify-center py-12 space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-display font-bold">Interdimensional Battle</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Pay 1,000 Mega Seeds to enter the rift. Face increasingly stronger enemies and earn rewards based on your progress.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
                <div className="bg-card p-6 rounded-2xl border border-border flex flex-col items-center space-y-4">
                  <Zap className="w-8 h-8 text-yellow-500" />
                  <h3 className="font-bold">Your Champion</h3>
                  {playerStrongestCard ? (
                    <div className="scale-90 pointer-events-none">
                      <GameCard card={playerStrongestCard} />
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic text-center">No cards in inventory</p>
                  )}
                  <p className="text-xs text-muted-foreground">Your strongest card will represent you.</p>
                </div>

                <div className="bg-card p-6 rounded-2xl border border-border flex flex-col items-center justify-center space-y-4 border-dashed">
                  <Sword className="w-8 h-8 text-red-500" />
                  <h3 className="font-bold text-muted-foreground">The Unknown</h3>
                  <div className="w-40 h-64 bg-muted/50 rounded-xl flex items-center justify-center">
                    <span className="text-4xl font-bold text-muted-foreground/20">?</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Enemy strength scales with level.</p>
                </div>
              </div>

              <Button 
                onClick={handleStart} 
                size="lg" 
                className="px-12 py-6 text-xl font-display font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all"
              >
                Open Portal (1,000 Seeds)
              </Button>
            </div>
          ) : (
            /* BATTLE VIEW */
            <div className="flex flex-col items-center py-8 space-y-12">
              <div className="text-center">
                <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-bold border border-primary/20">
                  DIMENSION LEVEL {dimensionLevel}
                </span>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24 w-full">
                {/* PLAYER */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                    You
                  </div>
                  <div className={`transition-all duration-300 ${isFighting ? 'animate-battle-jump' : ''}`}>
                    {playerStrongestCard && <GameCard card={playerStrongestCard} />}
                  </div>
                  <div className="flex items-center gap-2 text-2xl font-bold">
                    <Sword className="w-6 h-6 text-red-500" />
                    {playerStrongestCard?.power}
                  </div>
                </div>

                {/* VS */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-border shadow-inner">
                    <span className="text-xl font-display font-black italic text-muted-foreground">VS</span>
                  </div>
                  <div className="h-px w-24 bg-gradient-to-r from-transparent via-border to-transparent mt-4" />
                </div>

                {/* ENEMY */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                    Enemy
                  </div>
                  <div className={`transition-all duration-300 ${isFighting ? 'animate-battle-jump' : ''}`}>
                    {enemyCard && <GameCard card={enemyCard} />}
                  </div>
                  <div className="flex items-center gap-2 text-2xl font-bold text-red-500">
                    <Sword className="w-6 h-6" />
                    {enemyCard?.power}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <Button 
                  onClick={handleFight}
                  disabled={isFighting || !playerStrongestCard || !enemyCard}
                  size="lg"
                  className="px-20 py-8 text-2xl font-display font-bold bg-red-600 hover:bg-red-700 shadow-xl shadow-red-900/20"
                >
                  {isFighting ? "FIGHTING..." : "FIGHT!"}
                </Button>
                <p className="text-xs text-muted-foreground italic">
                  Winner is decided by total Power. Good luck!
                </p>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dimension;

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/game/Header";
import { Footer } from "@/components/game/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Map, ArrowLeft, Sword, History, Zap, Beaker } from "lucide-react";
import { useGameStore, resolveCardStats } from "@/store/gameStore";
import { GameCard as GameCardType } from "@/types/game";
import { GameCard } from "@/components/game/GameCard";
import { toast } from "sonner";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { GAME_CONFIG } from "@/config/gameConfig";

const Dimension = () => {
  const {
    seeds,
    inventory,
    isDimensionActive,
    dimensionLevel,
    maxDimensionLevel,
    currentEnemy,
    upgrades,
    startDimension,
    nextDimensionLevel,
    resetDimension,
  } = useGameStore();

  const [isFighting, setIsFighting] = useState(false);
  const [battleState, setBattleState] = useState<{
    playerAttacking: boolean;
    enemyAttacking: boolean;
    playerDamage: number | null;
    enemyDamage: number | null;
  }>({
    playerAttacking: false,
    enemyAttacking: false,
    playerDamage: null,
    enemyDamage: null,
  });

  // Find player's strongest card and calculate base vs bonus
  const playerStats = useMemo(() => {
    if (inventory.length === 0) return null;
    
    // Process inventory to resolve stats first
    const resolvedInventory = inventory
      .filter(Boolean)
      .map(card => ({
        card,
        stats: resolveCardStats(card)
      }))
      .sort((a, b) => b.stats.power - a.stats.power);
      
    const strongest = resolvedInventory[0];

    // Lab Power Upgrade
    const powerMultiplier = 1 + upgrades.power * GAME_CONFIG.UPGRADES.power.BONUS_PER_LEVEL;
    const totalPower = Math.floor(strongest.stats.power * powerMultiplier);

    return {
      card: strongest.card,
      basePower: strongest.stats.power,
      totalPower,
      bonusPercent: Math.round(upgrades.power * GAME_CONFIG.UPGRADES.power.BONUS_PER_LEVEL * 100),
    };
  }, [inventory, upgrades.power]);

  const handleStart = () => {
    if (seeds < GAME_CONFIG.DIMENSION_ENTRY_COST) {
      toast.error("Not enough Mega Seeds!");
      return;
    }
    if (startDimension()) {
      toast.success("Portal Stabilized!", {
        description: "Entering the unknown dimension...",
      });
    }
  };

  const handleFight = async () => {
    if (!playerStats || !currentEnemy) return;
    
    const enemyStats = resolveCardStats(currentEnemy);
    setIsFighting(true);
    const playerWins = playerStats.totalPower >= enemyStats.power;

    // 1. Player Attack
    setBattleState(s => ({ ...s, playerAttacking: true }));
    
    await new Promise(r => setTimeout(r, 300));
    // Damage pops up on enemy
    setBattleState(s => ({ ...s, enemyDamage: playerStats.totalPower }));
    
    await new Promise(r => setTimeout(r, 400));
    setBattleState(s => ({ ...s, playerAttacking: false }));

    // 2. Enemy Attack - ONLY if player didn't win yet
    if (!playerWins) {
      await new Promise(r => setTimeout(r, 200));
      setBattleState(s => ({ ...s, enemyAttacking: true }));
      
      await new Promise(r => setTimeout(r, 300));
      // Damage pops up on player
      setBattleState(s => ({ ...s, playerDamage: enemyStats.power }));
      
      await new Promise(r => setTimeout(r, 400));
      setBattleState(s => ({ ...s, enemyAttacking: false }));
    }

    // 3. Final Result
    setTimeout(() => {
      if (dimensionLevel >= GAME_CONFIG.DIMENSIONS.MAX_LEVEL) {
        toast.success(`EPIC VICTORY! You conquered the Dimension Rift!`, {
          description: `You've reached the maximum level and unlocked all rewards!`,
        });
        resetDimension(GAME_CONFIG.DIMENSIONS.MAX_LEVEL_REWARD);
      } else if (playerWins) {
        const { bonus, milestoneUnlocked } = nextDimensionLevel();

        if (milestoneUnlocked) {
          toast.success(`MILESTONE REACHED!`, {
            description: `You unlocked: ${milestoneUnlocked}!`,
            duration: 5000,
          });
        } else if (bonus > 0) {
          toast.success(`Victory! Level ${dimensionLevel} cleared.`, {
            description: `Milestone Bonus: +${formatCurrency(bonus)} Mega Seeds!`,
          });
        } else {
          toast.success(`Victory! Level ${dimensionLevel} cleared.`);
        }
      } else {
        const reward = dimensionLevel * GAME_CONFIG.DIMENSIONS.LEVEL_REWARD_MULTIPLIER;
        toast.error(`Defeat! You reached level ${dimensionLevel}.`, {
          description: `Final Reward: ${formatCurrency(reward)} Mega Seeds.`,
        });
        resetDimension(reward);
      }
      
      setIsFighting(false);
      setBattleState({
        playerAttacking: false,
        enemyAttacking: false,
        playerDamage: null,
        enemyDamage: null,
      });
    }, 400);
  };

  const enemyPower = useMemo(() => {
    if (!currentEnemy) return 0;
    return resolveCardStats(currentEnemy).power;
  }, [currentEnemy]);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Header />

      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="w-6 h-6" />
                </Button>
              </Link>
              <div>
                <h1 className="font-display font-bold text-2xl">
                  Dimension Rift
                </h1>
                <p className="text-xs text-muted-foreground">
                  Current Level:{" "}
                  {isDimensionActive ? dimensionLevel : "Inactive"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs font-bold px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full">
                <Beaker className="w-3.5 h-3.5" />
                Lab Bonus: +{Math.round(upgrades.power * GAME_CONFIG.UPGRADES.power.BONUS_PER_LEVEL * 100)}% Power
              </div>
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-bold">
                  Best: Lvl {maxDimensionLevel}
                </span>
              </div>
            </div>
          </div>

          {!isDimensionActive ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-display font-bold">
                  Interdimensional Battle
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Face increasingly stronger enemies using your strongest
                  character.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
                <div className="bg-card p-6 rounded-2xl border border-border flex flex-col items-center space-y-4">
                  <Zap className="w-8 h-8 text-yellow-500" />
                  <h3 className="font-bold">Your Champion</h3>
                  {playerStats ? (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="scale-90 pointer-events-none">
                        <GameCard card={playerStats.card} />
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
                          <Sword className="w-6 h-6 text-red-500" />
                          {formatNumber(playerStats.totalPower)}
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">
                          Base {formatNumber(playerStats.basePower)} +{" "}
                          {playerStats.bonusPercent}% Lab Bonus
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic text-center">
                      No cards in inventory
                    </p>
                  )}
                </div>

                <div className="bg-card p-6 rounded-2xl border border-border flex flex-col items-center justify-center space-y-4 border-dashed">
                  <Sword className="w-8 h-8 text-red-500" />
                  <h3 className="font-bold text-muted-foreground">
                    The Unknown
                  </h3>
                  <div className="w-40 h-64 bg-muted/50 rounded-xl flex items-center justify-center">
                    <span className="text-4xl font-bold text-muted-foreground/20">
                      ?
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enemy strength scales with level.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleStart}
                size="lg"
                className="px-12 py-6 text-xl font-display font-bold shadow-xl"
              >
                Open Portal ({formatCurrency(1000)} Seeds)
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 space-y-12">
              <div className="flex flex-col items-center justify-center gap-8 md:gap-32 md:flex-row w-full relative">
                
                {/* PLAYER */}
                <div className="flex flex-col items-center space-y-4 relative">
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                    You
                  </div>
                  <div
                    className={`transition-all duration-300 relative ${
                      battleState.playerAttacking ? "animate-battle-jump" : ""
                    }`}
                  >
                    {playerStats && <GameCard card={playerStats.card} />}
                    
                    {/* Player Damage Indicator */}
                    {battleState.playerDamage !== null && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                        <span className="text-4xl font-black text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-damage">
                          -{formatNumber(battleState.playerDamage)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-2 text-3xl font-bold text-foreground">
                      <Sword className="w-7 h-7 text-red-500" />
                      {formatNumber(playerStats?.totalPower || 0)}
                    </div>
                    {playerStats && playerStats.bonusPercent > 0 && (
                      <div className="flex items-center justify-center gap-1.5 text-[10px] text-primary font-bold uppercase">
                        <Beaker className="w-3 h-3" />
                        Includes +{playerStats.bonusPercent}% Lab Power
                      </div>
                    )}
                  </div>
                </div>

                {/* VS ICON */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-border shadow-inner">
                    <span className="text-xl font-display font-black italic text-muted-foreground">
                      VS
                    </span>
                  </div>
                </div>

                {/* ENEMY */}
                <div className="flex flex-col items-center space-y-4 relative">
                  <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                    Enemy
                  </div>
                  <div
                    className={`transition-all duration-300 relative ${
                      battleState.enemyAttacking ? "animate-battle-jump" : ""
                    }`}
                  >
                    {currentEnemy && <GameCard card={currentEnemy} />}
                    
                    {/* Enemy Damage Indicator */}
                    {battleState.enemyDamage !== null && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                        <span className="text-4xl font-black text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-damage">
                          -{formatNumber(battleState.enemyDamage)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-3xl font-bold text-red-500">
                    <Sword className="w-7 h-7" />
                    {formatNumber(enemyPower)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <Button
                  onClick={handleFight}
                  disabled={isFighting || !playerStats || !currentEnemy}
                  size="lg"
                  className="px-20 py-8 text-2xl font-display font-bold bg-red-600 hover:bg-red-700 shadow-xl"
                >
                  {isFighting ? "FIGHTING..." : "FIGHT!"}
                </Button>
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

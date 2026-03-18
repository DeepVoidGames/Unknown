import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/game/Header";
import { Footer } from "@/components/game/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Map,
  ArrowLeft,
  Sword,
  History,
  Zap,
  Beaker,
  ChevronDown,
  ChevronUp,
  Trophy,
} from "lucide-react";
import { useGameStore, resolveCardStats } from "@/store/gameStore";
import { GameCard as GameCardType } from "@/types/game";
import { GameCard } from "@/components/game/GameCard";
import { toast } from "sonner";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { GAME_CONFIG } from "@/config/gameConfig";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
  const [showMilestones, setShowMilestones] = useState(false);

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
      .map((card) => ({
        card,
        stats: resolveCardStats(card),
      }))
      .sort((a, b) => b.stats.power - a.stats.power);

    const strongest = resolvedInventory[0];

    // Lab Power Upgrade
    const powerMultiplier =
      1 + upgrades.power * GAME_CONFIG.UPGRADES.power.BONUS_PER_LEVEL;
    const totalPower = Math.floor(strongest.stats.power * powerMultiplier);

    return {
      card: strongest.card,
      basePower: strongest.stats.power,
      totalPower,
      bonusPercent: Math.round(
        upgrades.power * GAME_CONFIG.UPGRADES.power.BONUS_PER_LEVEL * 100,
      ),
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
    setBattleState((s) => ({ ...s, playerAttacking: true }));

    await new Promise((r) => setTimeout(r, 300));
    // Damage pops up on enemy
    setBattleState((s) => ({ ...s, enemyDamage: playerStats.totalPower }));

    await new Promise((r) => setTimeout(r, 400));
    setBattleState((s) => ({ ...s, playerAttacking: false }));

    // 2. Enemy Attack - ONLY if player didn't win yet
    if (!playerWins) {
      await new Promise((r) => setTimeout(r, 200));
      setBattleState((s) => ({ ...s, enemyAttacking: true }));

      await new Promise((r) => setTimeout(r, 300));
      // Damage pops up on player
      setBattleState((s) => ({ ...s, playerDamage: enemyStats.power }));

      await new Promise((r) => setTimeout(r, 400));
      setBattleState((s) => ({ ...s, enemyAttacking: false }));
    }

    // 3. Final Result
    setTimeout(() => {
      if (dimensionLevel >= GAME_CONFIG.DIMENSIONS.MAX_LEVEL) {
        toast.success(`EPIC VICTORY! You conquered the Dimension Rift!`, {
          description: `You've reached the maximum level and unlocked all rewards!`,
        });
        resetDimension(GAME_CONFIG.DIMENSIONS.MAX_LEVEL_REWARD);
      } else if (playerWins) {
        const { bonus, inventoryBonus, milestoneUnlocked } =
          nextDimensionLevel();

        if (milestoneUnlocked) {
          toast.success(`MILESTONE REACHED!`, {
            description: `You unlocked: ${milestoneUnlocked}!${inventoryBonus > 0 ? ` +${inventoryBonus} Card Slots!` : ""}`,
            duration: 5000,
          });
        } else if (bonus > 0) {
          toast.success(`Victory! Level ${dimensionLevel} cleared.`, {
            description: `Bonus: +${formatCurrency(bonus)} Mega Seeds${inventoryBonus > 0 ? ` & +${inventoryBonus} Card Slots!` : ""}`,
          });
        } else {
          toast.success(`Victory! Level ${dimensionLevel} cleared.`);
        }
      } else {
        const reward =
          dimensionLevel * GAME_CONFIG.DIMENSIONS.LEVEL_REWARD_MULTIPLIER;
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
                Lab Bonus: +
                {Math.round(
                  upgrades.power *
                    GAME_CONFIG.UPGRADES.power.BONUS_PER_LEVEL *
                    100,
                )}
                % Power
              </div>
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-bold">
                  Best: Lvl {maxDimensionLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Milestone Progress Section */}
          <Collapsible
            open={showMilestones}
            onOpenChange={setShowMilestones}
            className="w-full space-y-2"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full flex justify-between items-center p-6 bg-card/40 border-border/50 hover:bg-card/60 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg transition-colors ${showMilestones ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
                  >
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-display font-bold uppercase tracking-tight Stext-white">
                      Citadel Milestones
                    </p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">
                      Current Rank:{" "}
                      {maxDimensionLevel >= 100
                        ? "Dimension Master"
                        : maxDimensionLevel >= 50
                          ? "Alchemist"
                          : maxDimensionLevel >= 25
                            ? "Rift Walker"
                            : maxDimensionLevel >= 10
                              ? "Novice Traveler"
                              : "Lost Soul"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex flex-col items-end">
                    <p className="text-xs font-black text-primary font-display leading-none">
                      {Math.min(
                        100,
                        Math.round((maxDimensionLevel / 100) * 100),
                      )}
                      %
                    </p>
                    <p className="text-[8px] text-muted-foreground uppercase font-bold">
                      Progress
                    </p>
                  </div>
                  {showMilestones ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="bg-card/40 border border-border rounded-xl p-6 space-y-6 shadow-inner backdrop-blur-sm">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      Rift Completion
                    </h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                      Unlock powerful bonuses at each milestone
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-display font-black text-primary leading-none drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]">
                      {maxDimensionLevel}
                      <span className="text-xs text-muted-foreground">
                        /100
                      </span>
                    </p>
                  </div>
                </div>

                <div className="relative h-4 bg-muted/50 rounded-full overflow-hidden border border-border/50 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-primary/40 via-primary to-primary rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.min(100, (maxDimensionLevel / 100) * 100)}%`,
                    }}
                  />
                  {/* Milestone Markers */}
                  {[10, 25, 50, 100].map((m) => (
                    <div
                      key={m}
                      className={`absolute top-0 w-1 h-full z-10 transition-colors ${maxDimensionLevel >= m ? "bg-white/40" : "bg-white/10"}`}
                      style={{ left: `${m}%` }}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[10, 25, 50, 100].map((m) => {
                    const name = GAME_CONFIG.DIMENSIONS.MILESTONES[m];
                    const isReached = maxDimensionLevel >= m;
                    return (
                      <div
                        key={m}
                        className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-500 ${
                          isReached
                            ? "bg-primary/10 border-primary/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                            : "bg-muted/30 border-border/50 opacity-40 grayscale"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${isReached ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
                        >
                          <span className="text-[10px] font-black font-display">
                            {m}
                          </span>
                        </div>
                        <p
                          className={`text-[10px] font-black font-display text-center leading-tight mb-1 ${isReached ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {name || "???"}
                        </p>
                        <div
                          className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${isReached ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
                        >
                          {isReached ? "UNLOCKED" : "LOCKED"}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-start gap-3">
                  <div className="bg-primary/20 p-1.5 rounded-md mt-0.5">
                    <Beaker className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase">
                      Current Active Bonus
                    </p>
                    <p className="text-xs text-muted-foreground">
                      You've gained{" "}
                      <span className="text-primary font-bold">
                        +{Math.floor(maxDimensionLevel / 5) * 5}
                      </span>{" "}
                      extra card slots from your rift progression.
                    </p>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

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

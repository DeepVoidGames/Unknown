import { useState, useMemo } from "react";
import { useGameStore, resolveCardStats } from "@/store/gameStore";
import { Header } from "@/components/game/Header";
import { GameCard } from "@/components/game/GameCard";
import { Footer } from "@/components/game/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Beaker,
  Sparkles,
  AlertTriangle,
  Zap,
  ChevronRight,
  Dna,
  Filter,
  Trash2,
  Info,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getPrimaryType,
  RARITY_STYLES,
  TYPE_ICONS,
} from "@/config/rarityConfig";
import { toast } from "sonner";
import cardTypes from "@/data/cardTypes.json";

const Splicer = () => {
  const inventory = useGameStore((s) => s.inventory);
  const spliceCards = useGameStore((s) => s.spliceCards);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSplicing, setIsSplicing] = useState(false);
  const [resultCard, setResultCard] = useState<any>(null);
  const [filterRarity, setFilterRarity] = useState<string>("COMMON");

  const toggleSelect = (id: string) => {
    if (isSplicing) return;
    setResultCard(null);

    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const handleFilterChange = (rarity: string) => {
    setFilterRarity(rarity);
    setSelectedIds([]); // Unselect all when switching tags
    setResultCard(null);
  };

  const filteredInventory = useMemo(() => {
    // 1. Group cards by characterId and rarity to find those with 5+ copies
    const groups: Record<string, number> = {};
    inventory.forEach((card) => {
      const rarity = getPrimaryType(card.types);
      const key = `${card.characterId}-${rarity}`;
      groups[key] = (groups[key] || 0) + 1;
    });

    const validKeys = new Set(
      Object.keys(groups).filter((key) => groups[key] >= 5),
    );

    // 2. Initial filter by rarity and copy count
    let list = inventory.filter((card) => {
      const rarity = getPrimaryType(card.types);
      const key = `${card.characterId}-${rarity}`;
      return rarity === filterRarity && validKeys.has(key);
    });

    // 3. If something is already selected, only show copies of that specific card
    if (selectedIds.length > 0) {
      const firstSelected = inventory.find((c) => c.id === selectedIds[0]);
      if (firstSelected) {
        list = list.filter(
          (card) =>
            card.characterId === firstSelected.characterId &&
            getPrimaryType(card.types) === getPrimaryType(firstSelected.types),
        );
      }
    }

    return list;
  }, [inventory, filterRarity, selectedIds]);

  const selectedCards = useMemo(() => {
    return inventory.filter((c) => selectedIds.includes(c.id));
  }, [inventory, selectedIds]);

  const batchRarity = useMemo(() => {
    if (selectedCards.length === 0) return null;
    const rarities = selectedCards.map((c) => getPrimaryType(c.types));
    if (rarities.every((r) => r === rarities[0])) return rarities[0];
    return "MIXED";
  }, [selectedCards]);

  const isValidBatch =
    selectedCards.length === 5 &&
    batchRarity &&
    batchRarity !== "MIXED" &&
    batchRarity !== "REVERT";

  const handleSplice = async () => {
    if (!isValidBatch) return;

    setIsSplicing(true);
    setResultCard(null);

    // Aesthetic delay for Rick science
    await new Promise((r) => setTimeout(r, 2000));

    const result = spliceCards(selectedIds);
    if (result) {
      setResultCard(result);
      setSelectedIds([]);
      toast.success("GENETIC STABILIZATION COMPLETE", {
        description: "A superior lifeform has been synthesized.",
      });
    }

    setIsSplicing(false);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-primary/20"
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground flex items-center gap-3">
                <Dna className="w-8 h-8 text-primary animate-pulse" />
                Genetic Splicer
              </h2>
              <p className="text-muted-foreground font-body text-sm sm:text-base">
                Break biological boundaries. Upgrade your entities.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Controls & Selection (Lg: 8 cols) */}
          <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">
            {/* Filter Bar */}
            <div className="bg-card/40 border border-border p-4 rounded-2xl flex flex-col xl:flex-row justify-between items-center gap-4 sticky top-20 z-30 backdrop-blur-md">
              <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                {cardTypes.map(type => (
                  <Button
                    key={type.id}
                    variant={filterRarity === type.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange(type.id)}
                    className={`rounded-full text-[10px] h-7 px-3 border-${type.id.toLowerCase()}/20`}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-3 shrink-0 bg-background/40 px-4 py-2 rounded-full border border-border/50">
                <span className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-widest">
                  Ready
                </span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full border ${i < selectedIds.length ? "bg-primary border-primary shadow-[0_0_8px_hsl(var(--primary))]" : "bg-transparent border-border"}`}
                    />
                  ))}
                </div>
                {selectedIds.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:bg-destructive/10 ml-1"
                    onClick={() => setSelectedIds([])}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Inventory Grid - Using auto-fill to prevent overlapping */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 sm:gap-6 justify-items-center">
              {filteredInventory.map((card) => {
                const isSelected = selectedIds.includes(card.id);
                return (
                  <div
                    key={card.id}
                    className={`relative transition-all duration-300 cursor-pointer w-full max-w-[180px] ${isSelected ? "scale-95" : "hover:scale-105"}`}
                    onClick={() => toggleSelect(card.id)}
                  >
                    <div className="w-full flex justify-center">
                      <div className="transform origin-top scale-90 sm:scale-100">
                        <GameCard card={card} />
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-0 right-0 z-40 bg-primary text-primary-foreground rounded-full p-1 shadow-lg translate-x-1/3 -translate-y-1/3">
                        <Zap className="w-3 h-3 fill-current" />
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredInventory.length === 0 && (
                <div className="col-span-full py-32 flex flex-col items-center justify-center text-muted-foreground space-y-4 bg-muted/10 rounded-3xl border-2 border-dashed border-border">
                  <Filter className="w-12 h-12 opacity-20" />
                  <p className="font-display font-bold uppercase tracking-widest text-sm text-center px-6">
                    No entities with 5+ copies found in this resonance
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Splicing Machine (Lg: 4 cols) - Sticky on Desktop */}
          <div className="lg:col-span-4 space-y-6 order-1 lg:order-2 lg:sticky lg:top-24">
            <div className="bg-card border-2 border-primary/20 rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)] group">
              {/* Background Tech Decor */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10 group-hover:bg-primary/10 transition-colors" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -z-10" />

              <div className="flex flex-col items-center text-center space-y-8">
                {/* Result/Status Chamber */}
                <div className="relative w-full aspect-square max-w-[280px]">
                  <div
                    className={`absolute inset-0 rounded-full border-2 border-dashed border-primary/20 animate-[spin_20s_linear_infinite] ${isSplicing ? "opacity-100 scale-110" : "opacity-0 scale-90"} transition-all`}
                  />

                  <div
                    className={`w-full h-full rounded-full border-4 flex items-center justify-center relative bg-black/40 backdrop-blur-sm transition-all duration-500 ${isSplicing ? "border-primary shadow-[0_0_40px_rgba(var(--primary),0.4)]" : "border-border"}`}
                  >
                    {isSplicing ? (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-16 h-16 text-primary animate-spin" />
                        <span className="text-[10px] font-display font-bold text-primary animate-pulse tracking-[0.3em]">
                          SYNTHESIZING
                        </span>
                      </div>
                    ) : resultCard ? (
                      <div className="animate-in zoom-in duration-500 scale-110 sm:scale-125">
                        <GameCard card={resultCard} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 opacity-30">
                        <Beaker className="w-20 h-20" />
                        <span className="text-[8px] font-display font-bold uppercase tracking-[0.4em]">
                          Empty Chamber
                        </span>
                      </div>
                    )}

                    {/* Orbital slots for selected cards */}
                    {!isSplicing &&
                      !resultCard &&
                      selectedCards.map((card, idx) => {
                        const angle = idx * (360 / 5) - 90;
                        const radius = 120; // Distance from center
                        const x = Math.cos(angle * (Math.PI / 180)) * radius;
                        const y = Math.sin(angle * (Math.PI / 180)) * radius;

                        const stats = resolveCardStats(card);

                        return (
                          <div
                            key={card.id}
                            className="absolute w-12 h-12 rounded-lg border border-primary/40 overflow-hidden bg-background shadow-lg animate-in fade-in zoom-in duration-300"
                            style={{
                              transform: `translate(${x}px, ${y}px)`,
                            }}
                          >
                            <img
                              src={
                                stats.character.customImage ||
                                `https://rickandmortyapi.com/api/character/avatar/${stats.character.avatarId}.jpeg`
                              }
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="space-y-4 w-full">
                  <div className="bg-background/50 rounded-2xl p-4 border border-border/50 space-y-3">
                    <h4 className="font-display font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-2">
                      <Sparkles className="w-3 h-3 text-primary" />
                      Machine Diagnostics
                    </h4>

                    {selectedIds.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-2">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase">
                            Resonance
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${batchRarity === "MIXED" ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"}`}
                          >
                            {batchRarity}
                          </span>
                        </div>
                        <Progress
                          value={(selectedIds.length / 5) * 100}
                          className="h-1.5"
                        />

                        {batchRarity === "MIXED" && (
                          <p className="text-[9px] text-destructive font-bold flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> INCOMPATIBLE
                            GENETICS
                          </p>
                        )}
                        {batchRarity === "REVERT" && (
                          <p className="text-[9px] text-yellow-400 font-bold flex items-center justify-center gap-1">
                            <Info className="w-3 h-3" /> MAXIMUM EVOLUTION
                          </p>
                        )}
                        {isValidBatch && (
                          <p className="text-[9px] text-primary font-bold flex items-center justify-center gap-1 animate-pulse">
                            <Zap className="w-3 h-3 fill-current" /> STABLE FOR
                            FUSION
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground italic py-2">
                        Waiting for genetic samples...
                      </p>
                    )}
                  </div>

                  {resultCard ? (
                    <Button
                      onClick={() => setResultCard(null)}
                      variant="outline"
                      className="w-full py-6 font-display font-bold hover:bg-primary/10 hover:text-primary transition-all group"
                    >
                      <Zap className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                      EXTRACT SPECIMEN
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSplice}
                      disabled={!isValidBatch || isSplicing}
                      className={`w-full h-16 font-display font-bold text-lg shadow-2xl transition-all duration-500 ${isValidBatch ? "bg-primary text-primary-foreground scale-100" : "bg-muted opacity-50 scale-95"}`}
                    >
                      {isSplicing ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : isValidBatch ? (
                        "INITIATE FUSION"
                      ) : (
                        `NEED ${5 - selectedIds.length} MORE`
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Evolution Helper - Desktop only or bottom mobile */}
            <div className="bg-muted/30 border border-border p-5 rounded-3xl space-y-4">
              <h5 className="font-display font-bold text-[10px] uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                <Info className="w-3 h-3" />
                Lab Protocol
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                {[
                  { from: "COMMON", to: "RARE" },
                  { from: "RARE", to: "HOLO" },
                  { from: "HOLO", to: "FULL_ART" },
                  { from: "FULL_ART", to: "SILVER" },
                  { from: "SILVER", to: "GOLD" },
                  { from: "GOLD", to: "REVERT" },
                ].map((step, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-background/40 p-2 rounded-xl border border-border/50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`text-[8px] font-bold truncate px-2 py-0.5 rounded border ${RARITY_STYLES[step.from]?.bg} ${RARITY_STYLES[step.from]?.border}`}
                      >
                        {step.from}
                      </span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span
                        className={`text-[8px] font-bold truncate px-2 py-0.5 rounded border ${RARITY_STYLES[step.to]?.bg} ${RARITY_STYLES[step.to]?.border}`}
                      >
                        {step.to}
                      </span>
                    </div>
                    <span className="text-[8px] font-bold text-muted-foreground ml-2">
                      x5
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Splicer;

import { Header } from "@/components/game/Header";
import { Footer } from "@/components/game/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Beaker,
  TrendingUp,
  Sword,
  ChevronUp,
  Leaf,
} from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { toast } from "sonner";
import { formatNumber, formatCurrency } from "@/lib/utils";

const Upgrades = () => {
  const { seeds, upgrades, buyUpgrade, getUpgradeCost } = useGameStore();

  const handleBuy = (type: "seeds" | "power") => {
    const cost = getUpgradeCost(type);
    if (seeds < cost) {
      toast.error("Not enough Mega Seeds!", {
        description: `You need ${formatCurrency(cost)} seeds.`,
      });
      return;
    }

    if (buyUpgrade(type)) {
      toast.success(`Upgrade Purchased!`, {
        description: `${type === "seeds" ? "Seed Production" : "Combat Power"} increased.`,
      });
    }
  };

  const getEffect = (type: "seeds" | "power") => {
    const level = upgrades[type];
    return `+${(level * 5).toFixed(0)}%`;
  };

  const upgradesList = [
    {
      id: "seeds",
      name: "Seed Multiplier",
      description:
        "Increases all Mega Seeds earned from cards and offline production.",
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      id: "power",
      name: "Neural Enhancer",
      description: "Boosts the Power of your champion in dimension battles.",
      icon: Sword,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="w-6 h-6" />
                </Button>
              </Link>
              <div>
                <h2 className="text-4xl font-display font-bold text-foreground">
                  Rick's Lab
                </h2>
                <p className="text-muted-foreground font-body">
                  Use Mega Seeds to enhance your technology
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-xl border border-border">
              <Leaf className="w-5 h-5 text-primary" />
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">
                  Total Budget
                </p>
                <p className="font-display font-bold text-lg leading-tight">
                  {formatCurrency(seeds)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {upgradesList.map((upg) => {
              const type = upg.id as "seeds" | "power";
              const cost = getUpgradeCost(type);
              const level = upgrades[type];

              return (
                <div
                  key={upg.id}
                  className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:shadow-xl hover:shadow-primary/5 transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className={`p-3 ${upg.bgColor} rounded-xl`}>
                        <upg.icon className={`w-8 h-8 ${upg.color}`} />
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          Level
                        </span>
                        <p className="text-2xl font-display font-black text-foreground">
                          {level}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-display font-bold">
                        {upg.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {upg.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">
                          Current Bonus
                        </p>
                        <p className={`text-lg font-bold ${upg.color}`}>
                          {getEffect(type)}
                        </p>
                      </div>
                      <div className="flex-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">
                          Next Level
                        </p>
                        <div className="flex items-center gap-1">
                          <p className="text-lg font-bold text-foreground">
                            +{((level + 1) * 5).toFixed(0)}%
                          </p>
                          <ChevronUp className="w-4 h-4 text-green-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleBuy(type)}
                    disabled={seeds < cost}
                    className="w-full py-8 text-lg font-display font-bold shadow-lg"
                    variant={seeds < cost ? "outline" : "default"}
                  >
                    UPGRADE ({formatCurrency(cost)})
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="bg-muted/20 border border-dashed border-border p-8 rounded-3xl flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center border border-border">
              <Beaker className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <div className="max-w-md">
              <h4 className="font-display font-bold text-lg">
                Experimental Research
              </h4>
              <p className="text-sm text-muted-foreground">
                Rick is working on more upgrades. Every 10 levels, the
                complexity (and cost) of stabilization increases significantly.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Upgrades;

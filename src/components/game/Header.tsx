import { useGameStore } from '@/store/gameStore';
import { Leaf, TrendingUp, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function Header() {
  const seeds = useGameStore((s) => s.seeds);
  const activeSlots = useGameStore((s) => s.activeSlots);
  const inventory = useGameStore((s) => s.inventory);

  const activeIncome = activeSlots.reduce(
    (sum, slot) => sum + (slot?.income ?? 0),
    0
  );

  const inactiveCards = inventory.filter(
    (c) => !activeSlots.some((s) => s?.id === c.id)
  ).length;
  const collectionBonus = inactiveCards; // +1% per inactive card
  const totalIncome = activeIncome * (1 + collectionBonus / 100);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/60 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Leaf className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-body">Mega Seeds</p>
          <p className="text-xl font-display font-bold text-foreground">
            {Math.floor(seeds).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs text-muted-foreground font-body">Income</p>
          <p className="text-lg font-display font-bold text-primary flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +{totalIncome.toFixed(1)}/s
          </p>
        </div>
        {collectionBonus > 0 && (
          <span className="text-[10px] bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded-full font-body">
            +{collectionBonus}% bonus
          </span>
        )}
        <Link to="/settings" className="ml-2">
          <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary">
            <Settings className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </header>
  );
}

import { useGameStore, calculateCurrentIncome } from '@/store/gameStore';
import { Leaf, TrendingUp, Settings, Beaker, Library } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { GAME_CONFIG } from '@/config/gameConfig';

export function Header() {
  const seeds = useGameStore((s) => s.seeds);
  const activeSlots = useGameStore((s) => s.activeSlots);
  const discoveredCards = useGameStore((s) => s.discoveredCards);
  const upgrades = useGameStore((s) => s.upgrades);

  const totalDiscoveries = Object.values(discoveredCards).reduce(
    (sum, types) => sum + types.length,
    0,
  );
  
  const collectionBonus = Math.round(totalDiscoveries * GAME_CONFIG.INCOME.INACTIVE_CARD_BONUS * 100);
  const labBonus = Math.round((upgrades.seeds || 0) * GAME_CONFIG.UPGRADES.seeds.BONUS_PER_LEVEL * 100);
  
  const totalIncome = calculateCurrentIncome({ activeSlots, discoveredCards, upgrades });

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/60 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Leaf className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-body">Mega Seeds</p>
          <p className="text-xl font-display font-bold text-foreground">
            {formatCurrency(seeds)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end gap-1">
          <div className="text-right">
            <p className="text-xs text-muted-foreground font-body">Total Income</p>
            <p className="text-lg font-display font-bold text-primary flex items-center gap-1 leading-tight">
              <TrendingUp className="w-4 h-4" />
              +{formatNumber(totalIncome)}/s
            </p>
          </div>
          
          <div className="flex items-center gap-1.5">
            {collectionBonus > 0 && (
              <div className="flex items-center gap-1 text-[9px] bg-secondary/10 text-secondary-foreground border border-secondary/20 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                <Library className="w-2.5 h-2.5" />
                Coll: +{collectionBonus}%
              </div>
            )}
            {labBonus > 0 && (
              <div className="flex items-center gap-1 text-[9px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                <Beaker className="w-2.5 h-2.5" />
                Lab: +{labBonus}%
              </div>
            )}
          </div>
        </div>

        <Link to="/settings" className="ml-2">
          <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary">
            <Settings className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </header>
  );
}

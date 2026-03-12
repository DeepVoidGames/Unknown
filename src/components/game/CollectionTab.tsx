import { useGameStore, resolveCardStats } from '@/store/gameStore';
import { GameCard } from './GameCard';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LayoutGrid, Search } from 'lucide-react';

export function CollectionTab() {
  const inventory = useGameStore((s) => s.inventory);
  const activeSlots = useGameStore((s) => s.activeSlots);
  const toggleSlot = useGameStore((s) => s.toggleSlot);
  const [search, setSearch] = useState('');

  const handleCardClick = (card: typeof inventory[0]) => {
    const activeSlotIndex = activeSlots.findIndex((s) => s?.id === card.id);
    if (activeSlotIndex >= 0) {
      toggleSlot(activeSlotIndex, card);
      return;
    }
    const emptySlot = activeSlots.findIndex((s) => s === null);
    if (emptySlot >= 0) {
      toggleSlot(emptySlot, card);
    }
  };

  const displayCards = useMemo(() => {
    return inventory
      .map(card => ({ card, stats: resolveCardStats(card) }))
      .filter(({ stats }) => 
        stats.character.name.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => b.stats.income - a.stats.income)
      .slice(0, 4);
  }, [inventory, search]);

  return (
    <section className="py-8 px-4 border-t border-border bg-muted/5">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-xl font-bold text-foreground">
              Quick Collection
            </h2>
            <div className="relative w-48 md:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input 
                placeholder="Search inventory..." 
                className="pl-8 h-8 text-xs bg-background/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <Link to="/collection">
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 hover:text-primary transition-colors">
              <LayoutGrid className="w-4 h-4" />
              Manage All ({inventory.length})
            </Button>
          </Link>
        </div>
        
        {displayCards.length > 0 ? (
          <div className="flex justify-center gap-6 flex-wrap">
            {displayCards.map(({ card }) => {
              const isInSlot = activeSlots.some((s) => s?.id === card.id);
              return (
                <div key={card.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <GameCard
                    card={card}
                    isActive={isInSlot}
                    onClick={() => handleCardClick(card)}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center text-muted-foreground italic text-sm">
            No characters found matching "{search}"
          </div>
        )}

        <p className="text-center text-[10px] text-muted-foreground mt-8 font-body uppercase tracking-wider opacity-60">
          Showing top 4 earners matching your search • Click to assign to portal
        </p>
      </div>
    </section>
  );
}

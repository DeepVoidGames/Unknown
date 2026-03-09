import { useGameStore } from '@/store/gameStore';
import { GameCard } from './GameCard';
import { useState } from 'react';

export function CollectionTab() {
  const inventory = useGameStore((s) => s.inventory);
  const activeSlots = useGameStore((s) => s.activeSlots);
  const toggleSlot = useGameStore((s) => s.toggleSlot);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleCardClick = (card: typeof inventory[0]) => {
    // Find first empty slot, or toggle off if already active
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

  return (
    <section className="py-8 px-4 border-t border-border">
      <h2 className="font-display text-xl font-bold text-foreground text-center mb-6">
        Collection
      </h2>
      <div className="flex justify-center gap-4 flex-wrap">
        {inventory.map((card) => {
          const isInSlot = activeSlots.some((s) => s?.id === card.id);
          return (
            <GameCard
              key={card.id}
              card={card}
              isActive={isInSlot}
              onClick={() => handleCardClick(card)}
            />
          );
        })}
      </div>
      <p className="text-center text-xs text-muted-foreground mt-4 font-body">
        Click a card to place it in the next empty portal slot. Click again to remove.
      </p>
    </section>
  );
}

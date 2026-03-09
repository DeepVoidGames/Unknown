import { useGameStore } from '@/store/gameStore';
import { GameCard } from './GameCard';
import { CircleDot } from 'lucide-react';

export function PortalArea() {
  const activeSlots = useGameStore((s) => s.activeSlots);
  const inventory = useGameStore((s) => s.inventory);
  const toggleSlot = useGameStore((s) => s.toggleSlot);

  const inactiveCards = inventory.filter(
    (c) => !activeSlots.some((s) => s?.id === c.id)
  ).length;

  return (
    <section className="py-8 px-4">
      <div className="text-center mb-6">
        <h2 className="font-display text-xl font-bold text-foreground mb-1">
          Portal Slots
        </h2>
        <p className="text-sm text-muted-foreground font-body">
          Place cards to generate Mega Seeds • Collection bonus:{' '}
          <span className="text-primary font-bold">+{inactiveCards}%</span>{' '}
          ({inactiveCards} cards in inventory)
        </p>
      </div>

      <div className="flex justify-center gap-4 flex-wrap">
        {activeSlots.map((slot, i) => (
          <div key={i} className="relative">
            {/* Portal glow ring */}
            <div className="absolute -inset-2 rounded-2xl border border-primary/20 animate-portal-spin opacity-30 pointer-events-none" 
                 style={{ borderRadius: '50%', width: 'calc(100% + 16px)', height: 'calc(100% + 16px)', top: '-8px', left: '-8px' }} />
            
            {slot ? (
              <div className="animate-float">
                <GameCard
                  card={slot}
                  isActive
                  onClick={() => toggleSlot(i, slot)}
                />
              </div>
            ) : (
              <div className="w-40 h-64 rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 bg-muted/20">
                <CircleDot className="w-8 h-8 text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground/60 font-body">
                  Slot {i + 1}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

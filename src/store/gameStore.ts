import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CardRarity = 'COMMON' | 'RARE' | 'FULL_ART' | 'HOLO';

export interface GameCard {
  id: string;
  name: string;
  rarity: CardRarity;
  income: number;
  image?: string;
}

interface GameState {
  seeds: number;
  inventory: GameCard[];
  activeSlots: (GameCard | null)[];
  lastSaved: number;
  addCard: (card: GameCard) => void;
  toggleSlot: (slotIndex: number, card: GameCard) => void;
  updateSeeds: (amount: number) => void;
  setLastSaved: (ts: number) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      seeds: 100,
      inventory: [
        { id: 'rick-holo', name: 'Rick Sanchez', rarity: 'HOLO', income: 50 },
        { id: 'morty-fullart', name: 'Morty Smith', rarity: 'FULL_ART', income: 25 },
        { id: 'summer-rare', name: 'Summer Smith', rarity: 'RARE', income: 10 },
        { id: 'jerry-common', name: 'Jerry Smith', rarity: 'COMMON', income: 3 },
      ],
      activeSlots: [null, null, null, null],
      lastSaved: Date.now(),

      addCard: (card) =>
        set((s) => ({ inventory: [...s.inventory, card] })),

      toggleSlot: (slotIndex, card) =>
        set((s) => {
          const slots = [...s.activeSlots];
          // If this card is already in this slot, remove it
          if (slots[slotIndex]?.id === card.id) {
            slots[slotIndex] = null;
            return { activeSlots: slots };
          }
          // Remove card from any other slot first
          const cleanedSlots = slots.map((sl) =>
            sl?.id === card.id ? null : sl
          );
          cleanedSlots[slotIndex] = card;
          return { activeSlots: cleanedSlots };
        }),

      updateSeeds: (amount) =>
        set((s) => ({ seeds: s.seeds + amount, lastSaved: Date.now() })),

      setLastSaved: (ts) => set({ lastSaved: ts }),
    }),
    {
      name: 'rick-morty-idle-save',
    }
  )
);

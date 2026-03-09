import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import characters from '@/data/characters.json';
import cardTypes from '@/data/cardTypes.json';
import packs from '@/data/packs.json';

export interface CardType {
  id: string;
  label: string;
  multiplier: number;
  color: string;
  canCombine: boolean;
}

export interface GameCard {
  id: string;
  name: string;
  characterName: string;
  types: string[]; // e.g. ["HOLO", "FULL_ART"]
  income: number;
  power: number;
  avatarId?: number;
  customImage?: string;
  status: string;
  species: string;
  timestamp: number;
}

interface GameState {
  seeds: number;
  inventory: GameCard[];
  maxInventory: number;
  activeSlots: (GameCard | null)[];
  lastSaved: number;
  addCard: (card: GameCard) => boolean;
  addCards: (cards: GameCard[]) => boolean;
  sellCard: (cardId: string) => void;
  sellCards: (cardIds: string[]) => void;
  buyPack: (packId: string) => GameCard[] | null;
  generateRandomCard: (weights?: Record<string, number>, combineChance?: number) => GameCard;
  toggleSlot: (slotIndex: number, card: GameCard) => void;
  updateSeeds: (amount: number) => void;
  hardReset: () => void;
  setLastSaved: (ts: number) => void;
}

const generateCard = (
  weights: Record<string, number> = { "COMMON": 0.7, "RARE": 0.2, "HOLO": 0.08, "FULL_ART": 0.02 },
  combineChance: number = 0.1
): GameCard => {
  const character = characters[Math.floor(Math.random() * characters.length)];
  
  const typeRoll = Math.random();
  let baseTypeId = "COMMON";
  let cumulative = 0;
  
  for (const [type, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (typeRoll <= cumulative) {
      baseTypeId = type;
      break;
    }
  }

  const baseType = cardTypes.find(t => t.id === baseTypeId);
  const selectedTypes = [baseTypeId];

  // COMBINATION LOGIC
  // Full Art combines with almost everything. Silver, Gold, Revert, Holo only with Full Art.
  if (baseType?.canCombine && Math.random() < combineChance) {
    const validExtraTypes = (baseType as any).combinesWith || [];
    if (validExtraTypes.length > 0) {
      const extraTypeId = validExtraTypes[Math.floor(Math.random() * validExtraTypes.length)];
      if (!selectedTypes.includes(extraTypeId)) {
        selectedTypes.push(extraTypeId);
      }
    }
  }

  const combinedMultiplier = selectedTypes.reduce((acc, typeId) => {
    const type = cardTypes.find(t => t.id === typeId);
    return acc * (type?.multiplier || 1);
  }, 1);

  const finalIncome = Math.floor(character.baseMultiplier * combinedMultiplier);
  const finalPower = Math.floor((character as any).basePower * combinedMultiplier);
  const timestamp = Date.now();
  const uuid = crypto.randomUUID();

  return {
    id: `${character.name.replace(/\s+/g, '-').toLowerCase()}-${selectedTypes.join('-')}-${timestamp}-${uuid.slice(0, 8)}`,
    name: character.name,
    characterName: character.name,
    types: selectedTypes,
    income: finalIncome,
    power: finalPower,
    avatarId: character.avatarId,
    customImage: (character as any).customImage,
    status: character.status,
    species: character.species,
    timestamp
  };
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      seeds: 100,
      inventory: [],
      maxInventory: 50,
      activeSlots: [null, null, null, null],
      lastSaved: Date.now(),

      addCard: (card) => {
        const { inventory, maxInventory } = get();
        if (inventory.length >= maxInventory) return false;
        set((s) => ({ inventory: [...s.inventory, card] }));
        return true;
      },

      addCards: (cards) => {
        const { inventory, maxInventory } = get();
        const availableSpace = maxInventory - inventory.length;
        if (availableSpace <= 0) return false;
        
        const cardsToAdd = cards.slice(0, availableSpace);
        set((s) => ({ inventory: [...s.inventory, ...cardsToAdd] }));
        return true;
      },

      sellCard: (cardId) =>
        set((s) => {
          const card = s.inventory.find((c) => c.id === cardId);
          if (!card) return s;
          const sellPrice = Math.floor(card.income * 100);
          return {
            inventory: s.inventory.filter((c) => c.id !== cardId),
            activeSlots: s.activeSlots.map((sl) => (sl?.id === cardId ? null : sl)),
            seeds: s.seeds + sellPrice,
          };
        }),

      sellCards: (cardIds) =>
        set((s) => {
          const cardsToSell = s.inventory.filter((c) => cardIds.includes(c.id));
          const totalProfit = cardsToSell.reduce((acc, c) => acc + Math.floor(c.income * 100), 0);

          return {
            inventory: s.inventory.filter((c) => !cardIds.includes(c.id)),
            activeSlots: s.activeSlots.map((sl) => (sl && cardIds.includes(sl.id) ? null : sl)),
            seeds: s.seeds + totalProfit,
          };
        }),

      buyPack: (packId) => {
        const { seeds, inventory, maxInventory } = get();
        const pack = packs.find(p => p.id === packId);
        
        if (!pack || seeds < pack.cost) return null;
        if (inventory.length >= maxInventory) return null;

        const newCards: GameCard[] = [];
        for (let i = 0; i < pack.cardCount; i++) {
          newCards.push(generateCard(pack.weights, pack.combineChance));
        }

        set((state) => ({
          seeds: state.seeds - pack.cost,
        }));

        return newCards;
      },

      generateRandomCard: (weights, combineChance) => {
        return generateCard(weights, combineChance);
      },

      toggleSlot: (slotIndex, card) =>
        set((s) => {
          const slots = [...s.activeSlots];
          if (slots[slotIndex]?.id === card.id) {
            slots[slotIndex] = null;
            return { activeSlots: slots };
          }
          const cleanedSlots = slots.map((sl) =>
            sl?.id === card.id ? null : sl
          );
          cleanedSlots[slotIndex] = card;
          return { activeSlots: cleanedSlots };
        }),

      updateSeeds: (amount) =>
        set((s) => ({ seeds: s.seeds + amount, lastSaved: Date.now() })),

      hardReset: () => {
        set({
          seeds: 100,
          inventory: [],
          maxInventory: 50,
          activeSlots: [null, null, null, null],
          lastSaved: Date.now(),
        });
        const starter = generateCard({ "COMMON": 0.8, "RARE": 0.2, "HOLO": 0, "FULL_ART": 0 }, 0);
        get().addCard(starter);
      },

      setLastSaved: (ts) => set({ lastSaved: ts }),
    }),
    {
      name: 'rick-morty-idle-save',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            ...persistedState,
            inventory: [],
            activeSlots: [null, null, null, null]
          };
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state && state.inventory.length === 0) {
          const starter = generateCard({ "COMMON": 0.8, "RARE": 0.2, "HOLO": 0, "FULL_ART": 0 }, 0);
          state.addCard(starter);
        }
      }
    }
  )
);

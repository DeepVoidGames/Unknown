import { create } from "zustand";
import { persist } from "zustand/middleware";
import characters from "@/data/characters.json";
import cardTypes from "@/data/cardTypes.json";
import packs from "@/data/packs.json";

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
  origin: string;
  location: string;
  status: string;
  species: string;
  timestamp: number;
}

interface GameState {
  seeds: number;
  inventory: GameCard[];
  maxInventory: number;
  activeSlots: (GameCard | null)[];
  dimensionLevel: number;
  maxDimensionLevel: number;
  isDimensionActive: boolean;
  upgrades: {
    seeds: number;
    power: number;
  };
  lastSaved: number;
  addCard: (card: GameCard) => boolean;
  addCards: (cards: GameCard[]) => boolean;
  sellCard: (cardId: string, card?: GameCard) => void;
  sellCards: (cardIds: string[]) => void;
  isPackUnlocked: (packId: string) => boolean;
  buyPack: (packId: string) => GameCard[] | null;
  generateRandomCard: (
    weights?: Record<string, number>,
    combineChance?: number,
  ) => GameCard;
  toggleSlot: (slotIndex: number, card: GameCard) => void;
  updateSeeds: (amount: number) => void;
  startDimension: () => boolean;
  nextDimensionLevel: () => { bonus: number; milestoneUnlocked: string | null };
  resetDimension: (reward: number) => void;
  buyUpgrade: (type: "seeds" | "power") => boolean;
  getUpgradeCost: (type: "seeds" | "power") => number;
  hardReset: () => void;
  setLastSaved: (ts: number) => void;
}

const generateCard = (
  weights: Record<string, number> = {
    COMMON: 0.7,
    RARE: 0.2,
    HOLO: 0.08,
    FULL_ART: 0.02,
  },
  combineChance: number = 0.1,
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

  const baseType = cardTypes.find((t) => t.id === baseTypeId);
  const selectedTypes = [baseTypeId];

  if (baseType?.canCombine && Math.random() < combineChance) {
    const validExtraTypes = (baseType as any).combinesWith || [];
    if (validExtraTypes.length > 0) {
      const extraTypeId =
        validExtraTypes[Math.floor(Math.random() * validExtraTypes.length)];
      if (!selectedTypes.includes(extraTypeId)) {
        selectedTypes.push(extraTypeId);
      }
    }
  }

  const combinedMultiplier = selectedTypes.reduce((acc, typeId) => {
    const type = cardTypes.find((t) => t.id === typeId);
    return acc * (type?.multiplier || 1);
  }, 1);

  const finalIncome = Math.floor(character.baseMultiplier * combinedMultiplier);
  const finalPower = Math.floor(
    (character as any).basePower * combinedMultiplier,
  );
  const timestamp = Date.now();
  const uuid = crypto.randomUUID();

  return {
    id: `${character.name.replace(/\s+/g, "-").toLowerCase()}-${selectedTypes.join("-")}-${timestamp}-${uuid.slice(0, 8)}`,
    name: character.name,
    characterName: character.name,
    types: selectedTypes,
    income: finalIncome,
    power: finalPower,
    avatarId: character.avatarId,
    customImage: (character as any).customImage,
    origin: character.origin,
    location: character.location,
    status: character.status,
    species: character.species,
    timestamp,
  };
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      seeds: 100,
      inventory: [],
      maxInventory: 50,
      activeSlots: [null, null, null, null],
      dimensionLevel: 1,
      maxDimensionLevel: 1,
      isDimensionActive: false,
      upgrades: {
        seeds: 0,
        power: 0,
      },
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

      sellCard: (cardId, card) =>
        set((s) => {
          const cardInInventory = s.inventory.find((c) => c.id === cardId);
          const targetCard = cardInInventory || card;
          
          if (!targetCard) return s;
          
          const sellPrice = Math.floor(targetCard.income * 100);
          return {
            inventory: s.inventory.filter((c) => c.id !== cardId),
            activeSlots: s.activeSlots.map((sl) =>
              sl?.id === cardId ? null : sl,
            ),
            seeds: s.seeds + sellPrice,
          };
        }),

      sellCards: (cardIds) =>
        set((s) => {
          const cardsToSell = s.inventory.filter((c) => cardIds.includes(c.id));
          const totalProfit = cardsToSell.reduce(
            (acc, c) => acc + Math.floor(c.income * 100),
            0,
          );

          return {
            inventory: s.inventory.filter((c) => !cardIds.includes(c.id)),
            activeSlots: s.activeSlots.map((sl) =>
              sl && cardIds.includes(sl.id) ? null : sl,
            ),
            seeds: s.seeds + totalProfit,
          };
        }),

      isPackUnlocked: (packId) => {
        const { maxDimensionLevel } = get();
        if (packId === "standard") return true;
        if (packId === "mega") return maxDimensionLevel >= 10;
        if (packId === "silver-rift") return maxDimensionLevel >= 25;
        if (packId === "alchemists-portal") return maxDimensionLevel >= 50;
        if (packId === "void-breach") return maxDimensionLevel >= 100;
        return false;
      },

      buyPack: (packId) => {
        const { seeds, inventory, maxInventory, isPackUnlocked } = get();
        const pack = packs.find((p) => p.id === packId);

        if (!pack || seeds < pack.cost) return null;
        if (inventory.length >= maxInventory) return null;
        if (!isPackUnlocked(packId)) return null;

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
            sl?.id === card.id ? null : sl,
          );
          cleanedSlots[slotIndex] = card;
          return { activeSlots: cleanedSlots };
        }),

      updateSeeds: (amount) =>
        set((s) => ({ seeds: s.seeds + amount, lastSaved: Date.now() })),

      startDimension: () => {
        const { seeds } = get();
        if (seeds < 1000) return false;
        set((s) => ({
          seeds: s.seeds - 1000,
          isDimensionActive: true,
          dimensionLevel: 1,
        }));
        return true;
      },

      nextDimensionLevel: () => {
        const { dimensionLevel } = get();
        let bonus = 0;
        let milestoneUnlocked = null;

        if ((dimensionLevel + 1) % 5 === 0) {
          bonus = (dimensionLevel + 1) * 200;
        }

        const nextLvl = dimensionLevel + 1;
        if (nextLvl === 10) milestoneUnlocked = "Mega Portal";
        if (nextLvl === 25) milestoneUnlocked = "Silver Rift";
        if (nextLvl === 50) milestoneUnlocked = "Alchemist Portal";
        if (nextLvl === 100) milestoneUnlocked = "Void Breach";

        set((s) => {
          const nextLevel = s.dimensionLevel + 1;
          const newMax = Math.max(s.maxDimensionLevel, nextLevel);
          return {
            seeds: s.seeds + bonus,
            dimensionLevel: nextLevel,
            maxDimensionLevel: newMax,
          };
        });

        return { bonus, milestoneUnlocked };
      },

      resetDimension: (reward) => {
        set((s) => ({
          seeds: s.seeds + reward,
          isDimensionActive: false,
          dimensionLevel: 1,
        }));
      },

      getUpgradeCost: (type) => {
        const { upgrades } = get();
        const level = upgrades[type];
        const baseCost = type === "seeds" ? 500 : 800;

        // Exponential growth: base * 1.5^level.
        // Significant jump every 10 levels (multiplier * 5)
        let cost = baseCost * Math.pow(1.6, level);
        const jumps = Math.floor(level / 10);
        if (jumps > 0) {
          cost = cost * Math.pow(5, jumps);
        }

        return Math.floor(cost);
      },

      buyUpgrade: (type) => {
        const cost = get().getUpgradeCost(type);
        const { seeds, upgrades } = get();

        if (seeds < cost) return false;

        set((s) => ({
          seeds: s.seeds - cost,
          upgrades: {
            ...s.upgrades,
            [type]: s.upgrades[type] + 1,
          },
        }));
        return true;
      },

      hardReset: () => {
        set({
          seeds: 100,
          inventory: [],
          maxInventory: 50,
          activeSlots: [null, null, null, null],
          dimensionLevel: 1,
          maxDimensionLevel: 1,
          isDimensionActive: false,
          upgrades: { seeds: 0, power: 0 },
          lastSaved: Date.now(),
        });
        const starter = generateCard(
          { COMMON: 0.8, RARE: 0.2, HOLO: 0, FULL_ART: 0 },
          0,
        );
        get().addCard(starter);
      },

      setLastSaved: (ts) => set({ lastSaved: ts }),
    }),
    {
      name: "rick-morty-idle-save",
      version: 3,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          persistedState = {
            ...persistedState,
            inventory: [],
            activeSlots: [null, null, null, null],
            upgrades: { seeds: 0, power: 0 },
          };
        }

        if (version < 2) {
          const migrateCard = (card: any) => {
            if (!card) return card;
            if (!card.origin || card.origin === "none") {
              const charData = characters.find((c) => c.name === card.characterName);
              return {
                ...card,
                origin: charData?.origin || "unknown",
                location: charData?.location || "unknown",
              };
            }
            return card;
          };

          persistedState = {
            ...persistedState,
            inventory: persistedState.inventory?.map(migrateCard) || [],
            activeSlots: persistedState.activeSlots?.map(migrateCard) || [
              null,
              null,
              null,
              null,
            ],
          };
        }

        if (version < 3) {
          // Fix duplicate IDs by regenerating them for all cards
          const oldInv = persistedState.inventory || [];
          const newInventory = oldInv.map((card: any) => {
            const uuid = crypto.randomUUID().slice(0, 8);
            const baseId = card.id ? card.id.split('-').slice(0, 2).join('-') : 'unknown';
            return { 
              ...card, 
              id: `${baseId}-${card.timestamp || Date.now()}-${uuid}` 
            };
          });
          
          const newActiveSlots = (persistedState.activeSlots || [null, null, null, null]).map((slot: any) => {
            if (!slot) return null;
            const oldIndex = oldInv.findIndex((c: any) => c.id === slot.id);
            if (oldIndex !== -1 && newInventory[oldIndex]) {
              return newInventory[oldIndex];
            }
            return null;
          });

          persistedState = {
            ...persistedState,
            inventory: newInventory,
            activeSlots: newActiveSlots,
          };
        }

        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state && state.inventory.length === 0) {
          const starter = generateCard(
            { COMMON: 0.8, RARE: 0.2, HOLO: 0, FULL_ART: 0 },
            0,
          );
          state.addCard(starter);
        }
      },
    },
  ),
);

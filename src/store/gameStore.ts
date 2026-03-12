import { create } from "zustand";
import { persist } from "zustand/middleware";
import characters from "@/data/characters.json";
import cardTypes from "@/data/cardTypes.json";
import packs from "@/data/packs.json";
import { GAME_CONFIG } from "@/config/gameConfig";
import {
  CardType,
  GameCard,
  Character,
  GameState as BaseGameState,
} from "@/types/game";
import {
  trackPackOpening,
  trackUpgrade,
  trackDimensionStart,
  trackDimensionEnd,
} from "@/lib/analytics";

interface GameState extends BaseGameState {
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

type PersistedGameState = GameState;

const generateCard = (
  weights: Record<string, number> = GAME_CONFIG.CARD_GENERATION.DEFAULT_WEIGHTS,
  combineChance: number = GAME_CONFIG.CARD_GENERATION.DEFAULT_COMBINE_CHANCE,
): GameCard => {
  const character = (characters as Character[])[
    Math.floor(Math.random() * characters.length)
  ];

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

  const baseType = (cardTypes as CardType[]).find((t) => t.id === baseTypeId);
  const selectedTypes = [baseTypeId];

  if (baseType?.canCombine && Math.random() < combineChance) {
    const validExtraTypes = baseType.combinesWith || [];
    if (validExtraTypes.length > 0) {
      const extraTypeId =
        validExtraTypes[Math.floor(Math.random() * validExtraTypes.length)];
      if (!selectedTypes.includes(extraTypeId)) {
        selectedTypes.push(extraTypeId);
      }
    }
  }

  const timestamp = Date.now();
  const uuid = crypto.randomUUID();

  return {
    id: `${character.name.replace(/\s+/g, "-").toLowerCase()}-${selectedTypes.join("-")}-${timestamp}-${uuid.slice(0, 8)}`,
    characterId: character.id,
    types: selectedTypes,
    timestamp,
  };
};

export const resolveCardStats = (card: GameCard) => {
  const character =
    (characters as Character[]).find((c) => c.id === card.characterId) ||
    (characters as Character[])[0];

  if (card.income !== undefined && card.power !== undefined) {
    return { income: card.income, power: card.power, character };
  }

  const combinedMultiplier = card.types.reduce((acc, typeId) => {
    const type = (cardTypes as CardType[]).find((t) => t.id === typeId);
    return acc * (type?.multiplier || 1);
  }, 1);

  const baseIncome = card.income !== undefined ? card.income : character.baseMultiplier;
  const basePower = card.power !== undefined ? card.power : character.basePower;

  return {
    income: Math.floor(baseIncome * combinedMultiplier),
    power: Math.floor(basePower * combinedMultiplier),
    character,
  };
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      seeds: GAME_CONFIG.INITIAL_SEEDS,
      inventory: [],
      maxInventory: GAME_CONFIG.INITIAL_MAX_INVENTORY,
      activeSlots: [null, null, null, null],
      dimensionLevel: 1,
      maxDimensionLevel: 1,
      isDimensionActive: false,
      currentEnemy: null,
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

          const stats = resolveCardStats(targetCard);
          const sellPrice = Math.floor(
            stats.income * GAME_CONFIG.SELL_PRICE_MULTIPLIER,
          );
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
          const totalProfit = cardsToSell.reduce((acc, c) => {
            const stats = resolveCardStats(c);
            return (
              acc + Math.floor(stats.income * GAME_CONFIG.SELL_PRICE_MULTIPLIER)
            );
          }, 0);

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
        const reqLevel = GAME_CONFIG.DIMENSIONS.PACK_UNLOCKS[packId];
        if (reqLevel === undefined) return false;
        return maxDimensionLevel >= reqLevel;
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

        trackPackOpening(pack.name, pack.cost);

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
        const { seeds, generateRandomCard } = get();
        if (seeds < GAME_CONFIG.DIMENSION_ENTRY_COST) return false;

        const enemy = generateRandomCard(
          GAME_CONFIG.CARD_GENERATION.ENEMY_WEIGHTS,
          GAME_CONFIG.CARD_GENERATION.DEFAULT_COMBINE_CHANCE,
        );

        set((s) => ({
          seeds: s.seeds - GAME_CONFIG.DIMENSION_ENTRY_COST,
          isDimensionActive: true,
          dimensionLevel: 1,
          currentEnemy: enemy,
        }));
        trackDimensionStart(1);
        return true;
      },

      nextDimensionLevel: () => {
        const { dimensionLevel, generateRandomCard } = get();
        let bonus = 0;
        let milestoneUnlocked = null;

        if ((dimensionLevel + 1) % GAME_CONFIG.DIMENSIONS.BONUS_STEP === 0) {
          bonus = (dimensionLevel + 1) * GAME_CONFIG.DIMENSIONS.BONUS_AMOUNT;
        }

        const nextLvl = dimensionLevel + 1;
        milestoneUnlocked = GAME_CONFIG.DIMENSIONS.MILESTONES[nextLvl] || null;

        const newEnemy = generateRandomCard(
          GAME_CONFIG.CARD_GENERATION.ENEMY_WEIGHTS,
          GAME_CONFIG.CARD_GENERATION.DEFAULT_COMBINE_CHANCE,
        );
        const stats = resolveCardStats(newEnemy);
        const scaleFactor =
          1 + (nextLvl - 1) * GAME_CONFIG.DIMENSIONS.SCALE_FACTOR;
        newEnemy.power = Math.floor(stats.power * scaleFactor);
        newEnemy.income = stats.income;

        set((s) => {
          const nextLevel = s.dimensionLevel + 1;
          const newMax = Math.max(s.maxDimensionLevel, nextLevel);
          return {
            seeds: s.seeds + bonus,
            dimensionLevel: nextLevel,
            maxDimensionLevel: newMax,
            currentEnemy: newEnemy,
          };
        });

        return { bonus, milestoneUnlocked };
      },

      resetDimension: (reward) => {
        const { dimensionLevel } = get();
        trackDimensionEnd(dimensionLevel, reward);
        set((s) => ({
          seeds: s.seeds + reward,
          isDimensionActive: false,
          dimensionLevel: 1,
          currentEnemy: null,
        }));
      },

      getUpgradeCost: (type) => {
        const { upgrades } = get();
        const level = upgrades[type];
        const config = GAME_CONFIG.UPGRADES[type];

        let cost = config.BASE_COST * Math.pow(config.COST_EXPONENT, level);
        const jumps = Math.floor(level / config.JUMP_THRESHOLD);
        if (jumps > 0) {
          cost = cost * Math.pow(config.JUMP_MULTIPLIER, jumps);
        }

        return Math.floor(cost);
      },

      buyUpgrade: (type) => {
        const cost = get().getUpgradeCost(type);
        const { seeds, upgrades } = get();

        if (seeds < cost) return false;

        set((s) => {
          const newLevel = s.upgrades[type] + 1;
          trackUpgrade(type, newLevel, cost);
          return {
            seeds: s.seeds - cost,
            upgrades: {
              ...s.upgrades,
              [type]: newLevel,
            },
          };
        });
        return true;
      },

      hardReset: () => {
        set({
          seeds: GAME_CONFIG.INITIAL_SEEDS,
          inventory: [],
          maxInventory: GAME_CONFIG.INITIAL_MAX_INVENTORY,
          activeSlots: [null, null, null, null],
          dimensionLevel: 1,
          maxDimensionLevel: 1,
          isDimensionActive: false,
          currentEnemy: null,
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
      version: 5,
      migrate: (persistedState: unknown, version: number) => {
        let state = persistedState as any;

        if (version === 0) {
          state = {
            ...state,
            inventory: [],
            activeSlots: [null, null, null, null],
            upgrades: { seeds: 0, power: 0 },
          };
        }

        if (version < 2) {
          const migrateCard = (card: any): any => {
            if (!card) return card;
            if (!card.origin || card.origin === "none") {
              const charData = (characters as Character[]).find(
                (c) => c.name === card.characterName,
              );
              return {
                ...card,
                origin: charData?.origin || "unknown",
                location: charData?.location || "unknown",
              };
            }
            return card;
          };

          state = {
            ...state,
            inventory: state.inventory?.map(migrateCard) || [],
            activeSlots: state.activeSlots?.map((slot: any) =>
              slot ? migrateCard(slot) : null,
            ) || [null, null, null, null],
          };
        }

        if (version < 3) {
          // Fix duplicate IDs by regenerating them for all cards
          const oldInv = state.inventory || [];
          const newInventory = oldInv.map((card: any) => {
            const uuid = crypto.randomUUID().slice(0, 8);
            const baseId = card.id
              ? card.id.split("-").slice(0, 2).join("-")
              : "unknown";
            return {
              ...card,
              id: `${baseId}-${card.timestamp || Date.now()}-${uuid}`,
            };
          });

          const newActiveSlots = (
            state.activeSlots || [null, null, null, null]
          ).map((slot: any) => {
            if (!slot) return null;
            const oldIndex = oldInv.findIndex((c: any) => c.id === slot.id);
            if (oldIndex !== -1 && newInventory[oldIndex]) {
              return newInventory[oldIndex];
            }
            return null;
          });

          state = {
            ...state,
            inventory: newInventory,
            activeSlots: newActiveSlots,
          };
        }

        if (version < 4) {
          state = {
            ...state,
            currentEnemy: null,
          };
        }

        if (version < 5) {
          const migrateCardV5 = (card: any): GameCard => {
            if (!card || card.characterId) return card;
            const charData = (characters as Character[]).find(
              (c) => c.name === (card.characterName || card.name),
            );
            return {
              id: card.id,
              characterId: charData?.id || 1,
              types: card.types || ["COMMON"],
              timestamp: card.timestamp || Date.now(),
              income: card.income,
              power: card.power,
            };
          };

          state = {
            ...state,
            inventory: state.inventory?.map(migrateCardV5) || [],
            activeSlots: state.activeSlots?.map((slot: any) =>
              slot ? migrateCardV5(slot) : null,
            ) || [null, null, null, null],
          };
        }

        return state;
      },
      onRehydrateStorage: () => (state: GameState | undefined) => {
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

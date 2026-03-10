import { GameCard, GameState } from "@/types/game";

export const GAME_CONFIG = {
  INITIAL_SEEDS: 100,
  INITIAL_MAX_INVENTORY: 50,
  DIMENSION_ENTRY_COST: 1000,
  SELL_PRICE_MULTIPLIER: 100,
  MAX_OFFLINE_SECONDS: 24 * 60 * 60, // 24h
  
  UPGRADES: {
    seeds: {
      BASE_COST: 500,
      COST_EXPONENT: 1.6,
      JUMP_THRESHOLD: 10,
      JUMP_MULTIPLIER: 5,
      BONUS_PER_LEVEL: 0.05, // 5% per level
    },
    power: {
      BASE_COST: 800,
      COST_EXPONENT: 1.6,
      JUMP_THRESHOLD: 10,
      JUMP_MULTIPLIER: 5,
      BONUS_PER_LEVEL: 0.05, // 5% per level
    }
  },

  INCOME: {
    INACTIVE_CARD_BONUS: 0.01, // 1% per inactive card
  },

  CARD_GENERATION: {
    DEFAULT_WEIGHTS: {
      COMMON: 0.7,
      RARE: 0.2,
      HOLO: 0.08,
      FULL_ART: 0.02,
    },
    DEFAULT_COMBINE_CHANCE: 0.1,
    ENEMY_WEIGHTS: {
      COMMON: 0.6,
      RARE: 0.3,
      HOLO: 0.08,
      FULL_ART: 0.02,
    }
  },

  DIMENSIONS: {
    BONUS_STEP: 5,
    BONUS_AMOUNT: 200, // (dimensionLevel + 1) * 200
    SCALE_FACTOR: 0.25,
    MAX_LEVEL: 100,
    MAX_LEVEL_REWARD: 1000000,
    LEVEL_REWARD_MULTIPLIER: 500,
    MILESTONES: {
      10: "Mega Portal",
      25: "Silver Rift",
      50: "Alchemist Portal",
      100: "Void Breach",
    } as Record<number, string>,
    PACK_UNLOCKS: {
      "standard": 0,
      "mega": 10,
      "silver-rift": 25,
      "alchemists-portal": 50,
      "void-breach": 100,
    } as Record<string, number>
  }
};

/**
 * Calculates the current income per second based on the game state.
 * @param state The current game state
 * @returns Income per second
 */
export const calculateCurrentIncome = (state: Pick<GameState, "activeSlots" | "inventory" | "upgrades">) => {
  const activeIncome = state.activeSlots.reduce(
    (sum: number, slot: GameCard | null) => sum + (slot?.income ?? 0),
    0,
  );
  
  const inactiveCards = state.inventory.filter(
    (c: GameCard) => !state.activeSlots.some((s: GameCard | null) => s?.id === c.id),
  ).length;
  
  const bonus = 1 + inactiveCards * GAME_CONFIG.INCOME.INACTIVE_CARD_BONUS;
  
  const upgradeBonus = 1 + state.upgrades.seeds * GAME_CONFIG.UPGRADES.seeds.BONUS_PER_LEVEL;

  return activeIncome * bonus * upgradeBonus;
};

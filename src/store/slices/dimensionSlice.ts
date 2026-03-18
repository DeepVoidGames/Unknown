import { StateCreator } from "zustand";
import { GameStore } from "../gameStore";
import { GameCard } from "@/types/game";
import { GAME_CONFIG } from "@/config/gameConfig";
import { resolveCardStats, generateCard } from "../cardUtils";
import { trackDimensionStart, trackDimensionEnd } from "@/lib/analytics";

export interface DimensionSlice {
  dimensionLevel: number;
  maxDimensionLevel: number;
  isDimensionActive: boolean;
  currentEnemy: GameCard | null;
  dimensionInventoryBonus: number; // New field for permanent bonus
  startDimension: () => boolean;
  nextDimensionLevel: () => { bonus: number; inventoryBonus: number; milestoneUnlocked: string | null };
  resetDimension: (reward: number) => void;
}

export const createDimensionSlice: StateCreator<
  GameStore,
  [],
  [],
  DimensionSlice
> = (set, get) => ({
  dimensionLevel: 1,
  maxDimensionLevel: 1,
  isDimensionActive: false,
  currentEnemy: null,
  dimensionInventoryBonus: 0,

  startDimension: () => {
    const { seeds } = get();
    if (seeds < GAME_CONFIG.DIMENSION_ENTRY_COST) return false;

    const enemy = generateCard(
      GAME_CONFIG.CARD_GENERATION.ENEMY_WEIGHTS,
      GAME_CONFIG.CARD_GENERATION.DEFAULT_COMBINE_CHANCE,
    );
    const stats = resolveCardStats(enemy);
    enemy.power = stats.power;
    enemy.income = stats.income;

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
    const { dimensionLevel, maxDimensionLevel } = get();
    let bonus = 0;
    let inventoryBonus = 0;
    let milestoneUnlocked = null;

    const nextLvl = dimensionLevel + 1;
    const isNewMax = nextLvl > maxDimensionLevel;

    if (nextLvl % GAME_CONFIG.DIMENSIONS.BONUS_STEP === 0) {
      bonus = nextLvl * GAME_CONFIG.DIMENSIONS.BONUS_AMOUNT;
      // Only grant permanent inventory bonus if this is the first time reaching this milestone
      if (isNewMax) {
        inventoryBonus = GAME_CONFIG.DIMENSIONS.INVENTORY_BONUS_PER_STEP;
      }
    }

    milestoneUnlocked = GAME_CONFIG.DIMENSIONS.MILESTONES[nextLvl] || null;

    const newEnemy = generateCard(
      GAME_CONFIG.CARD_GENERATION.ENEMY_WEIGHTS,
      GAME_CONFIG.CARD_GENERATION.DEFAULT_COMBINE_CHANCE,
    );
    const stats = resolveCardStats(newEnemy);
    const scaleFactor =
      1 + (nextLvl - 1) * GAME_CONFIG.DIMENSIONS.SCALE_FACTOR;
    newEnemy.power = Math.floor(stats.power * scaleFactor);
    newEnemy.income = stats.income;

    set((s) => {
      const newMax = Math.max(s.maxDimensionLevel, nextLvl);
      
      const newDimensionBonus = s.dimensionInventoryBonus + inventoryBonus;
      const upgradeBonus = s.upgrades.inventory * GAME_CONFIG.UPGRADES.inventory.BONUS_PER_LEVEL;
      const newMaxInventory = GAME_CONFIG.INITIAL_MAX_INVENTORY + upgradeBonus + newDimensionBonus;

      return {
        seeds: s.seeds + bonus,
        dimensionInventoryBonus: newDimensionBonus,
        maxInventory: newMaxInventory,
        dimensionLevel: nextLvl,
        maxDimensionLevel: newMax,
        currentEnemy: newEnemy,
      };
    });

    return { bonus, inventoryBonus, milestoneUnlocked };
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
});

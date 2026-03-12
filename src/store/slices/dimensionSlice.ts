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
  startDimension: () => boolean;
  nextDimensionLevel: () => { bonus: number; milestoneUnlocked: string | null };
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
    const { dimensionLevel } = get();
    let bonus = 0;
    let milestoneUnlocked = null;

    if ((dimensionLevel + 1) % GAME_CONFIG.DIMENSIONS.BONUS_STEP === 0) {
      bonus = (dimensionLevel + 1) * GAME_CONFIG.DIMENSIONS.BONUS_AMOUNT;
    }

    const nextLvl = dimensionLevel + 1;
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
});

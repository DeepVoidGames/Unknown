import { StateCreator } from "zustand";
import { GameStore } from "../gameStore";
import { GAME_CONFIG } from "@/config/gameConfig";
import { trackUpgrade } from "@/lib/analytics";

export interface UpgradeSlice {
  upgrades: {
    seeds: number;
    power: number;
    inventory: number;
  };
  buyUpgrade: (type: "seeds" | "power" | "inventory") => boolean;
  getUpgradeCost: (type: "seeds" | "power" | "inventory") => number;
}

export const createUpgradeSlice: StateCreator<
  GameStore,
  [],
  [],
  UpgradeSlice
> = (set, get) => ({
  upgrades: {
    seeds: 0,
    power: 0,
    inventory: 0,
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
    const { seeds } = get();

    if (seeds < cost) return false;

    set((s) => {
      const newLevel = s.upgrades[type] + 1;
      trackUpgrade(type, newLevel, cost);

      const newState: Partial<GameStore> = {
        seeds: s.seeds - cost,
        upgrades: {
          ...s.upgrades,
          [type]: newLevel,
        },
      };

      if (type === "inventory") {
        const currentDimensionBonus = s.dimensionInventoryBonus || 0;
        newState.maxInventory =
          GAME_CONFIG.INITIAL_MAX_INVENTORY +
          newLevel * GAME_CONFIG.UPGRADES.inventory.BONUS_PER_LEVEL + 
          currentDimensionBonus;
      }

      return newState;
    });
    return true;
  },
});

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateCard } from "./cardUtils";
import { GAME_CONFIG } from "@/config/gameConfig";

import { createCurrencySlice, CurrencySlice } from "./slices/currencySlice";
import { createInventorySlice, InventorySlice } from "./slices/inventorySlice";
import { createDimensionSlice, DimensionSlice } from "./slices/dimensionSlice";
import { createUpgradeSlice, UpgradeSlice } from "./slices/upgradeSlice";
import { createPackSlice, PackSlice } from "./slices/packSlice";
import { createCollectionSlice, CollectionSlice } from "./slices/collectionSlice";
import { createAutoOpenSlice, AutoOpenSlice } from "./slices/autoOpenSlice";
import { createCraftingSlice, CraftingSlice } from "./slices/craftingSlice";
import { createCloudSlice, CloudSlice } from "./slices/cloudSlice";
import { migrateGameStore } from "./migrations";

// Re-export utilities for component usage
export { resolveCardStats, calculateCurrentIncome } from "./cardUtils";

export type GameStore = CurrencySlice &
  InventorySlice &
  DimensionSlice &
  UpgradeSlice &
  PackSlice &
  CollectionSlice &
  AutoOpenSlice &
  CraftingSlice &
  CloudSlice;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get, ...a) => ({
      ...createCurrencySlice(set, get, ...a),
      ...createInventorySlice(set, get, ...a),
      ...createDimensionSlice(set, get, ...a),
      ...createUpgradeSlice(set, get, ...a),
      ...createPackSlice(set, get, ...a),
      ...createCollectionSlice(set, get, ...a),
      ...createAutoOpenSlice(set, get, ...a),
      ...createCraftingSlice(set, get, ...a),
      ...createCloudSlice(set, get, ...a),
    }),
    {
      name: "rick-morty-idle-save",
      version: 8,
      migrate: migrateGameStore,
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Recalculate maxInventory to ensure consistency
          const upgradeBonus = (state.upgrades?.inventory || 0) * GAME_CONFIG.UPGRADES.inventory.BONUS_PER_LEVEL;
          const dimensionBonus = state.dimensionInventoryBonus || 0;
          state.maxInventory = GAME_CONFIG.INITIAL_MAX_INVENTORY + upgradeBonus + dimensionBonus;

          if (state.inventory && state.inventory.length === 0) {
            const starter = generateCard(
              { COMMON: 0.8, RARE: 0.2, HOLO: 0, FULL_ART: 0 },
              0,
            );
            state.addCard(starter);
          }
        }
      },
    },
  ),
);

export const getGameState = (state: GameStore) => ({
  seeds: state.seeds,
  inventory: state.inventory,
  discoveredCards: state.discoveredCards,
  dimensionLevel: state.dimensionLevel,
  maxDimensionLevel: state.maxDimensionLevel,
  upgrades: state.upgrades,
  nickname: state.nickname,
  lastSaved: state.lastSaved,
});

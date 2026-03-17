import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateCard } from "./cardUtils";

import { createCurrencySlice, CurrencySlice } from "./slices/currencySlice";
import { createInventorySlice, InventorySlice } from "./slices/inventorySlice";
import { createDimensionSlice, DimensionSlice } from "./slices/dimensionSlice";
import { createUpgradeSlice, UpgradeSlice } from "./slices/upgradeSlice";
import { createPackSlice, PackSlice } from "./slices/packSlice";
import { createCollectionSlice, CollectionSlice } from "./slices/collectionSlice";
import { createAutoOpenSlice, AutoOpenSlice } from "./slices/autoOpenSlice";
import { migrateGameStore } from "./migrations";

// Re-export utilities for component usage
export { resolveCardStats, calculateCurrentIncome } from "./cardUtils";

export type GameStore = CurrencySlice &
  InventorySlice &
  DimensionSlice &
  UpgradeSlice &
  PackSlice &
  CollectionSlice &
  AutoOpenSlice;

export const useGameStore = create<GameStore>()(
  persist(
    (...a) => ({
      ...createCurrencySlice(...a),
      ...createInventorySlice(...a),
      ...createDimensionSlice(...a),
      ...createUpgradeSlice(...a),
      ...createPackSlice(...a),
      ...createCollectionSlice(...a),
      ...createAutoOpenSlice(...a),
    }),
    {
      name: "rick-morty-idle-save",
      version: 8,
      migrate: migrateGameStore,
      onRehydrateStorage: () => (state: GameStore | undefined) => {
        if (state && state.inventory.length === 0) {
          const starter = generateCard(
            { COMMON: 0.8, RARE: 0.2, HOLO: 0, FULL_ART: 0 },
            0,
          );
          state.addCard(starter);
          state.addDiscovery(starter.characterId, starter.types);
        }
      },
    },
  ),
);


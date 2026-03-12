import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Character, GameCard } from "@/types/game";
import characters from "@/data/characters.json";
import { generateCard } from "./cardUtils";

import { createCurrencySlice, CurrencySlice } from "./slices/currencySlice";
import { createInventorySlice, InventorySlice } from "./slices/inventorySlice";
import { createDimensionSlice, DimensionSlice } from "./slices/dimensionSlice";
import { createUpgradeSlice, UpgradeSlice } from "./slices/upgradeSlice";
import { createPackSlice, PackSlice } from "./slices/packSlice";

// Re-export utilities for component usage
export { resolveCardStats, calculateCurrentIncome } from "./cardUtils";

export type GameStore = CurrencySlice &
  InventorySlice &
  DimensionSlice &
  UpgradeSlice &
  PackSlice;

export const useGameStore = create<GameStore>()(
  persist(
    (...a) => ({
      ...createCurrencySlice(...a),
      ...createInventorySlice(...a),
      ...createDimensionSlice(...a),
      ...createUpgradeSlice(...a),
      ...createPackSlice(...a),
    }),
    {
      name: "rick-morty-idle-save",
      version: 6,
      migrate: (persistedState: unknown, version: number) => {
        let state = persistedState as any;

        if (version === 0) {
          state = {
            ...state,
            inventory: [],
            activeSlots: [null, null, null, null],
            upgrades: { seeds: 0, power: 0, inventory: 0 },
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
            activeSlots:
              state.activeSlots?.map((slot: any) =>
                slot ? migrateCard(slot) : null,
              ) || [null, null, null, null],
          };
        }

        if (version < 3) {
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
          const migrateCardV5 = (card: any): GameCard | null => {
            if (!card) return null;
            if (card.characterId) return card;
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
            inventory: state.inventory?.map(migrateCardV5).filter(Boolean) || [],
            activeSlots:
              state.activeSlots?.map((slot: any) =>
                slot ? migrateCardV5(slot) : null,
              ) || [null, null, null, null],
          };
        }

        if (version < 6) {
          state = {
            ...state,
            upgrades: {
              ...state.upgrades,
              inventory: state.upgrades?.inventory ?? 0,
            },
            maxInventory:
              state.maxInventory ?? 50,
          };
        }

        return state;
      },
      onRehydrateStorage: () => (state: GameStore | undefined) => {
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

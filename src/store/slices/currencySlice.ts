import { StateCreator } from "zustand";
import { GameStore } from "../gameStore";
import { GAME_CONFIG } from "@/config/gameConfig";
import { generateCard } from "../cardUtils";

export interface CurrencySlice {
  seeds: number;
  lastSaved: number;
  updateSeeds: (amount: number) => void;
  setLastSaved: (ts: number) => void;
  hardReset: () => void;
}

export const createCurrencySlice: StateCreator<
  GameStore,
  [],
  [],
  CurrencySlice
> = (set, get) => ({
  seeds: GAME_CONFIG.INITIAL_SEEDS,
  lastSaved: Date.now(),

  updateSeeds: (amount) =>
    set((s) => ({ seeds: s.seeds + amount, lastSaved: Date.now() })),

  setLastSaved: (ts) => set({ lastSaved: ts }),

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
      dimensionInventoryBonus: 0,
      upgrades: { seeds: 0, power: 0, inventory: 0 },
      lastSaved: Date.now(),
    });
    const starter = generateCard(
      { COMMON: 0.8, RARE: 0.2, HOLO: 0, FULL_ART: 0 },
      0,
    );
    get().addCard(starter);
  },
});

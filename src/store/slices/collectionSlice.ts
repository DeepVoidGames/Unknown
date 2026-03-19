import { StateCreator } from "zustand";
import { GameStore } from "../gameStore";

export interface CollectionSlice {
  discoveredCards: Record<number, string[]>; // characterId -> array of rarity typeIds
  addDiscovery: (characterId: number, types: string[]) => void;
  resetCollection: () => void;
}

export const createCollectionSlice: StateCreator<
  GameStore,
  [],
  [],
  CollectionSlice
> = (set) => ({
  discoveredCards: {},

  addDiscovery: (characterId, types) => {
    set((state) => {
      const currentTypes = state.discoveredCards[characterId] || [];
      const newTypes = [...new Set([...currentTypes, ...types])];

      // Only update if there are actually new types discovered
      if (newTypes.length === currentTypes.length) return state;

      return {
        discoveredCards: {
          ...state.discoveredCards,
          [characterId]: newTypes,
        },
      };
    });
  },

  resetCollection: () => set({ discoveredCards: {} }),
});

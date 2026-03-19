import { StateCreator } from "zustand";
import { GameStore } from "../gameStore";
import { GameCard } from "@/types/game";

export interface AutoOpenSlice {
  isAutoOpenActive: boolean;
  activePackId: string | null;
  autoOpenHistory: GameCard[];
  startAutoOpen: (packId: string) => void;
  stopAutoOpen: () => void;
  addToAutoOpenHistory: (cards: GameCard[]) => void;
}

export const createAutoOpenSlice: StateCreator<
  GameStore,
  [],
  [],
  AutoOpenSlice
> = (set) => ({
  isAutoOpenActive: false,
  activePackId: null,
  autoOpenHistory: [],

  startAutoOpen: (packId) => {
    set({
      isAutoOpenActive: true,
      activePackId: packId,
      autoOpenHistory: [], // Reset history when starting a new one
    });
  },

  stopAutoOpen: () => {
    set({
      isAutoOpenActive: false,
      activePackId: null,
    });
  },

  addToAutoOpenHistory: (cards) => {
    set((state) => ({
      autoOpenHistory: [...cards, ...state.autoOpenHistory].slice(0, 10),
    }));
  },
});

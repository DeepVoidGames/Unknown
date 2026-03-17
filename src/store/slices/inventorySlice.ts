import { StateCreator } from "zustand";
import { GameStore } from "../gameStore";
import { GameCard } from "@/types/game";
import { GAME_CONFIG } from "@/config/gameConfig";
import { resolveCardStats } from "../cardUtils";

export interface InventorySlice {
  inventory: GameCard[];
  maxInventory: number;
  activeSlots: (GameCard | null)[];
  addCard: (card: GameCard) => boolean;
  addCards: (cards: GameCard[]) => boolean;
  sellCard: (cardId: string, card?: GameCard) => void;
  sellCards: (cardIds: string[]) => void;
  toggleSlot: (slotIndex: number, card: GameCard) => void;
}

export const createInventorySlice: StateCreator<
  GameStore,
  [],
  [],
  InventorySlice
> = (set, get) => ({
  inventory: [],
  maxInventory: GAME_CONFIG.INITIAL_MAX_INVENTORY,
  activeSlots: [null, null, null, null],

  addCard: (card) => {
    const { inventory, maxInventory, addDiscovery } = get();
    if (inventory.length >= maxInventory) return false;
    set((s) => ({ inventory: [...s.inventory, card] }));
    addDiscovery(card.characterId, card.types);
    return true;
  },

  addCards: (cards) => {
    const { inventory, maxInventory, addDiscovery } = get();
    const availableSpace = maxInventory - inventory.length;
    if (availableSpace <= 0) return false;

    const cardsToAdd = cards.slice(0, availableSpace);
    set((s) => ({ inventory: [...s.inventory, ...cardsToAdd] }));
    cardsToAdd.forEach((card) => addDiscovery(card.characterId, card.types));
    return true;
  },

  sellCard: (cardId, card) =>
    set((s) => {
      const cardInInventory = s.inventory.find((c) => c.id === cardId);
      const targetCard = cardInInventory || card;

      if (!targetCard) return s;

      const stats = resolveCardStats(targetCard);
      const sellPrice = Math.floor(
        stats.income * GAME_CONFIG.SELL_PRICE_MULTIPLIER,
      );
      return {
        inventory: s.inventory.filter((c) => c.id !== cardId),
        activeSlots: s.activeSlots.map((sl) =>
          sl?.id === cardId ? null : sl,
        ),
        seeds: s.seeds + sellPrice,
      };
    }),

  sellCards: (cardIds) =>
    set((s) => {
      const cardsToSell = s.inventory.filter((c) => cardIds.includes(c.id));
      const totalProfit = cardsToSell.reduce((acc, c) => {
        const stats = resolveCardStats(c);
        return (
          acc + Math.floor(stats.income * GAME_CONFIG.SELL_PRICE_MULTIPLIER)
        );
      }, 0);

      return {
        inventory: s.inventory.filter((c) => !cardIds.includes(c.id)),
        activeSlots: s.activeSlots.map((sl) =>
          sl && cardIds.includes(sl.id) ? null : sl,
        ),
        seeds: s.seeds + totalProfit,
      };
    }),

  toggleSlot: (slotIndex, card) =>
    set((s) => {
      const slots = [...s.activeSlots];
      if (slots[slotIndex]?.id === card.id) {
        slots[slotIndex] = null;
        return { activeSlots: slots };
      }
      const cleanedSlots = slots.map((sl) =>
        sl?.id === card.id ? null : sl,
      );
      cleanedSlots[slotIndex] = card;
      return { activeSlots: cleanedSlots };
    }),
});

import { StateCreator } from "zustand";
import { GameStore } from "../gameStore";
import { GameCard } from "@/types/game";
import { getPrimaryType } from "@/config/rarityConfig";
import { generateCard } from "../cardUtils";
import { toast } from "sonner";

export interface CraftingSlice {
  spliceCards: (cardIds: string[]) => GameCard | null;
}

const RARITY_ORDER = [
  "COMMON",
  "RARE",
  "HOLO",
  "FULL_ART",
  "SILVER",
  "GOLD",
  "REVERT",
];

export const createCraftingSlice: StateCreator<
  GameStore,
  [],
  [],
  CraftingSlice
> = (set, get) => ({
  spliceCards: (cardIds) => {
    const { inventory, addCard, addDiscovery } = get();
    
    if (cardIds.length !== 5) {
      toast.error("Splicer requires exactly 5 cards!");
      return null;
    }

    const cardsToSplice = inventory.filter((c) => cardIds.includes(c.id));
    if (cardsToSplice.length !== 5) return null;

    // Determine primary rarity of the batch (must be all the same for guaranteed upgrade)
    const rarities = cardsToSplice.map((c) => getPrimaryType(c.types));
    const firstRarity = rarities[0];
    const allSame = rarities.every((r) => r === firstRarity);

    if (!allSame) {
      toast.error("Mixed signals!", { description: "All cards must be of the same rarity tier." });
      return null;
    }

    const currentIndex = RARITY_ORDER.indexOf(firstRarity);
    if (currentIndex === -1 || currentIndex === RARITY_ORDER.length - 1) {
      toast.error("Maximum resonance reached!", { description: "These cards cannot be upgraded further." });
      return null;
    }

    const nextRarity = RARITY_ORDER[currentIndex + 1];

    // Remove old cards
    set((state) => ({
      inventory: state.inventory.filter((c) => !cardIds.includes(c.id)),
      activeSlots: state.activeSlots.map((slot) => 
        slot && cardIds.includes(slot.id) ? null : slot
      ),
    }));

    // Generate new card of next rarity
    // We pass a weights object with 100% chance for the next rarity
    const newCard = generateCard({ [nextRarity]: 1 }, 0.1); // Small chance for additional random type
    
    addCard(newCard);
    addDiscovery(newCard.characterId, newCard.types);

    return newCard;
  },
});

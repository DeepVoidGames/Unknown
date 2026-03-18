import { Character, GameCard, CardType, GameState } from "@/types/game";
import characters from "@/data/characters.json";
import cardTypes from "@/data/cardTypes.json";
import { GAME_CONFIG } from "@/config/gameConfig";

export const generateCard = (
  weights: Record<string, number> = GAME_CONFIG.CARD_GENERATION.DEFAULT_WEIGHTS,
  combineChance: number = GAME_CONFIG.CARD_GENERATION.DEFAULT_COMBINE_CHANCE,
): GameCard => {
  const character = (characters as Character[])[
    Math.floor(Math.random() * characters.length)
  ];

  const typeRoll = Math.random();
  let baseTypeId = "COMMON";
  let cumulative = 0;

  for (const [type, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (typeRoll <= cumulative) {
      baseTypeId = type;
      break;
    }
  }

  const baseType = (cardTypes as CardType[]).find((t) => t.id === baseTypeId);
  const selectedTypes = [baseTypeId];

  if (baseType?.canCombine && Math.random() < combineChance) {
    const validExtraTypes = baseType.combinesWith || [];
    if (validExtraTypes.length > 0) {
      const extraTypeId =
        validExtraTypes[Math.floor(Math.random() * validExtraTypes.length)];
      if (!selectedTypes.includes(extraTypeId)) {
        selectedTypes.push(extraTypeId);
      }
    }
  }

  const timestamp = Date.now();
  const uuid = crypto.randomUUID();

  return {
    id: `${character.name.replace(/\s+/g, "-").toLowerCase()}-${selectedTypes.join("-")}-${timestamp}-${uuid.slice(0, 8)}`,
    characterId: character.id,
    types: selectedTypes,
    timestamp,
  };
};

const characterMap = new Map(characters.map((c) => [c.id, c]));

export const resolveCardStats = (card: GameCard) => {
  if (!card) {
    const character = (characters as Character[])[0];
    return {
      income: 0,
      power: 0,
      character,
    };
  }

  const character =
    characterMap.get(card.characterId) ?? (characters as Character[])[0];
  // (characters as Character[]).find((c) => c.id === card.characterId) ||
  // (characters as Character[])[0];

  const types = card.types || [];

  if (card.income !== undefined && card.power !== undefined) {
    return { income: card.income, power: card.power, character };
  }

  const combinedMultiplier = types.reduce((acc, typeId) => {
    const type = (cardTypes as CardType[]).find((t) => t.id === typeId);
    return acc * (type?.multiplier || 1);
  }, 1);

  const baseIncome =
    card.income !== undefined ? card.income : character.baseMultiplier;
  const basePower = card.power !== undefined ? card.power : character.basePower;

  return {
    income: Math.floor(baseIncome * combinedMultiplier),
    power: Math.floor(basePower * combinedMultiplier),
    character,
  };
};

/**
 * Calculates the current income per second based on the game state.
 * @param state The current game state
 * @returns Income per second
 */
export const calculateCurrentIncome = (
  state: Pick<GameState, "activeSlots" | "discoveredCards" | "upgrades">,
) => {
  const activeIncome = state.activeSlots.reduce(
    (sum: number, slot: GameCard | null) => {
      if (!slot) return sum;
      return sum + resolveCardStats(slot).income;
    },
    0,
  );

  // Calculate total discoveries from Citadel Archives (characterId -> types[])
  const totalDiscoveries = Object.values(state.discoveredCards).reduce(
    (sum, types) => sum + types.length,
    0,
  );

  const bonus = 1 + totalDiscoveries * GAME_CONFIG.INCOME.INACTIVE_CARD_BONUS;

  const upgradeBonus =
    1 + state.upgrades.seeds * GAME_CONFIG.UPGRADES.seeds.BONUS_PER_LEVEL;

  return Math.floor(activeIncome * bonus * upgradeBonus);
};

import type { PokemonCardData, BoosterPackId, BoosterPackInfo } from '../types';
import allCardsData from '../data/cards.json';

const cards = allCardsData as PokemonCardData[];

export const BOOSTER_PACKS: Record<BoosterPackId, BoosterPackInfo> = {
  charizard: {
    id: 'charizard',
    name: 'Genetic Apex: Charizard',
    featuredPokemon: 'Charizard',
    accentColor: '#FF5722',
    glowColor: 'rgba(255, 87, 34, 0.45)',
    coverImage: 'https://assets.tcgdex.net/en/tcgp/A1/280/high.webp',
    description: 'Home of Immersive Charizard ex, Moltres ex, and blazing Fire/Fighting titans.',
    immersiveCardId: 'A1-280',
  },
  mewtwo: {
    id: 'mewtwo',
    name: 'Genetic Apex: Mewtwo',
    featuredPokemon: 'Mewtwo',
    accentColor: '#9C27B0',
    glowColor: 'rgba(156, 39, 176, 0.45)',
    coverImage: 'https://assets.tcgdex.net/en/tcgp/A1/282/high.webp',
    description: 'Home of Immersive Mewtwo ex, Gengar ex, and cosmic Psychic/Dark anomalies.',
    immersiveCardId: 'A1-282',
  },
  pikachu: {
    id: 'pikachu',
    name: 'Genetic Apex: Pikachu',
    featuredPokemon: 'Pikachu',
    accentColor: '#FFC107',
    glowColor: 'rgba(255, 193, 7, 0.45)',
    coverImage: 'https://assets.tcgdex.net/en/tcgp/A1/281/high.webp',
    description: 'Home of Immersive Pikachu ex, Zapdos ex, and electric Lightning/Water leviathans.',
    immersiveCardId: 'A1-281',
  },
};

export interface DrawnCard {
  card: PokemonCardData;
  isRevealed: boolean;
  slotIndex: number;
}

// Generate 5 cards for an opened booster pack with authentic TCG Pocket probability tiers
export function generateBoosterPack(packId: BoosterPackId): DrawnCard[] {
  const packName = BOOSTER_PACKS[packId].featuredPokemon;

  // Filter pool for this booster
  const pool = cards.filter((c) =>
    c.boosters.length === 0 || c.boosters.includes(packName)
  );

  const commons = pool.filter((c) => c.rarityRank <= 2);
  const uncommons = pool.filter((c) => c.rarityRank === 2 || c.rarityRank === 3);
  const rares = pool.filter((c) => c.rarityRank >= 3);
  const ultraRares = pool.filter((c) => c.rarityRank >= 4);
  const secretRares = pool.filter((c) => c.rarityRank >= 6); // 2 Star, 3 Star, Crown

  const sampleOne = (arr: PokemonCardData[]): PokemonCardData => {
    if (arr.length === 0) return pool[Math.floor(Math.random() * pool.length)];
    return arr[Math.floor(Math.random() * arr.length)];
  };

  // Check for Rare Pack / "God Pack" (1 in 50 chance for excitement)
  const isGodPack = Math.random() < 0.02;

  let packCards: PokemonCardData[] = [];

  if (isGodPack) {
    // All 5 cards are Star / Crown / Ultra Rares!
    for (let i = 0; i < 5; i++) {
      packCards.push(sampleOne(secretRares.length > 0 ? secretRares : ultraRares));
    }
  } else {
    // Slot 1: Common / 1 Diamond
    packCards.push(sampleOne(commons));

    // Slot 2: Common / 1 Diamond
    packCards.push(sampleOne(commons));

    // Slot 3: Common or Uncommon (20% Uncommon)
    packCards.push(Math.random() < 0.2 ? sampleOne(uncommons) : sampleOne(commons));

    // Slot 4: Uncommon or Rare (25% Rare / 4-Diamond ex)
    packCards.push(Math.random() < 0.25 ? sampleOne(rares) : sampleOne(uncommons));

    // Slot 5: The Climax Slot!
    // 60% Uncommon / Rare
    // 25% 4-Diamond ex
    // 10% 1-Star / 2-Star Art Rare
    // 4% 3-Star Immersive Rare
    // 1% Crown Gold Rare
    const roll = Math.random();
    if (roll < 0.01) {
      // Crown Gold!
      const crowns = pool.filter((c) => c.isCrown);
      packCards.push(sampleOne(crowns.length > 0 ? crowns : ultraRares));
    } else if (roll < 0.05) {
      // 3-Star Immersive!
      const immersives = pool.filter((c) => c.isImmersive);
      packCards.push(sampleOne(immersives.length > 0 ? immersives : ultraRares));
    } else if (roll < 0.15) {
      // 1-Star or 2-Star Art Rare
      const artRares = pool.filter((c) => c.rarityRank === 5 || c.rarityRank === 6);
      packCards.push(sampleOne(artRares.length > 0 ? artRares : ultraRares));
    } else if (roll < 0.40) {
      // 4-Diamond ex
      const exRares = pool.filter((c) => c.rarityRank === 4);
      packCards.push(sampleOne(exRares.length > 0 ? exRares : rares));
    } else {
      packCards.push(sampleOne(uncommons));
    }
  }

  return packCards.map((card, slotIndex) => ({
    card,
    isRevealed: false,
    slotIndex,
  }));
}

export function getAllCards(): PokemonCardData[] {
  return cards;
}

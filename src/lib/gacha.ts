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

export interface RarityTierVisual {
  name: string;
  color: string;
  borderClass: string;
  glowClass: string;
  edgeColor: string;
  suspenseAura: string;
  textColor: string;
  symbol: string;
}

export function getRarityTierVisual(card: PokemonCardData): RarityTierVisual {
  if (card.isCrown) {
    return {
      name: 'Crown Gold',
      color: '#FFD700',
      borderClass: 'border-yellow-400',
      glowClass: 'shadow-[0_0_35px_rgba(255,215,0,0.85)]',
      edgeColor: 'rgba(255, 215, 0, 0.95)',
      suspenseAura:
        '0 0 45px rgba(255, 215, 0, 0.9), 0 0 90px rgba(245, 158, 11, 0.7), inset 0 0 20px rgba(255, 255, 255, 0.6)',
      textColor: 'text-yellow-400',
      symbol: '👑',
    };
  }
  if (card.isImmersive) {
    return {
      name: '3-Star Immersive',
      color: '#00F5D4',
      borderClass: 'border-cyan-400',
      glowClass: 'shadow-[0_0_30px_rgba(0,245,212,0.8)]',
      edgeColor: 'rgba(0, 245, 212, 0.95)',
      suspenseAura:
        '0 0 45px rgba(0, 245, 212, 0.85), 0 0 80px rgba(168, 85, 247, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.6)',
      textColor: 'text-cyan-400',
      symbol: '★★★',
    };
  }
  if (card.rarityRank >= 5) {
    return {
      name: card.rarity,
      color: '#A855F7',
      borderClass: 'border-purple-400',
      glowClass: 'shadow-[0_0_28px_rgba(168,85,247,0.75)]',
      edgeColor: 'rgba(168, 85, 247, 0.9)',
      suspenseAura:
        '0 0 35px rgba(168, 85, 247, 0.85), 0 0 70px rgba(236, 72, 153, 0.5), inset 0 0 15px rgba(255, 255, 255, 0.5)',
      textColor: 'text-purple-400',
      symbol: card.rarityRank === 6 ? '★★' : '★',
    };
  }
  if (card.rarityRank === 4) {
    return {
      name: 'Four Diamond (ex)',
      color: '#F43F5E',
      borderClass: 'border-rose-400',
      glowClass: 'shadow-[0_0_24px_rgba(244,63,94,0.75)]',
      edgeColor: 'rgba(244, 63, 94, 0.85)',
      suspenseAura:
        '0 0 30px rgba(244, 63, 94, 0.8), 0 0 60px rgba(245, 158, 11, 0.5), inset 0 0 12px rgba(255, 255, 255, 0.4)',
      textColor: 'text-rose-400',
      symbol: '◆◆◆◆',
    };
  }
  if (card.rarityRank === 3) {
    return {
      name: 'Three Diamond',
      color: '#06B6D4',
      borderClass: 'border-cyan-500',
      glowClass: 'shadow-[0_0_18px_rgba(6,182,212,0.6)]',
      edgeColor: 'rgba(6, 182, 212, 0.75)',
      suspenseAura:
        '0 0 22px rgba(6, 182, 212, 0.65), inset 0 0 10px rgba(255, 255, 255, 0.3)',
      textColor: 'text-cyan-400',
      symbol: '◆◆◆',
    };
  }
  if (card.rarityRank === 2) {
    return {
      name: 'Two Diamond',
      color: '#60A5FA',
      borderClass: 'border-blue-400/60',
      glowClass: 'shadow-[0_0_12px_rgba(96,165,250,0.4)]',
      edgeColor: 'rgba(96, 165, 250, 0.6)',
      suspenseAura: '0 0 15px rgba(96, 165, 250, 0.45)',
      textColor: 'text-blue-300',
      symbol: '◆◆',
    };
  }
  return {
    name: 'One Diamond',
    color: '#94A3B8',
    borderClass: 'border-slate-500/40',
    glowClass: 'shadow-[0_0_8px_rgba(148,163,184,0.3)]',
    edgeColor: 'rgba(148, 163, 184, 0.45)',
    suspenseAura: '0 0 10px rgba(148, 163, 184, 0.35)',
    textColor: 'text-slate-300',
    symbol: '◆',
  };
}

// Generate 5 cards for an opened booster pack with authentic TCG Pocket probability tiers
// Rarest card ("Kartu Wah") is deliberately sorted to Slot 5 (the climax back slot)
export function generateBoosterPack(packId: BoosterPackId): DrawnCard[] {
  const packName = BOOSTER_PACKS[packId].featuredPokemon;

  // Filter pool for this booster
  const pool = cards.filter(
    (c) => c.boosters.length === 0 || c.boosters.includes(packName)
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
    } else if (roll < 0.4) {
      // 4-Diamond ex
      const exRares = pool.filter((c) => c.rarityRank === 4);
      packCards.push(sampleOne(exRares.length > 0 ? exRares : rares));
    } else {
      packCards.push(sampleOne(uncommons));
    }
  }

  // Sort cards ascending by rarity: lowest rarity on top (Slot 1), highest "kartu wah" at the back (Slot 5)!
  packCards.sort((a, b) => {
    if (a.rarityRank !== b.rarityRank) {
      return a.rarityRank - b.rarityRank;
    }
    if (a.isCrown !== b.isCrown) {
      return a.isCrown ? 1 : -1;
    }
    if (a.isImmersive !== b.isImmersive) {
      return a.isImmersive ? 1 : -1;
    }
    if (a.isHolo !== b.isHolo) {
      return a.isHolo ? 1 : -1;
    }
    return 0;
  });

  return packCards.map((card, slotIndex) => ({
    card,
    isRevealed: false,
    slotIndex,
  }));
}

export function getAllCards(): PokemonCardData[] {
  return cards;
}

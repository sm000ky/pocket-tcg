export type RarityType =
  | 'One Diamond'
  | 'Two Diamond'
  | 'Three Diamond'
  | 'Four Diamond'
  | 'One Star'
  | 'Two Star'
  | 'Three Star'
  | 'Crown';

export interface CardAttack {
  name: string;
  cost: string[];
  damage: string;
  effect?: string;
}

export interface PokemonCardData {
  id: string;
  localId: string;
  name: string;
  category: string;
  illustrator: string;
  rarity: string;
  rarityRank: number; // 1 to 8
  isHolo: boolean;
  isImmersive: boolean;
  isCrown: boolean;
  hp?: number;
  types: string[];
  stage: string;
  description: string;
  attacks: CardAttack[];
  weaknesses: { type: string; value: string }[];
  retreat: number;
  boosters: string[];
  imageHigh: string;
  imageLow: string;
}

export type BoosterPackId = 'charizard' | 'mewtwo' | 'pikachu';

export interface BoosterPackInfo {
  id: BoosterPackId;
  name: string;
  featuredPokemon: string;
  accentColor: string;
  glowColor: string;
  coverImage: string;
  description: string;
  immersiveCardId: string; // e.g. A1-280
}

export interface UserCollection {
  obtainedCardIds: Record<string, number>; // cardId -> count
  totalPacksOpened: number;
}

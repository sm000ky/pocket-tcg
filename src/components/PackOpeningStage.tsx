import React, { useState } from 'react';
import type { BoosterPackId, PokemonCardData } from '../types';
import { BOOSTER_PACKS, generateBoosterPack } from '../lib/gacha';
import type { DrawnCard } from '../lib/gacha';
import { BoosterPack3D } from './BoosterPack3D';
import { BoosterPackCarousel } from './BoosterPackCarousel';
import { TCGPocketDeckReveal } from './TCGPocketDeckReveal';
import { HoloCard3D } from './HoloCard3D';
import { pocketAudio } from '../lib/audio';
import {
  RotateCcw,
  BookOpen,
  Check,
  Trophy
} from 'lucide-react';

interface PackOpeningStageProps {
  onAddCardsToCollection: (cards: PokemonCardData[]) => void;
  onOpenBinder: () => void;
  onSelectImmersiveCard: (card: PokemonCardData) => void;
  allCards: PokemonCardData[];
  onOpenRatesModal: () => void;
  selectedPackId: BoosterPackId;
  onSelectPackId: (id: BoosterPackId) => void;
}

type StagePhase = 'select_pack' | 'inspect_pack' | 'stack_reveal' | 'summary';

export const PackOpeningStage: React.FC<PackOpeningStageProps> = ({
  onAddCardsToCollection,
  onOpenBinder,
  onSelectImmersiveCard,
  allCards,
  onOpenRatesModal,
  selectedPackId,
  onSelectPackId,
}) => {
  const [phase, setPhase] = useState<StagePhase>('select_pack');
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [isOpeningPack, setIsOpeningPack] = useState<boolean>(false);

  const activePack = BOOSTER_PACKS[selectedPackId];

  // Start opening pack from Carousel
  const handleStartOpeningFromCarousel = (packId: BoosterPackId) => {
    onSelectPackId(packId);
    setPhase('inspect_pack');
  };

  // Triggered when foil is torn open in BoosterPack3D
  const handleOpenPack = () => {
    setIsOpeningPack(true);
    // Generate 5 cards, with rarest card ("kartu wah") sorted to the back of the stack
    const newCards = generateBoosterPack(selectedPackId);
    setDrawnCards(newCards);
    setIsOpeningPack(false);
    pocketAudio.playCardSlide();
    setPhase('stack_reveal');
    onAddCardsToCollection(newCards.map((c) => c.card));
  };

  // Called when all 5 cards in the deck are revealed
  const handleRevealComplete = (finalCards: DrawnCard[]) => {
    setDrawnCards(finalCards);
    setPhase('summary');
  };

  const handleResetToPackSelection = () => {
    pocketAudio.playClick();
    setPhase('select_pack');
    setDrawnCards([]);
  };

  // Determine best card pull of the pack
  const bestCard = [...drawnCards].sort(
    (a, b) => b.card.rarityRank - a.card.rarityRank
  )[0]?.card;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[78vh] py-6 px-4">
      {/* ===================================================================
       * PHASE 1: INTERACTIVE 3D BOOSTER PACK CAROUSEL
       * =================================================================== */}
      {phase === 'select_pack' && (
        <BoosterPackCarousel
          selectedPackId={selectedPackId}
          onSelectPack={onSelectPackId}
          onStartOpening={handleStartOpeningFromCarousel}
          allCards={allCards}
          onOpenRatesModal={onOpenRatesModal}
        />
      )}

      {/* ===================================================================
       * PHASE 2: 3D PACK TEARING ARENA (BUTTER-SMOOTH RIP)
       * =================================================================== */}
      {phase === 'inspect_pack' && (
        <div className="flex flex-col items-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="text-center">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
              AUTHENTIC METALLIC FOIL POUCH
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
              {activePack.name}
            </h2>
          </div>

          <BoosterPack3D
            pack={activePack}
            onOpenPack={handleOpenPack}
            isOpening={isOpeningPack}
          />

          <button
            onClick={handleResetToPackSelection}
            className="text-xs font-mono text-neutral-400 hover:text-white transition-colors underline pt-2 cursor-pointer"
          >
            ← Choose Different Pack
          </button>
        </div>
      )}

      {/* ===================================================================
       * PHASE 3: POKÉMON TCG POCKET 3D STACK DECK REVEAL (WITH PEEKING & ZERO FLASH)
       * =================================================================== */}
      {phase === 'stack_reveal' && drawnCards.length > 0 && (
        <TCGPocketDeckReveal
          cards={drawnCards}
          onComplete={handleRevealComplete}
          onSelectImmersiveCard={onSelectImmersiveCard}
        />
      )}

      {/* ===================================================================
       * PHASE 4: SUMMARY & BEST PULL HIGHLIGHT
       * =================================================================== */}
      {phase === 'summary' && (
        <div className="w-full flex flex-col items-center space-y-8 animate-in zoom-in-95 duration-300">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
              <Check className="w-4 h-4" /> 5 SPECIMENS UNSEALED
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-white tracking-tight">
              Booster Opening Complete!
            </h2>
            {bestCard && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-mono text-xs font-bold mt-2 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <Trophy className="w-3.5 h-3.5" />
                <span>
                  Pull of the Pack:{' '}
                  <strong>
                    {bestCard.name} ({bestCard.rarity})
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Tray Showcase of 5 Drawn Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 justify-items-center w-full">
            {drawnCards.map((item) => (
              <div
                key={`summary-${item.card.id}`}
                className="flex flex-col items-center space-y-2"
              >
                <HoloCard3D
                  card={item.card}
                  isFlipped={true}
                  onDiveIn={() => onSelectImmersiveCard(item.card)}
                  size="md"
                />
                <div className="text-center font-mono">
                  <span className="text-xs font-bold text-white block">
                    {item.card.name}
                  </span>
                  <span className="text-[10px] text-amber-300">
                    {item.card.rarity}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-white/20 w-full max-w-xl">
            <button
              onClick={handleResetToPackSelection}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Open Another Pack</span>
            </button>

            <button
              onClick={onOpenBinder}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/40 bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>View in Card Binder</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

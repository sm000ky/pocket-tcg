import React, { useState } from 'react';
import type { BoosterPackId, PokemonCardData } from '../types';
import { BOOSTER_PACKS, generateBoosterPack } from '../lib/gacha';
import type { DrawnCard } from '../lib/gacha';
import { BoosterPack3D } from './BoosterPack3D';
import { HoloCard3D } from './HoloCard3D';
import { pocketAudio } from '../lib/audio';
import confetti from 'canvas-confetti';
import { RotateCcw, BookOpen, Check } from 'lucide-react';

interface PackOpeningStageProps {
  onAddCardsToCollection: (cards: PokemonCardData[]) => void;
  onOpenBinder: () => void;
  onSelectImmersiveCard: (card: PokemonCardData) => void;
}

type StagePhase = 'select_pack' | 'inspect_pack' | 'revealing_cards' | 'summary';

export const PackOpeningStage: React.FC<PackOpeningStageProps> = ({
  onAddCardsToCollection,
  onOpenBinder,
  onSelectImmersiveCard,
}) => {
  const [selectedPackId, setSelectedPackId] = useState<BoosterPackId>('charizard');
  const [phase, setPhase] = useState<StagePhase>('select_pack');
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);

  const activePack = BOOSTER_PACKS[selectedPackId];

  const handleSelectPack = (id: BoosterPackId) => {
    pocketAudio.playClick();
    setSelectedPackId(id);
    setPhase('inspect_pack');
  };

  const handleOpenPack = () => {
    // Generate 5 cards
    const newCards = generateBoosterPack(selectedPackId);
    setDrawnCards(newCards);
    pocketAudio.playCardSlide();
    setPhase('revealing_cards');

    // Add to collection
    onAddCardsToCollection(newCards.map((c) => c.card));
  };

  const handleFlipCard = (index: number) => {
    if (drawnCards[index].isRevealed) return;

    const updated = [...drawnCards];
    updated[index].isRevealed = true;
    setDrawnCards(updated);

    const card = updated[index].card;

    // Trigger audio & confetti for special rarities
    if (card.isCrown) {
      pocketAudio.playCrownFanfare();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FFFFFF', '#FFF8DC'],
      });
    } else if (card.isImmersive) {
      pocketAudio.playCrownFanfare();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#38BDF8', '#818CF8', '#C084FC', '#FFFFFF'],
      });
    } else if (card.rarityRank >= 4) {
      pocketAudio.playHoloSparkle();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F43F5E', '#FB7185', '#FDA4AF'],
      });
    }

    // Check if all cards revealed
    if (updated.every((c) => c.isRevealed)) {
      setTimeout(() => {
        setPhase('summary');
      }, 1200);
    }
  };

  const handleRevealAll = () => {
    pocketAudio.playHoloSparkle();
    const updated = drawnCards.map((c) => ({ ...c, isRevealed: true }));
    setDrawnCards(updated);
    setPhase('summary');
  };

  const handleResetToPackSelection = () => {
    pocketAudio.playClick();
    setPhase('select_pack');
    setDrawnCards([]);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[70vh] py-6 px-4">
      {/* ===================================================================
       * PHASE 1: SELECT BOOSTER PACK
       * =================================================================== */}
      {phase === 'select_pack' && (
        <div className="w-full flex flex-col items-center space-y-8 animate-in fade-in">
          <div className="text-center space-y-2 max-w-xl">
            <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase font-bold">
              GENETIC APEX · SERIES A1
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-white drop-shadow-md">
              Choose Your Booster Pack
            </h1>
            <p className="text-xs sm:text-sm font-mono text-neutral-400">
              Each pack contains 5 official cards with guaranteed rare foils, illustration rares, or elusive 3-star immersives.
            </p>
          </div>

          {/* 3 Pack Pods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full max-w-4xl justify-items-center">
            {(Object.keys(BOOSTER_PACKS) as BoosterPackId[]).map((packId) => {
              const pack = BOOSTER_PACKS[packId];
              return (
                <div
                  key={packId}
                  onClick={() => handleSelectPack(packId)}
                  className="group cursor-pointer flex flex-col items-center p-5 rounded-2xl border-2 border-white/20 bg-neutral-900/60 backdrop-blur-md hover:border-white transition-all duration-300 hover:scale-105 shadow-2xl relative overflow-hidden w-full max-w-[280px]"
                  style={{
                    boxShadow: `0 10px 30px ${pack.glowColor}`,
                  }}
                >
                  {/* Sheen backdrop */}
                  <div
                    className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity"
                    style={{
                      background: `radial-gradient(circle at 50% 30%, ${pack.accentColor} 0%, transparent 70%)`,
                    }}
                  />

                  {/* Artwork Preview */}
                  <div className="relative w-44 h-60 rounded-xl overflow-hidden shadow-xl border border-white/20 mb-4">
                    <img
                      src={pack.coverImage}
                      alt={pack.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 font-mono text-[9px] text-amber-300 font-bold border border-amber-400/50">
                      5 CARDS
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-wide text-center">
                    {pack.name}
                  </h3>
                  <p className="text-[11px] font-mono text-neutral-400 text-center mt-1">
                    {pack.description}
                  </p>

                  <button
                    className="mt-4 w-full py-2 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border transition-colors shadow-md"
                    style={{
                      backgroundColor: pack.accentColor,
                      borderColor: '#FFFFFF',
                      color: '#000000',
                    }}
                  >
                    Select Pack
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================
       * PHASE 2: 3D PACK RIP INSPECTOR
       * =================================================================== */}
      {phase === 'inspect_pack' && (
        <div className="flex flex-col items-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="text-center">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
              PREPARING BOOSTER
            </span>
            <h2 className="text-2xl font-bold text-white tracking-wide">
              {activePack.name}
            </h2>
          </div>

          <BoosterPack3D
            pack={activePack}
            onOpenPack={handleOpenPack}
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
       * PHASE 3: REVEALING 5 DRAWN CARDS (INTERACTIVE FLIP)
       * =================================================================== */}
      {phase === 'revealing_cards' && (
        <div className="w-full flex flex-col items-center space-y-6 animate-in fade-in">
          {/* Header Controls */}
          <div className="flex items-center justify-between w-full max-w-4xl border-b border-white/20 pb-3">
            <div>
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest block">
                CARDS UNSEALED
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Tap Each Card to Reveal
              </h2>
            </div>

            <button
              onClick={handleRevealAll}
              className="px-3.5 py-1.5 rounded-lg border border-white/30 bg-white/10 hover:bg-white hover:text-black font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Reveal All
            </button>
          </div>

          {/* Cards Stage Carousel / Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 justify-items-center py-4 w-full">
            {drawnCards.map((item, idx) => (
              <div key={item.card.id} className="flex flex-col items-center space-y-2">
                <HoloCard3D
                  card={item.card}
                  isFlipped={item.isRevealed}
                  onFlip={() => handleFlipCard(idx)}
                  onDiveIn={() => onSelectImmersiveCard(item.card)}
                  size="md"
                  showSuspenseGlow={!item.isRevealed}
                />
                <span className="text-[10px] font-mono text-neutral-400">
                  Slot #{idx + 1} {item.isRevealed ? `· ${item.card.name}` : '· Sealed'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================
       * PHASE 4: SUMMARY & BINDER ARCHIVE
       * =================================================================== */}
      {phase === 'summary' && (
        <div className="w-full flex flex-col items-center space-y-8 animate-in zoom-in-95 duration-300">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
              <Check className="w-4 h-4" /> PACK OPENING COMPLETE
            </span>
            <h2 className="text-3xl font-bold text-white tracking-wide">
              New Specimens Acquired!
            </h2>
            <p className="text-xs font-mono text-neutral-400">
              All 5 cards have been permanently archived to your Pocket binder.
            </p>
          </div>

          {/* Showcase of Drawn Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 justify-items-center w-full">
            {drawnCards.map((item) => (
              <div key={item.card.id} className="flex flex-col items-center space-y-2">
                <HoloCard3D
                  card={item.card}
                  isFlipped={true}
                  onDiveIn={() => onSelectImmersiveCard(item.card)}
                  size="md"
                />
                <div className="text-center">
                  <span className="text-xs font-bold text-white block">{item.card.name}</span>
                  <span className="text-[10px] font-mono text-amber-300">{item.card.rarity}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
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
              <span>View Card Binder</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

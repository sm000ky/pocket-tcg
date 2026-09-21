import React, { useState } from 'react';
import type { BoosterPackId, PokemonCardData } from '../types';
import { BOOSTER_PACKS, generateBoosterPack } from '../lib/gacha';
import type { DrawnCard } from '../lib/gacha';
import { BoosterPack3D } from './BoosterPack3D';
import { HoloCard3D } from './HoloCard3D';
import { pocketAudio } from '../lib/audio';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  BookOpen,
  Check,
  ArrowRight,
  Trophy,
  Sparkles,
  Layers,
  Sparkle
} from 'lucide-react';

interface PackOpeningStageProps {
  onAddCardsToCollection: (cards: PokemonCardData[]) => void;
  onOpenBinder: () => void;
  onSelectImmersiveCard: (card: PokemonCardData) => void;
}

type StagePhase = 'select_pack' | 'inspect_pack' | 'stack_reveal' | 'summary';

const POKEBALL_BACK_URL = 'https://assets.tcgdex.net/univ/tcgp/back.webp';

export const PackOpeningStage: React.FC<PackOpeningStageProps> = ({
  onAddCardsToCollection,
  onOpenBinder,
  onSelectImmersiveCard,
}) => {
  const [selectedPackId, setSelectedPackId] = useState<BoosterPackId>('charizard');
  const [phase, setPhase] = useState<StagePhase>('select_pack');
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isOpeningPack, setIsOpeningPack] = useState<boolean>(false);
  const [celebrationBanner, setCelebrationBanner] = useState<string | null>(null);
  const [flickAnim, setFlickAnim] = useState<'left' | 'right' | null>(null);
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);

  const activePack = BOOSTER_PACKS[selectedPackId];

  const handleSelectPack = (id: BoosterPackId) => {
    pocketAudio.playClick();
    setSelectedPackId(id);
    setPhase('inspect_pack');
  };

  const handleOpenPack = () => {
    setIsOpeningPack(true);
    const newCards = generateBoosterPack(selectedPackId);
    setDrawnCards(newCards);
    setCurrentCardIndex(0);
    setIsOpeningPack(false);
    pocketAudio.playCardSlide();
    setPhase('stack_reveal');
    onAddCardsToCollection(newCards.map((c) => c.card));
  };

  // Flip currently focused card in hand
  const handleFlipCurrentCard = () => {
    if (drawnCards.length === 0) return;
    const current = drawnCards[currentCardIndex];
    if (current.isRevealed) return;

    const updated = [...drawnCards];
    updated[currentCardIndex].isRevealed = true;
    setDrawnCards(updated);

    const card = current.card;

    // Trigger explosive audio, haptics, screen shake, and confetti based on rarity
    if (card.isCrown) {
      setIsScreenShaking(true);
      setTimeout(() => setIsScreenShaking(false), 500);
      pocketAudio.playCrownFanfare();
      setCelebrationBanner(`👑 CROWN GOLD RARE · ${card.name}!`);
      confetti({
        particleCount: 180,
        spread: 110,
        origin: { y: 0.5 },
        colors: ['#FFD700', '#FFA500', '#FFFFFF', '#FFF8DC'],
      });
    } else if (card.isImmersive) {
      setIsScreenShaking(true);
      setTimeout(() => setIsScreenShaking(false), 500);
      pocketAudio.playCrownFanfare();
      setCelebrationBanner(`★★★ IMMERSIVE RARE · ${card.name}!`);
      confetti({
        particleCount: 140,
        spread: 95,
        origin: { y: 0.5 },
        colors: ['#38BDF8', '#818CF8', '#C084FC', '#FFFFFF'],
      });
    } else if (card.rarityRank >= 4) {
      setIsScreenShaking(true);
      setTimeout(() => setIsScreenShaking(false), 450);
      pocketAudio.playImpactBoom();
      pocketAudio.playHoloSparkle();
      setCelebrationBanner(`★ ${card.rarity.toUpperCase()} · ${card.name}!`);
      confetti({
        particleCount: 80,
        spread: 75,
        origin: { y: 0.5 },
        colors: ['#F43F5E', '#FB7185', '#FDA4AF', '#F59E0B'],
      });
    } else {
      pocketAudio.playCardFlip();
    }
  };

  // Advance to next card in the 5-card stack with realistic flick physics
  const handleAdvanceCard = (direction: 'left' | 'right' = 'right') => {
    if (flickAnim) return; // Prevent double trigger
    pocketAudio.playCardSlide();
    setFlickAnim(direction);
    setCelebrationBanner(null);

    setTimeout(() => {
      setFlickAnim(null);
      if (currentCardIndex < drawnCards.length - 1) {
        setCurrentCardIndex((prev) => prev + 1);
      } else {
        // All 5 cards seen, transition to summary
        setPhase('summary');
      }
    }, 280);
  };

  const handleRevealAllInstant = () => {
    pocketAudio.playHoloSparkle();
    const updated = drawnCards.map((c) => ({ ...c, isRevealed: true }));
    setDrawnCards(updated);
    setPhase('summary');
  };

  const handleResetToPackSelection = () => {
    pocketAudio.playClick();
    setPhase('select_pack');
    setDrawnCards([]);
    setCurrentCardIndex(0);
    setCelebrationBanner(null);
    setFlickAnim(null);
  };

  // Determine best card pull of the pack
  const bestCard = [...drawnCards].sort(
    (a, b) => b.card.rarityRank - a.card.rarityRank
  )[0]?.card;

  const currentDrawn = drawnCards[currentCardIndex];
  const remainingCardsCount = Math.max(0, drawnCards.length - 1 - currentCardIndex);

  return (
    <div
      className={`w-full max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[78vh] py-6 px-4 ${
        isScreenShaking ? 'animate-screen-shake' : ''
      }`}
    >
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
              Each pack contains 5 official cards with guaranteed rare foils,
              illustration rares, or elusive 3-star immersives.
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
                  <div
                    className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity"
                    style={{
                      background: `radial-gradient(circle at 50% 30%, ${pack.accentColor} 0%, transparent 70%)`,
                    }}
                  />

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
       * PHASE 2: 3D PACK RIP INSPECTOR (BREWEK PACK)
       * =================================================================== */}
      {phase === 'inspect_pack' && (
        <div className="flex flex-col items-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="text-center">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
              AUTHENTIC FOIL POUCH
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
       * PHASE 3: DECK-IN-HAND SLIDE & PEEL REVEAL (POKÉMON TCG POCKET FEEL)
       * =================================================================== */}
      {phase === 'stack_reveal' && currentDrawn && (
        <div className="w-full flex flex-col items-center space-y-6 animate-in fade-in duration-300">
          {/* Top Progress & Suspense Bar */}
          <div className="w-full max-w-md flex items-center justify-between border-b border-white/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-amber-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                CARD {currentCardIndex + 1} / 5
              </span>
              {currentCardIndex === 4 && (
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-mono font-black text-[9px] shadow-[0_0_15px_#ffd700] animate-pulse flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> CLIMAX SLOT
                </span>
              )}
            </div>

            <button
              onClick={handleRevealAllInstant}
              className="text-[11px] font-mono text-neutral-400 hover:text-white underline cursor-pointer"
            >
              Skip to Summary
            </button>
          </div>

          {/* Celebration Flash Banner */}
          {celebrationBanner && (
            <div className="py-2.5 px-6 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-mono text-xs font-black tracking-widest uppercase shadow-[0_0_30px_rgba(245,158,11,0.9)] animate-in zoom-in-95 duration-200">
              {celebrationBanner}
            </div>
          )}

          {/* 3D Hand-Held Deck Stack Area */}
          <div className="relative flex flex-col items-center py-2">
            {/* Visual Physical Stack of Remaining Unopened Cards Behind */}
            {remainingCardsCount > 0 && (
              <>
                {/* 3rd Card in Hand Silhouette */}
                {remainingCardsCount >= 3 && (
                  <div
                    className="absolute top-6 w-60 h-84 sm:w-68 sm:h-96 rounded-2xl overflow-hidden border border-neutral-700/80 shadow-2xl pointer-events-none -z-30 opacity-65"
                    style={{
                      transform: 'translate3d(0, 16px, -40px) rotate(3deg)',
                    }}
                  >
                    <img
                      src={POKEBALL_BACK_URL}
                      alt="Remaining Card"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* 2nd Card in Hand Silhouette */}
                {remainingCardsCount >= 2 && (
                  <div
                    className="absolute top-4 w-62 h-86 sm:w-70 sm:h-98 rounded-2xl overflow-hidden border border-neutral-600/80 shadow-2xl pointer-events-none -z-20 opacity-80"
                    style={{
                      transform: 'translate3d(0, 10px, -25px) rotate(-2.2deg)',
                    }}
                  >
                    <img
                      src={POKEBALL_BACK_URL}
                      alt="Remaining Card"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Immediately Next Card in Hand */}
                <div
                  className="absolute top-2 w-64 h-88 sm:w-72 sm:h-[400px] rounded-2xl overflow-hidden border border-neutral-500 shadow-2xl pointer-events-none -z-10 opacity-95"
                  style={{
                    transform: 'translate3d(0, 5px, -12px) rotate(1.2deg)',
                  }}
                >
                  <img
                    src={POKEBALL_BACK_URL}
                    alt="Next Card"
                    className="w-full h-full object-cover"
                  />
                </div>
              </>
            )}

            {/* Active Card in Hand */}
            <div className="animate-card-spring-in">
              <HoloCard3D
                card={currentDrawn.card}
                isFlipped={currentDrawn.isRevealed}
                onFlip={handleFlipCurrentCard}
                onDiveIn={() => onSelectImmersiveCard(currentDrawn.card)}
                onFlick={(dir) => handleAdvanceCard(dir)}
                size="lg"
                showSuspenseGlow={!currentDrawn.isRevealed}
                flickAnimation={flickAnim}
              />
            </div>

            {/* Control & Gesture Tip Bar */}
            <div className="mt-5 text-center flex flex-col items-center gap-3">
              {!currentDrawn.isRevealed ? (
                <div className="flex flex-col items-center gap-1.5">
                  <button
                    onClick={handleFlipCurrentCard}
                    className="px-7 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.6)] cursor-pointer active:scale-95 flex items-center gap-2"
                  >
                    <Sparkle className="w-4 h-4 fill-current" />
                    <span>TAP OR PEEL CARD TO REVEAL</span>
                  </button>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Hint: Tap card face or drag across to flip over in 3D
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-3">
                  <div className="text-center font-mono">
                    <h3 className="text-xl font-black text-white drop-shadow">
                      {currentDrawn.card.name}
                    </h3>
                    <span className="text-xs text-amber-300 font-bold">
                      {currentDrawn.card.rarity} · #{currentDrawn.card.localId}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleAdvanceCard('right')}
                      className="flex items-center gap-2 px-8 py-3 rounded-full bg-white hover:bg-neutral-200 text-black font-mono text-xs font-black uppercase tracking-widest transition-all shadow-xl cursor-pointer active:scale-95"
                    >
                      <span>
                        {currentCardIndex < 4
                          ? 'Slide to Next Card'
                          : 'See Pack Results'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Swipe or flick card left/right to slide it away
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
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
                key={item.card.id}
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

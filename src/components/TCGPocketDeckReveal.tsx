import React, { useState, useRef, useCallback } from 'react';
import type { PokemonCardData } from '../types';
import type { DrawnCard } from '../lib/gacha';
import { getRarityTierVisual } from '../lib/gacha';
import { HoloCard3D } from './HoloCard3D';
import { pocketAudio } from '../lib/audio';
import confetti from 'canvas-confetti';
import {
  Layers,
  Sparkles,
  ArrowRight,
  Eye
} from 'lucide-react';

interface TCGPocketDeckRevealProps {
  cards: DrawnCard[];
  onComplete: (revealedCards: DrawnCard[]) => void;
  onSelectImmersiveCard: (card: PokemonCardData) => void;
}

const POKEBALL_BACK_URL = 'https://assets.tcgdex.net/univ/tcgp/back.webp';

export const TCGPocketDeckReveal: React.FC<TCGPocketDeckRevealProps> = ({
  cards,
  onComplete,
  onSelectImmersiveCard,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [revealedMap, setRevealedMap] = useState<Record<number, boolean>>({});
  const [flickAnim, setFlickAnim] = useState<'left' | 'right' | null>(null);
  const [peekOffset, setPeekOffset] = useState<number>(0);
  const [isPeekingActive, setIsPeekingActive] = useState<boolean>(false);
  const [celebrationBanner, setCelebrationBanner] = useState<string | null>(null);
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);

  const hasPlayedTensionRef = useRef<boolean>(false);

  const currentCardItem = cards[currentIndex];
  const isCurrentRevealed = !!revealedMap[currentIndex];
  const nextCardItem = currentIndex < cards.length - 1 ? cards[currentIndex + 1] : null;

  // Reveal current top card with authentic sound, haptics, and celebration
  const handleRevealCurrentCard = useCallback(() => {
    if (!currentCardItem || isCurrentRevealed || flickAnim) return;

    setRevealedMap((prev) => ({ ...prev, [currentIndex]: true }));
    const card = currentCardItem.card;

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
        particleCount: 85,
        spread: 75,
        origin: { y: 0.5 },
        colors: ['#F43F5E', '#FB7185', '#FDA4AF', '#F59E0B'],
      });
    } else {
      pocketAudio.playCardFlip();
    }
  }, [currentCardItem, currentIndex, flickAnim, isCurrentRevealed]);

  // Advance to next card in the 5-card stack with realistic flick physics
  // Zero leak because the next card in the stack is ALREADY 100% face-down
  const handleAdvanceCard = (direction: 'left' | 'right' = 'right') => {
    if (flickAnim) return;

    pocketAudio.playCardSlide();
    setFlickAnim(direction);
    setCelebrationBanner(null);
    setPeekOffset(0);
    setIsPeekingActive(false);
    hasPlayedTensionRef.current = false;

    setTimeout(() => {
      setFlickAnim(null);
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Complete the full deck reveal and transition to summary
        const finalResults = cards.map((c, idx) => ({
          ...c,
          isRevealed: !!revealedMap[idx] || true,
        }));
        onComplete(finalResults);
      }
    }, 290);
  };

  // Skip reveal and show summary
  const handleSkipToSummary = () => {
    pocketAudio.playHoloSparkle();
    const finalResults = cards.map((c) => ({
      ...c,
      isRevealed: true,
    }));
    onComplete(finalResults);
  };

  // Drag progress for live peeking the underlying card silhouette
  const handleCardDragProgress = (deltaX: number) => {
    if (flickAnim) return;
    setPeekOffset(deltaX);

    // If peeking and next card is rare, play tension sound once
    if (Math.abs(deltaX) > 25 && nextCardItem && nextCardItem.card.rarityRank >= 4) {
      if (!hasPlayedTensionRef.current) {
        hasPlayedTensionRef.current = true;
        pocketAudio.playTensionRiser();
      }
    }
  };

  const handleTogglePeekMode = () => {
    if (isPeekingActive) {
      setPeekOffset(0);
      setIsPeekingActive(false);
    } else {
      setPeekOffset(55);
      setIsPeekingActive(true);
      if (nextCardItem && nextCardItem.card.rarityRank >= 4) {
        pocketAudio.playTensionRiser();
      }
    }
  };

  if (!currentCardItem) return null;

  const remainingStackCount = cards.length - 1 - currentIndex;

  return (
    <div
      className={`w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[75vh] py-4 px-3 ${
        isScreenShaking ? 'animate-screen-shake' : ''
      }`}
    >
      {/* Top Progress Bar & Climax Slot Indicator */}
      <div className="w-full max-w-md flex items-center justify-between border-b border-white/20 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono font-black text-amber-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            CARD {currentIndex + 1} / {cards.length}
          </span>
          {currentIndex === 4 && (
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-black font-mono font-black text-[9px] shadow-[0_0_15px_rgba(255,215,0,0.8)] flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-current" /> CLIMAX RARE SLOT
            </span>
          )}
        </div>

        <button
          onClick={handleSkipToSummary}
          className="text-[11px] font-mono text-neutral-400 hover:text-white underline cursor-pointer"
        >
          Skip to Summary
        </button>
      </div>

      {/* Celebration Flash Banner */}
      {celebrationBanner && (
        <div className="mb-4 py-2.5 px-6 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-mono text-xs font-black tracking-widest uppercase shadow-[0_0_30px_rgba(245,158,11,0.9)] animate-in zoom-in-95 duration-200">
          {celebrationBanner}
        </div>
      )}

      {/* ===================================================================
       * 3D HAND-HELD PHYSICAL DECK STACK (DITUMBUK TCG POCKET STYLE)
       * =================================================================== */}
      <div
        className="relative flex flex-col items-center justify-center my-3"
        style={{ perspective: '1200px' }}
      >
        {/* Layered Physical Deck Stack Underneath (Cards currentIndex+1 to 4) */}
        {remainingStackCount > 0 &&
          cards.slice(currentIndex + 1).map((item, stackIdx) => {
            const actualCardIndex = currentIndex + 1 + stackIdx;
            const visualVisual = getRarityTierVisual(item.card);

            // Stacking offset with 3D depth and subtle rotation
            const zOffset = -(stackIdx + 1) * 16;
            const yOffset = (stackIdx + 1) * 6;
            const xOffset = stackIdx % 2 === 0 ? 3 : -3;
            const rotAngle = stackIdx === 0 ? 1.6 : stackIdx === 1 ? -2.0 : 2.4;
            const scaleVal = 1 - (stackIdx + 1) * 0.025;

            // When peeking the top card, the immediately next card (+1) glows brighter
            const isImmediatelyUnderneath = stackIdx === 0;
            const showPeekAura =
              isImmediatelyUnderneath && (Math.abs(peekOffset) > 20 || isPeekingActive);

            return (
              <div
                key={`stacked-under-${item.card.id}-${actualCardIndex}`}
                className="absolute top-0 w-64 h-92 sm:w-72 sm:h-[400px] rounded-2xl overflow-hidden border-2 shadow-2xl pointer-events-none transition-all duration-200"
                style={{
                  transform: `translate3d(${xOffset}px, ${yOffset}px, ${zOffset}px) rotate(${rotAngle}deg) scale(${scaleVal})`,
                  zIndex: 20 - stackIdx,
                  borderColor: visualVisual.edgeColor,
                  boxShadow: showPeekAura
                    ? `0 0 35px ${visualVisual.edgeColor}, 0 0 70px ${visualVisual.edgeColor}`
                    : `0 10px 25px rgba(0,0,0,0.6), inset 0 0 10px ${visualVisual.edgeColor}`,
                }}
              >
                {/* Back side of the card underneath - ALWAYS 100% FACE DOWN */}
                <img
                  src={POKEBALL_BACK_URL}
                  alt="Stacked Pokémon Card Back"
                  className="w-full h-full object-cover rounded-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />

                {/* Rarity Edge Glow Rim for Peeking */}
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    borderWidth: '3px',
                    borderColor: visualVisual.edgeColor,
                    boxShadow: `inset 0 0 16px ${visualVisual.edgeColor}`,
                  }}
                />

                {/* Peeking Silhouette Rarity Badge Hint */}
                {showPeekAura && (
                  <div
                    className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold flex items-center gap-1 animate-in fade-in"
                    style={{ color: visualVisual.color }}
                  >
                    <span>{visualVisual.symbol}</span>
                    <span>{visualVisual.name}</span>
                  </div>
                )}
              </div>
            );
          })}

        {/* ACTIVE TOP CARD (Slot currentIndex) */}
        <div
          className="relative z-30 animate-card-spring-in"
          key={`active-top-${currentCardItem.card.id}-${currentIndex}`}
        >
          <HoloCard3D
            card={currentCardItem.card}
            isFlipped={isCurrentRevealed}
            onFlip={handleRevealCurrentCard}
            onDiveIn={() => onSelectImmersiveCard(currentCardItem.card)}
            onFlick={(dir) => handleAdvanceCard(dir)}
            onDragProgress={handleCardDragProgress}
            peekOffsetX={peekOffset}
            size="lg"
            showSuspenseGlow={!isCurrentRevealed}
            flickAnimation={flickAnim}
          />
        </div>
      </div>

      {/* ===================================================================
       * INTERACTIVE CONTROLS & PEEKING SYSTEM
       * =================================================================== */}
      <div className="mt-4 flex flex-col items-center space-y-3 w-full max-w-md">
        {/* If Card is Face-Down */}
        {!isCurrentRevealed ? (
          <div className="flex flex-col items-center gap-2.5 w-full">
            <div className="flex items-center gap-3 w-full justify-center">
              {/* Tap to Reveal Button */}
              <button
                onClick={handleRevealCurrentCard}
                className="flex-1 max-w-[240px] py-3 px-5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-black font-mono text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.6)] cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>REVEAL CARD</span>
              </button>

              {/* Ngintip / Peek Silhouette Button (if there is a card underneath) */}
              {nextCardItem && (
                <button
                  onClick={handleTogglePeekMode}
                  className={`py-3 px-4 rounded-full border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                    isPeekingActive
                      ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                      : 'bg-neutral-900 border-white/20 text-neutral-300 hover:text-white hover:border-white/40'
                  }`}
                  title="Ngintip siluet kartu di bawahnya"
                >
                  <Eye className="w-4 h-4" />
                  <span>{isPeekingActive ? 'Tutup Intip' : 'Ngintip Edge'}</span>
                </button>
              )}
            </div>

            <span className="text-[10px] font-mono text-neutral-400 text-center">
              Geser kartu sedikit untuk ngintip warna rim kartu berikutnya di tumpukan
            </span>
          </div>
        ) : (
          /* If Card is Revealed (Face-Up) */
          <div className="flex flex-col items-center space-y-3 w-full">
            <div className="text-center font-mono">
              <h3 className="text-xl font-black text-white drop-shadow">
                {currentCardItem.card.name}
              </h3>
              <span className="text-xs text-amber-300 font-bold">
                {currentCardItem.card.rarity} · #{currentCardItem.card.localId}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full justify-center">
              {/* Slide to Next Card Button */}
              <button
                onClick={() => handleAdvanceCard('right')}
                className="flex-1 max-w-[260px] flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-white hover:bg-neutral-200 text-black font-mono text-xs font-black uppercase tracking-widest transition-all shadow-xl cursor-pointer active:scale-95"
              >
                <span>
                  {currentIndex < cards.length - 1 ? 'Slide to Next Card' : 'See Pack Results'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Ngintip Silhouette Button for Next Card */}
              {nextCardItem && (
                <button
                  onClick={handleTogglePeekMode}
                  className={`p-3 rounded-full border text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                    isPeekingActive
                      ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                      : 'bg-neutral-900 border-white/20 text-neutral-300 hover:text-white'
                  }`}
                  title="Ngintip siluet kartu di bawahnya"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>

            <span className="text-[10px] font-mono text-neutral-400 text-center">
              Geser atau flick kartu ke kiri/kanan untuk lanjut ke kartu berikutnya
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

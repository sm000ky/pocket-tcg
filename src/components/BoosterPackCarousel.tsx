import React, { useState, useRef, useCallback } from 'react';
import type { BoosterPackId, BoosterPackInfo, PokemonCardData } from '../types';
import { BOOSTER_PACKS } from '../lib/gacha';
import { pocketAudio } from '../lib/audio';
import { HoloCard3D } from './HoloCard3D';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Flame,
  Moon,
  Info
} from 'lucide-react';

interface BoosterPackCarouselProps {
  selectedPackId: BoosterPackId;
  onSelectPack: (packId: BoosterPackId) => void;
  onStartOpening: (packId: BoosterPackId) => void;
  allCards: PokemonCardData[];
  onOpenRatesModal: () => void;
}

const PACK_IDS: BoosterPackId[] = ['charizard', 'mewtwo', 'pikachu'];

export const BoosterPackCarousel: React.FC<BoosterPackCarouselProps> = ({
  selectedPackId,
  onSelectPack,
  onStartOpening,
  allCards,
  onOpenRatesModal,
}) => {
  const activeIndex = PACK_IDS.indexOf(selectedPackId);
  const activePack: BoosterPackInfo = BOOSTER_PACKS[selectedPackId];

  // 3D tilt state for the active pack preview
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);
  const [glareX, setGlareX] = useState<number>(50);
  const [glareY, setGlareY] = useState<number>(50);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const packRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number>(0);

  // Find the featured 3-Star immersive card for this pack
  const featuredImmersiveCard = allCards.find(
    (c) => c.id === activePack.immersiveCardId
  );

  const handleNextPack = useCallback(() => {
    pocketAudio.playClick();
    const nextIdx = (activeIndex + 1) % PACK_IDS.length;
    onSelectPack(PACK_IDS[nextIdx]);
    setRotateX(0);
    setRotateY(0);
  }, [activeIndex, onSelectPack]);

  const handlePrevPack = useCallback(() => {
    pocketAudio.playClick();
    const prevIdx = (activeIndex - 1 + PACK_IDS.length) % PACK_IDS.length;
    onSelectPack(PACK_IDS[prevIdx]);
    setRotateX(0);
    setRotateY(0);
  }, [activeIndex, onSelectPack]);

  // Touch swipe handling for carousel
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    if (diff > 50) {
      handlePrevPack();
    } else if (diff < -50) {
      handleNextPack();
    }
  };

  // 3D Tilt on the Active Pack Preview
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!packRef.current) return;
    const rect = packRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rY = ((x - rect.width / 2) / (rect.width / 2)) * 16;
    const rX = -((y - rect.height / 2) / (rect.height / 2)) * 16;

    setRotateX(rX);
    setRotateY(rY);
    setGlareX((x / rect.width) * 100);
    setGlareY((y / rect.height) * 100);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlareX(50);
    setGlareY(50);
  };

  // Get icon for elemental theme
  const getThemeIcon = () => {
    if (selectedPackId === 'charizard') return <Flame className="w-4 h-4 text-orange-400" />;
    if (selectedPackId === 'mewtwo') return <Moon className="w-4 h-4 text-purple-400" />;
    return <Zap className="w-4 h-4 text-yellow-400" />;
  };

  return (
    <div className="w-full flex flex-col items-center space-y-8 animate-in fade-in">
      {/* Series Title HUD */}
      <div className="text-center space-y-2 max-w-xl px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-mono font-bold tracking-widest text-amber-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>GENETIC APEX · A1 BOOSTER RACK</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-white drop-shadow-md">
          Select Your Booster Pack
        </h2>
        <p className="text-xs sm:text-sm font-mono text-neutral-400 max-w-md mx-auto">
          Choose a pack, inspect its metallic foil in 3D, and tear it open to reveal rare holographic specimens.
        </p>
      </div>

      {/* ===================================================================
       * 3D BOOSTER PACK CAROUSEL ARENA
       * =================================================================== */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full max-w-5xl h-[460px] sm:h-[500px] flex items-center justify-center overflow-hidden"
        style={{ perspective: '1400px' }}
      >
        {/* Left Navigation Chevron Button */}
        <button
          onClick={handlePrevPack}
          className="absolute left-2 sm:left-6 z-40 p-3 sm:p-4 rounded-full bg-black/70 hover:bg-white hover:text-black text-white border border-white/20 transition-all shadow-2xl backdrop-blur-md cursor-pointer active:scale-90"
          title="Previous Pack"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* 3D Packs Stage */}
        <div
          className="relative w-full h-full flex items-center justify-center preserve-3d"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {PACK_IDS.map((packId, index) => {
            const pack = BOOSTER_PACKS[packId];
            const isCenter = packId === selectedPackId;
            const isLeft = (activeIndex - 1 + PACK_IDS.length) % PACK_IDS.length === index;
            const isRight = (activeIndex + 1) % PACK_IDS.length === index;

            let transformStyle = '';
            let opacityVal = 0;
            let zIndexVal = 10;

            if (isCenter) {
              transformStyle = `translate3d(0, 0, 40px) scale(1.05)`;
              opacityVal = 1;
              zIndexVal = 30;
            } else if (isLeft) {
              transformStyle = `translate3d(-240px, 0, -90px) rotateY(32deg) scale(0.82)`;
              opacityVal = 0.6;
              zIndexVal = 15;
            } else if (isRight) {
              transformStyle = `translate3d(240px, 0, -90px) rotateY(-32deg) scale(0.82)`;
              opacityVal = 0.6;
              zIndexVal = 15;
            } else {
              transformStyle = `translate3d(0, 0, -200px) scale(0.5)`;
              opacityVal = 0;
            }

            return (
              <div
                key={packId}
                onClick={() => {
                  if (!isCenter) {
                    pocketAudio.playClick();
                    onSelectPack(packId);
                  }
                }}
                className={`absolute transition-all duration-500 ease-out cursor-pointer preserve-3d ${
                  isCenter ? 'pointer-events-auto' : 'pointer-events-auto hover:opacity-90'
                }`}
                style={{
                  transform: transformStyle,
                  opacity: opacityVal,
                  zIndex: zIndexVal,
                }}
              >
                {/* 3D Pack Chassis */}
                <div
                  ref={isCenter ? packRef : undefined}
                  onPointerMove={isCenter ? handlePointerMove : undefined}
                  onPointerEnter={isCenter ? () => setIsHovered(true) : undefined}
                  onPointerLeave={isCenter ? handlePointerLeave : undefined}
                  className={`w-64 sm:w-72 h-[410px] sm:h-[450px] rounded-2xl border-2 border-white/30 overflow-hidden relative shadow-2xl transition-transform duration-150 ease-out transform-gpu preserve-3d ${
                    isCenter && !isHovered ? 'animate-organic-float' : ''
                  }`}
                  style={{
                    transform: isCenter
                      ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
                      : undefined,
                    boxShadow: isCenter
                      ? `0 25px 60px ${pack.glowColor}, 0 0 35px rgba(255,255,255,0.15)`
                      : `0 15px 35px rgba(0,0,0,0.7)`,
                  }}
                >
                  {/* Top Crimp */}
                  <div
                    className="w-full h-10 bg-neutral-900 border-b border-white/30 relative flex items-center justify-between px-3"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(90deg, #000 0px, #000 2px, #fff 3px, #fff 4px)',
                      opacity: 0.85,
                    }}
                  >
                    <span className="text-[9px] font-mono font-black text-amber-300 tracking-widest uppercase">
                      GENETIC APEX
                    </span>
                    <span className="text-[9px] font-mono font-bold text-white/80">
                      5 CARDS
                    </span>
                  </div>

                  {/* Pack Body */}
                  <div
                    className="relative flex-1 h-[calc(100%-80px)] flex flex-col items-center justify-between p-3.5 overflow-hidden"
                    style={{
                      background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.45) 0%, transparent 55%), linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #090d16 100%)`,
                    }}
                  >
                    {/* Metallic color radial */}
                    <div
                      className="absolute inset-0 opacity-40 mix-blend-color-dodge pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 50% 40%, ${pack.accentColor} 0%, transparent 70%)`,
                      }}
                    />

                    {/* Specular sheen beam */}
                    <div
                      className="absolute inset-0 opacity-25 pointer-events-none"
                      style={{
                        backgroundImage: `linear-gradient(${
                          120 + rotateY * 2
                        }deg, transparent 35%, rgba(255,255,255,0.8) 50%, transparent 65%)`,
                      }}
                    />

                    {/* Brand header */}
                    <div className="text-center z-10">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-white/80 block">
                        POKÉMON TCG
                      </span>
                      <h3 className="text-xl sm:text-2xl font-serif font-black text-white leading-tight drop-shadow">
                        POCKET
                      </h3>
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider mt-0.5 border shadow-sm"
                        style={{
                          backgroundColor: `${pack.accentColor}40`,
                          borderColor: pack.accentColor,
                          color: '#FFFFFF',
                        }}
                      >
                        {pack.name}
                      </span>
                    </div>

                    {/* Featured Pokémon Frame */}
                    <div className="relative w-36 h-48 sm:w-40 sm:h-54 rounded-xl overflow-hidden shadow-xl border border-white/40 my-1">
                      <img
                        src={pack.coverImage}
                        alt={pack.featuredPokemon}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                        <span className="text-[9px] font-mono text-amber-300 font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" /> IMMERSIVE INSIDE
                        </span>
                      </div>
                    </div>

                    {/* Tagline */}
                    <span className="text-[10px] font-mono text-neutral-300 font-semibold z-10">
                      Guaranteed Rare Climax Slot
                    </span>
                  </div>

                  {/* Bottom Crimp */}
                  <div
                    className="w-full h-10 bg-neutral-900 border-t border-white/20 relative flex items-center justify-center px-3"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(90deg, #000 0px, #000 2px, #fff 3px, #fff 4px)',
                      opacity: 0.85,
                    }}
                  >
                    <span className="text-[9px] font-mono text-white/70 tracking-widest uppercase font-bold">
                      A1 SERIES · NINTENDO / CREATURES
                    </span>
                  </div>
                </div>

                {/* Pedestal Glow Reflection */}
                {isCenter && (
                  <div
                    className="w-48 h-6 mx-auto mt-3 rounded-full blur-md opacity-75"
                    style={{
                      backgroundColor: pack.accentColor,
                      boxShadow: `0 0 35px ${pack.accentColor}`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Right Navigation Chevron Button */}
        <button
          onClick={handleNextPack}
          className="absolute right-2 sm:right-6 z-40 p-3 sm:p-4 rounded-full bg-black/70 hover:bg-white hover:text-black text-white border border-white/20 transition-all shadow-2xl backdrop-blur-md cursor-pointer active:scale-90"
          title="Next Pack"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Pack Indicator Dots */}
      <div className="flex items-center gap-2.5">
        {PACK_IDS.map((packId) => {
          const pack = BOOSTER_PACKS[packId];
          const isSelected = packId === selectedPackId;
          return (
            <button
              key={packId}
              onClick={() => {
                pocketAudio.playClick();
                onSelectPack(packId);
              }}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                isSelected
                  ? 'w-8 h-2.5 shadow-[0_0_12px_currentColor]'
                  : 'w-2.5 h-2.5 bg-neutral-700 hover:bg-neutral-500'
              }`}
              style={{
                backgroundColor: isSelected ? pack.accentColor : undefined,
                color: pack.accentColor,
              }}
              title={pack.name}
            />
          );
        })}
      </div>

      {/* ===================================================================
       * INTERACTIVE PACK DOSSIER & PRIMARY RIP ACTION
       * =================================================================== */}
      <div className="w-full max-w-3xl rounded-2xl border-2 border-white/20 bg-neutral-900/80 backdrop-blur-md p-5 sm:p-7 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Pack Info & Chase Details */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-black/60 border border-white/15">
              {getThemeIcon()}
            </span>
            <span className="text-xs font-mono font-black text-white uppercase tracking-wider">
              {activePack.name}
            </span>
          </div>

          <p className="text-xs font-mono text-neutral-300 leading-relaxed">
            {activePack.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="px-2.5 py-1 rounded-md bg-black/60 border border-white/15 text-[10px] font-mono text-neutral-300 font-bold">
              5 Cards / Pack
            </span>
            <span className="px-2.5 py-1 rounded-md bg-black/60 border border-amber-400/40 text-[10px] font-mono text-amber-300 font-bold">
              ★ Guaranteed Rare Slot
            </span>
            <span className="px-2.5 py-1 rounded-md bg-black/60 border border-purple-400/40 text-[10px] font-mono text-purple-300 font-bold">
              2% God Pack Chance
            </span>
            <button
              onClick={onOpenRatesModal}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-[10px] font-mono text-white cursor-pointer transition-colors"
            >
              <Info className="w-3 h-3 text-cyan-300" />
              <span>Official Rates</span>
            </button>
          </div>
        </div>

        {/* Center/Right: Chase Mini Card Preview with 3D Depth */}
        {featuredImmersiveCard && (
          <div className="flex flex-col items-center space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> CHASE SPECIMEN
            </span>
            <div className="transform hover:scale-105 transition-transform duration-300">
              <HoloCard3D
                card={featuredImmersiveCard}
                isFlipped={true}
                size="sm"
                interactive={true}
              />
            </div>
          </div>
        )}

        {/* Right: Primary Action Button */}
        <div className="w-full md:w-auto flex flex-col items-center gap-2">
          <button
            onClick={() => {
              pocketAudio.playClick();
              onStartOpening(selectedPackId);
            }}
            className="w-full md:w-auto px-8 py-4 rounded-xl font-mono text-xs sm:text-sm font-black uppercase tracking-widest text-black transition-all shadow-2xl active:scale-95 hover:brightness-110 cursor-pointer flex items-center justify-center gap-2"
            style={{
              backgroundColor: activePack.accentColor,
              boxShadow: `0 0 30px ${activePack.glowColor}`,
            }}
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>UNSEAL BOOSTER PACK</span>
          </button>
          <span className="text-[10px] font-mono text-neutral-400">
            Swipe to tear open in 3D
          </span>
        </div>
      </div>
    </div>
  );
};

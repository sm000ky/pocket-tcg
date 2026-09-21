import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { BoosterPackInfo } from '../types';
import { pocketAudio } from '../lib/audio';
import confetti from 'canvas-confetti';
import { Scissors, Sparkles, ChevronRight, Zap } from 'lucide-react';

interface BoosterPack3DProps {
  pack: BoosterPackInfo;
  onOpenPack: () => void;
  isOpening?: boolean;
}

export const BoosterPack3D: React.FC<BoosterPack3DProps> = ({
  pack,
  onOpenPack,
  isOpening = false,
}) => {
  const packRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);
  const [glareX, setGlareX] = useState<number>(50);
  const [glareY, setGlareY] = useState<number>(50);
  const [ripProgress, setRipProgress] = useState<number>(0); // 0 to 100
  const [isTorn, setIsTorn] = useState<boolean>(false);
  const [showCardsSlideUp, setShowCardsSlideUp] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const lastSoundTickRef = useRef<number>(0);
  const openTriggeredRef = useRef<boolean>(false);

  // Trigger full cinematic rip sequence
  const triggerRipExecution = useCallback(() => {
    if (openTriggeredRef.current) return;
    openTriggeredRef.current = true;

    setIsTorn(true);
    setRipProgress(100);
    pocketAudio.playPackTear();

    // Metallic foil confetti burst along the tear line
    try {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.35 },
        colors: [pack.accentColor, '#FFD700', '#E2E8F0', '#FFFFFF'],
        gravity: 1.2,
        scalar: 0.9,
      });
    } catch {
      // Ignore fallback
    }

    // Sequence 2: Cards emerge & slide up out of pouch after 220ms
    setTimeout(() => {
      setShowCardsSlideUp(true);
      pocketAudio.playPackCardsEmerge();
    }, 220);

    // Sequence 3: Transition to deck-in-hand reveal after full animation
    setTimeout(() => {
      onOpenPack();
    }, 950);
  }, [onOpenPack, pack.accentColor]);

  // Pointer move for 3D tilt and drag ripping
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isTorn || isOpening || !packRef.current) return;
      const rect = packRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const rY = ((x - rect.width / 2) / (rect.width / 2)) * 14;
      const rX = -((y - rect.height / 2) / (rect.height / 2)) * 14;

      setRotateX(rX);
      setRotateY(rY);
      setGlareX((x / rect.width) * 100);
      setGlareY((y / rect.height) * 100);

      // Handle drag-to-rip gesture along top seam
      if (isDraggingRef.current) {
        const deltaX = e.clientX - startXRef.current;
        const progress = Math.min(
          100,
          Math.max(0, (deltaX / (rect.width * 0.72)) * 100)
        );
        setRipProgress(progress);

        // Tactile sound tick every 50ms during active drag
        const now = Date.now();
        if (now - lastSoundTickRef.current > 50) {
          pocketAudio.playFoilCrinkle();
          lastSoundTickRef.current = now;
        }

        if (progress >= 85 && !openTriggeredRef.current) {
          isDraggingRef.current = false;
          setIsDragging(false);
          triggerRipExecution();
        }
      }
    },
    [isTorn, isOpening, triggerRipExecution]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isTorn || isOpening) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = e.clientX;
    pocketAudio.playFoilCrinkle();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
    if (ripProgress < 85 && !isTorn) {
      setRipProgress(0); // Snap back if incomplete
    }
  };

  const handlePointerLeave = () => {
    if (!isDraggingRef.current && !isTorn) {
      setRotateX(0);
      setRotateY(0);
      setGlareX(50);
      setGlareY(50);
    }
  };

  const handleDirectClickRip = () => {
    if (isTorn || isOpening) return;
    triggerRipExecution();
  };

  // Sync state if opened from parent
  useEffect(() => {
    if (isOpening && !isTorn) {
      triggerRipExecution();
    }
  }, [isOpening, isTorn, triggerRipExecution]);

  return (
    <div className="relative flex flex-col items-center select-none perspective-[1200px] w-76 sm:w-88 h-[510px]">
      {/* 3D Pack Canvas */}
      <div
        ref={packRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className={`w-full h-full relative cursor-grab active:cursor-grabbing rounded-2xl transition-transform duration-150 ease-out transform-gpu preserve-3d shadow-2xl ${
          isTorn ? 'animate-screen-shake' : !isDragging ? 'animate-pack-idle' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
      >
        {/* =================================================================
         * TOP TEAR STRIP (CAN DETACH & PEEL PHYSICALLY)
         * ================================================================= */}
        <div
          className={`absolute top-0 left-0 right-0 h-16 rounded-t-2xl bg-neutral-900 border-2 border-b-0 border-white/30 overflow-hidden z-30 transition-transform origin-bottom-left ${
            isTorn ? 'animate-tear-flyoff pointer-events-none' : ''
          }`}
          style={{
            transform: !isTorn && ripProgress > 0
              ? `rotate(${-ripProgress * 0.18}deg) translate3d(${ripProgress * 0.25}px, ${-ripProgress * 0.12}px, 12px) skewX(${-ripProgress * 0.08}deg)`
              : undefined,
            boxShadow:
              ripProgress > 0 ? '0 10px 30px rgba(255,215,0,0.6)' : 'none',
          }}
        >
          {/* Metallic ridges */}
          <div
            className="absolute inset-0 opacity-45"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, #000 0px, #000 2px, #fff 3px, #fff 4px)',
            }}
          />

          {/* Holographic foil sheen on top crimp */}
          <div
            className="absolute inset-0 opacity-40 mix-blend-color-dodge pointer-events-none"
            style={{
              background: `linear-gradient(${110 + rotateY * 2}deg, rgba(255,0,128,0.4) 0%, rgba(255,215,0,0.5) 50%, rgba(0,255,255,0.4) 100%)`,
            }}
          />

          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4">
            <div className="w-full flex items-center justify-between border-b-2 border-dashed border-amber-400/90 pb-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-300 drop-shadow">
                <Scissors className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>SWIPE RIGHT TO RIP</span>
              </div>
              <div className="flex items-center text-[10px] font-mono text-amber-300 font-black">
                <span>{Math.round(ripProgress)}%</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5 text-amber-400" />
              </div>
            </div>

            {/* Glowing tear beam line */}
            {ripProgress > 0 && (
              <div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-200 shadow-[0_0_15px_#ffd700]"
                style={{ width: `${ripProgress}%` }}
              />
            )}
          </div>
        </div>

        {/* Light Beam shooting out from the breach */}
        {isTorn && (
          <div
            className="absolute top-12 left-0 right-0 h-32 bg-gradient-to-t from-amber-400 via-white to-transparent pointer-events-none z-25 blur-[4px] animate-beam-burst"
            style={{
              boxShadow: '0 0 60px rgba(255,215,0,0.95)',
            }}
          />
        )}

        {/* =================================================================
         * CARDS SLIDING OUT OF THE OPENED FOIL SLEEVE
         * ================================================================= */}
        {showCardsSlideUp && (
          <div className="absolute top-12 left-6 right-6 h-64 rounded-xl bg-gradient-to-b from-[#1e293b] to-[#0f172a] border-2 border-amber-400/80 shadow-[0_0_30px_rgba(251,191,36,0.6)] flex flex-col items-center justify-center z-20 animate-cards-emerge preserve-3d">
            <div className="w-12 h-12 rounded-full border-2 border-amber-400 flex items-center justify-center bg-black/50 shadow-inner mb-2">
              <Sparkles className="w-6 h-6 text-amber-300 animate-spin" />
            </div>
            <span className="text-xs font-mono font-extrabold text-amber-300 tracking-widest uppercase">
              5 CARDS UNSEALED!
            </span>
            <span className="text-[10px] font-mono text-neutral-300 mt-1">
              Entering Reveal Stage...
            </span>
          </div>
        )}

        {/* =================================================================
         * MAIN PACK FOIL POUCH BODY
         * ================================================================= */}
        <div
          className="absolute inset-0 top-14 rounded-b-2xl overflow-hidden border-2 border-t-0 border-white/30 flex flex-col justify-between"
          style={{
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.45) 0%, transparent 55%), linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #090d16 100%)`,
            boxShadow: `0 20px 50px ${pack.glowColor}, inset 0 0 30px rgba(255,255,255,0.25)`,
          }}
        >
          {/* Central Artwork & Typography */}
          <div className="relative flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
            {/* Background Foil Radial Color */}
            <div
              className="absolute inset-0 opacity-40 mix-blend-color-dodge"
              style={{
                background: `radial-gradient(circle at 50% 45%, ${pack.accentColor} 0%, transparent 65%)`,
              }}
            />

            {/* Specular Diagonal Sheen Bar */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(${
                  125 + rotateY * 2
                }deg, transparent 30%, rgba(255,255,255,0.7) 50%, transparent 70%)`,
              }}
            />

            {/* Brand Logo Header */}
            <div className="text-center z-10 mb-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-white/80 block">
                POKÉMON TRADING CARD GAME
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white drop-shadow-md">
                POCKET
              </h2>
              <span
                className="inline-block px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider mt-1 border shadow-sm"
                style={{
                  backgroundColor: `${pack.accentColor}35`,
                  borderColor: pack.accentColor,
                  color: '#FFFFFF',
                }}
              >
                {pack.name}
              </span>
            </div>

            {/* Featured High-Res Pokémon Card Frame */}
            <div className="relative w-44 h-60 rounded-xl overflow-hidden shadow-2xl border border-white/40 transform hover:scale-105 transition-transform duration-300 z-10">
              <img
                src={pack.coverImage}
                alt={pack.featuredPokemon}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[10px] font-mono text-amber-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> IMMERSIVE INSIDE
                </span>
              </div>
            </div>

            <p className="text-[11px] font-mono text-neutral-300 text-center max-w-[240px] mt-3 z-10 font-semibold">
              5 Official Cards · Guaranteed Rare Slot
            </p>
          </div>

          {/* Bottom Foil Crimp */}
          <div className="relative w-full h-10 bg-neutral-900 border-t border-white/20 flex items-center justify-center overflow-hidden">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, #000 0px, #000 2px, #fff 3px, #fff 4px)',
              }}
            />
            <span className="relative z-10 text-[9px] font-mono text-white/70 tracking-widest uppercase font-bold">
              GENETIC APEX · A1 SERIES
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Button for Tactile Click */}
      <div className="mt-5 w-full flex justify-center z-30">
        <button
          onClick={handleDirectClickRip}
          disabled={isTorn || isOpening}
          className="w-full py-3 px-6 rounded-xl font-mono text-xs font-black uppercase tracking-widest border transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xl active:scale-95 hover:brightness-110"
          style={{
            backgroundColor: pack.accentColor,
            borderColor: '#FFFFFF',
            color: '#000000',
            boxShadow: `0 0 25px ${pack.glowColor}`,
          }}
        >
          <Scissors className="w-4 h-4" />
          <span>
            {isTorn ? 'UNSEALING SPECIMENS...' : 'QUICK RIP BOOSTER PACK'}
          </span>
          <Zap className="w-4 h-4 fill-current ml-0.5" />
        </button>
      </div>
    </div>
  );
};

import React, { useState, useRef, useCallback } from 'react';
import type { BoosterPackInfo } from '../types';
import { pocketAudio } from '../lib/audio';
import { Scissors, Sparkles } from 'lucide-react';

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
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isOpening || !packRef.current) return;
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
      const progress = Math.min(100, Math.max(0, (deltaX / (rect.width * 0.75)) * 100));
      setRipProgress(progress);

      if (progress >= 95 && !isOpening) {
        isDraggingRef.current = false;
        pocketAudio.playPackTear();
        onOpenPack();
      }
    }
  }, [isOpening, onOpenPack]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isOpening) return;
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    if (ripProgress < 95) {
      setRipProgress(0); // Snap back if incomplete
    }
  };

  const handlePointerLeave = () => {
    if (!isDraggingRef.current) {
      setRotateX(0);
      setRotateY(0);
      setGlareX(50);
      setGlareY(50);
    }
  };

  const handleDirectClickRip = () => {
    if (isOpening) return;
    pocketAudio.playPackTear();
    setRipProgress(100);
    onOpenPack();
  };

  return (
    <div className="relative flex flex-col items-center select-none perspective-[1000px] w-72 sm:w-80 h-[460px]">
      {/* 3D Pack Canvas */}
      <div
        ref={packRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className={`w-full h-full relative cursor-grab active:cursor-grabbing rounded-2xl transition-transform duration-150 ease-out transform-gpu preserve-3d shadow-2xl ${
          isOpening ? 'scale-105 opacity-90' : 'hover:scale-[1.02]'
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
      >
        {/* Pack Foil Pouch Body */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-white/25 flex flex-col justify-between"
          style={{
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.4) 0%, transparent 50%), linear-gradient(180deg, #111827 0%, #1f2937 50%, #0f172a 100%)`,
            boxShadow: `0 15px 40px ${pack.glowColor}, inset 0 0 20px rgba(255,255,255,0.15)`,
          }}
        >
          {/* Top Crimped Foil Seal & Tear Strip */}
          <div className="relative w-full h-16 bg-neutral-900 border-b border-white/20 flex flex-col items-center justify-center overflow-hidden z-20">
            {/* Crimped ridges texture */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, #000 0px, #000 2px, #fff 3px, #fff 4px)',
              }}
            />
            {/* Tear Perforation Line */}
            <div className="relative z-10 w-11/12 flex items-center justify-between border-b-2 border-dashed border-amber-400/80 py-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-300">
                <Scissors className="w-3.5 h-3.5" />
                <span>SWIPE TO RIP FOIL</span>
              </div>
              <span className="text-[10px] font-mono text-amber-300 font-bold">{Math.round(ripProgress)}%</span>
            </div>

            {/* Visual Rip Mask */}
            {ripProgress > 0 && (
              <div
                className="absolute top-0 left-0 bottom-0 bg-amber-500/30 backdrop-blur-[1px] border-r-2 border-amber-300 transition-all"
                style={{ width: `${ripProgress}%` }}
              />
            )}
          </div>

          {/* Central Featured Artwork Frame */}
          <div className="relative flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
            {/* Background Foil Radial Sheen */}
            <div
              className="absolute inset-0 opacity-30 mix-blend-color-dodge"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${pack.accentColor} 0%, transparent 70%)`,
              }}
            />

            {/* Pocket Logo Branding */}
            <div className="text-center z-10 mb-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-white/70 block">
                POKÉMON TRADING CARD GAME
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white drop-shadow-md">
                POCKET
              </h2>
              <span
                className="inline-block px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider mt-1 border"
                style={{
                  backgroundColor: `${pack.accentColor}25`,
                  borderColor: pack.accentColor,
                  color: pack.accentColor,
                }}
              >
                {pack.name}
              </span>
            </div>

            {/* Featured Pokémon High-Res Card/Sprite */}
            <div className="relative w-40 h-56 rounded-xl overflow-hidden shadow-2xl border border-white/30 transform hover:scale-105 transition-transform duration-300 z-10">
              <img
                src={pack.coverImage}
                alt={pack.featuredPokemon}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                <span className="text-[10px] font-mono text-amber-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> IMMERSIVE INSIDE
                </span>
              </div>
            </div>

            <p className="text-[11px] font-mono text-neutral-300/80 text-center max-w-[240px] mt-3 z-10">
              Contains 5 official cards · Guaranteed Rare slot
            </p>
          </div>

          {/* Bottom Crimped Foil Seal */}
          <div className="relative w-full h-10 bg-neutral-900 border-t border-white/20 flex items-center justify-center overflow-hidden">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, #000 0px, #000 2px, #fff 3px, #fff 4px)',
              }}
            />
            <span className="relative z-10 text-[9px] font-mono text-white/50 tracking-widest uppercase">
              GENETIC APEX · A1 SERIES
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Button for Mobile or Click Users */}
      <div className="mt-5 w-full flex justify-center">
        <button
          onClick={handleDirectClickRip}
          disabled={isOpening}
          className="w-full py-3 px-6 rounded-xl font-mono text-xs font-bold uppercase tracking-widest border transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
          style={{
            backgroundColor: pack.accentColor,
            borderColor: '#FFFFFF',
            color: '#000000',
            boxShadow: `0 0 20px ${pack.glowColor}`,
          }}
        >
          <Scissors className="w-4 h-4" />
          <span>{isOpening ? 'OPENING BOOSTER PACK...' : 'OPEN BOOSTER PACK'}</span>
        </button>
      </div>
    </div>
  );
};

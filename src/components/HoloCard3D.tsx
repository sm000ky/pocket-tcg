import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { PokemonCardData } from '../types';
import { pocketAudio } from '../lib/audio';
import { Sparkles, Eye, Maximize2 } from 'lucide-react';

interface HoloCard3DProps {
  card: PokemonCardData;
  isFlipped?: boolean; // true = face up, false = back side
  onFlip?: () => void;
  onDiveIn?: () => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSuspenseGlow?: boolean;
}

const POKEBALL_BACK_URL = 'https://assets.tcgdex.net/univ/tcgp/back.webp';

export const HoloCard3D: React.FC<HoloCard3DProps> = ({
  card,
  isFlipped = true,
  onFlip,
  onDiveIn,
  interactive = true,
  size = 'md',
  showSuspenseGlow = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);
  const [glareX, setGlareX] = useState<number>(50);
  const [glareY, setGlareY] = useState<number>(50);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Size dimensions
  const sizeClasses = {
    sm: 'w-36 h-52',
    md: 'w-52 h-72 sm:w-60 sm:h-84',
    lg: 'w-64 h-92 sm:w-72 sm:h-[400px]',
    xl: 'w-72 h-[410px] sm:w-84 sm:h-[480px]',
  }[size];

  // Mouse & Touch 3D tilt tracking
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    const rY = ((x - rect.width / 2) / (rect.width / 2)) * 18; // Max 18deg
    const rX = -((y - rect.height / 2) / (rect.height / 2)) * 18;

    setRotateX(rX);
    setRotateY(rY);
    setGlareX(percentX);
    setGlareY(percentY);
  }, [interactive]);

  const handlePointerEnter = () => {
    if (!interactive) return;
    setIsHovered(true);
    if (card.isHolo) {
      pocketAudio.playHoloSparkle();
    }
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlareX(50);
    setGlareY(50);
  };

  // Gyroscope tilt on mobile Poco F7 Pro (DeviceOrientation API)
  useEffect(() => {
    if (!interactive) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        // gamma: left-right (-90 to 90), beta: front-back (-180 to 180)
        const tiltX = Math.max(-20, Math.min(20, (e.beta - 45) * 0.5));
        const tiltY = Math.max(-20, Math.min(20, e.gamma * 0.6));
        setRotateX(-tiltX);
        setRotateY(tiltY);
        setGlareX(50 + tiltY * 2);
        setGlareY(50 + tiltX * 2);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [interactive]);

  // Suspense glow for rare cards before reveal
  const getSuspenseGlowStyle = () => {
    if (!showSuspenseGlow || isFlipped) return '';
    if (card.isCrown) {
      return 'shadow-[0_0_35px_rgba(255,215,0,0.85)] ring-2 ring-yellow-400';
    }
    if (card.isImmersive) {
      return 'shadow-[0_0_35px_rgba(56,189,248,0.85)] ring-2 ring-cyan-400';
    }
    if (card.rarityRank >= 4) {
      return 'shadow-[0_0_25px_rgba(236,72,153,0.75)] ring-2 ring-pink-400';
    }
    if (card.rarityRank >= 3) {
      return 'shadow-[0_0_20px_rgba(168,85,247,0.65)] ring-2 ring-purple-400';
    }
    return '';
  };

  const handleClick = () => {
    if (onFlip) {
      pocketAudio.playCardFlip();
      onFlip();
    }
  };

  return (
    <div
      className={`relative select-none perspective-[1000px] flex items-center justify-center ${sizeClasses}`}
      style={{ perspective: '1000px' }}
    >
      <div
        ref={cardRef}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className={`w-full h-full relative cursor-pointer rounded-2xl transition-transform duration-200 ease-out transform-gpu preserve-3d ${getSuspenseGlowStyle()}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotateX}deg) rotateY(${isFlipped ? rotateY : rotateY + 180}deg) ${
            isHovered ? 'scale3d(1.05, 1.05, 1.05)' : 'scale3d(1, 1, 1)'
          }`,
        }}
      >
        {/* ===================================================================
         * FRONT SIDE (FACE UP)
         * =================================================================== */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden backface-hidden shadow-2xl bg-neutral-900 border-2 border-neutral-700/60 flex flex-col"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Card Artwork Image */}
          <img
            src={card.imageHigh}
            alt={card.name}
            loading="lazy"
            className="w-full h-full object-cover rounded-2xl pointer-events-none"
            onError={(e) => {
              (e.target as HTMLImageElement).src = card.imageLow;
            }}
          />

          {/* Holographic Prismatic Foil Shader (For Holo / ex / Stars / Crown) */}
          {card.isHolo && (
            <div
              className="absolute inset-0 pointer-events-none mix-blend-color-dodge transition-opacity duration-200 rounded-2xl"
              style={{
                opacity: isHovered ? 0.85 : 0.45,
                background: `linear-gradient(${
                  115 + rotateY * 2
                }deg, rgba(255,0,0,0.4) 0%, rgba(255,154,0,0.4) 15%, rgba(208,222,33,0.4) 30%, rgba(79,220,74,0.4) 45%, rgba(63,218,216,0.4) 60%, rgba(47,201,226,0.4) 75%, rgba(28,127,238,0.4) 85%, rgba(95,21,242,0.4) 95%)`,
              }}
            />
          )}

          {/* Specular Glare Dot Layer */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-150 rounded-2xl"
            style={{
              opacity: isHovered ? 0.75 : 0.25,
              background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.15) 35%, transparent 65%)`,
            }}
          />

          {/* Crown Gold Foil Texture */}
          {card.isCrown && (
            <div
              className="absolute inset-0 pointer-events-none mix-blend-soft-light rounded-2xl"
              style={{
                background: `linear-gradient(${
                  45 + rotateX * 3
                }deg, rgba(255,215,0,0.6) 0%, rgba(255,248,220,0.8) 50%, rgba(184,134,11,0.6) 100%)`,
              }}
            />
          )}

          {/* Immersive Badge & "Dive In" Button */}
          {card.isImmersive && onDiveIn && (
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDiveIn();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-cyan-400 text-cyan-300 text-xs font-mono font-bold tracking-wider hover:bg-cyan-500 hover:text-black transition-all shadow-[0_0_15px_rgba(56,189,248,0.5)] cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>DIVE IN (IMMERSIVE)</span>
              </button>
            </div>
          )}

          {/* Rarity & Card Info Badge (Top Right) */}
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm border border-white/20 text-[10px] font-mono font-bold text-white flex items-center gap-1 z-10">
            {card.isCrown ? (
              <span className="text-yellow-400 font-extrabold flex items-center gap-0.5">
                <Sparkles className="w-3 h-3" /> CROWN
              </span>
            ) : card.isImmersive ? (
              <span className="text-cyan-400 font-extrabold flex items-center gap-0.5">
                ★★★ IMMERSIVE
              </span>
            ) : card.rarityRank >= 4 ? (
              <span className="text-amber-300 font-bold">ex</span>
            ) : (
              <span className="opacity-80">{card.rarity}</span>
            )}
          </div>
        </div>

        {/* ===================================================================
         * BACK SIDE (FACE DOWN)
         * =================================================================== */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden backface-hidden shadow-2xl bg-[#0c1220] border-2 border-neutral-700/80 flex items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <img
            src={POKEBALL_BACK_URL}
            alt="Pokémon Card Back"
            className="w-full h-full object-cover rounded-2xl pointer-events-none"
            onError={(e) => {
              // Fallback aesthetic styling if external back fails
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {/* Subtle Back Specular Sheen */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-overlay rounded-2xl"
            style={{
              background: `radial-gradient(circle at ${100 - glareX}% ${glareY}%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-amber-400/60 bg-black/40 flex items-center justify-center shadow-inner">
              <Eye className="w-6 h-6 text-amber-300 opacity-80" />
            </div>
            <span className="mt-3 text-[11px] font-mono tracking-widest text-amber-200/80 uppercase font-bold">
              TAP TO REVEAL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

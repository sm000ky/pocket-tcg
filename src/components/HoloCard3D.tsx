import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { PokemonCardData } from '../types';
import { pocketAudio } from '../lib/audio';
import { getRarityTierVisual } from '../lib/gacha';
import { Sparkles, Eye, Maximize2 } from 'lucide-react';

interface HoloCard3DProps {
  card: PokemonCardData;
  isFlipped?: boolean; // true = face up, false = back side
  onFlip?: () => void;
  onDiveIn?: () => void;
  onFlick?: (direction: 'left' | 'right') => void;
  onDragProgress?: (deltaX: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSuspenseGlow?: boolean;
  flickAnimation?: 'left' | 'right' | null;
  peekOffsetX?: number; // Optional external peek offset
  disableFlipOnTap?: boolean;
}

const POKEBALL_BACK_URL = 'https://assets.tcgdex.net/univ/tcgp/back.webp';

export const HoloCard3D: React.FC<HoloCard3DProps> = ({
  card,
  isFlipped = true,
  onFlip,
  onDiveIn,
  onFlick,
  onDragProgress,
  interactive = true,
  size = 'md',
  showSuspenseGlow = false,
  flickAnimation = null,
  peekOffsetX = 0,
  disableFlipOnTap = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);
  const [glareX, setGlareX] = useState<number>(50);
  const [glareY, setGlareY] = useState<number>(50);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [justRevealed, setJustRevealed] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const isDraggingRef = useRef<boolean>(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const wasFlippedRef = useRef<boolean>(isFlipped);

  const rarityVisual = getRarityTierVisual(card);

  // Trigger sheen sweep animation on reveal
  useEffect(() => {
    if (isFlipped && !wasFlippedRef.current) {
      setJustRevealed(true);
      const timer = setTimeout(() => setJustRevealed(false), 900);
      return () => clearTimeout(timer);
    }
    wasFlippedRef.current = isFlipped;
  }, [isFlipped]);

  // Size dimensions
  const sizeClasses = {
    sm: 'w-36 h-52',
    md: 'w-52 h-72 sm:w-60 sm:h-84',
    lg: 'w-64 h-92 sm:w-72 sm:h-[400px]',
    xl: 'w-72 h-[410px] sm:w-84 sm:h-[480px]',
  }[size];

  // Pointer move for 3D tilt and drag
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;

      // Real 3D tilt calculation (up to 20deg)
      const rY = ((x - rect.width / 2) / (rect.width / 2)) * 20;
      const rX = -((y - rect.height / 2) / (rect.height / 2)) * 20;

      setRotateX(rX);
      setRotateY(rY);
      setGlareX(percentX);
      setGlareY(percentY);

      if (isDraggingRef.current) {
        const dx = e.clientX - startPosRef.current.x;
        const dy = e.clientY - startPosRef.current.y;
        setDragOffset({ x: dx, y: dy });
        onDragProgress?.(dx);
      }
    },
    [interactive, onDragProgress]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    // If card is unrevealed and rare, play subtle tension riser
    if (!isFlipped && card.rarityRank >= 4) {
      pocketAudio.playTensionRiser();
    }
  };

  const handlePointerUp = () => {
    if (!interactive) return;
    const { x: dx, y: dy } = dragOffset;
    isDraggingRef.current = false;
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    onDragProgress?.(0);

    const dist = Math.sqrt(dx * dx + dy * dy);

    // Flick gesture (if dragged > 65px)
    if (onFlick && Math.abs(dx) > 65) {
      onFlick(dx > 0 ? 'right' : 'left');
      return;
    }

    // Tap/Click to flip
    if (dist < 15 && !isFlipped && onFlip && !disableFlipOnTap) {
      pocketAudio.playCardFlip();
      onFlip();
    }
  };

  const handlePointerEnter = () => {
    if (!interactive) return;
    setIsHovered(true);
    if (card.isHolo && isFlipped) {
      pocketAudio.playHoloSparkle();
    }
  };

  const handlePointerLeave = () => {
    if (!isDraggingRef.current) {
      setIsHovered(false);
      setRotateX(0);
      setRotateY(0);
      setGlareX(50);
      setGlareY(50);
    }
  };

  // Gyroscope tilt on mobile (DeviceOrientation API)
  useEffect(() => {
    if (!interactive) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        const tiltX = Math.max(-22, Math.min(22, (e.beta - 45) * 0.55));
        const tiltY = Math.max(-22, Math.min(22, e.gamma * 0.65));
        setRotateX(-tiltX);
        setRotateY(tiltY);
        setGlareX(50 + tiltY * 2);
        setGlareY(50 + tiltX * 2);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [interactive]);

  // Dynamic 3D directional cast shadow based on tilt angle (gives authentic physical slab depth)
  const shadowX = -rotateY * 1.5;
  const shadowY = rotateX * 1.5 + 18;
  const shadowBlur = 28 + Math.abs(rotateX) * 0.4 + Math.abs(rotateY) * 0.4;

  const currentTotalX = dragOffset.x + peekOffsetX;

  const getFlickAnimationClass = () => {
    if (flickAnimation === 'left') return 'animate-card-flick-left pointer-events-none';
    if (flickAnimation === 'right') return 'animate-card-flick-right pointer-events-none';
    return '';
  };

  // Suspense glow styling based on rarity
  const suspenseStyle = showSuspenseGlow && !isFlipped ? rarityVisual.suspenseAura : undefined;

  return (
    <div
      className={`relative select-none flex items-center justify-center ${sizeClasses} ${getFlickAnimationClass()}`}
      style={{
        perspective: '1200px',
      }}
    >
      <div
        ref={cardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className="w-full h-full relative cursor-pointer rounded-2xl transition-transform duration-150 ease-out transform-gpu preserve-3d touch-none"
        style={{
          transformStyle: 'preserve-3d',
          transform: `translate3d(${currentTotalX}px, ${dragOffset.y}px, 0px) rotateZ(${
            currentTotalX * 0.08
          }deg) rotateX(${rotateX}deg) rotateY(${
            isFlipped ? rotateY : rotateY + 180
          }deg) ${isHovered && !isDragging ? 'scale3d(1.03, 1.03, 1.03)' : 'scale3d(1, 1, 1)'}`,
          boxShadow: suspenseStyle
            ? `${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0,0,0,0.7), ${suspenseStyle}`
            : `${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0,0,0,0.7), 0 0 0 1.5px rgba(255,255,255,0.15), inset 0 1px 2px rgba(255,255,255,0.3)`,
        }}
      >
        {/* ===================================================================
         * FRONT SIDE (FACE UP) - WITH TRUE 3D LAYERED PARALLAX
         * =================================================================== */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden backface-hidden bg-neutral-950 border border-white/20 flex flex-col preserve-3d"
          style={{
            backfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Layer 0: Recessed Base Artwork Image (translateZ: 2px) */}
          <div
            className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl overflow-hidden"
            style={{
              transform: 'translateZ(2px)',
            }}
          >
            <img
              src={card.imageHigh}
              alt={card.name}
              loading="lazy"
              className="w-full h-full object-cover rounded-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = card.imageLow;
              }}
            />
          </div>

          {/* Layer 1: Beveled 3D Inner Rim Highlight (translateZ: 12px) */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none border border-white/30"
            style={{
              transform: 'translateZ(12px)',
              boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)',
            }}
          />

          {/* Layer 2: Holographic Prismatic Foil Shader (translateZ: 22px) */}
          {card.isHolo && (
            <div
              className="absolute inset-0 pointer-events-none mix-blend-color-dodge transition-opacity duration-200 rounded-2xl"
              style={{
                transform: 'translateZ(22px)',
                opacity: isHovered ? 0.92 : 0.5,
                background: `linear-gradient(${
                  115 + rotateY * 2.2 + rotateX
                }deg, rgba(255,0,0,0.45) 0%, rgba(255,154,0,0.45) 15%, rgba(208,222,33,0.45) 30%, rgba(79,220,74,0.45) 45%, rgba(63,218,216,0.45) 60%, rgba(47,201,226,0.45) 75%, rgba(28,127,238,0.45) 85%, rgba(95,21,242,0.45) 95%)`,
              }}
            />
          )}

          {/* Layer 3: Crown Gold Specular Texture (translateZ: 24px) */}
          {card.isCrown && (
            <div
              className="absolute inset-0 pointer-events-none mix-blend-soft-light rounded-2xl"
              style={{
                transform: 'translateZ(24px)',
                background: `linear-gradient(${
                  45 + rotateX * 3 + rotateY * 2
                }deg, rgba(255,215,0,0.7) 0%, rgba(255,248,220,0.9) 50%, rgba(184,134,11,0.7) 100%)`,
              }}
            />
          )}

          {/* Layer 4: Specular Glare Dot Flare (translateZ: 30px) */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-150 rounded-2xl"
            style={{
              transform: 'translateZ(30px)',
              opacity: isHovered ? 0.85 : 0.35,
              background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.2) 35%, transparent 65%)`,
            }}
          />

          {/* Layer 5: Reveal Flash Sheen Sweep Animation */}
          {justRevealed && (
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-30"
              style={{ transform: 'translateZ(34px)' }}
            >
              <div
                className="w-[200%] h-full bg-gradient-to-r from-transparent via-white/90 to-transparent animate-sheen-sweep"
                style={{
                  boxShadow: '0 0 50px rgba(255,255,255,0.95)',
                }}
              />
            </div>
          )}

          {/* Layer 6: Floating 3D Metadata Badges (translateZ: 38px) */}
          <div
            className="absolute top-2.5 right-2.5 z-20 pointer-events-none"
            style={{
              transform: 'translateZ(38px)',
              filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.75))',
            }}
          >
            <div className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/30 text-[10px] font-mono font-bold text-white flex items-center gap-1.5">
              {card.isCrown ? (
                <span className="text-yellow-400 font-extrabold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 fill-current" /> CROWN GOLD
                </span>
              ) : card.isImmersive ? (
                <span className="text-cyan-300 font-extrabold flex items-center gap-1">
                  ★★★ IMMERSIVE
                </span>
              ) : card.rarityRank >= 4 ? (
                <span className="text-rose-300 font-black tracking-wider">
                  ★ {card.rarity.toUpperCase()}
                </span>
              ) : (
                <span className="text-neutral-200">{card.rarity}</span>
              )}
            </div>
          </div>

          {/* Layer 7: Floating "DIVE IN" Button for Immersive Cards (translateZ: 44px) */}
          {card.isImmersive && onDiveIn && (
            <div
              className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-center z-30"
              style={{
                transform: 'translateZ(44px)',
                filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.85))',
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDiveIn();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 text-black text-xs font-mono font-black tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(6,182,212,0.7)] cursor-pointer active:scale-95"
              >
                <Maximize2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>DIVE IN (IMMERSIVE REALM)</span>
              </button>
            </div>
          )}
        </div>

        {/* ===================================================================
         * BACK SIDE (FACE DOWN) - AUTHENTIC 3D POKÉBALL EMBOSS
         * =================================================================== */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden backface-hidden bg-[#0c1220] border-2 border-white/20 flex items-center justify-center preserve-3d"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Card Back Base Image (translateZ: 2px) */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{ transform: 'translateZ(2px)' }}
          >
            <img
              src={POKEBALL_BACK_URL}
              alt="Pokémon Card Back"
              className="w-full h-full object-cover rounded-2xl pointer-events-none"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          {/* Back Specular Light Gleam (translateZ: 18px) */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-overlay rounded-2xl"
            style={{
              transform: 'translateZ(18px)',
              background: `radial-gradient(circle at ${100 - glareX}% ${glareY}%, rgba(255,255,255,0.45) 0%, transparent 60%)`,
            }}
          />

          {/* Rarity Silhouette Glow on Card Edge when Face Down */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none border-2 transition-all duration-200"
            style={{
              transform: 'translateZ(24px)',
              borderColor: rarityVisual.edgeColor,
              boxShadow: `inset 0 0 20px ${rarityVisual.edgeColor}`,
            }}
          />

          {/* Floating Tap/Peel Prompt (translateZ: 32px) */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none"
            style={{
              transform: 'translateZ(32px)',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.8))',
            }}
          >
            <div
              className="w-14 h-14 rounded-full border-2 bg-black/60 backdrop-blur-md flex items-center justify-center shadow-lg"
              style={{
                borderColor: rarityVisual.color,
                boxShadow: `0 0 18px ${rarityVisual.edgeColor}`,
              }}
            >
              <Eye className="w-6 h-6" style={{ color: rarityVisual.color }} />
            </div>
            <span
              className="mt-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[10px] font-mono tracking-widest uppercase font-black"
              style={{ color: rarityVisual.color }}
            >
              TAP TO REVEAL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

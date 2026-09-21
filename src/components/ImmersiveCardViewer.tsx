import React, { useState, useEffect } from 'react';
import type { PokemonCardData } from '../types';
import { X, Compass, Flame, Zap, Eye } from 'lucide-react';

interface ImmersiveCardViewerProps {
  card: PokemonCardData;
  onClose: () => void;
}

export const ImmersiveCardViewer: React.FC<ImmersiveCardViewerProps> = ({
  card,
  onClose,
}) => {
  const [tiltX, setTiltX] = useState<number>(0);
  const [tiltY, setTiltY] = useState<number>(0);

  // Device orientation or mouse movement for 3D panoramic depth
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 40; // -20 to 20
    const y = (clientY / innerHeight - 0.5) * 40;
    setTiltX(x);
    setTiltY(y);
  };

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        setTiltX(Math.max(-25, Math.min(25, e.gamma)));
        setTiltY(Math.max(-25, Math.min(25, (e.beta - 45) * 0.8)));
      }
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const getElementalTheme = () => {
    if (card.types.includes('Fire')) {
      return {
        bg: 'from-amber-950 via-red-950 to-black',
        accent: 'text-amber-400 border-amber-500',
        glow: 'rgba(245, 158, 11, 0.4)',
        icon: Flame,
        realmTitle: 'Kanto Volcanic Caldera Rift',
        particleColor: 'bg-amber-400',
      };
    }
    if (card.types.includes('Lightning')) {
      return {
        bg: 'from-yellow-950 via-amber-950 to-black',
        accent: 'text-yellow-400 border-yellow-500',
        glow: 'rgba(250, 204, 21, 0.4)',
        icon: Zap,
        realmTitle: 'Viridian Lightning Storm Horizon',
        particleColor: 'bg-yellow-300',
      };
    }
    return {
      bg: 'from-purple-950 via-indigo-950 to-black',
      accent: 'text-purple-400 border-purple-500',
      glow: 'rgba(168, 85, 247, 0.4)',
      icon: Eye,
      realmTitle: 'Cinnabar Genetic Synthesis Core',
      particleColor: 'bg-purple-300',
    };
  };

  const theme = getElementalTheme();
  const Icon = theme.icon;

  return (
    <div
      onPointerMove={handlePointerMove}
      className={`fixed inset-0 z-50 bg-gradient-to-b ${theme.bg} text-white flex flex-col justify-between p-4 sm:p-8 overflow-hidden select-none`}
    >
      {/* Top Header HUD */}
      <div className="flex items-center justify-between z-30 border-b border-white/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-black/60 border border-white/20">
            <Icon className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-cyan-300 uppercase font-bold">
                IMMERSIVE ART REALM
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500 text-cyan-200">
                ★★★ THREE STAR
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-wide mt-0.5">
              {card.name} · {theme.realmTitle}
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-black/60 border border-white/30 hover:bg-white hover:text-black transition-all cursor-pointer shadow-lg"
          title="Exit Immersive Realm"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* 3D Multi-Layer Parallax Landscape Stage */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden my-4">
        {/* Layer 0: Ambient Nebula Backing */}
        <div
          className="absolute inset-[-20%] transition-transform duration-100 ease-out pointer-events-none opacity-60"
          style={{
            transform: `translate3d(${tiltX * -0.4}px, ${tiltY * -0.4}px, 0)`,
            backgroundImage: `radial-gradient(circle at 50% 50%, ${theme.glow} 0%, transparent 60%)`,
          }}
        />

        {/* Layer 1: Expanded High-Resolution Illustration */}
        <div
          className="relative max-w-4xl max-h-[75vh] aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] border-2 border-white/30 transition-transform duration-150 ease-out"
          style={{
            transform: `translate3d(${tiltX * 0.8}px, ${tiltY * 0.8}px, 0) scale(1.08)`,
          }}
        >
          <img
            src={card.imageHigh}
            alt={card.name}
            className="w-full h-full object-cover scale-110"
          />

          {/* Dynamic Light Sweep Shader */}
          <div
            className="absolute inset-0 mix-blend-overlay pointer-events-none"
            style={{
              background: `linear-gradient(${115 + tiltX * 2}deg, rgba(255,255,255,0.4) 0%, transparent 40%, rgba(255,255,255,0.2) 70%, transparent 100%)`,
            }}
          />
        </div>

        {/* Layer 2: Floating Floating Specular Particles */}
        <div
          className="absolute inset-0 pointer-events-none transition-transform duration-75 ease-out"
          style={{
            transform: `translate3d(${tiltX * 1.8}px, ${tiltY * 1.8}px, 0)`,
          }}
        >
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${theme.particleColor} opacity-75 blur-[1px]`}
              style={{
                top: `${(i * 19) % 90}%`,
                left: `${(i * 23) % 95}%`,
                transform: `scale(${0.6 + (i % 3) * 0.4})`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom HUD: Illustrator Credit & Card Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 z-30 border-t border-white/20 pt-4 text-xs font-mono">
        <div className="flex items-center gap-2 opacity-80">
          <Compass className="w-4 h-4 text-cyan-300" />
          <span>Move cursor or tilt device to explore panoramic 3D depth</span>
        </div>

        <div className="flex items-center gap-4 text-neutral-300">
          <span>Illustrator: <strong className="text-white">{card.illustrator}</strong></span>
          <span>·</span>
          <span>Set: <strong className="text-white">Genetic Apex #{card.localId}</strong></span>
        </div>
      </div>
    </div>
  );
};

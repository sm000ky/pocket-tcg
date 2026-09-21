import React from 'react';
import { X, Sparkles, Trophy, ShieldAlert, Award } from 'lucide-react';
import { pocketAudio } from '../lib/audio';

interface PackRatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PackRatesModal: React.FC<PackRatesModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border-2 border-white/20 bg-neutral-900 shadow-2xl p-6 space-y-5 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-40 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-black text-white">
                Official Drop Rates
              </h3>
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                Genetic Apex · Series A1 Distribution
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              pocketAudio.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-neutral-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rate Hierarchy Table */}
        <div className="space-y-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-neutral-300 font-bold border-b border-white/10 pb-1.5">
              <span>Slot 1 to 3</span>
              <span className="text-white">Common / Diamond 1-2</span>
            </div>
            <div className="flex items-center justify-between text-neutral-300 font-bold border-b border-white/10 pb-1.5">
              <span>Slot 4</span>
              <span className="text-cyan-300">Uncommon / Rare (75% / 25%)</span>
            </div>
            <div className="flex items-center justify-between text-amber-300 font-black">
              <span>Slot 5 (The Climax Slot)</span>
              <span>Guaranteed Rare+</span>
            </div>
          </div>

          {/* Climax Slot Probabilities */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold block">
              Slot 5 Rarity Probabilities
            </span>

            <div className="space-y-1">
              <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-500/10 border border-yellow-400/30 text-yellow-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Crown Gold Rare
                </span>
                <span>1.0%</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-cyan-400" /> 3-Star Immersive Rare
                </span>
                <span>4.0%</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-purple-500/10 border border-purple-400/30 text-purple-300 font-bold">
                <span>1-Star & 2-Star Art Rare</span>
                <span>10.0%</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-500/10 border border-rose-400/30 text-rose-300 font-bold">
                <span>4-Diamond (ex)</span>
                <span>25.0%</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/60 border border-white/10 text-neutral-300">
                <span>Uncommon / 3-Diamond</span>
                <span>60.0%</span>
              </div>
            </div>
          </div>

          {/* God Pack Bonus Info */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-cyan-500/20 border border-white/20 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-neutral-200">
              <strong className="text-amber-300">Rare God Pack (2% Chance):</strong>{' '}
              All 5 cards pulled in this pack are guaranteed to be Ultra Rares, Art Rares, Immersives, or Crown Golds!
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              pocketAudio.playClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-white text-black font-mono text-xs font-black uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

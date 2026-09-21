import { useState, useEffect } from 'react';
import type { PokemonCardData, UserCollection } from './types';
import allCardsData from './data/cards.json';
import { PackOpeningStage } from './components/PackOpeningStage';
import { BinderView } from './components/BinderView';
import { ImmersiveCardViewer } from './components/ImmersiveCardViewer';
import { pocketAudio } from './lib/audio';
import {
  Sparkles,
  Volume2,
  VolumeX,
  BookOpen,
  ArrowUp,
  Package
} from 'lucide-react';

const allCards = allCardsData as PokemonCardData[];
const STORAGE_KEY = 'pocket_tcg_collection_v1';

export function App() {
  const [activeTab, setActiveTab] = useState<'open_packs' | 'binder'>('open_packs');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [immersiveCard, setImmersiveCard] = useState<PokemonCardData | null>(null);

  // Persistent user collection
  const [collection, setCollection] = useState<UserCollection>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return {
      obtainedCardIds: {},
      totalPacksOpened: 0,
    };
  });

  // Save collection changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
    } catch {
      // Ignore storage quota
    }
  }, [collection]);

  const handleAddCards = (newCards: PokemonCardData[]) => {
    setCollection((prev) => {
      const nextCounts = { ...prev.obtainedCardIds };
      newCards.forEach((c) => {
        nextCounts[c.id] = (nextCounts[c.id] || 0) + 1;
      });
      return {
        obtainedCardIds: nextCounts,
        totalPacksOpened: prev.totalPacksOpened + 1,
      };
    });
  };

  const handleToggleMute = () => {
    const muted = pocketAudio.toggleMute();
    setIsMuted(muted);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const collectedCount = Object.keys(collection.obtainedCardIds).length;

  return (
    <div className="min-h-screen bg-[#070b14] text-neutral-100 font-sans select-none flex flex-col justify-between overflow-x-hidden">
      {/* Top Ambient Glow Field */}
      <div
        className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none opacity-20 blur-[100px] rounded-full"
        style={{
          background: 'radial-gradient(circle, #38bdf8 0%, #a855f7 40%, transparent 70%)',
        }}
      />

      {/* ===================================================================
       * STICKY COMMAND HEADER
       * =================================================================== */}
      <header className="sticky top-0 z-40 px-4 sm:px-8 py-3 border-b border-white/10 backdrop-blur-md bg-black/40 flex items-center justify-between gap-4">
        {/* Brand & Series Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-serif font-black tracking-tight leading-none text-white">
              POKÉMON TCG POCKET
            </h1>
            <span className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase block mt-0.5">
              GENETIC APEX · 286 SPECIMENS
            </span>
          </div>
        </div>

        {/* Center Navigation Dock */}
        <nav className="flex items-center p-1 rounded-xl bg-black/50 border border-white/15">
          <button
            onClick={() => {
              pocketAudio.playClick();
              setActiveTab('open_packs');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'open_packs'
                ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.6)] font-extrabold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">OPEN PACKS</span>
          </button>

          <button
            onClick={() => {
              pocketAudio.playClick();
              setActiveTab('binder');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'binder'
                ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.6)] font-extrabold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CARD BINDER</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[9px] text-white">
              {collectedCount}
            </span>
          </button>
        </nav>

        {/* Audio Mute Toggle */}
        <button
          onClick={handleToggleMute}
          className="p-2 rounded-xl border border-white/15 bg-black/40 hover:bg-white/10 text-neutral-300 transition-colors cursor-pointer"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-red-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_6px_currentColor]" />
          )}
        </button>
      </header>

      {/* ===================================================================
       * MAIN STAGE WORKSPACE
       * =================================================================== */}
      <main className="flex-1 flex flex-col items-center">
        {activeTab === 'open_packs' && (
          <PackOpeningStage
            onAddCardsToCollection={handleAddCards}
            onOpenBinder={() => setActiveTab('binder')}
            onSelectImmersiveCard={setImmersiveCard}
          />
        )}

        {activeTab === 'binder' && (
          <BinderView
            allCards={allCards}
            collection={collection}
            onSelectImmersiveCard={setImmersiveCard}
            onOpenPackStage={() => setActiveTab('open_packs')}
          />
        )}
      </main>

      {/* ===================================================================
       * IMMERSIVE PARALLAX REALM VIEWER MODAL
       * =================================================================== */}
      {immersiveCard && (
        <ImmersiveCardViewer
          card={immersiveCard}
          onClose={() => setImmersiveCard(null)}
        />
      )}

      {/* ===================================================================
       * FOOTER
       * =================================================================== */}
      <footer className="mt-16 py-8 border-t border-white/10 text-center font-mono text-xs text-neutral-400 space-y-2">
        <div className="font-bold tracking-widest text-neutral-200 uppercase">
          POKÉMON TCG POCKET · WEB EDITION
        </div>
        <div>
          Engineered with pride by <strong>sm000ky × Zero Two</strong> · 100% Synthetic Web Audio & 3D WebGL Foil
        </div>
        <div className="pt-2">
          <button
            onClick={handleScrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-white/20 hover:bg-white/10 text-neutral-300 transition-colors cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Back to Top</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;

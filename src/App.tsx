import { useState, useEffect } from 'react';
import type { PokemonCardData, UserCollection, BoosterPackId } from './types';
import allCardsData from './data/cards.json';
import { PackOpeningStage } from './components/PackOpeningStage';
import { BinderView } from './components/BinderView';
import { ImmersiveCardViewer } from './components/ImmersiveCardViewer';
import { HoloCard3D } from './components/HoloCard3D';
import { PackRatesModal } from './components/PackRatesModal';
import { BOOSTER_PACKS } from './lib/gacha';
import { pocketAudio } from './lib/audio';
import {
  Sparkles,
  Volume2,
  VolumeX,
  BookOpen,
  ArrowUp,
  Package,
  Award,
  Trophy,
  Flame,
  Info
} from 'lucide-react';

const allCards = allCardsData as PokemonCardData[];
const STORAGE_KEY = 'pocket_tcg_collection_v1';

export function App() {
  const [activeTab, setActiveTab] = useState<'open_packs' | 'binder'>('open_packs');
  const [selectedPackId, setSelectedPackId] = useState<BoosterPackId>('charizard');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [immersiveCard, setImmersiveCard] = useState<PokemonCardData | null>(null);
  const [isRatesModalOpen, setIsRatesModalOpen] = useState<boolean>(false);

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
  const totalCardsCount = allCards.length;
  const collectionPercentage = ((collectedCount / totalCardsCount) * 100).toFixed(1);

  // Dynamic ambient glow color based on active pack
  const activePack = BOOSTER_PACKS[selectedPackId];

  // Find Holy Grail Showcase Cards (Charizard Crown, Mewtwo Immersive, Pikachu Immersive)
  const crownCharizard = allCards.find((c) => c.id === 'A1-284');
  const immersiveMewtwo = allCards.find((c) => c.id === 'A1-282');
  const immersivePikachu = allCards.find((c) => c.id === 'A1-281');

  return (
    <div className="min-h-screen bg-[#070b14] text-neutral-100 font-sans select-none flex flex-col justify-between overflow-x-hidden">
      {/* Dynamic Ambient Background Glow Field */}
      <div
        className="fixed top-[-25%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] pointer-events-none opacity-25 blur-[120px] rounded-full transition-colors duration-700"
        style={{
          background: `radial-gradient(circle, ${activePack.accentColor} 0%, #3b82f6 40%, transparent 70%)`,
        }}
      />

      {/* ===================================================================
       * STICKY COMMAND HEADER
       * =================================================================== */}
      <header className="sticky top-0 z-40 px-4 sm:px-8 py-3 border-b border-white/10 backdrop-blur-md bg-black/50 flex items-center justify-between gap-4">
        {/* Brand & Series Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-500"
            style={{
              backgroundColor: activePack.accentColor,
              boxShadow: `0 0 15px ${activePack.glowColor}`,
            }}
          >
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
        <nav className="flex items-center p-1 rounded-xl bg-black/60 border border-white/15 shadow-inner">
          <button
            onClick={() => {
              pocketAudio.playClick();
              setActiveTab('open_packs');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'open_packs'
                ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.6)] font-extrabold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">BOOSTER RACK</span>
          </button>

          <button
            onClick={() => {
              pocketAudio.playClick();
              setActiveTab('binder');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'binder'
                ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.6)] font-extrabold'
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

        {/* Right Tools: Rates Info & Audio Mute Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              pocketAudio.playClick();
              setIsRatesModalOpen(true);
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 bg-black/40 hover:bg-white/10 text-neutral-300 text-xs font-mono transition-colors cursor-pointer"
            title="Official Drop Rates"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Rates</span>
          </button>

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
        </div>
      </header>

      {/* ===================================================================
       * MAIN STAGE WORKSPACE
       * =================================================================== */}
      <main className="flex-1 flex flex-col items-center w-full">
        {activeTab === 'open_packs' && (
          <div className="w-full flex flex-col items-center space-y-12">
            {/* Booster Opening Stage (Carousel -> 3D Rip -> Stack Reveal -> Summary) */}
            <PackOpeningStage
              onAddCardsToCollection={handleAddCards}
              onOpenBinder={() => setActiveTab('binder')}
              onSelectImmersiveCard={setImmersiveCard}
              allCards={allCards}
              onOpenRatesModal={() => setIsRatesModalOpen(true)}
              selectedPackId={selectedPackId}
              onSelectPackId={setSelectedPackId}
            />

            {/* Live Collection Progress & Stamina HUD */}
            <section className="w-full max-w-5xl px-4">
              <div className="p-6 rounded-2xl border-2 border-white/15 bg-neutral-900/60 backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px] font-mono tracking-widest text-neutral-300 uppercase font-bold">
                      GENETIC APEX REGISTRY PROGRESS
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-mono font-black text-white">
                      {collectedCount}
                    </span>
                    <span className="text-xs font-mono text-neutral-400">
                      / {totalCardsCount} Specimens Documented ({collectionPercentage}%)
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full md:w-80 h-2 bg-neutral-800 rounded-full overflow-hidden border border-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full transition-all duration-500"
                      style={{ width: `${collectionPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Quick Metrics */}
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-start md:justify-end">
                  <div className="px-4 py-2 rounded-xl bg-black/50 border border-white/10 text-center">
                    <span className="text-[10px] font-mono text-neutral-400 block">
                      PACKS UNSEALED
                    </span>
                    <span className="text-lg font-mono font-black text-amber-300">
                      {collection.totalPacksOpened}
                    </span>
                  </div>

                  <div className="px-4 py-2 rounded-xl bg-black/50 border border-white/10 text-center">
                    <span className="text-[10px] font-mono text-neutral-400 block">
                      BOOSTER STAMINA
                    </span>
                    <span className="text-xs font-mono font-black text-emerald-400 flex items-center justify-center gap-1 mt-1">
                      <Flame className="w-3.5 h-3.5" /> READY
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      pocketAudio.playClick();
                      setActiveTab('binder');
                    }}
                    className="px-5 py-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    View Binder Album →
                  </button>
                </div>
              </div>
            </section>

            {/* Interactive Holy Grails 3D Showcase */}
            <section className="w-full max-w-5xl px-4 space-y-6">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>CROWNING JEWELS OF SET A1</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-tight">
                  Featured 3D Holy Grails
                </h3>
                <p className="text-xs font-mono text-neutral-400 max-w-md mx-auto">
                  Tilt, inspect, and experience the holographic depth of the rarest specimens in Genetic Apex.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
                {crownCharizard && (
                  <div className="flex flex-col items-center space-y-3">
                    <HoloCard3D
                      card={crownCharizard}
                      isFlipped={true}
                      size="md"
                      interactive={true}
                    />
                    <div className="text-center font-mono">
                      <span className="text-xs font-black text-yellow-400 block">
                        👑 Charizard ex #284
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        Crown Gold Reflective Foil
                      </span>
                    </div>
                  </div>
                )}

                {immersiveMewtwo && (
                  <div className="flex flex-col items-center space-y-3">
                    <HoloCard3D
                      card={immersiveMewtwo}
                      isFlipped={true}
                      onDiveIn={() => setImmersiveCard(immersiveMewtwo)}
                      size="md"
                      interactive={true}
                    />
                    <div className="text-center font-mono">
                      <span className="text-xs font-black text-cyan-300 block">
                        ★★★ Mewtwo ex #282
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        3-Star Immersive Parallax
                      </span>
                    </div>
                  </div>
                )}

                {immersivePikachu && (
                  <div className="flex flex-col items-center space-y-3">
                    <HoloCard3D
                      card={immersivePikachu}
                      isFlipped={true}
                      onDiveIn={() => setImmersiveCard(immersivePikachu)}
                      size="md"
                      interactive={true}
                    />
                    <div className="text-center font-mono">
                      <span className="text-xs font-black text-amber-300 block">
                        ★★★ Pikachu ex #281
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        3-Star Immersive Parallax
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
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
       * OFFICIAL PACK RATES MODAL
       * =================================================================== */}
      <PackRatesModal
        isOpen={isRatesModalOpen}
        onClose={() => setIsRatesModalOpen(false)}
      />

      {/* ===================================================================
       * FOOTER
       * =================================================================== */}
      <footer className="mt-20 py-8 border-t border-white/10 text-center font-mono text-xs text-neutral-400 space-y-2">
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

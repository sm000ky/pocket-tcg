import React, { useState, useMemo } from 'react';
import type { PokemonCardData, UserCollection } from '../types';
import { HoloCard3D } from './HoloCard3D';
import { pocketAudio } from '../lib/audio';
import {
  Search,
  Filter,
  BookOpen,
  X,
  Lock
} from 'lucide-react';

interface BinderViewProps {
  allCards: PokemonCardData[];
  collection: UserCollection;
  onSelectImmersiveCard: (card: PokemonCardData) => void;
  onOpenPackStage: () => void;
}

export const BinderView: React.FC<BinderViewProps> = ({
  allCards,
  collection,
  onSelectImmersiveCard,
  onOpenPackStage,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPackFilter, setSelectedPackFilter] = useState<string>('All');
  const [selectedRarityFilter, setSelectedRarityFilter] = useState<string>('All');
  const [selectedCardForModal, setSelectedCardForModal] = useState<PokemonCardData | null>(null);

  // Calculate Collection Statistics
  const collectedCount = Object.keys(collection.obtainedCardIds).length;
  const totalCardsCount = allCards.length;
  const completionPercentage = ((collectedCount / totalCardsCount) * 100).toFixed(1);

  // Filter Cards
  const filteredCards = useMemo(() => {
    return allCards.filter((card) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        card.name.toLowerCase().includes(q) ||
        card.localId.includes(q) ||
        card.illustrator.toLowerCase().includes(q);

      const matchesPack =
        selectedPackFilter === 'All' || card.boosters.includes(selectedPackFilter);

      let matchesRarity = true;
      if (selectedRarityFilter === 'Common') {
        matchesRarity = card.rarityRank <= 2;
      } else if (selectedRarityFilter === 'Rare') {
        matchesRarity = card.rarityRank === 3 || card.rarityRank === 4;
      } else if (selectedRarityFilter === 'Art Rare') {
        matchesRarity = card.rarityRank === 5 || card.rarityRank === 6;
      } else if (selectedRarityFilter === 'Immersive') {
        matchesRarity = card.isImmersive;
      } else if (selectedRarityFilter === 'Crown') {
        matchesRarity = card.isCrown;
      }

      return matchesSearch && matchesPack && matchesRarity;
    });
  }, [allCards, searchQuery, selectedPackFilter, selectedRarityFilter]);

  const handleCardClick = (card: PokemonCardData) => {
    pocketAudio.playClick();
    setSelectedCardForModal(card);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 space-y-6 animate-in fade-in">
      {/* Binder Header HUD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border-2 border-white/20 bg-neutral-900/80 backdrop-blur-md shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span className="text-[11px] font-mono tracking-widest text-amber-300 uppercase font-bold">
              GENETIC APEX BINDER ARCHIVE
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
            Specimen Collection Vault
          </h2>
          <p className="text-xs font-mono text-neutral-400">
            Catalogued: <strong>{collectedCount}</strong> / {totalCardsCount} cards · {completionPercentage}% Completed · Packs Opened: {collection.totalPacksOpened}
          </p>
        </div>

        {/* Progress Bar & Quick Action */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-48 bg-neutral-800 h-3 rounded-full overflow-hidden border border-white/20">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.7)]"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <button
            onClick={onOpenPackStage}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(245,158,11,0.5)] cursor-pointer"
          >
            + Open New Pack
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-white/20 bg-neutral-900/60 backdrop-blur-md space-y-3 font-mono text-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full flex-1 flex items-center p-2.5 rounded-lg border border-white/20 bg-black/40">
            <Search className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Pokémon name, local ID (#280), or illustrator..."
              className="w-full bg-transparent border-none outline-none text-white text-xs placeholder:text-neutral-500 font-mono"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Pack Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[10px] text-neutral-400 uppercase mr-1">Pack:</span>
            {['All', 'Charizard', 'Mewtwo', 'Pikachu'].map((packName) => (
              <button
                key={packName}
                onClick={() => setSelectedPackFilter(packName)}
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                  selectedPackFilter === packName
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-black/20 text-neutral-300 border-white/20 hover:bg-white/10'
                }`}
              >
                {packName}
              </button>
            ))}
          </div>
        </div>

        {/* Rarity Tier Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          <span className="text-[10px] text-neutral-400 uppercase mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Tier:
          </span>
          {['All', 'Common', 'Rare', 'Art Rare', 'Immersive', 'Crown'].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedRarityFilter(tier)}
              className={`px-3 py-1 rounded-full border transition-all ${
                selectedRarityFilter === tier
                  ? 'bg-amber-400 text-black border-amber-400 font-bold shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                  : 'bg-black/20 text-neutral-300 border-white/20 hover:bg-white/10'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* 286 Cards Grid Album */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 justify-items-center">
        {filteredCards.map((card) => {
          const isCollected = Boolean(collection.obtainedCardIds[card.id]);
          const copiesCount = collection.obtainedCardIds[card.id] || 0;

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`group cursor-pointer relative flex flex-col items-center p-2 rounded-xl border transition-all duration-200 w-full max-w-[190px] ${
                isCollected
                  ? 'border-white/25 bg-neutral-900/60 hover:border-amber-400 hover:scale-105 shadow-lg'
                  : 'border-white/10 bg-neutral-950/40 opacity-40 hover:opacity-60'
              }`}
            >
              {/* Card Artwork Aspect Box */}
              <div className="relative aspect-[7/10] w-full rounded-lg overflow-hidden border border-white/10 bg-black flex items-center justify-center">
                <img
                  src={card.imageHigh}
                  alt={card.name}
                  loading="lazy"
                  className={`w-full h-full object-cover transition-all ${
                    !isCollected ? 'grayscale contrast-150 brightness-50 blur-[0.5px]' : ''
                  }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = card.imageLow;
                  }}
                />

                {/* Copies Badge */}
                {isCollected && copiesCount > 1 && (
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-amber-500 text-black font-mono font-bold text-[9px] shadow-md">
                    {copiesCount}x
                  </div>
                )}

                {/* Lock icon for uncollected */}
                {!isCollected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Lock className="w-6 h-6 text-white/60" />
                  </div>
                )}
              </div>

              {/* Card Title & Rarity Footer */}
              <div className="w-full mt-2 flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold text-white truncate max-w-[100px]">{card.name}</span>
                <span className="text-[10px] text-neutral-400">#{card.localId}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full 3D Card Inspector Modal */}
      {selectedCardForModal && (
        <div
          onClick={() => setSelectedCardForModal(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col items-center p-6 rounded-3xl bg-neutral-900 border-2 border-white/30 shadow-[0_0_50px_rgba(0,0,0,0.9)] max-w-sm sm:max-w-md w-full"
          >
            <button
              onClick={() => setSelectedCardForModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-white hover:text-black transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="py-4">
              <HoloCard3D
                card={selectedCardForModal}
                isFlipped={true}
                onDiveIn={() => {
                  const target = selectedCardForModal;
                  setSelectedCardForModal(null);
                  onSelectImmersiveCard(target);
                }}
                size="lg"
              />
            </div>

            {/* Detailed Specimen Metadata */}
            <div className="w-full mt-2 font-mono text-xs border-t border-white/20 pt-4 space-y-2 text-neutral-300">
              <div className="flex justify-between items-center text-sm font-bold text-white">
                <span>{selectedCardForModal.name}</span>
                <span className="text-amber-400">{selectedCardForModal.rarity}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Stage: {selectedCardForModal.stage}</span>
                <span>HP: {selectedCardForModal.hp || '—'}</span>
                <span>Type: {selectedCardForModal.types.join(', ')}</span>
              </div>

              {selectedCardForModal.attacks.length > 0 && (
                <div className="p-2 rounded bg-black/40 border border-white/10 space-y-1">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block">Attacks</span>
                  {selectedCardForModal.attacks.map((atk, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span>{atk.name}</span>
                      <strong className="text-amber-300">{atk.damage ? `${atk.damage} DMG` : '—'}</strong>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between text-[10px] text-neutral-400 pt-1">
                <span>Illustrator: {selectedCardForModal.illustrator}</span>
                <span>#{selectedCardForModal.localId} / 286</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

# POKÉMON TCG POCKET // 3D Web Edition

> A faithful, ultra-performant 3D web reproduction of Pokémon TCG Pocket (Genetic Apex / A1 Series) with interactive 3D booster pack tearing, gyroscopic holographic foil shaders, 3-Star Immersive Card realm exploration, and tactile collection binder.

**Live Application**: [https://pocket-tcg.vercel.app](https://pocket-tcg.vercel.app)  
**Authors**: `sm000ky × Zero Two`

---

## Key Highlights

### 1. 3D Metallic Booster Pack Tearing (Gesture-Driven)
* Authentic 3D metallic foil booster pack models for **Charizard**, **Mewtwo**, and **Pikachu** Genetic Apex packs.
* Swipe across the top perforated seal or click to tear the foil pouch open.
* Realistic metallic foil tearing sound synthesis powered by 100% procedural Web Audio API.

### 2. Holographic Prismatic & Crown Gold Foil Shaders
* GPU-accelerated CSS 3D perspectives (`rotateX`, `rotateY`, `perspective(1000px)`) that dynamically track cursor position, touch movement, or the physical device gyroscope (`DeviceOrientationEvent`).
* **Prismatic Rainbow Sheen**: Dynamic diagonal color-dodge specular interference for Holo and ex cards.
* **Crown Gold Foil**: Metallic reflective gold gradients for Crown Rare gold specimens (Charizard ex #284, Pikachu ex #285, Mewtwo ex #286).
* **Double-Sided 3D Card Flip**: Suspenseful edge aura glow indicating rare pulls before cards are flipped.

### 3. "DIVE IN" Immersive Card Parallax Experience
* Tap **DIVE IN** on 3-Star Immersive Cards (Charizard ex #280, Pikachu ex #281, Mewtwo ex #282) to enter an expanded full-screen 3D panoramic realm.
* Tilt your phone or mouse to pan across multi-layered depth artwork with floating elemental particles (embers, lightning arcs, psychic orbs).

### 4. 286 Official Genetic Apex Cards & Tactile Binder
* Complete official dataset of 286 cards from Set A1 with high-resolution artwork from TCGdex.
* Persistent user collection stored locally in browser storage.
* Filter by Booster Pack, Rarity Tier (Common, Rare, Art Rare, Immersive, Crown), or Search by Pokémon name/ID.

### 5. Zero External Audio Bloat (100% Web Audio API)
* No heavy audio files loaded over network.
* Procedural white-noise bandpass sweeps for foil tearing, filtered whooshes for card sliding, acoustic snaps for card flips, and crystalline arpeggio chords for rare card reveals.

---

## Technical Stack
* **Framework**: React 19 + TypeScript + Vite
* **Styling**: Tailwind CSS v4 (Mobile-First 60–120 FPS for Poco F7 Pro)
* **Audio**: Procedural Web Audio API
* **Deployment**: Vercel

# Pokédex Hub

A modern, full-featured Pokédex web application built with **Nuxt 3** and powered by **PokéAPI**. Browse all 1,025+ base Pokémon alongside their variants (Mega, Gigantamax, regional forms), filter by type or generation, and dive deep into stats, moves, evolution chains, and encounter locations.

---

## Features

- **Complete Pokédex** — all 1,025 base Pokémon plus variants (Mega, Gigantamax, Alolan, Galarian, Hisuian, Paldean, Primal, and more), grouped alongside their base forms
- **Search** — instant name or ID search across the full list before details are even loaded
- **Type filter** — filter by any of the 18 Pokémon types with a searchable dropdown
- **Generation filter** — browse by generation (Gen I–IX), with variants scoped to their generation
- **Pokémon detail modal** with five tabs:
  - **Info** — height, weight, base XP, catch rate, flavor text, abilities, type effectiveness chart (resistances & weaknesses)
  - **Stats** — animated base stat bars with total
  - **Moves** — full move table with level learned, move name, type badge, damage category, power, and accuracy; sorted by level then alphabetically
  - **Evolution** — visual evolution chain with trigger conditions
  - **Location** — encounter locations by game version
- **Pokémon cry** — plays the official cry audio for each Pokémon
- **Custom Pokéball loader** — animated bouncing Pokéball shown during initial load and all data fetches
- **Pagination** — 49 Pokémon per page with page number navigation
- **Responsive design** — works on mobile, tablet, and desktop
- **Server-side rendering** — powered by Nuxt 3 SSR

---

## Tech Stack

| Layer      | Technology                                           |
| ---------- | ---------------------------------------------------- |
| Framework  | [Nuxt 3](https://nuxt.com)                           |
| UI Library | [Vue 3](https://vuejs.org) (Composition API)         |
| Language   | TypeScript                                           |
| Styling    | Vanilla CSS (custom design system via CSS variables) |
| Icons      | [@lucide/vue](https://lucide.dev)                    |
| Fonts      | Outfit + DM Sans (Google Fonts)                      |
| Data       | [PokéAPI](https://pokeapi.co)                        |

---

## Project Structure

```
app/
├── assets/
│   ├── css/
│   │   └── main.css          # Global styles and design tokens
│   └── images/
│       └── logo.png
├── components/
│   ├── PokeballLoader.vue    # Animated Pokéball loading screen
│   ├── PokemonCard.vue       # Grid card (base + variant display)
│   ├── PokemonModal.vue      # Detail modal with 5 tabs
│   └── StatBar.vue           # Animated stat bar
├── composables/
│   ├── usePokemonDetail.ts   # Fetches detail, species, moves, evolution, encounters
│   └── usePokemonList.ts     # Manages list, filters, pagination, batch fetching
├── pages/
│   └── index.vue             # Main page
├── server/
│   └── api/
│       ├── pokemon-all.get.ts    # Returns grouped base + variant name list
│       ├── pokemon-batch.get.ts  # Fetches full summaries for a batch of IDs
│       └── pokemon.get.ts        # Single Pokémon detail endpoint
├── types/
│   └── pokemon.ts            # All TypeScript interfaces and shared helpers
└── public/
    └── favicon.ico
```

---

## Getting Started

### Prerequisites

- Node.js **18+**
- npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd pokedex-app

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Static Generation

```bash
npm run generate
```

---

## How It Works

### Data Loading Strategy

The app uses a two-phase loading approach to keep the UI fast:

1. **Name list** (`/api/pokemon-all`) — a single lightweight call that fetches all Pokémon names and IDs (base + variants), grouped so variants appear immediately after their base. This powers search and filtering before any card details are loaded.

2. **Batch detail fetch** (`/api/pokemon-batch`) — as each page is displayed, the visible IDs are batched (up to 49 at a time) and their sprites, types, and variant metadata are fetched in parallel. Already-loaded Pokémon are cached in memory so pagination is instant on revisit.

### Variant Grouping

Variants (IDs 10001+) are resolved back to their base species via name parsing (e.g. `blastoise-mega` → `blastoise` → ID 9). The server groups them so they appear immediately after their base Pokémon in the list. Their cards show the base dex number and a coloured variant badge (purple for Mega, red for Gigantamax, green for regional forms, etc.).

### Move Enrichment

Move data is loaded in the background after a Pokémon detail modal opens. Each move is fetched from `/move/:name` in batches of 20 to retrieve type, power, accuracy, and damage class. Moves are sorted with level-up moves first (ascending level), followed by TM, Egg, and Tutor moves alphabetically.

---

## API Reference

All endpoints are Nuxt server routes that proxy PokéAPI to avoid CORS issues and keep API logic server-side.

| Endpoint                                     | Method | Description                                       |
| -------------------------------------------- | ------ | ------------------------------------------------- |
| `/api/pokemon-all`                           | GET    | Full grouped name + ID list (base + variants)     |
| `/api/pokemon-batch?ids=1,2,3&baseIds=0,0,0` | GET    | Batch summary fetch (sprite, types, variant info) |
| `/api/pokemon?id=1`                          | GET    | Single Pokémon full detail                        |

---

## Acknowledgements

- Pokémon data provided by [PokéAPI](https://pokeapi.co) — free and open Pokémon data
- Sprites from the [PokeAPI sprites repository](https://github.com/PokeAPI/sprites)
- Pokémon and all related names are trademarks of Nintendo / The Pokémon Company

---

_Not affiliated with Nintendo or The Pokémon Company._

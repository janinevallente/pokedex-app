export interface PokemonSummary {
  id: number
  name: string
  types: string[]
  sprite: string
  isVariant?: boolean
  variantLabel?: string  // e.g. "Mega", "Gigantamax", "Alolan", etc.
  baseId?: number        // national dex ID of the base form (variants only)
}

// const VARIANT_KEYWORDS = [
//   'mega-x', 'mega-y', 'mega', 'gmax', 'alola', 'galar',
//   'hisui', 'paldea', 'primal', 'origin', 'therian', 'eternamax',
//   'black', 'white', 'sky',
// ]

const VARIANT_KEYWORDS = [
  'mega-x', 
  'mega-y', 
  'mega', 
  'gmax', 
  'alola', 
  'galar',
  'hisui', 
  'paldea', 
  'primal', 
  'origin', 
  'therian', 
  'eternamax',
  'black', 
  'white', 
  'sky',
  'heat',
  "wash",
  "frost",
  "fan",
  "mow",
  // "plant",
  // "sandy",
  // "trash",
  // "normal",
  // "attack",
  // "defense",
  // "speed",
  // "baile",
  // "pom-pom",
  // "pau",
  // "sensu",
  // "amped",
  // "low-key"
]

/**
 * Extracts the base species name from a variant name.
 * e.g. "blastoise-mega"  -> "blastoise"
 *      "mewtwo-mega-x"   -> "mewtwo"
 *      "raichu-alola"    -> "raichu"
 */
export function extractBaseName(name: string): string {
  const lower = name.toLowerCase()
  for (const kw of VARIANT_KEYWORDS) {
    const idx = lower.indexOf(`-${kw}`)
    if (idx !== -1) return lower.slice(0, idx)
  }
  return lower
}

/** Extracts a human-readable variant label from a Pokémon name */
export function getVariantLabel(name: string): string | undefined {
  const lower = name.toLowerCase()
  if (lower.includes('mega-x')) return 'Mega X'
  if (lower.includes('mega-y')) return 'Mega Y'
  if (lower.includes('mega')) return 'Mega'
  if (lower.includes('gmax')) return 'Gigantamax'
  if (lower.includes('alola') || lower.includes('alolan')) return 'Alolan'
  if (lower.includes('galar') || lower.includes('galarian')) return 'Galarian'
  if (lower.includes('hisui') || lower.includes('hisuian')) return 'Hisuian'
  if (lower.includes('paldea') || lower.includes('paldean')) return 'Paldean'
  if (lower.includes('primal')) return 'Primal'
  if (lower.includes('origin')) return 'Origin'
  if (lower.includes('therian')) return 'Therian'
  if (lower.includes('black')) return 'Black'
  if (lower.includes('white')) return 'White'
  if (lower.includes('sky')) return 'Sky'
  if (lower.includes('eternamax')) return 'Eternamax'
  return undefined
}

export interface PokemonDetail {
  id: number
  name: string
  height: number
  weight: number
  base_experience: number
  types: { type: { name: string } }[]
  stats: { base_stat: number; stat: { name: string } }[]
  abilities: { ability: { name: string }; is_hidden: boolean }[]
  sprites: {
    front_default: string
    back_default: string
    other: {
      'official-artwork': { front_default: string }
      showdown?: { front_default: string }
    }
  }
  moves: { move: { name: string } }[]
  species: { url: string }
  cries?: {
    latest: string
    legacy: string
  }
}

export interface PokemonSpecies {
  flavor_text_entries: {
    flavor_text: string
    language: { name: string }
    version: { name: string }
  }[]
  genera: { genus: string; language: { name: string } }[]
  evolution_chain: { url: string }
  capture_rate: number
  base_happiness: number
  is_legendary: boolean
  is_mythical: boolean
}

// Evolution chain types from PokeAPI
export interface EvolutionDetail {
  min_level: number | null
  item: { name: string } | null
  trigger: { name: string }
  happiness: number | null
  min_beauty: number | null
  min_affection: number | null
  held_item: { name: string } | null
  known_move: { name: string } | null
  time_of_day: string
  location: { name: string } | null
  trade_species: { name: string } | null
  needs_overworld_rain: boolean
  turn_upside_down: boolean
}

export interface ChainLink {
  species: { name: string; url: string }
  evolution_details: EvolutionDetail[]
  evolves_to: ChainLink[]
}

export interface EvolutionChain {
  chain: ChainLink
}

// Flattened evolution step for display
export interface EvolutionStep {
  name: string
  id: number
  sprite: string
  trigger: string       // human-readable trigger e.g. "Level 16", "Use Fire Stone"
}

export interface PokemonEncounter {
  location_area: {
    name: string
    url: string
  }
  version_details: {
    version: {
      name: string
      url: string
    }
    max_chance: number
    encounter_details: {
      method: {
        name: string
      }
      chance: number
      condition_values: any[]
      max_level: number
      min_level: number
    }[]
  }[]
}

export interface EncounterArea {
  name: string
  games: {
    game: string
    methods: {
      method: string
      chance: number
      levels: string
    }[]
  }[]
}

export const STAT_COLORS: Record<string, string> = {
  hp: '#ff5555',
  attack: '#f5a623',
  defense: '#4a90d9',
  'special-attack': '#bd4ae4',
  'special-defense': '#56c0a9',
  speed: '#f8d030',
}

export const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SP.ATK',
  'special-defense': 'SP.DEF',
  speed: 'SPD',
}

export const ALL_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
]

export const TYPE_HEX: Record<string, string> = {
  normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
  grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
  ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
  rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
  steel: '#B8B8D0', fairy: '#F0B6BC',
}

export const GENERATIONS = [
  { num: 1, label: 'Gen I', sub: 'Kanto', offset: 0, limit: 151 },
  { num: 2, label: 'Gen II', sub: 'Johto', offset: 151, limit: 100 },
  { num: 3, label: 'Gen III', sub: 'Hoenn', offset: 251, limit: 135 },
  { num: 4, label: 'Gen IV', sub: 'Sinnoh', offset: 386, limit: 107 },
  { num: 5, label: 'Gen V', sub: 'Unova', offset: 493, limit: 156 },
  { num: 6, label: 'Gen VI', sub: 'Kalos', offset: 649, limit: 72 },
  { num: 7, label: 'Gen VII', sub: 'Alola', offset: 721, limit: 88 },
  { num: 8, label: 'Gen VIII', sub: 'Galar', offset: 809, limit: 96 },
  { num: 9, label: 'Gen IX', sub: 'Paldea', offset: 905, limit: 120 },
]

// Full type effectiveness chart
export const TYPE_CHART: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, ice: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, fighting: 0, poison: 0.5, bug: 0.5, ghost: 2, dark: 0.5, psychic: 2 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: {
    fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2,
    normal: 0.5, grass: 0.5, psychic: 0.5, bug: 0.5, dragon: 0.5, dark: 0.5,
    fighting: 0.5, flying: 0.5, ground: 2, poison: 0
  },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
}

/**
 * Computes the effective damage multiplier for each attacking type
 * against a defender with one or two types.
 */
export function getTypeEffectiveness(defenderTypes: string[]) {
  const multipliers: Record<string, number> = {}

  for (const attackType of ALL_TYPES) {
    let mult = 1
    for (const defType of defenderTypes) {
      const chart = TYPE_CHART[attackType] || {}
      mult *= chart[defType] ?? 1
    }
    multipliers[attackType] = mult
  }

  return {
    immune: ALL_TYPES.filter(t => multipliers[t] === 0),
    quarter: ALL_TYPES.filter(t => multipliers[t] === 0.25),
    half: ALL_TYPES.filter(t => multipliers[t] === 0.5),
    double: ALL_TYPES.filter(t => multipliers[t] === 2),
    quadruple: ALL_TYPES.filter(t => multipliers[t] === 4),
  }
}

/** Human-readable evolution trigger string */
export function formatTrigger(detail: EvolutionDetail): string {
  if (!detail) return ''
  if (detail.trigger?.name === 'level-up') {
    if (detail.min_level) return `Level ${detail.min_level}`
    if (detail.happiness) return `High Friendship`
    if (detail.min_beauty) return `High Beauty`
    if (detail.known_move) return `Know ${detail.known_move.name.replace(/-/g, ' ')}`
    if (detail.location) return `Level up at ${detail.location.name.replace(/-/g, ' ')}`
    if (detail.time_of_day) return `Level up (${detail.time_of_day})`
    return 'Level up'
  }
  if (detail.trigger?.name === 'use-item') {
    return `Use ${(detail.item?.name || '').replace(/-/g, ' ')}`
  }
  if (detail.trigger?.name === 'trade') {
    if (detail.held_item) return `Trade holding ${detail.held_item.name.replace(/-/g, ' ')}`
    if (detail.trade_species) return `Trade with ${detail.trade_species.name}`
    return 'Trade'
  }
  if (detail.trigger?.name === 'shed') return 'Shed'
  return detail.trigger?.name?.replace(/-/g, ' ') || ''
}

export function padId(id: number): string {
  return String(id).padStart(3, '0')
}

export function speciesUrlToId(url: string): number {
  const parts = url.split('/').filter(Boolean)
  return parseInt(parts[parts.length - 1])
}
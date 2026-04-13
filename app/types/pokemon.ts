export interface PokemonSummary {
  id: number
  name: string
  types: string[]
  sprite: string
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

export function padId(id: number): string {
  return String(id).padStart(3, '0')
}

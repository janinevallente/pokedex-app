import type { 
  PokemonDetail, 
  PokemonSpecies, 
  EvolutionChain, 
  EvolutionStep, 
  ChainLink,
  PokemonEncounter,
  EncounterArea 
} from '~/types/pokemon'
import { formatTrigger, speciesUrlToId } from '~/types/pokemon'

const BASE = 'https://pokeapi.co/api/v2'

/** Recursively flatten the PokeAPI evolution chain into ordered steps */
function flattenChain(link: ChainLink, steps: EvolutionStep[] = [], prevName = ''): EvolutionStep[] {
  const id = speciesUrlToId(link.species.url)
  const trigger = link.evolution_details[0] ? formatTrigger(link.evolution_details[0]) : ''

  steps.push({
    name: link.species.name,
    id,
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    trigger,
  })

  for (const next of link.evolves_to) {
    flattenChain(next, steps, link.species.name)
  }

  return steps
}

export function usePokemonDetail(pokemonId: Ref<number | null>) {
  const detail = ref<PokemonDetail | null>(null)
  const species = ref<PokemonSpecies | null>(null)
  const evolution = ref<EvolutionStep[]>([])
  const loading = ref(false)
  const cryUrl = ref<string>('')
  const encounters = ref<EncounterArea[]>([]) // Add this

  watch(pokemonId, async (id) => {
    if (!id) {
      detail.value = null
      species.value = null
      evolution.value = []
      cryUrl.value = ''
      encounters.value = []
      return
    }
    loading.value = true
    detail.value = null
    species.value = null
    evolution.value = []
    cryUrl.value = ''
    encounters.value = []

    try {
      const [d, s] = await Promise.all([
        $fetch<PokemonDetail>(`${BASE}/pokemon/${id}`),
        $fetch<PokemonSpecies>(`${BASE}/pokemon-species/${id}`),
      ])
      detail.value = d
      species.value = s

      if (d.cries?.latest) {
        cryUrl.value = d.cries.latest
      } else if (d.cries?.legacy) {
        cryUrl.value = d.cries.legacy
      }

      // Fetch encounter data
      try {
        const encounterData = await $fetch<PokemonEncounter[]>(`${BASE}/pokemon/${id}/encounters`)
        encounters.value = processEncounters(encounterData)
      } catch (e) {
        console.error('Failed to fetch encounters:', e)
        encounters.value = []
      }

      // Fetch evolution chain
      if (s.evolution_chain?.url) {
        const chain = await $fetch<EvolutionChain>(s.evolution_chain.url)
        evolution.value = flattenChain(chain.chain)
      }
    } catch {
      // silent fail
    } finally {
      loading.value = false
    }
  })

  return { detail, species, evolution, loading, cryUrl, encounters }
}

// Helper function to process encounters
function processEncounters(encounterData: PokemonEncounter[]): EncounterArea[] {
  const locationMap = new Map<string, Map<string, EncounterArea['games'][0]['methods']>>()
  
  for (const location of encounterData) {
    const locationName = location.location_area.name.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())
    
    for (const versionDetail of location.version_details) {
      const gameName = versionDetail.version.name.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())
      
      // Get methods for this location and game
      const methods = versionDetail.encounter_details.map(detail => ({
        method: detail.method.name.replace(/-/g, ' '),
        chance: detail.chance,
        levels: `${detail.min_level}-${detail.max_level}`
      }))
      
      if (!locationMap.has(locationName)) {
        locationMap.set(locationName, new Map())
      }
      
      const gameMap = locationMap.get(locationName)!
      if (!gameMap.has(gameName)) {
        gameMap.set(gameName, [])
      }
      
      gameMap.get(gameName)!.push(...methods)
    }
  }
  
  // Convert to array format
  const result: EncounterArea[] = []
  for (const [locationName, gameMap] of locationMap) {
    const games: EncounterArea['games'] = []
    for (const [gameName, methods] of gameMap) {
      // Deduplicate methods
      const uniqueMethods = methods.filter((method, index, self) => 
        index === self.findIndex(m => m.method === method.method && m.levels === method.levels)
      )
      games.push({ game: gameName, methods: uniqueMethods })
    }
    result.push({ name: locationName, games })
  }
  
  return result
}
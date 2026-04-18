import type {
  PokemonDetail,
  PokemonSpecies,
  EvolutionChain,
  EvolutionStep,
  ChainLink,
  PokemonEncounter,
  EncounterArea,
  MoveEntry,
  MoveDetail,
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

/**
 * For each raw move entry, pick the best learn info:
 * - If any version group has 'level-up', take the one with the highest level
 * - Otherwise fall back to whatever method is available
 */
function pickLearnInfo(vgd: PokemonDetail['moves'][0]['version_group_details']) {
  const levelUp = vgd.filter(d => d.move_learn_method.name === 'level-up')
  if (levelUp.length > 0) {
    const best = levelUp.reduce((a, b) =>
      a.level_learned_at >= b.level_learned_at ? a : b
    )
    return { levelLearnedAt: best.level_learned_at, learnMethod: 'level-up' }
  }
  const latest = vgd[vgd.length - 1]
  return { levelLearnedAt: 0, learnMethod: latest?.move_learn_method.name ?? 'unknown' }
}

/**
 * Fetch move details in parallel batches, then merge with raw learn info.
 */
async function enrichMoves(rawMoves: PokemonDetail['moves']): Promise<MoveEntry[]> {
  const BATCH = 20
  const results: MoveEntry[] = []

  for (let i = 0; i < rawMoves.length; i += BATCH) {
    const chunk = rawMoves.slice(i, i + BATCH)
    const details = await Promise.all(
      chunk.map(m =>
        $fetch<MoveDetail>(`${BASE}/move/${m.move.name}`).catch(() => null)
      )
    )
    for (let j = 0; j < chunk.length; j++) {
      const raw = chunk[j]
      const d = details[j]
      const { levelLearnedAt, learnMethod } = pickLearnInfo(raw.version_group_details)
      results.push({
        name: raw.move.name,
        type: d?.type.name ?? 'normal',
        levelLearnedAt,
        learnMethod,
        power: d?.power ?? null,
        accuracy: d?.accuracy ?? null,
        damageClass: d?.damage_class.name ?? 'status',
      })
    }
  }

  // Sort: level-up moves first (ascending level), then others alphabetically
  results.sort((a, b) => {
    if (a.learnMethod === 'level-up' && b.learnMethod !== 'level-up') return -1
    if (a.learnMethod !== 'level-up' && b.learnMethod === 'level-up') return 1
    if (a.learnMethod === 'level-up' && b.learnMethod === 'level-up') {
      return a.levelLearnedAt - b.levelLearnedAt
    }
    return a.name.localeCompare(b.name)
  })

  return results
}

export function usePokemonDetail(pokemonId: Ref<number | null>) {
  const detail = ref<PokemonDetail | null>(null)
  const species = ref<PokemonSpecies | null>(null)
  const evolution = ref<EvolutionStep[]>([])
  const moves = ref<MoveEntry[]>([])
  const movesLoading = ref(false)
  const loading = ref(false)
  const cryUrl = ref<string>('')
  const encounters = ref<EncounterArea[]>([])

  watch(pokemonId, async (id) => {
    if (!id) {
      detail.value = null
      species.value = null
      evolution.value = []
      moves.value = []
      cryUrl.value = ''
      encounters.value = []
      return
    }

    loading.value = true
    detail.value = null
    species.value = null
    evolution.value = []
    moves.value = []
    cryUrl.value = ''
    encounters.value = []

    // ── Fetch Pokémon detail ──
    let d: PokemonDetail | null = null
    try {
      d = await $fetch<PokemonDetail>(`${BASE}/pokemon/${id}`)
      detail.value = d

      if (d.cries?.latest) cryUrl.value = d.cries.latest
      else if (d.cries?.legacy) cryUrl.value = d.cries.legacy
    } catch (e) {
      console.error('Failed to fetch pokemon detail:', e)
    }

    // ── Fetch species + evolution ──
    try {
      const s = await $fetch<PokemonSpecies>(`${BASE}/pokemon-species/${id}`)
      species.value = s

      if (s.evolution_chain?.url) {
        const chain = await $fetch<EvolutionChain>(s.evolution_chain.url)
        evolution.value = flattenChain(chain.chain)
      }
    } catch (e) {
      console.error('Failed to fetch species data:', e)
      species.value = null
      evolution.value = []
    }

    // ── Fetch encounter data ──
    try {
      const encounterData = await $fetch<PokemonEncounter[]>(`${BASE}/pokemon/${id}/encounters`)
      encounters.value = processEncounters(encounterData)
    } catch (e) {
      console.error('Failed to fetch encounters:', e)
      encounters.value = []
    }

    loading.value = false

    // ── Enrich moves in background (non-blocking) ──
    if (d && d.moves.length > 0) {
      movesLoading.value = true
      try {
        moves.value = await enrichMoves(d.moves)
      } catch (e) {
        console.error('Failed to enrich moves:', e)
        moves.value = []
      } finally {
        movesLoading.value = false
      }
    }
  })

  return { detail, species, evolution, moves, movesLoading, loading, cryUrl, encounters }
}

// ── Encounter helpers ──────────────────────────────────────────────────────

function processEncounters(encounterData: PokemonEncounter[]): EncounterArea[] {
  const locationMap = new Map<string, Map<string, EncounterArea['games'][0]['methods']>>()

  for (const location of encounterData) {
    const locationName = location.location_area.name.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())

    for (const versionDetail of location.version_details) {
      const gameName = versionDetail.version.name.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())

      const methods = versionDetail.encounter_details.map(detail => ({
        method: detail.method.name.replace(/-/g, ' '),
        chance: detail.chance,
        levels: `${detail.min_level}-${detail.max_level}`
      }))

      if (!locationMap.has(locationName)) locationMap.set(locationName, new Map())

      const gameMap = locationMap.get(locationName)!
      if (!gameMap.has(gameName)) gameMap.set(gameName, [])
      gameMap.get(gameName)!.push(...methods)
    }
  }

  const result: EncounterArea[] = []
  for (const [locationName, gameMap] of locationMap) {
    const games: EncounterArea['games'] = []
    for (const [gameName, methods] of gameMap) {
      const uniqueMethods = methods.filter((method, index, self) =>
        index === self.findIndex(m => m.method === method.method && m.levels === method.levels)
      )
      games.push({ game: gameName, methods: uniqueMethods })
    }
    result.push({ name: locationName, games })
  }

  return result
}
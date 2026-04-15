import type { PokemonDetail, PokemonSpecies, EvolutionChain, EvolutionStep, ChainLink } from '~/types/pokemon'
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

  watch(pokemonId, async (id) => {
    if (!id) {
      detail.value = null
      species.value = null
      evolution.value = []
      return
    }
    loading.value = true
    detail.value = null
    species.value = null
    evolution.value = []

    try {
      const [d, s] = await Promise.all([
        $fetch<PokemonDetail>(`${BASE}/pokemon/${id}`),
        $fetch<PokemonSpecies>(`${BASE}/pokemon-species/${id}`),
      ])
      detail.value = d
      species.value = s

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

  return { detail, species, evolution, loading }
}
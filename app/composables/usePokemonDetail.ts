import type { PokemonDetail, PokemonSpecies } from '~/types/pokemon'

const BASE = 'https://pokeapi.co/api/v2'

export function usePokemonDetail(pokemonId: Ref<number | null>) {
  const detail = ref<PokemonDetail | null>(null)
  const species = ref<PokemonSpecies | null>(null)
  const loading = ref(false)

  watch(pokemonId, async (id) => {
    if (!id) {
      detail.value = null
      species.value = null
      return
    }
    loading.value = true
    detail.value = null
    species.value = null
    try {
      const [d, s] = await Promise.all([
        $fetch<PokemonDetail>(`${BASE}/pokemon/${id}`),
        $fetch<PokemonSpecies>(`${BASE}/pokemon-species/${id}`),
      ])
      detail.value = d
      species.value = s
    } catch {
      // silent fail
    } finally {
      loading.value = false
    }
  })

  return { detail, species, loading }
}

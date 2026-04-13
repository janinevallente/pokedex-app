import type { PokemonSummary } from '~/types/pokemon'
import { GENERATIONS } from '~/types/pokemon'

export function usePokemonList(generation: Ref<number>) {
  const pokemon = ref<PokemonSummary[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const load = async (gen: number) => {
    const g = GENERATIONS.find(g => g.num === gen) || GENERATIONS[0]
    loading.value = true
    error.value = null
    pokemon.value = []

    try {
      const data = await $fetch<PokemonSummary[]>('/api/pokemon', {
        params: { limit: g.limit, offset: g.offset },
      })
      pokemon.value = data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load'
    } finally {
      loading.value = false
    }
  }

  watch(generation, (gen) => load(gen), { immediate: true })

  return { pokemon, loading, error }
}

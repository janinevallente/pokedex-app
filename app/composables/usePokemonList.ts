import type { PokemonSummary } from '~/types/pokemon'
import { GENERATIONS } from '~/types/pokemon'

const PAGE_SIZE = 48 // Number of Pokémon per page

interface NameEntry { id: number; name: string }

export function usePokemonList() {
  // Full national dex name list (lightweight — id + name only)
  const allNames = ref<NameEntry[]>([])
  const namesLoading = ref(false)
  const namesError = ref<string | null>(null)

  // Loaded detail summaries
  const loadedPokemon = ref<PokemonSummary[]>([])
  const batchLoading = ref(false)
  const loadedIds = ref(new Set<number>())

  // Filters
  const search = ref('')
  const typeFilter = ref<string | null>(null)
  const genFilter = ref<number | null>(null)

  // Pagination
  const currentPage = ref(1)
  const pageSize = ref(PAGE_SIZE)

  // --- Derived: which IDs match the current filters on the name list ---
  const filteredNames = computed<NameEntry[]>(() => {
    let list = allNames.value

    // Gen filter: slice by national dex range
    if (genFilter.value !== null) {
      const g = GENERATIONS.find(g => g.num === genFilter.value)
      if (g) {
        const start = g.offset + 1        // 1-based national dex ID start
        const end = g.offset + g.limit    // inclusive end
        list = list.filter(p => p.id >= start && p.id <= end)
      }
    }

    // Search filter on name or id (works even before details are loaded)
    if (search.value.trim()) {
      const q = search.value.toLowerCase().trim()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) || String(p.id).includes(q)
      )
    }

    return list
  })

  // Paginated names
  const paginatedNames = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredNames.value.slice(start, end)
  })

  const visibleIds = computed(() => paginatedNames.value.map(p => p.id))

  // Total pages
  const totalPages = computed(() => Math.ceil(filteredNames.value.length / pageSize.value))

  // Details we have for visible IDs
  const visiblePokemon = computed<PokemonSummary[]>(() => {
    const map = new Map(loadedPokemon.value.map(p => [p.id, p]))
    return visibleIds.value
      .map(id => map.get(id))
      .filter((p): p is PokemonSummary => !!p)
  })

  // Apply type filter on loaded details only
  const filtered = computed<PokemonSummary[]>(() => {
    if (!typeFilter.value) return visiblePokemon.value
    return visiblePokemon.value.filter(p => p.types.includes(typeFilter.value!))
  })

  const hasMore = computed(() => currentPage.value < totalPages.value)
  const hasPrevious = computed(() => currentPage.value > 1)
  const loading = computed(() => namesLoading.value || batchLoading.value)
  const error = computed(() => namesError.value)
  const totalCount = computed(() => filteredNames.value.length)

  // --- Fetch missing details for currently visible IDs ---
  async function fetchMissingDetails(ids: number[]) {
    const missing = ids.filter(id => !loadedIds.value.has(id))
    if (!missing.length) return

    batchLoading.value = true
    try {
      // Chunk into batches of 24 to avoid overwhelming the API
      for (let i = 0; i < missing.length; i += PAGE_SIZE) {
        const chunk = missing.slice(i, i + PAGE_SIZE)
        const data = await $fetch<PokemonSummary[]>('/api/pokemon-batch', {
          params: { ids: chunk.join(',') },
        })
        for (const p of data) {
          if (!loadedIds.value.has(p.id)) {
            loadedPokemon.value.push(p)
            loadedIds.value.add(p.id)
          }
        }
      }
    } catch (e) {
      console.error('Batch fetch failed', e)
    } finally {
      batchLoading.value = false
    }
  }

  // Pagination methods
  function nextPage() {
    if (hasMore.value) {
      currentPage.value++
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function previousPage() {
    if (hasPrevious.value) {
      currentPage.value--
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Reset page when filters change
  watch([search, typeFilter, genFilter], () => {
    currentPage.value = 1
  })

  // Watch visible IDs and fetch details when they change
  watch(visibleIds, (ids) => {
    fetchMissingDetails(ids)
  })

  // Initial load: fetch the full name list once
  async function init() {
    namesLoading.value = true
    namesError.value = null
    try {
      const data = await $fetch<NameEntry[]>('/api/pokemon-all')
      allNames.value = data
    } catch (e: unknown) {
      namesError.value = e instanceof Error ? e.message : 'Failed to load'
    } finally {
      namesLoading.value = false
    }
  }

  onMounted(init)

  return {
    filtered,
    loading,
    batchLoading,
    error,
    currentPage,
    totalPages,
    hasMore,
    hasPrevious,
    nextPage,
    previousPage,
    goToPage,
    totalCount,
    search,
    typeFilter,
    genFilter,
    allNames,
  }
}
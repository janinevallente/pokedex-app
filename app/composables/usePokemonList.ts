import type { PokemonSummary } from '~/types/pokemon'
import { GENERATIONS, extractBaseName } from '~/types/pokemon'

const PAGE_SIZE = 49

// Each entry from the server: id, name, optional baseId (variants only)
interface NameEntry {
  id: number
  name: string
  baseId?: number
}

const VARIANT_ID_THRESHOLD = 10000

export function usePokemonList() {
  // Full grouped name list returned by the server (base + variants interleaved)
  const allNames = ref<NameEntry[]>([])
  const namesLoading = ref(false)
  const namesError = ref<string | null>(null)

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

  // Set of base species names for the selected gen (to filter variants by gen)
  const genBaseNames = computed<Set<string>>(() => {
    if (genFilter.value === null) return new Set()
    const g = GENERATIONS.find(g => g.num === genFilter.value)
    if (!g) return new Set()
    const start = g.offset + 1
    const end = g.offset + g.limit
    return new Set(
      allNames.value
        .filter(p => p.id >= start && p.id <= end)
        .map(p => p.name.toLowerCase())
    )
  })

  // Filtered name list — preserves server grouping order (base then its variants)
  const filteredNames = computed<NameEntry[]>(() => {
    let list = allNames.value

    if (genFilter.value !== null) {
      const g = GENERATIONS.find(g => g.num === genFilter.value)
      if (g) {
        const start = g.offset + 1
        const end = g.offset + g.limit
        const baseNames = genBaseNames.value
        list = list.filter(p => {
          if (p.id <= VARIANT_ID_THRESHOLD) {
            return p.id >= start && p.id <= end
          } else {
            // Include variant only if its base species is in this gen
            const base = extractBaseName(p.name)
            return baseNames.has(base)
          }
        })
      }
    }

    if (search.value.trim()) {
      const q = search.value.toLowerCase().trim()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) || String(p.id).includes(q)
      )
    }

    return list
  })

  const paginatedNames = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredNames.value.slice(start, end)
  })

  const visibleIds = computed(() => paginatedNames.value.map(p => p.id))
  const visibleBaseIds = computed(() => paginatedNames.value.map(p => p.baseId ?? 0))

  const totalPages = computed(() => Math.ceil(filteredNames.value.length / pageSize.value))

  const visiblePokemon = computed<PokemonSummary[]>(() => {
    const map = new Map(loadedPokemon.value.map(p => [p.id, p]))
    return visibleIds.value
      .map(id => map.get(id))
      .filter((p): p is PokemonSummary => !!p)
  })

  const filtered = computed<PokemonSummary[]>(() => {
    if (!typeFilter.value) return visiblePokemon.value
    return visiblePokemon.value.filter(p => p.types.includes(typeFilter.value!))
  })

  // Counts
  const baseCount = computed(() =>
    filteredNames.value.filter(p => p.id <= VARIANT_ID_THRESHOLD).length
  )
  const variantCount = computed(() =>
    filteredNames.value.filter(p => p.id > VARIANT_ID_THRESHOLD).length
  )

  const hasMore = computed(() => currentPage.value < totalPages.value)
  const hasPrevious = computed(() => currentPage.value > 1)
  const loading = computed(() => namesLoading.value || batchLoading.value)
  const error = computed(() => namesError.value)
  const totalCount = computed(() => filteredNames.value.length)

  async function fetchMissingDetails(ids: number[], baseIds: number[]) {
    const missingIndices = ids
      .map((id, i) => ({ id, baseId: baseIds[i], i }))
      .filter(({ id }) => !loadedIds.value.has(id))

    if (!missingIndices.length) return

    batchLoading.value = true
    try {
      for (let i = 0; i < missingIndices.length; i += PAGE_SIZE) {
        const chunk = missingIndices.slice(i, i + PAGE_SIZE)
        const data = await $fetch<PokemonSummary[]>('/api/pokemon-batch', {
          params: {
            ids: chunk.map(c => c.id).join(','),
            baseIds: chunk.map(c => c.baseId).join(','),
          },
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

  watch([search, typeFilter, genFilter], () => {
    currentPage.value = 1
  })

  // When the visible window changes, fetch details for any unseen IDs
  watch([visibleIds, visibleBaseIds], ([ids, baseIds]) => {
    fetchMissingDetails(ids, baseIds)
  })

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
    baseCount,
    variantCount,
    search,
    typeFilter,
    genFilter,
    allNames,
  }
}
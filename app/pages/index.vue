<script setup lang="ts">
import { Search } from '@lucide/vue'
import { ALL_TYPES, GENERATIONS } from '~/types/pokemon'
import type { PokemonSummary } from '~/types/pokemon'
import { usePokemonList } from '~/composables/usePokemonList'
import LogoImg from '~/assets/images/logo.png'

useHead({ title: 'Pokédex Hub' })

const {
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
} = usePokemonList()

const selectedId = ref<number | null>(null)
const showTypeMenu = ref(false)
const showGenMenu = ref(false)
const typeMenuRef = ref<HTMLElement | null>(null)
const genMenuRef = ref<HTMLElement | null>(null)

// Add search states for dropdowns
const typeSearch = ref('')
const genSearch = ref('')

// Filtered types based on search
const filteredTypes = computed(() => {
  if (!typeSearch.value) return ALL_TYPES
  return ALL_TYPES.filter(t => 
    t.toLowerCase().includes(typeSearch.value.toLowerCase())
  )
})

// Filtered generations based on search
const filteredGenerations = computed(() => {
  if (!genSearch.value) return GENERATIONS
  return GENERATIONS.filter(g => 
    g.label.toLowerCase().includes(genSearch.value.toLowerCase()) ||
    g.sub.toLowerCase().includes(genSearch.value.toLowerCase())
  )
})

const selectedIndex = computed(() =>
  filtered.value.findIndex(p => p.id === selectedId.value)
)

function selectPrev() {
  if (selectedIndex.value > 0)
    selectedId.value = filtered.value[selectedIndex.value - 1].id
}

function selectNext() {
  if (selectedIndex.value < filtered.value.length - 1)
    selectedId.value = filtered.value[selectedIndex.value + 1].id
}

function selectType(t: string | null) {
  typeFilter.value = t === typeFilter.value ? null : t
  showTypeMenu.value = false
}

function selectGen(num: number | null) {
  genFilter.value = num === genFilter.value ? null : num
  showGenMenu.value = false
}

const activeGenLabel = computed(() => {
  if (genFilter.value === null) return null
  const g = GENERATIONS.find(g => g.num === genFilter.value)
  return g ? `${g.label} · ${g.sub}` : null
})

// Utility function to capitalize first letter
const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Reset search when dropdown opens
watch(showTypeMenu, (isOpen) => {
  if (!isOpen) {
    typeSearch.value = ''
  }
})

watch(showGenMenu, (isOpen) => {
  if (!isOpen) {
    genSearch.value = ''
  }
})

onMounted(() => {
  document.addEventListener('mousedown', (e) => {
    if (typeMenuRef.value && !typeMenuRef.value.contains(e.target as Node))
      showTypeMenu.value = false
    if (genMenuRef.value && !genMenuRef.value.contains(e.target as Node))
      showGenMenu.value = false
  })
})
</script>

<template>
  <div class="app-wrapper">
    <!-- Header -->
    <header class="site-header">
      <div class="header-inner">
        <!-- Top row -->
        <div class="header-top">
          <!-- Logo -->
          <div class="logo">
            <div>
              <img class="logo-img" :src="LogoImg" />
            </div>
            <div>
              <div class="logo-name">Pokédex Hub</div>
              <div class="logo-subtitle">Developed by J9</div>
            </div>
          </div>

          <!-- Search -->
          <div class="search-wrapper">
            <span class="search-icon"><Search :size="20" color="#d02b45" /></span>
            <input
              v-model="search"
              type="text"
              placeholder="Search pokemon name..."
              class="search-input"
            />
          </div>

          <div class="filters-wrapper">
            <!-- Type filter -->
            <div ref="typeMenuRef" class="type-filter-wrapper">
              <button
                :class="['type-filter-btn', { active: typeFilter }]"
                @click="showTypeMenu = !showTypeMenu"
              >
                <span v-if="typeFilter">{{ capitalizeFirstLetter(typeFilter) }}</span>
                <span v-else>All Types</span>
                <span class="type-filter-arrow">{{ showTypeMenu ? '▲' : '▼' }}</span>
              </button>

              <div v-if="showTypeMenu" class="type-dropdown">
                <div class="dropdown-search">
                  <input
                    v-model="typeSearch"
                    type="text"
                    placeholder="Search type..."
                    class="dropdown-search-input"
                    @click.stop
                  />
                </div>
                <div class="dropdown-list">
                  <button
                    :class="['dropdown-item', { selected: !typeFilter }]"
                    @click="selectType(null)"
                  >
                    All Types
                  </button>
                  <button
                    v-for="t in filteredTypes"
                    :key="t"
                    :class="['dropdown-item', { selected: typeFilter === t }]"
                    @click="selectType(t)"
                  >
                    <span>{{ capitalizeFirstLetter(t) }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Generation filter -->
            <div ref="genMenuRef" class="type-filter-wrapper">
              <button
                :class="['type-filter-btn', { active: genFilter !== null }]"
                @click="showGenMenu = !showGenMenu"
              >
                <span v-if="activeGenLabel">{{ activeGenLabel }}</span>
                <span v-else>All Gens</span>
                <span class="type-filter-arrow">{{ showGenMenu ? '▲' : '▼' }}</span>
              </button>

              <div v-if="showGenMenu" class="type-dropdown gen-dropdown">
                <div class="dropdown-search">
                  <input
                    v-model="genSearch"
                    type="text"
                    placeholder="Search generation..."
                    class="dropdown-search-input"
                    @click.stop
                  />
                </div>
                <div class="dropdown-list">
                  <button
                    :class="['dropdown-item', { selected: genFilter === null }]"
                    @click="selectGen(null)"
                  >
                    All Generations
                  </button>
                  <button
                    v-for="g in filteredGenerations"
                    :key="g.num"
                    :class="['dropdown-item', { selected: genFilter === g.num }]"
                    @click="selectGen(g.num)"
                  >
                    <span class="gen-dropdown-label">{{ g.label }}</span>
                    <span class="gen-dropdown-sub">{{ g.sub }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Active filter chips -->
        <div v-if="genFilter !== null || typeFilter" class="active-filters">
          <span class="active-filters-label">Filters:</span>
          <button v-if="genFilter !== null" class="filter-chip" @click="genFilter = null">
            {{ activeGenLabel }} ✕
          </button>
          <button v-if="typeFilter" class="filter-chip" @click="typeFilter = null">
            {{ capitalizeFirstLetter(typeFilter) }} ✕
          </button>
          <button class="filter-chip filter-chip--clear" @click="genFilter = null; typeFilter = null; search = ''">
            Clear all
          </button>
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="main-content">
      <!-- Pokéball loader: initial load AND batch fetching (filter/search/page) -->
      <PokeballLoader
        v-if="loading || batchLoading"
        :message="loading ? 'Loading Pokémon…' : 'Fetching data…'"
      />

      <!-- Error state -->
      <div v-else-if="error" class="state-center">
        <div class="state-emoji">⚠️</div>
        <div class="state-title">Failed to load</div>
        <div class="state-sub">{{ error }}</div>
      </div>

      <!-- Empty state: only show after the full name list has loaded (allNames.length > 0) -->
      <div
        v-else-if="allNames.length > 0 && filtered.length === 0"
        class="state-center"
      >
        <div class="state-emoji">🔎</div>
        <div class="state-title">No Pokémon found</div>
        <div class="state-sub">Try a different search or filter</div>
      </div>

      <!-- Grid -->
      <template v-else>
        <div class="pokemon-grid">
          <PokemonCard
            v-for="(p, i) in filtered"
            :key="p.id"
            :pokemon="p"
            :delay="Math.min(i * 15, 400)"
            @click="selectedId = p.id"
          />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination-area">
          <div class="pagination-controls">
            <button
              class="pagination-btn"
              :disabled="!hasPrevious"
              @click="previousPage"
            >
              <span class="pagination-arrow">←</span>
              <span class="btn-text">Previous</span>
            </button>
            
            <div class="pagination-pages">
              <!-- First page -->
              <button
                v-if="currentPage > 2"
                class="pagination-page-btn"
                @click="goToPage(1)"
              >
                1
              </button>
              
              <span v-if="currentPage > 3" class="pagination-dots">...</span>
              
              <!-- Previous page -->
              <button
                v-if="hasPrevious"
                class="pagination-page-btn"
                @click="goToPage(currentPage - 1)"
              >
                {{ currentPage - 1 }}
              </button>
              
              <!-- Current page -->
              <button class="pagination-page-btn pagination-page-btn--active">
                {{ currentPage }}
              </button>
              
              <!-- Next page -->
              <button
                v-if="hasMore"
                class="pagination-page-btn"
                @click="goToPage(currentPage + 1)"
              >
                {{ currentPage + 1 }}
              </button>
              
              <span v-if="currentPage < totalPages - 2" class="pagination-dots">...</span>
              
              <!-- Last page -->
              <button
                v-if="currentPage < totalPages - 1"
                class="pagination-page-btn"
                @click="goToPage(totalPages)"
              >
                {{ totalPages }}
              </button>
            </div>
            
            <button
              class="pagination-btn"
              :disabled="!hasMore"
              @click="nextPage"
            >
              <span class="btn-text">Next</span>
              <span class="pagination-arrow">→</span>
            </button>
          </div>

          <div class="pagination-info">
            Page {{ currentPage }} of {{ totalPages }}
            <span class="pagination-total">({{ totalCount }} Total: {{ baseCount }} Base + {{ variantCount }} Variants)</span>
          </div>
        </div>
      </template>
    </main>

    <!-- Footer -->
    <footer class="site-footer">
      <p>
        Data from
        <a href="https://pokeapi.co" target="_blank" rel="noopener noreferrer">PokéAPI</a>
        · Not affiliated with Nintendo or The Pokémon Company
      </p>
      <p>All rights reserved © 2026</p>
    </footer>

    <!-- Modal -->
    <PokemonModal
      :pokemon-id="selectedId"
      :is-first="selectedIndex === 0"
      :is-last="selectedIndex === filtered.length - 1"
      @close="selectedId = null"
      @prev="selectPrev"
      @next="selectNext"
    />
  </div>
</template>
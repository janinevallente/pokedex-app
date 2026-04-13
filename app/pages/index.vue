<script setup lang="ts">
import { Search } from '@lucide/vue'
import { ALL_TYPES, GENERATIONS } from '~/types/pokemon'
import type { PokemonSummary } from '~/types/pokemon'
import { usePokemonList } from '~/composables/usePokemonList'
import LogoImg from '~/assets/images/logo.png'

useHead({ title: 'Pokédex' })

const generation = ref(1)
const search = ref('')
const typeFilter = ref<string | null>(null)
const selectedId = ref<number | null>(null)
const showTypeMenu = ref(false)
const typeMenuRef = ref<HTMLElement | null>(null)

const { pokemon, loading, error } = usePokemonList(generation)

const filtered = computed<PokemonSummary[]>(() =>
  pokemon.value.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.value.toLowerCase()) ||
      String(p.id).includes(search.value)
    const matchType = !typeFilter.value || p.types.includes(typeFilter.value)
    return matchSearch && matchType
  })
)

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

function selectGen(num: number) {
  generation.value = num
  search.value = ''
  typeFilter.value = null
}

function selectType(t: string | null) {
  typeFilter.value = t === typeFilter.value ? null : t
  showTypeMenu.value = false
}

// Close type dropdown on outside click
onMounted(() => {
  document.addEventListener('mousedown', (e) => {
    if (typeMenuRef.value && !typeMenuRef.value.contains(e.target as Node)) {
      showTypeMenu.value = false
    }
  })
})

const subtitleText = computed(() =>
  loading.value
    ? 'Loading…'
    : `${filtered.value.length} of ${pokemon.value.length} Pokémon`
)
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
              <img class="logo-img" :src="LogoImg"/>
            </div>
            <div>
              <div class="logo-name">Pokédex</div>
              <div class="logo-subtitle">{{ subtitleText }}</div>
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

          <!-- Type filter -->
          <div ref="typeMenuRef" class="type-filter-wrapper">
            <button
              :class="['type-filter-btn', { active: typeFilter }]"
              @click="showTypeMenu = !showTypeMenu"
            >
              <span
                v-if="typeFilter"
                :class="['type-badge', `type-${typeFilter}`]"
                style="font-size:11px; padding:2px 8px"
              >{{ typeFilter }}</span>
              <span v-else>All Types</span>
              <span class="type-filter-arrow">{{ showTypeMenu ? '▲' : '▼' }}</span>
            </button>

            <div v-if="showTypeMenu" class="type-dropdown">
              <button
                :class="['type-all-btn', { selected: !typeFilter }]"
                @click="selectType(null)"
              >
                All Types
              </button>
              <button
                v-for="t in ALL_TYPES"
                :key="t"
                :class="['type-badge', `type-${t}`]"
                :style="typeFilter === t ? { outline: '2px solid rgba(255,255,255,0.5)' } : {}"
                @click="selectType(t)"
              >
                {{ t }}
              </button>
            </div>
          </div>
        </div>

        <!-- Generation tabs -->
        <div class="gen-tabs">
          <button
            v-for="g in GENERATIONS"
            :key="g.num"
            :class="['gen-tab', { active: generation === g.num }]"
            @click="selectGen(g.num)"
          >
            {{ g.label }}
            <span class="gen-tab-sub"> {{ g.sub }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="main-content">
      <!-- Loading skeleton -->
      <div v-if="loading" class="skeleton-grid">
        <div
          v-for="i in 20"
          :key="i"
          class="skeleton"
          :style="{ height: '180px', animationDelay: `${i * 0.05}s` }"
        />
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="state-center">
        <div class="state-emoji">⚠️</div>
        <div class="state-title">Failed to load</div>
        <div class="state-sub">{{ error }}</div>
      </div>

      <!-- Empty state -->
      <div v-else-if="filtered.length === 0" class="state-center">
        <div class="state-emoji">🔎</div>
        <div class="state-title">No Pokémon found</div>
        <div class="state-sub">Try a different search or type filter</div>
      </div>

      <!-- Grid -->
      <div v-else class="pokemon-grid">
        <PokemonCard
          v-for="(p, i) in filtered"
          :key="p.id"
          :pokemon="p"
          :delay="Math.min(i * 25, 500)"
          @click="selectedId = p.id"
        />
      </div>
    </main>

    <!-- Footer -->
    <footer class="site-footer">
      <p>
        Developed by J9
      </p>
      <p>
        Data from
        <a href="https://pokeapi.co" target="_blank" rel="noopener noreferrer">PokéAPI</a>
        · Not affiliated with Nintendo or The Pokémon Company
      </p>
    </footer>

    <!-- Modal -->
    <PokemonModal
      :pokemon-id="selectedId"
      :is-first="selectedIndex === 0"
      @close="selectedId = null"
      @prev="selectPrev"
      @next="selectNext"
    />
  </div>
</template>
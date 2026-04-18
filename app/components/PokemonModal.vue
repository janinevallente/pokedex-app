<script setup lang="ts">
import { TYPE_HEX, padId, getTypeEffectiveness } from '~/types/pokemon'
import { usePokemonDetail } from '~/composables/usePokemonDetail'
import { Shield, TriangleAlert, Volume2, MapPin, Ghost, Inbox } from '@lucide/vue'

const props = defineProps<{
  pokemonId: number | null
  isFirst?: boolean
  isLast?: boolean
}>()

const emit = defineEmits<{
  close: []
  prev: []
  next: []
}>()

const pokemonIdRef = computed(() => props.pokemonId)
const { detail, species, evolution, moves, movesLoading, loading, cryUrl, encounters } = usePokemonDetail(pokemonIdRef)

type Tab = 'info' | 'stats' | 'moves' | 'evolution' | 'location'
const tab = ref<Tab>('info')
const showBack = ref(false)
const isPlaying = ref(false) // sound loading state
let audioElement: HTMLAudioElement | null = null

// Utility function to capitalize first letter
const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Group encounters by game
const groupedEncounters = computed(() => {
  const gameMap = new Map<string, { location: string; methods: any[] }[]>()
  
  for (const location of encounters.value) {
    for (const game of location.games) {
      if (!gameMap.has(game.game)) {
        gameMap.set(game.game, [])
      }
      gameMap.get(game.game)!.push({
        location: location.name,
        methods: game.methods
      })
    }
  }
  
  // Convert to array and sort by game name
  return Array.from(gameMap.entries())
    .map(([game, locations]) => ({
      game,
      locations: locations.sort((a, b) => a.location.localeCompare(b.location)),
      locationCount: locations.length
    }))
    .sort((a, b) => a.game.localeCompare(b.game))
})

// Helper to get game version color
const getGameColor = (game: string): string => {
  const gameColors: Record<string, string> = {
    'Red': '#ff4444',
    'Blue': '#4444ff',
    'Yellow': '#ffff44',
    'Gold': '#ffcc44',
    'Silver': '#cccccc',
    'Crystal': '#44ccff',
    'Ruby': '#ff4444',
    'Sapphire': '#4444ff',
    'Emerald': '#44ff44',
    'Diamond': '#44ccff',
    'Pearl': '#ff44ff',
    'Platinum': '#cccccc',
    'Black': '#444444',
    'White': '#ffffff',
    'Black 2': '#333333',
    'White 2': '#eeeeee',
    'X': '#44aaff',
    'Y': '#ff4444',
    'Omega Ruby': '#ff4444',
    'Alpha Sapphire': '#4444ff',
    'Sun': '#ffaa44',
    'Moon': '#aa88ff',
    'Ultra Sun': '#ffcc44',
    'Ultra Moon': '#aa99ff',
    'Sword': '#4488ff',
    'Shield': '#ff4444',
    'Brilliant Diamond': '#44ccff',
    'Shining Pearl': '#ff44ff',
    'Legends Arceus': '#88aaff',
    'Scarlet': '#ff4444',
    'Violet': '#8844ff'
  }
  
  for (const [key, color] of Object.entries(gameColors)) {
    if (game.includes(key)) return color
  }
  return '#56c0a9'
}

// Clean up audio on unmount
onUnmounted(() => {
  if (audioElement) {
    audioElement.pause()
    audioElement = null
  }
})

// Function to play Pokémon cry
const playCry = async () => {
  if (!cryUrl.value || isPlaying.value) return
  
  try {
    isPlaying.value = true
    
    // Stop any currently playing audio
    if (audioElement) {
      audioElement.pause()
      audioElement = null
    }
    
    // Create new audio element
    audioElement = new Audio(cryUrl.value)
    
    // Play the sound
    await audioElement.play()
    
    // Reset when finished
    audioElement.onended = () => {
      isPlaying.value = false
      audioElement = null
    }
    
    // Handle errors
    audioElement.onerror = () => {
      console.error('Failed to play Pokémon cry')
      isPlaying.value = false
      audioElement = null
    }
    
  } catch (error) {
    console.error('Error playing sound:', error)
    isPlaying.value = false
  }
}

watch(() => props.pokemonId, () => {
  tab.value = 'info'
  showBack.value = false
   // Stop any playing sound when switching Pokémon
  if (audioElement) {
    audioElement.pause()
    audioElement = null
    isPlaying.value = false
  }
})

const typeColor = computed(() => {
  const t = detail.value?.types[0]?.type.name || 'normal'
  return TYPE_HEX[t] || '#6890F0'
})

const flavorText = computed(() => {
  return species.value?.flavor_text_entries
    .filter(e => e.language.name === 'en')
    .slice(-1)[0]?.flavor_text
    .replace(/\f/g, ' ')
    .replace(/\n/g, ' ') || ''
})

const genus = computed(() =>
  species.value?.genera.find(g => g.language.name === 'en')?.genus || ''
)

const sprite = computed(() => {
  if (!detail.value) return ''
  if (showBack.value) return detail.value.sprites.back_default
  return detail.value.sprites.other['official-artwork']?.front_default
    || detail.value.sprites.front_default
})

const statTotal = computed(() =>
  detail.value?.stats.reduce((a, s) => a + s.base_stat, 0) ?? 0
)

// Type effectiveness
const effectiveness = computed(() => {
  if (!detail.value) return null
  const defTypes = detail.value.types.map(t => t.type.name)
  return getTypeEffectiveness(defTypes)
})

const heroStyle = computed(() => ({
  background: `linear-gradient(145deg, ${typeColor.value}30 0%, ${typeColor.value}10 50%, transparent 100%)`,
}))

const panelStyle = computed(() => ({
  boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05), 0 0 60px ${typeColor.value}22`,
}))

const spriteStyle = computed(() => ({
  filter: `drop-shadow(0 12px 32px ${typeColor.value}80)`,
}))

const handleKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close')
  if (e.key === 'ArrowLeft' && !props.isFirst) emit('prev')
  if (e.key === 'ArrowRight' && !props.isLast) emit('next') 
}

onMounted(() => window.addEventListener('keydown', handleKey))
onUnmounted(() => window.removeEventListener('keydown', handleKey))

const infoItems = computed(() => [
  { label: 'Height',     value: detail.value ? `${(detail.value.height / 10).toFixed(1)} m` : '—' },
  { label: 'Weight',     value: detail.value ? `${(detail.value.weight / 10).toFixed(1)} kg` : '—' },
  { label: 'Base XP',    value: detail.value?.base_experience ?? '—' },
  { label: 'Catch Rate', value: species.value?.capture_rate ?? '—' },
])
</script>

<template>
  <Teleport to="body">
    <div
      v-if="pokemonId"
      class="modal-backdrop"
      @click.self="emit('close')"
    >
      <div class="modal-panel" :style="panelStyle">
        <!-- Hero header -->
        <div class="modal-hero" :style="heroStyle" style="position: relative;">

          <!-- Sound button - bottom right corner -->
          <button
            v-if="detail && cryUrl"
            class="sound-btn"
            :class="{ 'sound-btn--playing': isPlaying }"
            @click="playCry"
            :disabled="isPlaying"
            title="Click to hear this Pokémon’s cry"
          >
            <div v-if="!isPlaying" class="sound-icon"><Volume2 :size="18" color="#e8344a" /></div>
            <div v-else class="sound-icon"><Volume2 :size="18" color="#e8344a" /></div>
          </button>

          <!-- Pokémon name & ID -->
          <div class="modal-title-area">
            <template v-if="detail">
              <div class="modal-id">#{{ padId(pokemonId) }}</div>
              <div class="modal-name">{{ detail.name.replace(/-/g, ' ') }}</div>
              <div v-if="genus" class="modal-genus">{{ genus }}</div>
            </template>
            <template v-else>
              <div class="modal-id">#{{ padId(pokemonId) }}</div>
            </template>
          </div>

          <!-- Loader -->
          <div v-if="loading" class="modal-loader">
            <div class="loader-dot" />
            <div class="loader-dot" />
            <div class="loader-dot" />
          </div>

          <template v-else-if="detail">
            <!-- Sprite -->
            <div class="modal-sprite-wrapper">
              <button
                v-if="!isFirst"
                class="modal-edge-btn modal-edge-btn--left"
                title="Previous"
                @click="emit('prev')"
              >←</button>

              <button
                v-if="!isLast"
                class="modal-edge-btn modal-edge-btn--right"
                title="Next"
                @click="emit('next')"
              >→</button>

              <img
                v-if="sprite"
                :src="sprite"
                :alt="detail.name"
                class="modal-sprite"
                :style="spriteStyle"
              />
            </div>

            <!-- Types + legendary badges -->
            <div class="modal-type-row">
              <span
                v-for="t in detail.types"
                :key="t.type.name"
                :class="['type-badge', `type-${t.type.name}`]"
              >{{ t.type.name }}</span>
              <span v-if="species?.is_legendary" class="legendary-badge">★ Legendary</span>
              <span v-if="species?.is_mythical" class="legendary-badge">✦ Mythical</span>
            </div>
          </template>
        </div>

        <!-- Tab nav -->
        <div v-if="detail" class="modal-tabs">
          <div class="modal-tabs-inner">
            <button
              v-for="t in (['info', 'stats', 'moves', 'evolution', 'location'] as Tab[])"
              :key="t"
              :class="['tab-btn', { active: tab === t }]"
              @click="tab = t"
            >
              {{ t.charAt(0).toUpperCase() + t.slice(1) }}
            </button>
          </div>
        </div>

        <!-- Tab content -->
        <div v-if="detail" class="modal-content">

          <!-- ── INFO TAB ── -->
          <template v-if="tab === 'info'">
            <p v-if="flavorText" class="flavor-text">"{{ flavorText }}"</p>

            <div class="info-grid">
              <div v-for="item in infoItems" :key="item.label" class="info-cell">
                <div class="info-cell-label">{{ item.label }}</div>
                <div class="info-cell-value">
                  {{ item.value }}{{ item.label === 'Catch Rate' ? ' %' : '' }}
                </div>
              </div>
            </div>

            <div class="abilities-section">
              <div class="abilities-label">Abilities</div>
              <div class="abilities-list">
                <span
                  v-for="a in detail.abilities"
                  :key="a.ability.name"
                  :class="['ability-chip', { hidden: a.is_hidden }]"
                >
                  {{ a.ability.name.replace(/-/g, ' ') }}{{ a.is_hidden ? ' · hidden' : '' }}
                </span>
              </div>
            </div>

            <!-- Type effectiveness -->
            <template v-if="effectiveness">
              <!-- Strong against (resists) -->
              <div
                v-if="effectiveness.immune.length || effectiveness.quarter.length || effectiveness.half.length"
                class="effectiveness-section"
              >
                <div class="effectiveness-label strong-label">
                  <Shield :size="15" color="#56c0a9" /> Strong against
                </div>
                <div class="effectiveness-types">
                  <span
                    v-for="t in effectiveness.immune"
                    :key="t"
                    :class="['type-badge', `type-${t}`, 'eff-badge']"
                  >{{ t }} <span class="eff-mult">×0</span></span>
                  <span
                    v-for="t in effectiveness.quarter"
                    :key="t"
                    :class="['type-badge', `type-${t}`, 'eff-badge']"
                  >{{ t }} <span class="eff-mult">×¼</span></span>
                  <span
                    v-for="t in effectiveness.half"
                    :key="t"
                    :class="['type-badge', `type-${t}`, 'eff-badge']"
                  >{{ t }} <span class="eff-mult">×½</span></span>
                </div>
              </div>

              <!-- Weak against -->
              <div
                v-if="effectiveness.quadruple.length || effectiveness.double.length"
                class="effectiveness-section"
              >
                <div class="effectiveness-label weak-label">
                  <TriangleAlert :size="15" color="#ff6b6b"/> Weak Against
                </div>
                <div class="effectiveness-types">
                  <span
                    v-for="t in effectiveness.quadruple"
                    :key="t"
                    :class="['type-badge', `type-${t}`, 'eff-badge']"
                  >{{ t }} <span class="eff-mult">×4</span></span>
                  <span
                    v-for="t in effectiveness.double"
                    :key="t"
                    :class="['type-badge', `type-${t}`, 'eff-badge']"
                  >{{ t }} <span class="eff-mult">×2</span></span>
                </div>
              </div>

            </template>
          </template>

          <!-- ── STATS TAB ── -->
          <template v-else-if="tab === 'stats'">
            <StatBar
              v-for="s in detail.stats"
              :key="s.stat.name"
              :stat="s.stat.name"
              :value="s.base_stat"
            />
            <div class="stat-total-row">
              <span class="stat-total-label">Total</span>
              <span class="stat-total-value">{{ statTotal }}</span>
            </div>
          </template>

          <!-- ── MOVES TAB ── -->
          <template v-else-if="tab === 'moves'">

            <!-- Loading -->
            <div v-if="movesLoading" class="moves-loading">
              <div class="moves-loading-dots">
                <span /><span /><span />
              </div>
              <div class="moves-loading-text">Loading move details…</div>
            </div>

            <!-- No moves -->
            <div v-else-if="moves.length === 0" class="moves-empty">
              <Inbox :size="48" class="moves-empty-icon" />
              <div class="moves-empty-title">No data available</div>
              <div class="moves-empty-sub">This Pokémon has no recorded moves.</div>
            </div>

            <!-- Moves table -->
            <template v-else>
              <div class="moves-summary">
                {{ moves.length }} moves
                <span class="moves-summary-hint">· sorted by level learned</span>
              </div>
              <div class="moves-table-wrapper">
                <table class="moves-table">
                  <thead>
                    <tr>
                      <th class="col-lv">Lv.</th>
                      <th class="col-name">Move</th>
                      <th class="col-type">Type</th>
                      <th class="col-cat">Cat.</th>
                      <th class="col-pow">Power</th>
                      <th class="col-acc">Acc.</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="m in moves"
                      :key="m.name"
                      class="move-row"
                    >
                      <td class="col-lv">
                        <span v-if="m.learnMethod === 'level-up'" class="lv-badge">
                          {{ m.levelLearnedAt === 0 ? '—' : m.levelLearnedAt }}
                        </span>
                        <span v-else class="learn-method-badge">
                          {{ m.learnMethod === 'machine' ? 'TM' : m.learnMethod === 'egg' ? 'Egg' : m.learnMethod === 'tutor' ? 'Tutor' : capitalizeFirstLetter(m.learnMethod) }}
                        </span>
                      </td>
                      <td class="col-name move-name-cell">
                        {{ m.name.replace(/-/g, ' ').replace(/(^|\s)\w/g, (c: string) => c.toUpperCase()) }}
                      </td>
                      <td class="col-type">
                        <span :class="['type-badge', `type-${m.type}`]">{{ m.type }}</span>
                      </td>
                      <td class="col-cat">
                        <span :class="['damage-class', `damage-${m.damageClass}`]" :title="m.damageClass">
                          {{ m.damageClass === 'physical' ? '⚔' : m.damageClass === 'special' ? '✦' : '○' }}
                        </span>
                      </td>
                      <td class="col-pow">
                        <span class="stat-val">{{ m.power ?? '—' }}</span>
                      </td>
                      <td class="col-acc">
                        <span class="stat-val">{{ m.accuracy != null ? m.accuracy + '%' : '—' }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>

          </template>

          <!-- ── EVOLUTION TAB ── -->
          <template v-else-if="tab === 'evolution'">
            <div v-if="evolution.length <= 1" class="evo-empty">
              <!-- This Pokémon does not evolve. -->
              <Inbox :size="48" class="evo-empty-icon" />
              <div class="evo-empty-title">No data available</div>
              <div class="evo-empty-sub">Detailed records of this Pokémon's evolution chain are currently unavailable.</div>
            </div>
            <div v-else class="evo-chain">
              <template v-for="(step, i) in evolution" :key="step.id">
                <!-- Evolution step card -->
                <div
                  :class="['evo-card', { 'evo-card--current': step.id === pokemonId }]"
                >
                  <img :src="step.sprite" :alt="step.name" class="evo-sprite" />
                  <div class="evo-name">{{ step.name.replace(/-/g, ' ') }}</div>
                  <div class="evo-id">#{{ padId(step.id) }}</div>
                </div>

                <!-- Arrow + trigger between steps -->
                <div v-if="i < evolution.length - 1" class="evo-arrow-block">
                  <div class="evo-arrow">→</div>
                  <div v-if="evolution[i + 1].trigger" class="evo-trigger">
                    {{ evolution[i + 1].trigger }}
                  </div>
                </div>
              </template>
            </div>
          </template>

          <!-- ── LOCATION TAB ── -->
          <template v-else-if="tab === 'location'">
            <div v-if="encounters.length === 0" class="location-empty">
              <Inbox :size="48" class="location-empty-icon" />
              <div class="location-empty-title">No data available</div>
              <div class="location-empty-sub">No wild sightings have been documented for this Pokémon.</div>
            </div>
            
            <div v-else class="location-container">
              <div class="location-table-wrapper">
                <table class="location-table">
                  <thead>
                    <tr>
                      <th>Pokémon Game</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="(group, gameIndex) in groupedEncounters" :key="group.game">
                      <tr>
                        <td class="game-cell" :rowspan="group.locationCount">
                          <span 
                            class="game-badge"
                            :style="{ borderLeftColor: getGameColor(group.game) }"
                          >
                            {{ group.game }}
                          </span>
                        </td>
                        <td class="location-cell">
                          <div class="location-info">
                            <span class="location-name-text">{{ group.locations[0].location }}</span>
                            <div class="location-details">
                              <span v-for="(method, mIdx) in group.locations[0].methods" :key="mIdx" class="method-tag">
                                {{ capitalizeFirstLetter(method.method) }} (Lv. {{ method.levels }})
                                <span v-if="method.chance" class="chance-text">{{ method.chance }}%</span>
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr v-for="(location, idx) in group.locations.slice(1)" :key="idx">
                        <td class="location-cell">
                          <div class="location-info">
                            <span class="location-name-text">{{ location.location }}</span>
                            <div class="location-details">
                              <span v-for="(method, mIdx) in location.methods" :key="mIdx" class="method-tag">
                                {{ capitalizeFirstLetter(method.method) }} (Lv. {{ method.levels }})
                                <span v-if="method.chance" class="chance-text">{{ method.chance }}%</span>
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>

            </div>
          </template>

        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn-close" @click="emit('close')">Close</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
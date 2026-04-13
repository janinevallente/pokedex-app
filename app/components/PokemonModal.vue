<script setup lang="ts">
import { TYPE_HEX, padId } from '~/types/pokemon'
import { usePokemonDetail } from '~/composables/usePokemonDetail'

const props = defineProps<{
  pokemonId: number | null
}>()

const emit = defineEmits<{
  close: []
  prev: []
  next: []
}>()

const pokemonIdRef = computed(() => props.pokemonId)
const { detail, species, loading } = usePokemonDetail(pokemonIdRef)

type Tab = 'info' | 'stats' | 'moves'
const tab = ref<Tab>('info')
const showBack = ref(false)

watch(() => props.pokemonId, () => {
  tab.value = 'info'
  showBack.value = false
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

const heroStyle = computed(() => ({
  background: `linear-gradient(145deg, ${typeColor.value}30 0%, ${typeColor.value}10 50%, transparent 100%)`,
}))

const panelStyle = computed(() => ({
  boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05), 0 0 60px ${typeColor.value}22`,
}))

const spriteStyle = computed(() => ({
  filter: `drop-shadow(0 12px 32px ${typeColor.value}80)`,
}))

// Keyboard navigation
const handleKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close')
  if (e.key === 'ArrowLeft') emit('prev')
  if (e.key === 'ArrowRight') emit('next')
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
        <div class="modal-hero" :style="heroStyle">
          <div class="modal-nav">
            <button class="modal-nav-btn" @click="emit('prev')">←</button>

            <div v-if="detail" class="modal-title-area">
              <div class="modal-id">#{{ padId(pokemonId) }}</div>
              <div class="modal-name">{{ detail.name.replace(/-/g, ' ') }}</div>
              <div v-if="genus" class="modal-genus">{{ genus }}</div>
            </div>
            <div v-else class="modal-title-area">
              <div class="modal-id">#{{ padId(pokemonId) }}</div>
            </div>

            <button class="modal-nav-btn" @click="emit('next')">→</button>
          </div>

          <!-- Loader -->
          <div v-if="loading" class="modal-loader">
            <div class="loader-dot" />
            <div class="loader-dot" />
            <div class="loader-dot" />
          </div>

          <template v-else-if="detail">
            <!-- Sprite -->
            <div class="modal-sprite-wrapper" @click="showBack = !showBack">
              <img
                v-if="sprite"
                :src="sprite"
                :alt="detail.name"
                class="modal-sprite"
                :style="spriteStyle"
              />
              <div v-else class="sprite-placeholder" style="width:160px;height:160px;font-size:48px">?</div>
              <div class="modal-sprite-hint">
                {{ showBack ? 'back' : 'front' }} · click to flip
              </div>
            </div>

            <!-- Types + badges -->
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
          <button
            v-for="t in (['info', 'stats', 'moves'] as Tab[])"
            :key="t"
            :class="['tab-btn', { active: tab === t }]"
            @click="tab = t"
          >
            {{ t.charAt(0).toUpperCase() + t.slice(1) }}
          </button>
        </div>

        <!-- Tab content -->
        <div v-if="detail" class="modal-content">
          <!-- Info -->
          <template v-if="tab === 'info'">
            <p v-if="flavorText" class="flavor-text">"{{ flavorText }}"</p>

            <div class="info-grid">
              <div v-for="item in infoItems" :key="item.label" class="info-cell">
                <div class="info-cell-label">{{ item.label }}</div>
                <div class="info-cell-value">{{ item.value }}</div>
              </div>
            </div>

            <div>
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
          </template>

          <!-- Stats -->
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

          <!-- Moves -->
          <template v-else-if="tab === 'moves'">
            <div class="moves-count">{{ detail.moves.length }} moves available</div>
            <div class="moves-grid">
              <div
                v-for="m in detail.moves.slice(0, 48)"
                :key="m.move.name"
                class="move-chip"
              >
                {{ m.move.name.replace(/-/g, ' ') }}
              </div>
            </div>
            <div v-if="detail.moves.length > 48" class="moves-more">
              +{{ detail.moves.length - 48 }} more moves
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

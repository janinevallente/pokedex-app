<script setup lang="ts">
import { TYPE_HEX, padId, getTypeEffectiveness } from '~/types/pokemon'
import { usePokemonDetail } from '~/composables/usePokemonDetail'
import { Shield, TriangleAlert } from '@lucide/vue'

const props = defineProps<{
  pokemonId: number | null
  isFirst?: boolean
}>()

const emit = defineEmits<{
  close: []
  prev: []
  next: []
}>()

const pokemonIdRef = computed(() => props.pokemonId)
const { detail, species, evolution, loading } = usePokemonDetail(pokemonIdRef)

type Tab = 'info' | 'stats' | 'moves' | 'evolution'
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
                @click="showBack = !showBack"
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
          <button
            v-for="t in (['info', 'stats', 'moves', 'evolution'] as Tab[])"
            :key="t"
            :class="['tab-btn', { active: tab === t }]"
            @click="tab = t"
          >
            {{ t.charAt(0).toUpperCase() + t.slice(1) }}
          </button>
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

          <!-- ── EVOLUTION TAB ── -->
          <template v-else-if="tab === 'evolution'">
            <div v-if="evolution.length <= 1" class="evo-none">
              This Pokémon does not evolve.
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

        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn-close" @click="emit('close')">Close</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
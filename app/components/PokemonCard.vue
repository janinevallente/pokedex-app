<script setup lang="ts">
import type { PokemonSummary } from '~/types/pokemon'
import { padId } from '~/types/pokemon'

const props = defineProps<{
  pokemon: PokemonSummary
  delay?: number
}>()

const emit = defineEmits<{ click: [] }>()

const primaryType = computed(() => props.pokemon.types[0])

const VARIANT_KEYWORDS = [
  'mega-x', 
  'mega-y', 
  'mega', 
  'gmax', 
  'alola', 
  'galar',
  'hisui', 
  'paldea', 
  'primal', 
  'origin', 
  'therian', 
  'eternamax',
  'black', 
  'white', 
  'sky',
  'heat',
  "wash",
  "frost",
  "fan",
  "mow",
  // "plant",
  // "sandy",
  // "trash",
  // "normal",
  // "attack",
  // "defense",
  // "speed",
  // "baile",
  // "pom-pom",
  // "pau",
  // "sensu",
  // "amped",
  // "low-key"
]

/**
 * For variants, strip the variant suffix so the card shows only the base
 * species name — the badge already communicates which form it is.
 * e.g. "blastoise-mega" → "Blastoise"   "raichu-alola" → "Raichu"
 */
const displayName = computed(() => {
  let name = props.pokemon.name.toLowerCase()
  if (props.pokemon.isVariant) {
    for (const kw of VARIANT_KEYWORDS) {
      const idx = name.indexOf(`-${kw}`)
      if (idx !== -1) { name = name.slice(0, idx); break }
    }
  }
  return name.replace(/-/g, ' ').replace(/(^|\s)\w/g, c => c.toUpperCase())
})

/**
 * Display ID:
 * - Base Pokémon  → their own national dex id  (#009)
 * - Variant       → their base's dex id         (#009) so it sits naturally
 *                   beside the base card; variant label already distinguishes it
 */
const displayId = computed(() =>
  props.pokemon.isVariant && props.pokemon.baseId
    ? padId(props.pokemon.baseId)
    : padId(props.pokemon.id)
)

// Variant badge colour
const variantBadgeClass = computed(() => {
  const label = (props.pokemon.variantLabel ?? '').toLowerCase()
  if (label === 'mega x' || label === 'mega y' || label === 'mega') return 'badge-mega'
  if (label === 'gmax') return 'badge-gmax'
  if (label === 'primal') return 'badge-primal'
  if (label === 'eternamax') return 'badge-eternamax'
  return 'badge-regional'
})
</script>

<template>
  <div
    :class="[
      'poke-card',
      `card-type-${primaryType}`,
      'animate-fade-slide',
      pokemon.isVariant ? 'poke-card--variant' : '',
    ]"
    :style="{ animationDelay: `${delay ?? 0}ms`, animationFillMode: 'both' }"
    @click="emit('click')"
  >
    <div class="card-glow" />
    <div class="card-pokeball-ring" />
    <div class="card-pokeball-stripe" />

    <!-- Variant badge -->
    <div
      v-if="pokemon.isVariant && pokemon.variantLabel"
      :class="['variant-badge', variantBadgeClass]"
    >
      {{ pokemon.variantLabel }}
    </div>

    <div class="card-body">
      <div class="card-id">#{{ displayId }}</div>

      <div class="card-sprite-wrapper">
        <img
          v-if="pokemon.sprite"
          :src="pokemon.sprite"
          :alt="displayName"
          class="sprite-img"
        />
        <div v-else class="sprite-placeholder">?</div>
      </div>

      <div class="card-name">{{ displayName }}</div>

      <div class="card-types">
        <span
          v-for="type in pokemon.types"
          :key="type"
          :class="['type-badge', `type-${type}`]"
        >{{ type }}</span>
      </div>
    </div>
  </div>
</template>
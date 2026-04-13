<script setup lang="ts">
import type { PokemonSummary } from '~/types/pokemon'
import { padId } from '~/types/pokemon'

const props = defineProps<{
  pokemon: PokemonSummary
  delay?: number
}>()

const emit = defineEmits<{ click: [] }>()

const primaryType = computed(() => props.pokemon.types[0])
</script>

<template>
  <div
    :class="['poke-card', `card-type-${primaryType}`, 'animate-fade-slide']"
    :style="{ animationDelay: `${delay ?? 0}ms`, animationFillMode: 'both' }"
    @click="emit('click')"
  >
    <div class="card-glow" />
    <div class="card-pokeball-ring" />
    <div class="card-pokeball-stripe" />

    <div class="card-body">
      <div class="card-id">#{{ padId(pokemon.id) }}</div>

      <div class="card-sprite-wrapper">
        <img
          v-if="pokemon.sprite"
          :src="pokemon.sprite"
          :alt="pokemon.name"
          class="sprite-img"
        />
        <div v-else class="sprite-placeholder">?</div>
      </div>

      <div class="card-name">{{ pokemon.name.replace(/-/g, ' ') }}</div>

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

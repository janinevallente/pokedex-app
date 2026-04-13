<script setup lang="ts">
import { STAT_COLORS, STAT_LABELS } from '~/types/pokemon'

const props = defineProps<{
  stat: string
  value: number
  max?: number
}>()

const color = computed(() => STAT_COLORS[props.stat] || '#e8344a')
const label = computed(() => STAT_LABELS[props.stat] || props.stat.toUpperCase())
const pct = computed(() => Math.min((props.value / (props.max ?? 255)) * 100, 100))

const barWidth = ref(0)

onMounted(() => {
  setTimeout(() => { barWidth.value = pct.value }, 150)
})

watch(pct, (v) => {
  barWidth.value = 0
  setTimeout(() => { barWidth.value = v }, 150)
})
</script>

<template>
  <div class="stat-row">
    <div class="stat-label">{{ label }}</div>
    <div class="stat-value">{{ value }}</div>
    <div class="stat-bar-track">
      <div
        class="stat-bar-fill"
        :style="{
          width: `${barWidth}%`,
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          boxShadow: `0 0 8px ${color}60`,
        }"
      />
    </div>
  </div>
</template>

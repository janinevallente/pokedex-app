<script setup lang="ts">
defineProps<{
  message?: string
}>()
</script>

<template>
  <div class="pokeball-loader-wrapper">
    <div class="pokeball-scene">
      <!-- Shadow beneath the ball -->
      <div class="pokeball-shadow" />

      <!-- The Pokéball -->
      <div class="pokeball">
        <!-- Top half (red) -->
        <div class="pokeball-top">
          <div class="pokeball-top-shine" />
        </div>

        <!-- Divider band -->
        <div class="pokeball-band" />

        <!-- Center button -->
        <div class="pokeball-btn-ring">
          <div class="pokeball-btn-inner">
            <div class="pokeball-btn-dot" />
          </div>
        </div>

        <!-- Bottom half (white) -->
        <div class="pokeball-bottom" />
      </div>
    </div>

    <!-- Loading text -->
    <div class="pokeball-label">
      {{ message }}
    </div>

    <!-- Animated dots -->
    <div class="pokeball-dots">
      <span /><span /><span />
    </div>
  </div>
</template>
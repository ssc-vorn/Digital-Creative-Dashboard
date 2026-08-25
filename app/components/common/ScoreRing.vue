<script setup lang="ts">
const props = withDefaults(defineProps<{
  score: number
  size?: number
  label?: string
}>(), {
  size: 56,
  label: 'Score'
})

const radius = computed(() => props.size / 2 - 4)
const circumference = computed(() => 2 * Math.PI * radius.value)

const tone = computed(() => {
  if (props.score >= 75) return 'text-success'
  if (props.score >= 50) return 'text-warning'
  return 'text-error'
})
</script>

<template>
  <div
    class="relative inline-flex shrink-0 items-center justify-center"
    :style="{ width: `${props.size}px`, height: `${props.size}px` }"
    role="img"
    :aria-label="`${props.label}: ${props.score} out of 100`"
  >
    <svg :width="props.size" :height="props.size" class="-rotate-90">
      <circle
        :cx="props.size / 2"
        :cy="props.size / 2"
        :r="radius"
        fill="none"
        class="stroke-(--ui-border)"
        stroke-width="4"
      />
      <circle
        :cx="props.size / 2"
        :cy="props.size / 2"
        :r="radius"
        fill="none"
        stroke="currentColor"
        :class="tone"
        stroke-width="4"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="circumference * (1 - Math.min(100, Math.max(0, props.score)) / 100)"
      />
    </svg>
    <span class="absolute text-xs font-semibold text-highlighted tabular-nums">{{ Math.round(props.score) }}</span>
  </div>
</template>

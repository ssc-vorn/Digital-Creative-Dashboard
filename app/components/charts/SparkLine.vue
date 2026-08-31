<script setup lang="ts">
import type { TrendPoint } from '~/types'

const props = withDefaults(defineProps<{
  data: TrendPoint[]
  color?: string
  width?: number
  height?: number
}>(), {
  color: 'var(--ui-primary)',
  width: 96,
  height: 28
})

const path = computed(() => {
  const points = props.data
  if (points.length < 2) return ''
  const values = points.map(p => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pad = 2
  return points
    .map((p, i) => {
      const x = pad + (i / (points.length - 1)) * (props.width - pad * 2)
      const y = pad + (1 - (p.value - min) / range) * (props.height - pad * 2)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
})

const lastPoint = computed(() => {
  const match = path.value.match(/L?([\d.]+),([\d.]+)$/)
  return match ? { x: Number(match[1]), y: Number(match[2]) } : null
})
</script>

<template>
  <svg
    :width="props.width"
    :height="props.height"
    :viewBox="`0 0 ${props.width} ${props.height}`"
    fill="none"
    aria-hidden="true"
    class="shrink-0"
  >
    <path :d="path" :stroke="props.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <circle v-if="lastPoint" :cx="lastPoint.x" :cy="lastPoint.y" r="3" :fill="props.color" class="stroke-default" stroke-width="2" :style="{ stroke: 'var(--ui-bg)' }" />
  </svg>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import type { TrendPoint } from '~/types'

const props = withDefaults(defineProps<{
  data: TrendPoint[]
  label: string
  color?: string
  height?: number
  formatValue?: (value: number) => string
}>(), {
  color: 'var(--viz-1)',
  height: 220,
  formatValue: (value: number) => formatCompact(value)
})

const container = ref<HTMLElement | null>(null)
const { width } = useElementSize(container)

const PAD = { top: 12, right: 12, bottom: 24, left: 40 }

const maxValue = computed(() => {
  const max = Math.max(...props.data.map(p => p.value), 1)
  const magnitude = 10 ** Math.floor(Math.log10(max))
  return Math.ceil(max / magnitude) * magnitude
})

const bars = computed(() => {
  const w = width.value || 600
  const innerW = w - PAD.left - PAD.right
  const innerH = props.height - PAD.top - PAD.bottom
  const slot = innerW / Math.max(1, props.data.length)
  // Thin marks: cap thickness at 24px, keep a ≥2px surface gap between bars.
  const barW = Math.min(24, Math.max(3, slot - 2))
  return props.data.map((p, i) => {
    const h = (p.value / maxValue.value) * innerH
    return {
      point: p,
      x: PAD.left + i * slot + (slot - barW) / 2,
      y: PAD.top + innerH - h,
      w: barW,
      h: Math.max(h, p.value > 0 ? 2 : 0)
    }
  })
})

const ticks = computed(() =>
  [0, 0.5, 1].map(t => ({
    value: Math.round(maxValue.value * t),
    y: PAD.top + (1 - t) * (props.height - PAD.top - PAD.bottom)
  }))
)

const hover = ref<number | null>(null)
const hovered = computed(() => (hover.value === null ? null : bars.value[hover.value] ?? null))
</script>

<template>
  <div ref="container" class="relative w-full" :style="{ height: `${props.height}px` }">
    <svg
      v-if="width > 0 && props.data.length > 0"
      :width="width"
      :height="props.height"
      :viewBox="`0 0 ${width} ${props.height}`"
      role="img"
      :aria-label="`${props.label}: bar chart`"
      class="block"
      @mouseleave="hover = null"
    >
      <g v-for="tick in ticks" :key="tick.value">
        <line :x1="PAD.left" :x2="width - PAD.right" :y1="tick.y" :y2="tick.y" class="stroke-(--ui-border)" stroke-width="1" />
        <text :x="PAD.left - 8" :y="tick.y + 3" text-anchor="end" class="fill-(--ui-text-dimmed) text-[10px] tabular-nums">
          {{ formatCompact(tick.value) }}
        </text>
      </g>

      <!-- rounded data-end, square baseline -->
      <path
        v-for="(bar, i) in bars"
        :key="bar.point.date"
        :d="`M${bar.x},${bar.y + bar.h} V${bar.y + 4} Q${bar.x},${bar.y} ${bar.x + 4},${bar.y} H${bar.x + bar.w - 4} Q${bar.x + bar.w},${bar.y} ${bar.x + bar.w},${bar.y + 4} V${bar.y + bar.h} Z`"
        :fill="props.color"
        :opacity="hover === null || hover === i ? 1 : 0.45"
        @mouseenter="hover = i"
      />
    </svg>

    <div
      v-if="hovered"
      class="pointer-events-none absolute z-10 -translate-x-1/2 rounded-md border border-default bg-default px-2.5 py-1.5 shadow-sm"
      :style="{ left: `${hovered.x + hovered.w / 2}px`, top: `${Math.max(0, hovered.y - 52)}px` }"
    >
      <p class="text-[11px] text-muted">{{ formatDate(hovered.point.date) }}</p>
      <p class="text-xs font-semibold text-highlighted tabular-nums">{{ props.formatValue(hovered.point.value) }}</p>
    </div>
  </div>
</template>

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

const PAD = { top: 12, right: 12, bottom: 24, left: 44 }

const bounds = computed(() => {
  const values = props.data.map(p => p.value)
  const max = Math.max(...values, 1)
  // Round the top tick up to a clean number.
  const magnitude = 10 ** Math.floor(Math.log10(max))
  const top = Math.ceil(max / magnitude) * magnitude
  return { min: 0, max: top }
})

function xAt(index: number, w: number): number {
  if (props.data.length < 2) return PAD.left
  return PAD.left + (index / (props.data.length - 1)) * (w - PAD.left - PAD.right)
}

function yAt(value: number): number {
  const { min, max } = bounds.value
  const h = props.height
  return PAD.top + (1 - (value - min) / (max - min || 1)) * (h - PAD.top - PAD.bottom)
}

const linePath = computed(() => {
  const w = width.value || 600
  return props.data.map((p, i) => `${i === 0 ? 'M' : 'L'}${xAt(i, w).toFixed(1)},${yAt(p.value).toFixed(1)}`).join(' ')
})

const areaPath = computed(() => {
  const w = width.value || 600
  if (props.data.length < 2) return ''
  const baseline = props.height - PAD.bottom
  return `${linePath.value} L${xAt(props.data.length - 1, w).toFixed(1)},${baseline} L${PAD.left},${baseline} Z`
})

const ticks = computed(() => {
  const { max } = bounds.value
  return [0, 0.25, 0.5, 0.75, 1].map(t => ({ value: Math.round(max * t), y: yAt(max * t) }))
})

const xLabels = computed(() => {
  const points = props.data
  if (points.length === 0) return []
  const w = width.value || 600
  const count = Math.max(2, Math.min(6, Math.floor(w / 120)))
  const step = Math.max(1, Math.floor((points.length - 1) / (count - 1)))
  const labels: { x: number, label: string }[] = []
  for (let i = 0; i < points.length; i += step) {
    const date = new Date(`${points[i]!.date}T00:00:00`)
    labels.push({ x: xAt(i, w), label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) })
  }
  return labels
})

const hover = ref<{ index: number, x: number, y: number } | null>(null)

function onMove(event: MouseEvent) {
  const w = width.value || 600
  const rect = (event.currentTarget as SVGElement).getBoundingClientRect()
  const mx = event.clientX - rect.left
  const inner = w - PAD.left - PAD.right
  const ratio = Math.min(1, Math.max(0, (mx - PAD.left) / (inner || 1)))
  const index = Math.round(ratio * (props.data.length - 1))
  const point = props.data[index]
  if (point) hover.value = { index, x: xAt(index, w), y: yAt(point.value) }
}

const hoverPoint = computed(() => (hover.value ? props.data[hover.value.index] : null))
</script>

<template>
  <div ref="container" class="relative w-full" :style="{ height: `${props.height}px` }">
    <svg
      v-if="width > 0 && props.data.length > 1"
      :width="width"
      :height="props.height"
      :viewBox="`0 0 ${width} ${props.height}`"
      role="img"
      :aria-label="`${props.label}: line chart, latest value ${props.formatValue(props.data[props.data.length - 1]?.value ?? 0)}`"
      class="block"
      @mousemove="onMove"
      @mouseleave="hover = null"
    >
      <!-- hairline gridlines + clean ticks -->
      <g v-for="tick in ticks" :key="tick.value">
        <line :x1="PAD.left" :x2="width - PAD.right" :y1="tick.y" :y2="tick.y" class="stroke-(--ui-border)" stroke-width="1" />
        <text :x="PAD.left - 8" :y="tick.y + 3" text-anchor="end" class="fill-(--ui-text-dimmed) text-[10px] tabular-nums">
          {{ formatCompact(tick.value) }}
        </text>
      </g>

      <text
        v-for="xl in xLabels"
        :key="xl.x"
        :x="xl.x"
        :y="props.height - 6"
        text-anchor="middle"
        class="fill-(--ui-text-dimmed) text-[10px]"
      >{{ xl.label }}</text>

      <path :d="areaPath" :fill="props.color" opacity="0.1" />
      <path :d="linePath" fill="none" :stroke="props.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />

      <template v-if="hover">
        <line :x1="hover.x" :x2="hover.x" :y1="PAD.top" :y2="props.height - PAD.bottom" class="stroke-(--ui-border-accented)" stroke-width="1" />
        <circle :cx="hover.x" :cy="hover.y" r="4" :fill="props.color" stroke-width="2" :style="{ stroke: 'var(--ui-bg)' }" />
      </template>
    </svg>

    <div
      v-if="hover && hoverPoint"
      class="pointer-events-none absolute z-10 -translate-x-1/2 rounded-md border border-default bg-default px-2.5 py-1.5 shadow-sm"
      :style="{ left: `${hover.x}px`, top: `${Math.max(0, hover.y - 52)}px` }"
    >
      <p class="text-[11px] text-muted">{{ formatDate(hoverPoint.date) }}</p>
      <p class="text-xs font-semibold text-highlighted tabular-nums">{{ props.formatValue(hoverPoint.value) }}</p>
    </div>
  </div>
</template>

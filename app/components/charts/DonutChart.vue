<script setup lang="ts">
export interface DonutSlice {
  label: string
  value: number
}

const props = withDefaults(defineProps<{
  data: DonutSlice[]
  label: string
  size?: number
  formatValue?: (value: number) => string
}>(), {
  size: 168,
  formatValue: (value: number) => formatCompact(value)
})

const SERIES = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)', 'var(--viz-5)']

const total = computed(() => props.data.reduce((sum, d) => sum + d.value, 0))

const segments = computed(() => {
  const r = props.size / 2 - 6
  const c = props.size / 2
  const circumference = 2 * Math.PI * r
  let offset = 0
  return props.data.slice(0, SERIES.length).map((slice, i) => {
    const fraction = total.value > 0 ? slice.value / total.value : 0
    const seg = {
      ...slice,
      color: SERIES[i]!,
      share: fraction * 100,
      // 2px surface gap between touching segments
      dasharray: `${Math.max(0, fraction * circumference - 2)} ${circumference - Math.max(0, fraction * circumference - 2)}`,
      dashoffset: -offset,
      r,
      c
    }
    offset += fraction * circumference
    return seg
  })
})

const hover = ref<number | null>(null)
</script>

<template>
  <div class="flex flex-wrap items-center gap-6">
    <div class="relative" :style="{ width: `${props.size}px`, height: `${props.size}px` }">
      <svg
        :width="props.size"
        :height="props.size"
        :viewBox="`0 0 ${props.size} ${props.size}`"
        role="img"
        :aria-label="`${props.label}: donut chart with ${props.data.length} segments`"
        class="-rotate-90"
        @mouseleave="hover = null"
      >
        <circle
          v-for="(seg, i) in segments"
          :key="seg.label"
          :cx="seg.c"
          :cy="seg.c"
          :r="seg.r"
          fill="none"
          :stroke="seg.color"
          stroke-width="11"
          :stroke-dasharray="seg.dasharray"
          :stroke-dashoffset="seg.dashoffset"
          :opacity="hover === null || hover === i ? 1 : 0.35"
          class="transition-opacity"
          @mouseenter="hover = i"
        />
      </svg>
      <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <template v-if="hover !== null && segments[hover]">
          <p class="text-lg font-semibold text-highlighted tabular-nums">{{ formatPercent(segments[hover]!.share, 0) }}</p>
          <p class="max-w-[70%] truncate text-xs text-muted">{{ segments[hover]!.label }}</p>
        </template>
        <template v-else>
          <p class="text-lg font-semibold text-highlighted tabular-nums">{{ props.formatValue(total) }}</p>
          <p class="text-xs text-muted">Total</p>
        </template>
      </div>
    </div>

    <!-- Legend with values: identity never rides on color alone -->
    <ul class="min-w-36 flex-1 space-y-2" role="list">
      <li
        v-for="(seg, i) in segments"
        :key="seg.label"
        class="flex items-center gap-2 text-sm"
        @mouseenter="hover = i"
        @mouseleave="hover = null"
      >
        <span class="size-2.5 shrink-0 rounded-full" :style="{ backgroundColor: seg.color }" aria-hidden="true" />
        <span class="min-w-0 flex-1 truncate text-default">{{ seg.label }}</span>
        <span class="text-muted tabular-nums">{{ formatPercent(seg.share, 0) }}</span>
      </li>
    </ul>
  </div>
</template>

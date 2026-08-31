<script setup lang="ts">
import type { FunnelStage } from '~/types'

const props = defineProps<{
  data: FunnelStage[]
}>()

const rows = computed(() => {
  const max = props.data[0]?.value || 1
  return props.data.map((stage, i) => {
    const previous = i === 0 ? stage.value : props.data[i - 1]!.value
    return {
      ...stage,
      share: (stage.value / max) * 100,
      conversion: previous > 0 ? (stage.value / previous) * 100 : 0,
      dropOff: i === 0 ? null : 100 - (previous > 0 ? (stage.value / previous) * 100 : 0)
    }
  })
})
</script>

<template>
  <!-- Magnitude in one hue; values directly labeled on every row -->
  <ol class="space-y-3" role="list" aria-label="Conversion funnel">
    <li v-for="(row, i) in rows" :key="row.label">
      <div class="mb-1 flex items-baseline justify-between gap-2 text-sm">
        <span class="text-default">{{ row.label }}</span>
        <span class="flex items-baseline gap-2">
          <span class="font-semibold text-highlighted tabular-nums">{{ formatNumber(row.value) }}</span>
          <span v-if="i > 0" class="text-xs text-muted tabular-nums">{{ formatPercent(row.conversion, 1) }} · −{{ formatPercent(row.dropOff ?? 0, 1) }} drop</span>
        </span>
      </div>
      <div class="h-3 w-full rounded-full bg-elevated" role="presentation">
        <div
          class="h-3 rounded-full bg-primary transition-[width] duration-300"
          :style="{ width: `${Math.max(row.share, 1.5)}%` }"
        />
      </div>
    </li>
  </ol>
</template>

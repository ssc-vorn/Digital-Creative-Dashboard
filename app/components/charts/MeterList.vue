<script setup lang="ts">
export interface MeterRow {
  label: string
  value: number
  /** 0–100 share of the bar */
  share: number
}

const props = withDefaults(defineProps<{
  rows: MeterRow[]
  formatValue?: (value: number) => string
}>(), {
  formatValue: (value: number) => formatCompact(value)
})
</script>

<template>
  <!-- Horizontal magnitude list: one hue, labels + values always visible -->
  <ul class="space-y-3" role="list">
    <li v-for="row in props.rows" :key="row.label">
      <div class="mb-1 flex items-baseline justify-between gap-2 text-sm">
        <span class="min-w-0 truncate text-default">{{ row.label }}</span>
        <span class="shrink-0 text-muted tabular-nums">{{ props.formatValue(row.value) }}</span>
      </div>
      <div class="h-1.5 w-full rounded-full bg-elevated">
        <div class="h-1.5 rounded-full bg-primary" :style="{ width: `${Math.min(100, Math.max(row.share, 1))}%` }" />
      </div>
    </li>
  </ul>
</template>

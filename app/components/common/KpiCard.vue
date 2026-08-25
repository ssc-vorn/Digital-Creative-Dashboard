<script setup lang="ts">
import type { KpiMetric } from '~/types'

const props = defineProps<{ metric: KpiMetric }>()

const change = computed(() => percentChange(props.metric.value, props.metric.previous))

const displayValue = computed(() => {
  if (props.metric.unit === 'percent') return formatPercent(props.metric.value)
  if (props.metric.unit === 'currency') return formatCurrency(props.metric.value)
  return formatNumber(props.metric.value)
})

const direction = computed(() => (change.value > 0.05 ? 'up' : change.value < -0.05 ? 'down' : 'flat'))
</script>

<template>
  <UCard :ui="{ body: 'p-4 sm:p-4' }">
    <p class="type-overline">{{ props.metric.label }}</p>
    <div class="mt-2 flex items-end justify-between gap-3">
      <div>
        <p class="text-2xl font-semibold text-highlighted">{{ displayValue }}</p>
        <p class="mt-1 flex items-center gap-1 text-xs" :class="direction === 'up' ? 'text-success' : direction === 'down' ? 'text-error' : 'text-muted'">
          <UIcon
            :name="direction === 'up' ? 'i-lucide-trending-up' : direction === 'down' ? 'i-lucide-trending-down' : 'i-lucide-minus'"
            class="size-3.5"
          />
          <span class="tabular-nums">{{ change >= 0 ? '+' : '' }}{{ change.toFixed(1) }}%</span>
          <span class="text-dimmed">vs last period</span>
        </p>
      </div>
      <ChartsSparkLine :data="props.metric.trend" class="text-primary" color="currentColor" />
    </div>
  </UCard>
</template>

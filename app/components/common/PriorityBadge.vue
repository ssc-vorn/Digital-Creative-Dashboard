<script setup lang="ts">
import type { Priority } from '~/types'

const props = defineProps<{ priority: Priority }>()

const MAP: Record<Priority, { label: string, color: 'neutral' | 'info' | 'warning' | 'error', icon: string }> = {
  low: { label: 'Low', color: 'neutral', icon: 'i-lucide-arrow-down' },
  medium: { label: 'Medium', color: 'info', icon: 'i-lucide-equal' },
  high: { label: 'High', color: 'warning', icon: 'i-lucide-arrow-up' },
  urgent: { label: 'Urgent', color: 'error', icon: 'i-lucide-flame' }
}
</script>

<template>
  <UBadge :color="MAP[props.priority].color" variant="subtle" size="sm" :icon="MAP[props.priority].icon">
    {{ MAP[props.priority].label }}
  </UBadge>
</template>

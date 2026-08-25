<script setup lang="ts">
import { useDashboardStore } from '~/stores/dashboard'

const props = defineProps<{
  widgetKey: string
  title: string
  description?: string
}>()

const store = useDashboardStore()
const collapsed = computed(() => store.isCollapsed(props.widgetKey))
</script>

<template>
  <UCard :ui="{ header: 'py-3 sm:px-4', body: collapsed ? 'hidden' : 'sm:p-4' }">
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <div class="min-w-0">
          <h2 class="truncate type-h4">{{ props.title }}</h2>
          <p v-if="props.description && !collapsed" class="mt-0.5 truncate text-xs text-muted">{{ props.description }}</p>
        </div>
        <div class="flex shrink-0 items-center gap-0.5 text-dimmed">
          <UButton
            icon="i-lucide-chevron-up"
            size="xs"
            color="neutral"
            variant="ghost"
            aria-label="Move widget up"
            @click="store.move(props.widgetKey, -1)"
          />
          <UButton
            icon="i-lucide-chevron-down"
            size="xs"
            color="neutral"
            variant="ghost"
            aria-label="Move widget down"
            @click="store.move(props.widgetKey, 1)"
          />
          <UButton
            :icon="collapsed ? 'i-lucide-maximize-2' : 'i-lucide-minimize-2'"
            size="xs"
            color="neutral"
            variant="ghost"
            :aria-label="collapsed ? 'Expand widget' : 'Collapse widget'"
            @click="store.toggleCollapse(props.widgetKey)"
          />
          <UButton
            icon="i-lucide-x"
            size="xs"
            color="neutral"
            variant="ghost"
            aria-label="Remove widget"
            @click="store.remove(props.widgetKey)"
          />
        </div>
      </div>
    </template>

    <slot />
  </UCard>
</template>

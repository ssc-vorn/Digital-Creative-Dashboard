<script setup lang="ts">
import type { ActivityEvent, ActivityEventType } from '~/types'

withDefaults(defineProps<{
  events: ActivityEvent[]
  status?: 'idle' | 'loading' | 'loaded' | 'error'
  emptyTitle?: string
  emptyDescription?: string
}>(), {
  status: 'loaded',
  emptyTitle: 'No activity yet',
  emptyDescription: 'Actions taken on this item will appear here.'
})

defineEmits<{ retry: [] }>()

const ICON: Record<ActivityEventType, string> = {
  'created': 'i-lucide-sparkles',
  'updated': 'i-lucide-pen-line',
  'published': 'i-lucide-send',
  'archived': 'i-lucide-archive',
  'trashed': 'i-lucide-trash-2',
  'restored': 'i-lucide-history',
  'commented': 'i-lucide-message-square',
  'approved': 'i-lucide-badge-check',
  'rejected': 'i-lucide-circle-x',
  'assigned': 'i-lucide-user-check',
  'status-changed': 'i-lucide-git-commit-horizontal'
}
</script>

<template>
  <div v-if="status === 'loading'" class="space-y-4 p-4">
    <USkeleton v-for="i in 4" :key="i" class="h-10 w-full" />
  </div>

  <CommonErrorState v-else-if="status === 'error'" class="p-4" @retry="$emit('retry')" />

  <UEmpty
    v-else-if="events.length === 0"
    icon="i-lucide-activity"
    :title="emptyTitle"
    :description="emptyDescription"
    variant="naked"
    class="py-8"
  />

  <ol v-else role="list" class="relative space-y-5 before:absolute before:inset-y-1 before:left-[15px] before:w-px before:bg-border">
    <li v-for="event in events" :key="event.id" class="relative flex gap-3">
      <span class="z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-default bg-default">
        <UIcon :name="ICON[event.type] ?? 'i-lucide-circle'" class="size-3.5 text-muted" />
      </span>
      <div class="min-w-0 pt-1">
        <p class="text-sm text-default">
          <span class="font-medium text-highlighted">{{ event.actor }}</span> {{ event.summary }}
        </p>
        <p v-if="event.meta" class="mt-0.5 text-xs text-muted">{{ event.meta }}</p>
        <p class="text-xs text-dimmed">{{ relativeTime(event.date) }}</p>
      </div>
    </li>
  </ol>
</template>

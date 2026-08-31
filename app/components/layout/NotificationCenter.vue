<script setup lang="ts">
import type { NotificationCategory } from '~/types'
import { useNotificationsStore } from '~/stores/notifications'

const store = useNotificationsStore()

const filterOptions: { label: string, value: 'all' | 'unread' | NotificationCategory }[] = [
  { label: 'All', value: 'all' },
  { label: 'Unread', value: 'unread' },
  { label: 'Leads', value: 'leads' },
  { label: 'Projects', value: 'projects' },
  { label: 'Content', value: 'content' },
  { label: 'Team', value: 'team' },
  { label: 'System', value: 'system' },
  { label: 'Security', value: 'security' }
]

watch(() => store.panelOpen, (open) => {
  if (open) store.load()
})

function openNotification(id: string, link: string | null) {
  store.markRead(id)
  if (link) {
    store.panelOpen = false
    navigateTo(link)
  }
}
</script>

<template>
  <USlideover
    v-model:open="store.panelOpen"
    title="Notifications"
    :description="store.unreadCount > 0 ? `${store.unreadCount} unread` : 'You’re all caught up'"
    :ui="{ body: 'p-0 sm:p-0' }"
  >
    <template #body>
      <div class="flex flex-wrap gap-1.5 border-b border-default p-4">
        <UButton
          v-for="option in filterOptions"
          :key="option.value"
          :label="option.label"
          size="xs"
          :color="store.filter === option.value ? 'primary' : 'neutral'"
          :variant="store.filter === option.value ? 'soft' : 'ghost'"
          @click="store.filter = option.value"
        />
      </div>

      <div v-if="store.status === 'loading'" class="space-y-4 p-4">
        <div v-for="i in 6" :key="i" class="flex gap-3">
          <USkeleton class="size-8 rounded-full" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-3 w-2/3" />
            <USkeleton class="h-3 w-full" />
          </div>
        </div>
      </div>

      <div v-else-if="store.status === 'error'" class="p-8 text-center">
        <p class="type-body">Couldn’t load notifications.</p>
        <UButton label="Retry" variant="soft" color="neutral" size="sm" class="mt-3" @click="store.status = 'idle'; store.load()" />
      </div>

      <UEmpty
        v-else-if="store.filtered.length === 0"
        icon="i-lucide-bell-off"
        title="Nothing here"
        description="Notifications matching this filter will appear here."
        class="py-16"
      />

      <ul v-else role="list" class="divide-y divide-default">
        <li v-for="notification in store.filtered" :key="notification.id">
          <div
            class="group relative flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-elevated/50"
          >
            <span class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-elevated">
              <UIcon :name="notification.icon" class="size-4 text-default" />
            </span>
            <button
              type="button"
              class="min-w-0 flex-1 text-left focus-visible:outline-primary"
              @click="openNotification(notification.id, notification.link)"
            >
              <p class="flex items-center gap-2 text-sm font-medium text-highlighted">
                <span class="truncate">{{ notification.title }}</span>
                <span v-if="!notification.read" class="size-1.5 shrink-0 rounded-full bg-primary" aria-label="Unread" />
              </p>
              <p class="mt-0.5 line-clamp-2 text-xs text-muted">{{ notification.body }}</p>
              <p class="mt-1 text-xs text-dimmed">{{ relativeTime(notification.date) }}</p>
            </button>
            <div class="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <UTooltip v-if="!notification.read" text="Mark read">
                <UButton
                  icon="i-lucide-check"
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  aria-label="Mark as read"
                  @click="store.markRead(notification.id)"
                />
              </UTooltip>
              <UTooltip text="Delete">
                <UButton
                  icon="i-lucide-x"
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  aria-label="Delete notification"
                  @click="store.remove(notification.id)"
                />
              </UTooltip>
            </div>
          </div>
        </li>
      </ul>
    </template>

    <template #footer>
      <UButton
        label="Mark all as read"
        color="neutral"
        variant="soft"
        block
        :disabled="store.unreadCount === 0"
        @click="store.markAllRead()"
      />
    </template>
  </USlideover>
</template>

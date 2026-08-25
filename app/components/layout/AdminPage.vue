<script setup lang="ts">
import { useNotificationsStore } from '~/stores/notifications'
import { useUiStore } from '~/stores/ui'
import { useBreadcrumbs } from '~/composables/useNavigation'

const props = defineProps<{
  title: string
  description?: string
  /** Hide the auto breadcrumb (e.g. on the dashboard). */
  noBreadcrumb?: boolean
}>()

const notifications = useNotificationsStore()
const ui = useUiStore()
const colorMode = useColorMode()
const breadcrumbs = useBreadcrumbs()

useHead({ title: props.title })

const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (value) => { colorMode.preference = value ? 'dark' : 'light' }
})
</script>

<template>
  <UDashboardPanel :id="`panel-${title.toLowerCase().replace(/\s+/g, '-')}`">
    <template #header>
      <UDashboardNavbar :title="props.title" :ui="{ title: 'font-semibold' }">
        <template #trailing>
          <span v-if="ui.realtimeConnected" class="ms-2 inline-flex items-center gap-1.5 rounded-full bg-elevated px-2 py-0.5 text-[11px] font-medium text-muted">
            <span class="relative flex size-1.5">
              <span class="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75 motion-reduce:animate-none" />
              <span class="relative inline-flex size-1.5 rounded-full bg-success" />
            </span>
            Live
          </span>
        </template>

        <template #right>
          <slot name="actions" />

          <USeparator orientation="vertical" class="mx-1 hidden h-5 sm:block" />

          <ClientOnly>
            <UTooltip :text="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
              <UButton
                :icon="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
                color="neutral"
                variant="ghost"
                :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
                @click="isDark = !isDark"
              />
            </UTooltip>
            <template #fallback>
              <UButton icon="i-lucide-moon" color="neutral" variant="ghost" aria-label="Toggle color mode" />
            </template>
          </ClientOnly>

          <UTooltip text="Notifications" :kbds="['N']">
            <UChip :show="notifications.unreadCount > 0" :text="notifications.unreadCount > 9 ? '9+' : String(notifications.unreadCount)" size="2xl" color="error">
              <UButton
                icon="i-lucide-bell"
                color="neutral"
                variant="ghost"
                aria-label="Open notifications"
                @click="notifications.panelOpen = true"
              />
            </UChip>
          </UTooltip>
        </template>
      </UDashboardNavbar>

      <slot name="toolbar" />
    </template>

    <template #body>
      <UBreadcrumb
        v-if="!props.noBreadcrumb && breadcrumbs.length > 1"
        :items="breadcrumbs"
        class="mb-4"
        :ui="{ link: 'text-xs', separatorIcon: 'size-3.5' }"
      />
      <slot />
    </template>
  </UDashboardPanel>
</template>

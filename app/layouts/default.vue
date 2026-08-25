<script setup lang="ts">
import { useNotificationsStore } from '~/stores/notifications'
import { useMockRealtime } from '~/composables/useMockRealtime'

const notifications = useNotificationsStore()
const realtime = useMockRealtime()
const shortcutsOpen = ref(false)

onMounted(() => {
  notifications.load()
  realtime.connect()
})

defineShortcuts({
  n: () => { notifications.panelOpen = !notifications.panelOpen },
  '?': () => { shortcutsOpen.value = true }
})
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <LayoutMaintenanceBanner />
    <LayoutOfflineBanner />

    <UDashboardGroup unit="rem" class="min-h-0 flex-1">
      <LayoutAppSidebar />
      <LayoutAppSearch />
      <LayoutNotificationCenter />

      <slot />
    </UDashboardGroup>

    <LayoutShortcutsHelpModal v-model:open="shortcutsOpen" />
  </div>
</template>

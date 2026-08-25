<script setup lang="ts">
import { useNotificationsStore } from '~/stores/notifications'
import { useMockRealtime } from '~/composables/useMockRealtime'

const notifications = useNotificationsStore()
const realtime = useMockRealtime()

onMounted(() => {
  notifications.load()
  realtime.connect()
})

defineShortcuts({
  n: () => { notifications.panelOpen = !notifications.panelOpen }
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <LayoutAppSidebar />
    <LayoutAppSearch />
    <LayoutNotificationCenter />

    <slot />
  </UDashboardGroup>
</template>

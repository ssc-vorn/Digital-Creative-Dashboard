<script setup lang="ts">
import { useOnline } from '@vueuse/core'

const online = useOnline()
const justReconnected = ref(false)
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

watch(online, (isOnline, wasOnline) => {
  if (isOnline && wasOnline === false) {
    justReconnected.value = true
    if (reconnectTimer) clearTimeout(reconnectTimer)
    reconnectTimer = setTimeout(() => { justReconnected.value = false }, 4000)
  }
})

onBeforeUnmount(() => { if (reconnectTimer) clearTimeout(reconnectTimer) })
</script>

<template>
  <Transition name="fade">
    <div
      v-if="!online"
      class="flex items-center justify-center gap-2 bg-warning/15 px-4 py-1.5 text-center text-xs font-medium text-warning"
      role="status"
    >
      <UIcon name="i-lucide-cloud-off" class="size-3.5" />
      You’re offline — changes are kept locally and will sync once reconnected.
    </div>
    <div
      v-else-if="justReconnected"
      class="flex items-center justify-center gap-2 bg-success/15 px-4 py-1.5 text-center text-xs font-medium text-success"
      role="status"
    >
      <UIcon name="i-lucide-cloud-check" class="size-3.5" />
      Connection restored.
    </div>
  </Transition>
</template>

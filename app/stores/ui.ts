import { defineStore } from 'pinia'

/** Global UI chrome state: sidebar, search, live indicator. */
export const useUiStore = defineStore('ui', () => {
  const sidebarCollapsed = ref(false)
  const searchOpen = ref(false)
  const realtimeConnected = ref(false)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return { sidebarCollapsed, searchOpen, realtimeConnected, toggleSidebar }
})

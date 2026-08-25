import { defineStore } from 'pinia'

/** Maintenance-mode state. Session-only (frontend phase) — a real deploy would read this from the backend. */
export const useSystemStore = defineStore('system', () => {
  const maintenanceEnabled = ref(false)
  const maintenanceMessage = ref('We’re making scheduled improvements. The studio site will be back shortly.')
  const maintenanceScheduledFor = ref<string | null>(null)
  const allowAdminAccess = ref(true)

  return { maintenanceEnabled, maintenanceMessage, maintenanceScheduledFor, allowAdminAccess }
})

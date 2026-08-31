import { defineStore } from 'pinia'
import type { PermissionKey } from '~/types'

/**
 * Global application state: the signed-in admin and their permission
 * snapshot. Auth is mocked in Phase 1 — the shape mirrors what the Laravel
 * session endpoint will return later, so only this store changes then.
 *
 * NOTE: permission checks here shape the UX only; real authorization is
 * enforced server-side once the backend exists.
 */
export const useAppStore = defineStore('app', () => {
  const currentUser = ref({
    id: 'usr_05',
    name: 'Amara Diallo',
    email: 'amara.diallo@northshore.studio',
    role: 'Admin',
    initials: 'AD',
    avatarColor: '#6366f1'
  })

  const workspace = ref({
    name: 'Northshore Studio',
    plan: 'Studio',
    initials: 'NS'
  })

  const permissions = ref<PermissionKey[]>([
    'view', 'create', 'edit', 'publish', 'manage-users', 'manage-settings', 'manage-analytics'
  ])

  function can(permission: PermissionKey): boolean {
    return permissions.value.includes(permission)
  }

  /** Demo helper: lets the Settings screen preview restricted-role UX. */
  function setPermissions(next: PermissionKey[]) {
    permissions.value = next
  }

  const greeting = computed(() => {
    const hour = new Date().getHours()
    if (hour < 5) return 'Working late'
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  })

  return { currentUser, workspace, permissions, can, setPermissions, greeting }
})

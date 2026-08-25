<script setup lang="ts">
import type { PermissionKey, Role } from '~/types'
import { roleRepository } from '~/repositories/platform'
import { useAppStore } from '~/stores/app'

const app = useAppStore()

const { data: roles, status, load } = useResource<Role[]>(() => roleRepository.list())

const PERMISSIONS: { key: PermissionKey, label: string, description: string }[] = [
  { key: 'view', label: 'View', description: 'Read access to all content and data' },
  { key: 'create', label: 'Create', description: 'Create new content, leads and tasks' },
  { key: 'edit', label: 'Edit', description: 'Modify existing content' },
  { key: 'delete', label: 'Delete', description: 'Permanently remove content' },
  { key: 'publish', label: 'Publish', description: 'Approve and publish content' },
  { key: 'manage-users', label: 'Manage users', description: 'Invite, suspend and edit users' },
  { key: 'manage-settings', label: 'Manage settings', description: 'Change workspace configuration' },
  { key: 'manage-analytics', label: 'Manage analytics', description: 'View and export analytics' }
]

const update = useMutation(
  (payload: { role: Role, permission: PermissionKey, granted: boolean }) => {
    const permissions = payload.granted
      ? [...payload.role.permissions, payload.permission]
      : payload.role.permissions.filter(p => p !== payload.permission)
    return roleRepository.update(payload.role.id, { permissions })
  },
  { success: 'Permissions updated', onSuccess: () => load() }
)
</script>

<template>
  <LayoutAdminPage title="Roles & Permissions">
    <div class="mx-auto w-full max-w-7xl space-y-4">
      <UAlert
        icon="i-lucide-info"
        color="info"
        variant="subtle"
        title="UX simulation only"
        description="This matrix shapes what the interface shows. Real authorization is enforced by the backend once connected — never trust the frontend."
      />

      <div v-if="status === 'loading' || status === 'idle'" class="space-y-3">
        <USkeleton v-for="i in 6" :key="i" class="h-12 w-full" />
      </div>
      <CommonErrorState v-else-if="status === 'error'" @retry="load" />

      <div v-else-if="roles" class="overflow-hidden rounded-lg border border-default">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[56rem] text-sm">
            <thead>
              <tr class="border-b border-default bg-elevated/40 text-left">
                <th scope="col" class="px-4 py-3 text-xs font-medium text-muted">Role</th>
                <th
                  v-for="permission in PERMISSIONS"
                  :key="permission.key"
                  scope="col"
                  class="px-2 py-3 text-center text-xs font-medium text-muted"
                >
                  <UTooltip :text="permission.description">
                    <span class="cursor-help underline decoration-dotted underline-offset-2">{{ permission.label }}</span>
                  </UTooltip>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="role in roles" :key="role.id" class="border-b border-default last:border-0 hover:bg-elevated/30">
                <td class="px-4 py-3">
                  <p class="flex items-center gap-2 font-medium text-highlighted">
                    {{ role.name }}
                    <UBadge v-if="role.system" color="neutral" variant="soft" size="sm">System</UBadge>
                  </p>
                  <p class="mt-0.5 max-w-64 text-xs text-muted">{{ role.description }} · {{ role.usersCount }} {{ role.usersCount === 1 ? 'user' : 'users' }}</p>
                </td>
                <td v-for="permission in PERMISSIONS" :key="permission.key" class="px-2 py-3 text-center">
                  <UCheckbox
                    :model-value="role.permissions.includes(permission.key)"
                    :disabled="role.system || !app.can('manage-users') || update.saving.value"
                    :aria-label="`${permission.label} for ${role.name}`"
                    class="inline-flex"
                    @update:model-value="(v: boolean | 'indeterminate') => update.run({ role, permission: permission.key, granted: v === true })"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </LayoutAdminPage>
</template>

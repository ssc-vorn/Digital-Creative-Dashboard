<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Role, User } from '~/types'
import { roleRepository, userRepository } from '~/repositories/platform'
import { useAppStore } from '~/stores/app'

const app = useAppStore()
const typedConfirm = useTypedConfirm()
const toast = useToast()

const collection = useCollection<User>(query => userRepository.list(query), {
  pageSize: 10,
  sortBy: 'name',
  sortDir: 'asc'
})

const roles = ref<Role[]>([])
onMounted(async () => {
  try {
    roles.value = await roleRepository.list()
  } catch { /* role filter stays empty */ }
})

const columns = [
  { key: 'name', label: 'User', sortable: true },
  { key: 'roleName', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'twoFactorEnabled', label: '2FA', hide: 'lg' as const },
  { key: 'lastActiveAt', label: 'Last active', sortable: true, hide: 'md' as const }
]

/* -------------------------------- Invite --------------------------------- */

const inviteOpen = ref(false)
const inviteState = reactive({ name: '', email: '', roleId: 'role_editor' })

const invite = useMutation(
  () => {
    const role = roles.value.find(r => r.id === inviteState.roleId)
    return userRepository.create({ name: inviteState.name, email: inviteState.email, roleId: inviteState.roleId, roleName: role?.name ?? 'Editor' })
  },
  { success: 'Invitation sent', onSuccess: () => { inviteOpen.value = false; collection.reload() } }
)

/* -------------------------------- Actions -------------------------------- */

const activate = useMutation((id: string) => userRepository.activate(id), { success: 'User activated', onSuccess: () => collection.reload() })
const deactivate = useMutation((id: string) => userRepository.deactivate(id), { success: 'User deactivated', onSuccess: () => collection.reload() })
const unlock = useMutation((id: string) => userRepository.unlock(id), { success: 'User unlocked', onSuccess: () => collection.reload() })

async function confirmSuspend(user: User) {
  const result = await typedConfirm({
    title: 'Suspend user',
    description: `${user.name} will immediately lose access to the workspace until reactivated.`,
    itemLabel: user.name,
    itemType: 'User',
    confirmPhrase: 'SUSPEND USER',
    confirmLabel: 'Suspend User',
    requireReason: true,
    reasonPlaceholder: 'Why is this account being suspended?',
    showReauthPlaceholder: true
  })
  if (!result?.confirmed) return
  await userRepository.suspend(user.id)
  toast.add({ title: 'User suspended', description: `${user.name} — ${result.reason || 'no reason given'}`, color: 'success', icon: 'i-lucide-check' })
  collection.reload()
}

/** Context-aware actions — never show every action at once, only what this status allows. */
function rowActions(user: User): DropdownMenuItem[][] {
  const lifecycle: DropdownMenuItem[] = []
  if (user.status === 'invited' || user.status === 'pending') {
    lifecycle.push({ label: 'Resend invite', icon: 'i-lucide-mail-plus', onSelect: () => toast.add({ title: `Invite resent to ${user.email} (mock)`, icon: 'i-lucide-mail', color: 'success' }) })
  }
  if (user.status === 'active') {
    lifecycle.push({ label: 'Suspend', icon: 'i-lucide-user-x', color: 'error' as const, onSelect: () => confirmSuspend(user) })
    lifecycle.push({ label: 'Deactivate', icon: 'i-lucide-user-minus', onSelect: () => deactivate.run(user.id) })
  }
  if (user.status === 'suspended' || user.status === 'deactivated') {
    lifecycle.push({ label: 'Activate', icon: 'i-lucide-user-check', onSelect: () => activate.run(user.id) })
  }
  if (user.status === 'locked') {
    lifecycle.push({ label: 'Unlock account', icon: 'i-lucide-lock-open', onSelect: () => unlock.run(user.id) })
  }

  return [
    [
      { label: 'Edit role', icon: 'i-lucide-shield-check', to: '/admin/access/roles' },
      { label: 'Reset password', icon: 'i-lucide-key-round', onSelect: () => toast.add({ title: `Password reset email sent to ${user.email} (mock)`, icon: 'i-lucide-mail', color: 'success' }) },
      { label: 'Revoke sessions', icon: 'i-lucide-monitor-x', onSelect: () => toast.add({ title: `All sessions revoked for ${user.name} (mock)`, icon: 'i-lucide-check', color: 'success' }) }
    ],
    lifecycle
  ]
}
</script>

<template>
  <LayoutAdminPage title="Users">
    <template #actions>
      <UButton v-if="app.can('manage-users')" label="Invite user" icon="i-lucide-mail-plus" @click="inviteOpen = true" />
    </template>

    <div class="mx-auto w-full max-w-6xl space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <UInput v-model="collection.search.value" icon="i-lucide-search" placeholder="Search users…" class="w-full sm:w-64" />
        <USelect v-model="collection.filters.roleName" :items="roles.map(r => r.name)" placeholder="Role" class="w-44" />
        <USelect v-model="collection.filters.status" :items="['invited', 'pending', 'active', 'suspended', 'deactivated', 'locked']" placeholder="Status" class="w-36" />
        <UButton v-if="collection.isFiltered.value" label="Clear" size="sm" color="neutral" variant="ghost" icon="i-lucide-x" @click="collection.clearFilters()" />
      </div>

      <CommonDataTable
        v-model:page="collection.page.value"
        :columns="columns"
        :rows="collection.items.value"
        :status="collection.status.value"
        :error="collection.error.value"
        :total="collection.total.value"
        :page-size="collection.pageSize.value"
        :sort-by="collection.sortBy.value"
        :sort-dir="collection.sortDir.value"
        exportable
        export-name="users"
        empty-icon="i-lucide-users"
        empty-title="No users found"
        @sort="collection.toggleSort"
        @retry="collection.reload"
      >
        <template #cell-name="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar :text="row.initials" size="sm" :style="{ backgroundColor: row.avatarColor, color: 'white' }" />
            <div class="min-w-0">
              <p class="truncate font-medium text-highlighted">{{ row.name }}</p>
              <p class="truncate text-xs text-muted">{{ row.email }}</p>
            </div>
          </div>
        </template>
        <template #cell-roleName="{ row }">
          <UBadge color="neutral" variant="outline" size="sm">{{ row.roleName }}</UBadge>
        </template>
        <template #cell-status="{ row }">
          <CommonStatusBadge :status="row.status" />
        </template>
        <template #cell-twoFactorEnabled="{ row }">
          <UIcon
            :name="row.twoFactorEnabled ? 'i-lucide-shield-check' : 'i-lucide-shield-off'"
            class="size-4"
            :class="row.twoFactorEnabled ? 'text-success' : 'text-dimmed'"
            :aria-label="row.twoFactorEnabled ? '2FA enabled' : '2FA disabled'"
          />
        </template>
        <template #cell-lastActiveAt="{ row }">
          <span class="text-muted">{{ row.lastActiveAt ? relativeTime(row.lastActiveAt) : 'Never signed in' }}</span>
        </template>
        <template #actions="{ row }">
          <CommonRowActionsMenu v-if="app.can('manage-users')" :items="rowActions(row)" />
        </template>
      </CommonDataTable>
    </div>

    <UModal v-model:open="inviteOpen" title="Invite user" description="They’ll receive an email with a link to join the workspace.">
      <template #body>
        <form class="space-y-4" @submit.prevent="inviteState.email && invite.run()">
          <UFormField label="Full name" required>
            <UInput v-model="inviteState.name" class="w-full" autofocus />
          </UFormField>
          <UFormField label="Email" required>
            <UInput v-model="inviteState.email" type="email" class="w-full" />
          </UFormField>
          <UFormField label="Role">
            <USelectMenu
              v-model="inviteState.roleId"
              :items="roles.map(r => ({ label: r.name, value: r.id }))"
              value-key="value"
              class="w-full"
            />
          </UFormField>
        </form>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="ghost" @click="inviteOpen = false" />
          <UButton label="Send invite" icon="i-lucide-mail-plus" :loading="invite.saving.value" :disabled="!inviteState.name || !inviteState.email" @click="invite.run()" />
        </div>
      </template>
    </UModal>
  </LayoutAdminPage>
</template>

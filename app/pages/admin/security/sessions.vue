<script setup lang="ts">
import type { ActiveSession } from '~/types'
import { securityRepository } from '~/repositories/platform'

const confirm = useConfirm()
const { data: sessions, status, load } = useResource<ActiveSession[]>(() => securityRepository.sessions())

const revoke = useMutation(
  (id: string) => securityRepository.revokeSession(id),
  {
    success: 'Session revoked',
    onSuccess: () => load()
  }
)

async function confirmRevoke(session: ActiveSession) {
  const ok = await confirm({
    title: `Revoke session for ${session.userName}?`,
    description: `${session.device} in ${session.location} will be signed out immediately.`,
    confirmLabel: 'Revoke session',
    danger: true
  })
  if (ok) revoke.run(session.id)
}
</script>

<template>
  <LayoutAdminPage title="Sessions">
    <div class="mx-auto w-full max-w-5xl space-y-4">
      <p class="type-body text-muted">Devices currently signed in across the workspace.</p>

      <div v-if="status === 'loading' || status === 'idle'" class="space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-18 w-full" />
      </div>
      <CommonErrorState v-else-if="status === 'error'" @retry="load" />

      <ul v-else role="list" class="divide-y divide-default overflow-hidden rounded-lg border border-default">
        <li v-for="session in sessions" :key="session.id" class="flex flex-wrap items-center gap-3 px-4 py-3.5">
          <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-elevated">
            <UIcon :name="session.device.includes('iPhone') || session.device.includes('Pixel') ? 'i-lucide-smartphone' : session.device.includes('iPad') ? 'i-lucide-tablet' : 'i-lucide-laptop'" class="size-5 text-muted" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="flex flex-wrap items-center gap-2 text-sm font-medium text-highlighted">
              {{ session.userName }}
              <UBadge v-if="session.current" color="primary" variant="soft" size="sm">This device</UBadge>
            </p>
            <p class="truncate text-xs text-muted">{{ session.device }} · {{ session.browser }} · {{ session.location }} · <code>{{ session.ip }}</code></p>
          </div>
          <span class="text-xs text-dimmed">{{ relativeTime(session.lastSeenAt) }}</span>
          <UButton
            v-if="!session.current"
            label="Revoke"
            size="xs"
            color="error"
            variant="soft"
            :loading="revoke.saving.value"
            @click="confirmRevoke(session)"
          />
        </li>
      </ul>
    </div>
  </LayoutAdminPage>
</template>

<script setup lang="ts">
import type { SecurityEvent, User } from '~/types'
import { securityRepository, userRepository } from '~/repositories/platform'

const { data, status, load } = useResource<{ events: SecurityEvent[], users: User[] }>(async () => {
  const [events, users] = await Promise.all([
    securityRepository.events(),
    userRepository.list({ pageSize: 100 })
  ])
  return { events, users: users.items }
})

const securityScore = computed(() => {
  if (!data.value) return 0
  const users = data.value.users
  const twoFaShare = users.length ? users.filter(u => u.twoFactorEnabled).length / users.length : 0
  const unresolved = data.value.events.filter(e => !e.resolved && e.severity !== 'info').length
  return Math.max(0, Math.min(100, Math.round(55 + twoFaShare * 40 - unresolved * 8)))
})

const twoFaCount = computed(() => data.value?.users.filter(u => u.twoFactorEnabled).length ?? 0)

const SEVERITY: Record<SecurityEvent['severity'], { color: 'error' | 'warning' | 'info', icon: string }> = {
  critical: { color: 'error', icon: 'i-lucide-shield-alert' },
  warning: { color: 'warning', icon: 'i-lucide-triangle-alert' },
  info: { color: 'info', icon: 'i-lucide-info' }
}
</script>

<template>
  <LayoutAdminPage title="Security Center">
    <div class="mx-auto w-full max-w-6xl space-y-6">
      <div v-if="status === 'loading' || status === 'idle'" class="space-y-4">
        <USkeleton class="h-32 w-full" />
        <USkeleton class="h-64 w-full" />
      </div>
      <CommonErrorState v-else-if="status === 'error'" @retry="load" />

      <template v-else-if="data">
        <!-- Overview cards -->
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <UCard :ui="{ body: 'flex items-center gap-4 p-4 sm:p-4' }">
            <CommonScoreRing :score="securityScore" :size="64" label="Security score" />
            <div>
              <p class="type-overline">Security score</p>
              <p class="text-xl font-semibold text-highlighted tabular-nums">{{ securityScore }}/100</p>
            </div>
          </UCard>
          <UCard :ui="{ body: 'p-4 sm:p-4' }">
            <p class="type-overline">2FA adoption</p>
            <p class="mt-1.5 text-xl font-semibold text-highlighted tabular-nums">{{ twoFaCount }}/{{ data.users.length }}</p>
            <p class="mt-0.5 text-xs text-muted">users with two-factor enabled</p>
          </UCard>
          <UCard :ui="{ body: 'p-4 sm:p-4' }">
            <p class="type-overline">Open alerts</p>
            <p class="mt-1.5 text-xl font-semibold tabular-nums" :class="data.events.some(e => !e.resolved && e.severity === 'critical') ? 'text-error' : 'text-highlighted'">
              {{ data.events.filter(e => !e.resolved).length }}
            </p>
            <p class="mt-0.5 text-xs text-muted">needing attention</p>
          </UCard>
          <UCard :ui="{ body: 'p-4 sm:p-4' }">
            <p class="type-overline">Quick links</p>
            <div class="mt-2 flex flex-col gap-1">
              <UButton label="Active sessions" variant="link" size="xs" class="justify-start p-0" to="/admin/security/sessions" />
              <UButton label="Login activity" variant="link" size="xs" class="justify-start p-0" to="/admin/security/login-activity" />
              <UButton label="Audit logs" variant="link" size="xs" class="justify-start p-0" to="/admin/security/audit-logs" />
            </div>
          </UCard>
        </div>

        <!-- Events -->
        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <template #header>
            <h2 class="type-h3">Security events</h2>
          </template>
          <ul role="list" class="divide-y divide-default">
            <li v-for="event in data.events" :key="event.id" class="flex items-start gap-3 px-4 py-3">
              <UIcon :name="SEVERITY[event.severity].icon" class="mt-0.5 size-4 shrink-0" :class="`text-${SEVERITY[event.severity].color}`" />
              <div class="min-w-0 flex-1">
                <p class="flex flex-wrap items-center gap-2 text-sm font-medium text-highlighted">
                  {{ event.title }}
                  <UBadge :color="SEVERITY[event.severity].color" variant="subtle" size="sm" class="capitalize">{{ event.severity }}</UBadge>
                  <UBadge v-if="event.resolved" color="neutral" variant="soft" size="sm">Resolved</UBadge>
                </p>
                <p class="mt-0.5 text-xs text-muted">{{ event.detail }}</p>
              </div>
              <span class="shrink-0 text-xs text-dimmed">{{ relativeTime(event.date) }}</span>
            </li>
          </ul>
        </UCard>
      </template>
    </div>
  </LayoutAdminPage>
</template>

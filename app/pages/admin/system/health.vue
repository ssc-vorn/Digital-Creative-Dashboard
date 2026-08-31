<script setup lang="ts">
import type { SystemService } from '~/types'
import { systemHealthRepository } from '~/repositories/platform'

const { data: services, status, load } = useResource<SystemService[]>(() => systemHealthRepository.services())

const overall = computed(() => {
  const list = services.value ?? []
  if (list.some(s => s.status === 'offline')) return { label: 'Partial outage', status: 'offline' }
  if (list.some(s => s.status === 'warning' || s.status === 'degraded')) return { label: 'Degraded performance', status: 'warning' }
  return { label: 'All systems operational', status: 'operational' }
})

const HISTORY_CLASS: Record<string, string> = {
  operational: 'bg-success',
  degraded: 'bg-warning',
  warning: 'bg-warning',
  offline: 'bg-error'
}

const lastPageLoad = ref(new Date().toISOString())
</script>

<template>
  <LayoutAdminPage title="System Health">
    <template #actions>
      <p class="hidden items-center gap-2 text-xs text-muted sm:flex">
        Updated {{ relativeTime(lastPageLoad) }}
        <UButton label="Refresh" size="xs" color="neutral" variant="ghost" icon="i-lucide-refresh-cw" @click="load(); lastPageLoad = new Date().toISOString()" />
      </p>
    </template>

    <div class="mx-auto w-full max-w-4xl space-y-4">
      <div v-if="status === 'loading' || status === 'idle'" class="space-y-3">
        <USkeleton class="h-16 w-full" />
        <USkeleton v-for="i in 7" :key="i" class="h-20 w-full" />
      </div>
      <CommonErrorState v-else-if="status === 'error'" @retry="load" />

      <template v-else-if="services">
        <UAlert
          :color="overall.status === 'operational' ? 'success' : overall.status === 'warning' ? 'warning' : 'error'"
          variant="subtle"
          :icon="overall.status === 'operational' ? 'i-lucide-circle-check' : 'i-lucide-triangle-alert'"
          :title="overall.label"
          description="Status is simulated in the frontend phase and refreshes with the mock realtime feed."
        />

        <div class="space-y-3">
          <UCard v-for="service in services" :key="service.id" :ui="{ body: 'space-y-3' }">
            <div class="flex flex-wrap items-center gap-3">
              <div class="min-w-0 flex-1">
                <h2 class="font-medium text-highlighted">{{ service.name }}</h2>
                <p class="text-xs text-muted">{{ service.description }}</p>
              </div>
              <div class="flex items-center gap-4 text-sm">
                <span class="text-muted tabular-nums">{{ service.uptime }}% uptime</span>
                <span class="text-muted tabular-nums">{{ service.latencyMs }}ms p95</span>
                <CommonStatusBadge :status="service.status" />
              </div>
            </div>
            <div class="flex gap-0.5" role="img" :aria-label="`${service.name} status over the last 24 hours`">
              <span
                v-for="(h, i) in service.history"
                :key="i"
                class="h-6 flex-1 rounded-sm"
                :class="HISTORY_CLASS[h]"
                :title="`${24 - i}h ago: ${h}`"
              />
            </div>
            <p class="text-[11px] text-dimmed">Last 24 hours, hourly · checked {{ relativeTime(service.lastCheckedAt) }}</p>
          </UCard>
        </div>
      </template>
    </div>
  </LayoutAdminPage>
</template>

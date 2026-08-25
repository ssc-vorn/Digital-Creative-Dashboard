<script setup lang="ts">
import type { Lead } from '~/types'
import { leadRepository } from '~/repositories/crm'

const { data: overview, status: overviewStatus, load: loadOverview } = useAnalyticsOverview()

const { data: leads, status: leadsStatus, load: loadLeads } = useResource<Lead[]>(async () => {
  const result = await leadRepository.list({ pageSize: 100 })
  return result.items
})

const byService = computed(() => {
  const counts = new Map<string, number>()
  for (const lead of leads.value ?? []) counts.set(lead.service, (counts.get(lead.service) ?? 0) + 1)
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1])
  const max = rows[0]?.[1] ?? 1
  return rows.map(([label, value]) => ({ label, value, share: (value / max) * 100 }))
})

const bySource = computed(() => {
  const counts = new Map<string, number>()
  for (const lead of leads.value ?? []) counts.set(lead.source, (counts.get(lead.source) ?? 0) + 1)
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1])
  const max = rows[0]?.[1] ?? 1
  return rows.map(([label, value]) => ({ label, value, share: (value / max) * 100 }))
})

const stats = computed(() => {
  const list = leads.value ?? []
  const won = list.filter(l => l.stage === 'won').length
  const hot = list.filter(l => l.score >= 75).length
  const avg = list.length ? Math.round(list.reduce((sum, l) => sum + l.score, 0) / list.length) : 0
  return [
    { label: 'Total leads', value: String(list.length) },
    { label: 'Hot leads (75+)', value: String(hot) },
    { label: 'Won', value: String(won) },
    { label: 'Avg. score', value: String(avg) }
  ]
})
</script>

<template>
  <LayoutAdminPage title="Lead Analytics">
    <div class="mx-auto w-full max-w-7xl space-y-6">
      <div v-if="leadsStatus === 'loading' || leadsStatus === 'idle'" class="space-y-6">
        <USkeleton class="h-24 w-full" />
        <USkeleton class="h-64 w-full" />
      </div>
      <CommonErrorState v-else-if="leadsStatus === 'error'" @retry="loadLeads" />

      <template v-else>
        <div class="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <UCard v-for="stat in stats" :key="stat.label" :ui="{ body: 'p-4 sm:p-4' }">
            <p class="type-overline">{{ stat.label }}</p>
            <p class="mt-1.5 text-xl font-semibold text-highlighted tabular-nums">{{ stat.value }}</p>
          </UCard>
        </div>

        <UCard v-if="overviewStatus === 'loaded' && overview">
          <template #header>
            <h2 class="type-h3">New leads per day — last 90 days</h2>
          </template>
          <ChartsBarChart :data="overview.leads" label="New leads" :height="240" />
        </UCard>
        <CommonErrorState v-else-if="overviewStatus === 'error'" @retry="loadOverview(true)" />

        <div class="grid gap-6 lg:grid-cols-2">
          <UCard>
            <template #header>
              <h2 class="type-h3">Leads by service</h2>
            </template>
            <ChartsMeterList :rows="byService" :format-value="v => String(v)" />
          </UCard>
          <UCard>
            <template #header>
              <h2 class="type-h3">Leads by source</h2>
            </template>
            <ChartsMeterList :rows="bySource" :format-value="v => String(v)" />
          </UCard>
        </div>
      </template>
    </div>
  </LayoutAdminPage>
</template>

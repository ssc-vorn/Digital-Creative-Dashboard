<script setup lang="ts">
const { data, status, load } = useAnalyticsOverview()

const metrics = computed(() => {
  if (!data.value) return []
  const visitors = data.value.kpis.find(k => k.key === 'visitors')?.value ?? 0
  return [
    { label: 'Visitors', value: formatCompact(visitors) },
    { label: 'Sessions', value: formatCompact(Math.round(visitors * 1.34)) },
    { label: 'Page views', value: formatCompact(Math.round(visitors * 3.1)) },
    { label: 'Engagement', value: '61%' },
    { label: 'Bounce rate', value: '38%' },
    { label: 'Avg. time', value: '2m 41s' }
  ]
})
</script>

<template>
  <LayoutAdminPage title="Website Analytics">
    <div class="mx-auto w-full max-w-7xl space-y-6">
      <div v-if="status === 'loading' || status === 'idle'" class="space-y-6">
        <USkeleton class="h-24 w-full" />
        <USkeleton class="h-72 w-full" />
      </div>
      <CommonErrorState v-else-if="status === 'error'" @retry="load(true)" />

      <template v-else-if="data">
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          <UCard v-for="metric in metrics" :key="metric.label" :ui="{ body: 'p-4 sm:p-4' }">
            <p class="type-overline">{{ metric.label }}</p>
            <p class="mt-1.5 text-xl font-semibold text-highlighted">{{ metric.value }}</p>
          </UCard>
        </div>

        <UCard>
          <template #header>
            <h2 class="type-h3">Sessions — last 90 days</h2>
          </template>
          <ChartsAreaLineChart :data="data.traffic" label="Sessions" :height="280" />
        </UCard>

        <div class="grid gap-6 lg:grid-cols-3">
          <UCard>
            <template #header>
              <h2 class="type-h3">Sources</h2>
            </template>
            <ChartsMeterList :rows="data.sources.map(s => ({ label: s.source, value: s.sessions, share: s.share }))" />
          </UCard>

          <UCard>
            <template #header>
              <h2 class="type-h3">Devices</h2>
            </template>
            <ChartsDonutChart :data="data.devices.map(d => ({ label: d.device, value: d.share }))" label="Devices" :format-value="(v: number) => `${v}%`" />
          </UCard>

          <UCard>
            <template #header>
              <h2 class="type-h3">Geography</h2>
            </template>
            <ChartsMeterList :rows="data.geo.map(g => ({ label: g.country, value: g.sessions, share: g.share * 3 }))" />
          </UCard>
        </div>
      </template>
    </div>
  </LayoutAdminPage>
</template>

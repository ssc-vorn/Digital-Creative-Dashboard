<script setup lang="ts">
const { data, status, updatedAt, load } = useAnalyticsOverview()
</script>

<template>
  <LayoutAdminPage title="Analytics Overview">
    <template #actions>
      <p v-if="updatedAt" class="flex items-center gap-1.5 text-xs text-muted">
        Updated {{ relativeTime(updatedAt) }}
        <UButton icon="i-lucide-refresh-cw" size="xs" color="neutral" variant="ghost" aria-label="Refresh analytics data" @click="load(true)" />
      </p>
    </template>

    <div class="mx-auto w-full max-w-7xl space-y-6">
      <div v-if="status === 'loading' || status === 'idle'" class="space-y-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <USkeleton v-for="i in 5" :key="i" class="h-28 w-full" />
        </div>
        <USkeleton class="h-72 w-full" />
      </div>
      <CommonErrorState v-else-if="status === 'error'" @retry="load(true)" />

      <template v-else-if="data">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <CommonKpiCard v-for="metric in data.kpis" :key="metric.key" :metric="metric" />
        </div>

        <div class="grid gap-6 lg:grid-cols-3">
          <UCard class="lg:col-span-2">
            <template #header>
              <h2 class="type-h3">Traffic — last 90 days</h2>
            </template>
            <ChartsAreaLineChart :data="data.traffic" label="Sessions" :height="260" />
          </UCard>

          <UCard>
            <template #header>
              <h2 class="type-h3">Traffic sources</h2>
            </template>
            <ChartsDonutChart :data="data.sources.map(s => ({ label: s.source, value: s.sessions }))" label="Traffic sources" />
          </UCard>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <UCard>
            <template #header>
              <h2 class="type-h3">Conversion funnel</h2>
            </template>
            <ChartsFunnelChart :data="data.funnel" />
          </UCard>

          <UCard>
            <template #header>
              <h2 class="type-h3">Top content</h2>
            </template>
            <ol class="divide-y divide-default" role="list">
              <li v-for="(item, i) in data.topContent.slice(0, 6)" :key="item.id" class="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <span class="w-5 text-center text-xs text-dimmed tabular-nums">{{ i + 1 }}</span>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm text-default">{{ item.title }}</p>
                  <p class="text-xs text-dimmed">{{ item.type }}</p>
                </div>
                <span class="text-sm text-muted tabular-nums">{{ formatCompact(item.views) }} views</span>
              </li>
            </ol>
          </UCard>
        </div>
      </template>
    </div>
  </LayoutAdminPage>
</template>

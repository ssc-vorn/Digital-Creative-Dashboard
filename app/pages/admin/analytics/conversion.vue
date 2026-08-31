<script setup lang="ts">
const { data, status, load } = useAnalyticsOverview()

const dropOffs = computed(() => {
  const funnel = data.value?.funnel ?? []
  return funnel.slice(1).map((stage, i) => {
    const previous = funnel[i]!
    const rate = previous.value > 0 ? (stage.value / previous.value) * 100 : 0
    return {
      from: previous.label,
      to: stage.label,
      rate,
      lost: previous.value - stage.value
    }
  })
})
</script>

<template>
  <LayoutAdminPage title="Conversion">
    <div class="mx-auto w-full max-w-6xl space-y-6">
      <div v-if="status === 'loading' || status === 'idle'" class="space-y-6">
        <USkeleton class="h-72 w-full" />
      </div>
      <CommonErrorState v-else-if="status === 'error'" @retry="load(true)" />

      <template v-else-if="data">
        <UCard>
          <template #header>
            <div>
              <h2 class="type-h3">Visitor → won funnel</h2>
              <p class="type-body-sm mt-0.5">End-to-end conversion across the last 90 days.</p>
            </div>
          </template>
          <ChartsFunnelChart :data="data.funnel" />
        </UCard>

        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <template #header>
            <h2 class="type-h3">Step-by-step drop-off</h2>
          </template>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-default text-left text-xs font-medium text-muted">
                  <th scope="col" class="px-4 py-2.5">Transition</th>
                  <th scope="col" class="px-4 py-2.5 text-right">Conversion</th>
                  <th scope="col" class="px-4 py-2.5 text-right">Lost</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="step in dropOffs" :key="step.to" class="border-b border-default last:border-0">
                  <td class="px-4 py-3 text-default">{{ step.from }} → {{ step.to }}</td>
                  <td class="px-4 py-3 text-right font-medium tabular-nums" :class="step.rate >= 30 ? 'text-success' : step.rate >= 10 ? 'text-warning' : 'text-error'">
                    {{ formatPercent(step.rate, 1) }}
                  </td>
                  <td class="px-4 py-3 text-right text-muted tabular-nums">−{{ formatNumber(step.lost) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </template>
    </div>
  </LayoutAdminPage>
</template>

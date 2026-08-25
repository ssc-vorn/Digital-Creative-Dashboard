<script setup lang="ts">
const stats = [
  { label: 'Subscribers', value: '4,812', change: '+3.2%' },
  { label: 'Avg. open rate', value: '46.8%', change: '+1.1%' },
  { label: 'Avg. click rate', value: '7.4%', change: '−0.3%' },
  { label: 'Unsubscribe rate', value: '0.4%', change: '±0.0%' }
]

const issues = [
  { id: 'nl_48', subject: '#48 — The quiet power of motion design', status: 'draft', sentAt: null, opens: null, clicks: null },
  { id: 'nl_47', subject: '#47 — Nuxt 4 in production, honestly', status: 'published', sentAt: 'Aug 12, 2026', opens: '48.1%', clicks: '8.9%' },
  { id: 'nl_46', subject: '#46 — Designing premium empty states', status: 'published', sentAt: 'Jul 29, 2026', opens: '45.7%', clicks: '6.2%' },
  { id: 'nl_45', subject: '#45 — Inside the Meridian archive project', status: 'published', sentAt: 'Jul 15, 2026', opens: '51.3%', clicks: '9.8%' },
  { id: 'nl_44', subject: '#44 — Tokens, themes and dark mode', status: 'published', sentAt: 'Jul 1, 2026', opens: '44.2%', clicks: '7.1%' }
]

const growth = trendSeries(77, 60, 70, 18)
</script>

<template>
  <LayoutAdminPage title="Newsletter">
    <div class="mx-auto w-full max-w-6xl space-y-6">
      <div class="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <UCard v-for="stat in stats" :key="stat.label" :ui="{ body: 'p-4 sm:p-4' }">
          <p class="type-overline">{{ stat.label }}</p>
          <p class="mt-1.5 text-xl font-semibold text-highlighted tabular-nums">{{ stat.value }}</p>
          <p class="mt-0.5 text-xs text-muted tabular-nums">{{ stat.change }} vs last month</p>
        </UCard>
      </div>

      <UCard>
        <template #header>
          <h2 class="type-h3">Subscriber growth — last 60 days</h2>
        </template>
        <ChartsAreaLineChart :data="growth" label="New subscribers" :height="200" />
      </UCard>

      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="type-h3">Issues</h2>
            <UButton label="New issue" icon="i-lucide-plus" size="sm" to="/admin/blog?new=1" />
          </div>
        </template>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-default text-left text-xs font-medium text-muted">
                <th scope="col" class="px-4 py-2.5">Subject</th>
                <th scope="col" class="px-4 py-2.5">Status</th>
                <th scope="col" class="hidden px-4 py-2.5 md:table-cell">Sent</th>
                <th scope="col" class="hidden px-4 py-2.5 text-right md:table-cell">Opens</th>
                <th scope="col" class="hidden px-4 py-2.5 text-right md:table-cell">Clicks</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="issue in issues" :key="issue.id" class="border-b border-default last:border-0 hover:bg-elevated/40">
                <td class="px-4 py-3 font-medium text-highlighted">{{ issue.subject }}</td>
                <td class="px-4 py-3"><CommonStatusBadge :status="issue.status" /></td>
                <td class="hidden px-4 py-3 text-muted md:table-cell">{{ issue.sentAt ?? '—' }}</td>
                <td class="hidden px-4 py-3 text-right tabular-nums md:table-cell">{{ issue.opens ?? '—' }}</td>
                <td class="hidden px-4 py-3 text-right tabular-nums md:table-cell">{{ issue.clicks ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </div>
  </LayoutAdminPage>
</template>

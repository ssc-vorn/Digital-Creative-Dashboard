<script setup lang="ts">
const { data, status, load } = useAnalyticsOverview()

const typeFilter = ref<string | undefined>(undefined)

const rows = computed(() => {
  const items = data.value?.topContent ?? []
  return typeFilter.value ? items.filter(i => i.type === typeFilter.value) : items
})
</script>

<template>
  <LayoutAdminPage title="Content Analytics">
    <div class="mx-auto w-full max-w-7xl space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <USelect v-model="typeFilter" :items="['Project', 'Blog Post']" placeholder="All content types" class="w-44" />
        <UButton v-if="typeFilter" label="Clear" size="sm" color="neutral" variant="ghost" icon="i-lucide-x" @click="typeFilter = undefined" />
      </div>

      <div v-if="status === 'loading' || status === 'idle'" class="space-y-3">
        <USkeleton v-for="i in 8" :key="i" class="h-12 w-full" />
      </div>
      <CommonErrorState v-else-if="status === 'error'" @retry="load(true)" />

      <div v-else class="overflow-hidden rounded-lg border border-default">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-default bg-elevated/40 text-left text-xs font-medium text-muted">
                <th scope="col" class="px-3 py-2.5">Content</th>
                <th scope="col" class="px-3 py-2.5 text-right">Views</th>
                <th scope="col" class="hidden px-3 py-2.5 text-right md:table-cell">Engagement</th>
                <th scope="col" class="hidden px-3 py-2.5 text-right md:table-cell">CTR</th>
                <th scope="col" class="hidden px-3 py-2.5 text-right lg:table-cell">Conversion</th>
                <th scope="col" class="hidden px-3 py-2.5 text-right lg:table-cell">Avg. time</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in rows" :key="item.id" class="border-b border-default last:border-0 hover:bg-elevated/40">
                <td class="px-3 py-3">
                  <p class="font-medium text-highlighted">{{ item.title }}</p>
                  <p class="text-xs text-dimmed">{{ item.type }}</p>
                </td>
                <td class="px-3 py-3 text-right tabular-nums">{{ formatNumber(item.views) }}</td>
                <td class="hidden px-3 py-3 text-right tabular-nums md:table-cell">{{ item.engagement }}%</td>
                <td class="hidden px-3 py-3 text-right tabular-nums md:table-cell">{{ item.ctr }}%</td>
                <td class="hidden px-3 py-3 text-right tabular-nums lg:table-cell">{{ item.conversion }}%</td>
                <td class="hidden px-3 py-3 text-right tabular-nums lg:table-cell">{{ item.avgTime }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </LayoutAdminPage>
</template>

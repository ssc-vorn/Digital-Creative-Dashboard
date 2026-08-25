<script setup lang="ts">
import type { LoginEvent } from '~/types'
import { securityRepository } from '~/repositories/platform'

const collection = useCollection<LoginEvent>(query => securityRepository.loginHistory(query), {
  pageSize: 15,
  sortBy: 'date',
  sortDir: 'desc'
})

const columns = [
  { key: 'userName', label: 'User', sortable: true },
  { key: 'date', label: 'When', sortable: true },
  { key: 'location', label: 'Location', hide: 'md' as const },
  { key: 'device', label: 'Device', hide: 'lg' as const },
  { key: 'ip', label: 'IP', hide: 'xl' as const },
  { key: 'result', label: 'Result', sortable: true }
]
</script>

<template>
  <LayoutAdminPage title="Login Activity">
    <div class="mx-auto w-full max-w-7xl space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <UInput v-model="collection.search.value" icon="i-lucide-search" placeholder="Search user, location, IP…" class="w-full sm:w-72" />
        <USelect v-model="collection.filters.result" :items="['success', 'failure']" placeholder="Result" class="w-32" />
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
        export-name="login-activity"
        empty-icon="i-lucide-log-in"
        empty-title="No login events"
        @sort="collection.toggleSort"
        @retry="collection.reload"
      >
        <template #cell-userName="{ row }">
          <span class="font-medium text-highlighted">{{ row.userName }}</span>
        </template>
        <template #cell-date="{ row }">
          <span class="text-muted">{{ formatDateTime(row.date) }}</span>
        </template>
        <template #cell-ip="{ row }">
          <code class="text-xs text-muted">{{ row.ip }}</code>
        </template>
        <template #cell-result="{ row }">
          <CommonStatusBadge :status="row.result" />
        </template>
      </CommonDataTable>
    </div>
  </LayoutAdminPage>
</template>

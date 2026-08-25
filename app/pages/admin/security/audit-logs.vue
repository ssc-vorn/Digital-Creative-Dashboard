<script setup lang="ts">
import type { AuditLog } from '~/types'
import { auditLogRepository } from '~/repositories/platform'

const collection = useCollection<AuditLog>(query => auditLogRepository.list(query), {
  pageSize: 15,
  sortBy: 'date',
  sortDir: 'desc'
})

const columns = [
  { key: 'userName', label: 'User', sortable: true },
  { key: 'action', label: 'Action', sortable: true },
  { key: 'resourceName', label: 'Resource' },
  { key: 'date', label: 'When', sortable: true },
  { key: 'ip', label: 'IP', hide: 'lg' as const },
  { key: 'result', label: 'Result', sortable: true, hide: 'md' as const }
]
</script>

<template>
  <LayoutAdminPage title="Audit Logs">
    <div class="mx-auto w-full max-w-7xl space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <UInput v-model="collection.search.value" icon="i-lucide-search" placeholder="Search user, action, resource, IP…" class="w-full sm:w-72" />
        <USelect v-model="collection.filters.resourceType" :items="['Project', 'Blog Post', 'Lead', 'User', 'Media Asset', 'Session', 'Settings', 'Case Study', 'Analytics Report', 'Feature Flag']" placeholder="Resource" class="w-40" />
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
        export-name="audit-logs"
        empty-icon="i-lucide-scroll-text"
        empty-title="No audit entries"
        empty-description="Actions across the workspace are recorded here."
        @sort="collection.toggleSort"
        @retry="collection.reload"
      >
        <template #cell-userName="{ row }">
          <span class="font-medium text-highlighted">{{ row.userName }}</span>
        </template>
        <template #cell-resourceName="{ row }">
          <p class="text-default">{{ row.resourceName }}</p>
          <p class="text-xs text-dimmed">{{ row.resourceType }}</p>
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

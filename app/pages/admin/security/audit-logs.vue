<script setup lang="ts">
import type { AuditLog } from '~/types'
import { auditLogRepository } from '~/repositories/platform'

const collection = useCollection<AuditLog>(query => auditLogRepository.list(query), {
  pageSize: 15,
  sortBy: 'date',
  sortDir: 'desc'
})
collection.dateField.value = 'date'

const columns = [
  { key: 'userName', label: 'User', sortable: true },
  { key: 'action', label: 'Action', sortable: true },
  { key: 'resourceName', label: 'Resource' },
  { key: 'date', label: 'When', sortable: true },
  { key: 'ip', label: 'IP', hide: 'lg' as const },
  { key: 'result', label: 'Result', sortable: true, hide: 'md' as const }
]

const detail = ref<AuditLog | null>(null)
</script>

<template>
  <LayoutAdminPage title="Audit Logs">
    <div class="mx-auto w-full max-w-7xl space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <UInput v-model="collection.search.value" icon="i-lucide-search" placeholder="Search user, action, resource, IP…" class="w-full sm:w-72" />
        <USelect v-model="collection.filters.resourceType" :items="['Project', 'Blog Post', 'Lead', 'User', 'Media Asset', 'Session', 'Settings', 'Case Study', 'Analytics Report', 'Feature Flag']" placeholder="Resource" class="w-40" />
        <USelect v-model="collection.filters.result" :items="['success', 'failure']" placeholder="Result" class="w-32" />
        <UInput v-model="collection.dateFrom.value" type="date" class="w-40" aria-label="From date" />
        <span class="text-xs text-dimmed">to</span>
        <UInput v-model="collection.dateTo.value" type="date" class="w-40" aria-label="To date" />
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
          <button type="button" class="text-left font-medium text-highlighted hover:text-primary focus-visible:outline-primary" @click="detail = row">
            {{ row.userName }}
          </button>
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
        <template #actions="{ row }">
          <UButton icon="i-lucide-eye" size="xs" color="neutral" variant="ghost" :aria-label="`View details for ${row.action} ${row.resourceName}`" @click="detail = row" />
        </template>
      </CommonDataTable>
    </div>

    <USlideover :open="Boolean(detail)" title="Audit event" description="Full detail for this action" @update:open="(v: boolean) => { if (!v) detail = null }">
      <template #body>
        <div v-if="detail" class="space-y-5">
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between gap-3"><dt class="text-muted">User</dt><dd class="text-default">{{ detail.userName }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-muted">Action</dt><dd class="text-default">{{ detail.action }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-muted">Resource</dt><dd class="text-default">{{ detail.resourceName }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-muted">Resource type</dt><dd class="text-default">{{ detail.resourceType }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-muted">When</dt><dd class="text-default">{{ formatDateTime(detail.date) }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-muted">IP address</dt><dd class="font-mono text-xs text-default">{{ detail.ip }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-muted">Device</dt><dd class="text-default">{{ detail.device }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-muted">Browser</dt><dd class="text-default">{{ detail.browser }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-muted">Result</dt><dd><CommonStatusBadge :status="detail.result" /></dd></div>
          </dl>

          <div v-if="detail.before || detail.after" class="rounded-lg border border-default p-3">
            <p class="type-label mb-2">Change</p>
            <div class="flex items-center gap-2 text-sm">
              <UBadge v-if="detail.before" color="neutral" variant="soft">{{ detail.before }}</UBadge>
              <UIcon v-if="detail.before && detail.after" name="i-lucide-arrow-right" class="size-3.5 text-dimmed" />
              <UBadge v-if="detail.after" color="primary" variant="soft">{{ detail.after }}</UBadge>
            </div>
          </div>

          <p v-if="detail.reason" class="text-sm text-default">
            <span class="text-muted">Reason: </span>{{ detail.reason }}
          </p>
        </div>
      </template>
    </USlideover>
  </LayoutAdminPage>
</template>

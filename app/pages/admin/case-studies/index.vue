<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { CaseStudy } from '~/types'
import { caseStudyRepository } from '~/repositories/content'
import { useAppStore } from '~/stores/app'

const app = useAppStore()
const confirm = useConfirm()

const collection = useCollection<CaseStudy>(query => caseStudyRepository.list(query), {
  pageSize: 10,
  sortBy: 'updatedAt',
  sortDir: 'desc'
})

const columns = [
  { key: 'title', label: 'Case study', sortable: true },
  { key: 'clientName', label: 'Client', hide: 'lg' as const },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'readingTime', label: 'Read', hide: 'lg' as const },
  { key: 'updatedAt', label: 'Updated', sortable: true, hide: 'md' as const }
]

const duplicate = useMutation((id: string) => caseStudyRepository.duplicate(id), { success: 'Case study duplicated', onSuccess: () => collection.reload() })
const publish = useMutation((id: string) => caseStudyRepository.publish(id), { success: 'Case study published', onSuccess: () => collection.reload() })
const destroy = useMutation((id: string) => caseStudyRepository.remove(id), { success: 'Case study deleted', onSuccess: () => collection.reload() })

async function confirmDelete(item: CaseStudy) {
  if (await confirm({ title: `Delete “${item.title}”?`, confirmLabel: 'Delete', danger: true })) destroy.run(item.id)
}

function rowActions(item: CaseStudy): DropdownMenuItem[][] {
  return [
    [
      { label: 'Edit story', icon: 'i-lucide-pen-line', to: `/admin/case-studies/${item.id}` },
      { label: 'Duplicate', icon: 'i-lucide-copy', onSelect: () => duplicate.run(item.id) },
      ...(app.can('publish') && item.status !== 'published' ? [{ label: 'Publish', icon: 'i-lucide-send', onSelect: () => publish.run(item.id) }] : [])
    ],
    [{ label: 'Delete', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => confirmDelete(item) }]
  ]
}
</script>

<template>
  <LayoutAdminPage title="Case Studies">
    <div class="mx-auto w-full max-w-7xl space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <UInput v-model="collection.search.value" icon="i-lucide-search" placeholder="Search case studies…" class="w-full sm:w-64" />
        <USelect v-model="collection.filters.status" :items="['draft', 'review', 'approved', 'scheduled', 'published', 'archived']" placeholder="Status" class="w-32" />
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
        export-name="case-studies"
        empty-icon="i-lucide-book-open"
        empty-title="No case studies found"
        empty-description="Turn a shipped project into an editorial story."
        @sort="collection.toggleSort"
        @retry="collection.reload"
      >
        <template #cell-title="{ row }">
          <NuxtLink :to="`/admin/case-studies/${row.id}`" class="group/link flex items-center gap-3 focus-visible:outline-primary">
            <span class="h-9 w-1.5 shrink-0 rounded-full" :style="{ backgroundColor: row.coverColor }" aria-hidden="true" />
            <span class="min-w-0">
              <span class="block truncate font-medium text-highlighted group-hover/link:text-primary">{{ row.title }}</span>
              <span class="block truncate text-xs text-muted">{{ row.blocks.filter(b => !b.hidden).length }} blocks</span>
            </span>
          </NuxtLink>
        </template>
        <template #cell-status="{ row }">
          <CommonStatusBadge :status="row.status" />
        </template>
        <template #cell-readingTime="{ row }">
          <span class="text-muted tabular-nums">{{ row.readingTime }} min</span>
        </template>
        <template #cell-updatedAt="{ row }">
          <span class="text-muted">{{ relativeTime(row.updatedAt) }}</span>
        </template>
        <template #actions="{ row }">
          <CommonRowActionsMenu :items="rowActions(row)" />
        </template>
      </CommonDataTable>
    </div>
  </LayoutAdminPage>
</template>

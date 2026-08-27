<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { CaseStudy } from '~/types'
import { makeSeo } from '~/mock-data/shared'
import { slugify } from '~/utils/format'
import { caseStudyRepository } from '~/repositories/content'
import { useAppStore } from '~/stores/app'
import { CommonDuplicateModal } from '#components'

const app = useAppStore()
const overlay = useOverlay()

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

const publish = useMutation((id: string) => caseStudyRepository.publish(id), { success: 'Case study published', onSuccess: () => collection.reload() })
const archive = useMutation((id: string) => caseStudyRepository.archive(id), { success: 'Case study archived', onSuccess: () => collection.reload() })
const restoreFromArchive = useMutation((id: string) => caseStudyRepository.update(id, { status: 'draft' }), { success: 'Restored from Archive', onSuccess: () => collection.reload() })
const { moveToTrash } = useTrashAction(caseStudyRepository, {
  resourceLabel: 'Case Study',
  itemName: c => c.title,
  onDone: () => collection.reload()
})

const duplicateModal = overlay.create(CommonDuplicateModal)
async function openDuplicate(item: CaseStudy) {
  const created = await duplicateModal.open({
    resourceLabel: 'Case Study',
    sourceTitle: item.title,
    options: [
      { key: 'content', label: 'Content', description: 'Story blocks', default: true },
      { key: 'seo', label: 'SEO', description: 'Meta title, description and social preview', default: true }
    ],
    onConfirm: (title, selected) => caseStudyRepository.create({
      ...structuredClone(toRaw(item)),
      title,
      slug: slugify(title),
      status: 'draft',
      blocks: selected.content ? item.blocks : [],
      seo: selected.seo ? { ...item.seo, slug: slugify(title) } : makeSeo(title, `case-studies/${slugify(title)}`, 35)
    } as Partial<CaseStudy>)
  }).result
  if (created) collection.reload()
}

function rowActions(item: CaseStudy): DropdownMenuItem[][] {
  return [
    [
      { label: 'Edit story', icon: 'i-lucide-pen-line', to: `/admin/case-studies/${item.id}` },
      { label: 'Duplicate', icon: 'i-lucide-copy', onSelect: () => openDuplicate(item) },
      ...(app.can('publish') && item.status !== 'published' ? [{ label: 'Publish', icon: 'i-lucide-send', onSelect: () => publish.run(item.id) }] : [])
    ],
    [
      ...(item.status === 'archived'
        ? [{ label: 'Restore from Archive', icon: 'i-lucide-archive-restore', onSelect: () => restoreFromArchive.run(item.id) }]
        : [{ label: 'Archive', icon: 'i-lucide-archive', onSelect: () => archive.run(item.id) }]),
      { label: 'Move to Trash', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => moveToTrash(item) }
    ]
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

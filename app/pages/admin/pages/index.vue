<script setup lang="ts">
import type { SitePage } from '~/types'
import { slugify } from '~/utils/format'
import { makeSeo } from '~/mock-data/shared'
import { pageRepository } from '~/repositories/content'
import { CommonDuplicateModal } from '#components'

const overlay = useOverlay()

const collection = useCollection<SitePage>(query => pageRepository.list(query), {
  pageSize: 10,
  sortBy: 'updatedAt',
  sortDir: 'desc'
})

const columns = [
  { key: 'title', label: 'Page', sortable: true },
  { key: 'slug', label: 'Path', hide: 'md' as const },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'updatedAt', label: 'Updated', sortable: true, hide: 'md' as const }
]

const publish = useMutation((id: string) => pageRepository.publish(id), { success: 'Page published', onSuccess: () => collection.reload() })
const archive = useMutation((id: string) => pageRepository.archive(id), { success: 'Page archived', onSuccess: () => collection.reload() })
const restoreFromArchive = useMutation((id: string) => pageRepository.update(id, { status: 'draft' }), { success: 'Restored from Archive', onSuccess: () => collection.reload() })
const { moveToTrash } = useTrashAction(pageRepository, {
  resourceLabel: 'Page',
  itemName: p => p.title,
  onDone: () => collection.reload()
})

const duplicateModal = overlay.create(CommonDuplicateModal)
async function openDuplicate(page: SitePage) {
  const created = await duplicateModal.open({
    resourceLabel: 'Page',
    sourceTitle: page.title,
    options: [
      { key: 'blocks', label: 'Blocks', description: 'Page builder content', default: true },
      { key: 'seo', label: 'SEO', description: 'Meta title, description and social preview', default: true }
    ],
    onConfirm: (title, selected) => pageRepository.create({
      ...structuredClone(toRaw(page)),
      title,
      slug: slugify(title),
      status: 'draft',
      blocks: selected.blocks ? page.blocks : [],
      seo: selected.seo ? { ...page.seo, slug: slugify(title) } : makeSeo(title, slugify(title), 35)
    } as Partial<SitePage>)
  }).result
  if (created) collection.reload()
}
</script>

<template>
  <LayoutAdminPage title="Pages">
    <div class="mx-auto w-full max-w-7xl space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <UInput v-model="collection.search.value" icon="i-lucide-search" placeholder="Search pages…" class="w-full sm:w-64" />
        <USelect v-model="collection.filters.status" :items="['draft', 'review', 'published', 'archived']" placeholder="Status" class="w-32" />
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
        empty-icon="i-lucide-panels-top-left"
        empty-title="No pages found"
        @sort="collection.toggleSort"
        @retry="collection.reload"
      >
        <template #cell-title="{ row }">
          <NuxtLink :to="`/admin/pages/${row.id}`" class="group/link flex items-center gap-2 font-medium text-highlighted focus-visible:outline-primary">
            <UIcon name="i-lucide-panels-top-left" class="size-4 text-muted" />
            <span class="truncate group-hover/link:text-primary">{{ row.title }}</span>
          </NuxtLink>
        </template>
        <template #cell-slug="{ row }">
          <code class="text-xs text-muted">/{{ row.slug }}</code>
        </template>
        <template #cell-status="{ row }">
          <CommonStatusBadge :status="row.status" />
        </template>
        <template #cell-updatedAt="{ row }">
          <span class="text-muted">{{ relativeTime(row.updatedAt) }}</span>
        </template>
        <template #actions="{ row }">
          <CommonRowActionsMenu
            :items="[
              [
                { label: 'Open builder', icon: 'i-lucide-pen-line', to: `/admin/pages/${row.id}` },
                { label: 'Duplicate', icon: 'i-lucide-copy', onSelect: () => openDuplicate(row) },
                ...(row.status !== 'published' ? [{ label: 'Publish', icon: 'i-lucide-send', onSelect: () => publish.run(row.id) }] : [])
              ],
              [
                ...(row.status === 'archived'
                  ? [{ label: 'Restore from Archive', icon: 'i-lucide-archive-restore', onSelect: () => restoreFromArchive.run(row.id) }]
                  : [{ label: 'Archive', icon: 'i-lucide-archive', onSelect: () => archive.run(row.id) }]),
                { label: 'Move to Trash', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => moveToTrash(row) }
              ]
            ]"
          />
        </template>
      </CommonDataTable>
    </div>
  </LayoutAdminPage>
</template>

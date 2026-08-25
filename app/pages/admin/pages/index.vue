<script setup lang="ts">
import type { SitePage } from '~/types'
import { pageRepository } from '~/repositories/content'

const confirm = useConfirm()

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

const destroy = useMutation((id: string) => pageRepository.remove(id), { success: 'Page deleted', onSuccess: () => collection.reload() })
const publish = useMutation((id: string) => pageRepository.publish(id), { success: 'Page published', onSuccess: () => collection.reload() })
</script>

<template>
  <LayoutAdminPage title="Pages">
    <div class="mx-auto w-full max-w-7xl space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <UInput v-model="collection.search.value" icon="i-lucide-search" placeholder="Search pages…" class="w-full sm:w-64" />
        <USelect v-model="collection.filters.status" :items="['draft', 'review', 'published']" placeholder="Status" class="w-32" />
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
                ...(row.status !== 'published' ? [{ label: 'Publish', icon: 'i-lucide-send', onSelect: () => publish.run(row.id) }] : [])
              ],
              [{ label: 'Delete', icon: 'i-lucide-trash-2', color: 'error', onSelect: async () => { if (await confirm({ title: `Delete “${row.title}”?`, confirmLabel: 'Delete', danger: true })) destroy.run(row.id) } }]
            ]"
          />
        </template>
      </CommonDataTable>
    </div>
  </LayoutAdminPage>
</template>

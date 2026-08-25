<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Project } from '~/types'
import { projectRepository } from '~/repositories/projects'
import { useAppStore } from '~/stores/app'
import { ProjectsProjectCreateModal, ProjectsProjectDuplicateModal } from '#components'

const app = useAppStore()
const confirm = useConfirm()
const overlay = useOverlay()
const route = useRoute()

const view = ref<'table' | 'grid' | 'editorial'>('table')

const collection = useCollection<Project>(query => projectRepository.list(query), {
  pageSize: 10,
  sortBy: 'updatedAt',
  sortDir: 'desc'
})

const STATUS_OPTIONS = ['draft', 'review', 'approved', 'scheduled', 'published', 'archived']
const CATEGORY_OPTIONS = ['Branding', 'Web Design', 'Web Development', 'E-commerce', 'Product Design', 'Design System', 'Campaign', 'Content']
const YEAR_OPTIONS = ['2026', '2025', '2024']

const columns = [
  { key: 'title', label: 'Project', sortable: true },
  { key: 'clientName', label: 'Client', sortable: true, hide: 'lg' as const },
  { key: 'category', label: 'Category', hide: 'xl' as const },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'views', label: 'Views', sortable: true, hide: 'lg' as const, class: 'text-right' },
  { key: 'updatedAt', label: 'Updated', sortable: true, hide: 'md' as const }
]

const createModal = overlay.create(ProjectsProjectCreateModal)

async function openCreate() {
  const project = await createModal.open().result
  if (project) navigateTo(`/admin/projects/${project.id}`)
}

onMounted(() => {
  if (route.query.new) openCreate()
})

const publish = useMutation((id: string) => projectRepository.publish(id), { success: 'Project published', onSuccess: () => collection.reload() })
const archive = useMutation((id: string) => projectRepository.archive(id), { success: 'Project archived', onSuccess: () => collection.reload() })

const duplicateModal = overlay.create(ProjectsProjectDuplicateModal)
async function openDuplicate(project: Project) {
  const created = await duplicateModal.open({ source: project }).result
  if (created) collection.reload()
}
const { moveToTrash } = useTrashAction(projectRepository, {
  resourceLabel: 'Project',
  itemName: p => p.title,
  onDone: () => collection.reload()
})

async function bulkAction(action: 'publish' | 'archive', ids: string[], clear: () => void) {
  await Promise.all(ids.map(id => action === 'publish' ? projectRepository.publish(id) : projectRepository.archive(id)))
  clear()
  collection.reload()
}

async function bulkTrash(ids: string[], clear: () => void) {
  const items = collection.items.value.filter(p => ids.includes(p.id))
  const ok = await confirm({
    title: `Move ${items.length} projects to Trash?`,
    description: 'They can be restored later from Trash.',
    confirmLabel: 'Move to Trash',
    danger: true
  })
  if (!ok) return
  await Promise.all(items.map(p => projectRepository.remove(p.id)))
  clear()
  collection.reload()
}

function rowActions(project: Project): DropdownMenuItem[][] {
  return [
    [
      { label: 'Edit', icon: 'i-lucide-pen-line', to: `/admin/projects/${project.id}` },
      { label: 'Preview', icon: 'i-lucide-external-link', onSelect: () => useToast().add({ title: 'Preview opens the public site once it exists', icon: 'i-lucide-info' }) },
      { label: 'Duplicate', icon: 'i-lucide-copy', onSelect: () => openDuplicate(project) }
    ],
    [
      ...(app.can('publish') && project.status !== 'published'
        ? [{ label: 'Publish', icon: 'i-lucide-send', onSelect: () => publish.run(project.id) }]
        : []),
      ...(project.status === 'archived'
        ? [{ label: 'Restore from Archive', icon: 'i-lucide-archive-restore', onSelect: () => projectRepository.update(project.id, { status: 'draft' }).then(() => collection.reload()) }]
        : [{ label: 'Archive', icon: 'i-lucide-archive', onSelect: () => archive.run(project.id) }])
    ],
    [
      { label: 'Move to Trash', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => moveToTrash(project) }
    ]
  ]
}
</script>

<template>
  <LayoutAdminPage title="Projects">
    <template #actions>
      <UButton
        v-if="app.can('create')"
        label="New project"
        icon="i-lucide-plus"
        @click="openCreate"
      />
    </template>

    <div class="mx-auto w-full max-w-7xl space-y-4">
      <!-- Filter toolbar -->
      <div class="flex flex-wrap items-center gap-2">
        <UInput
          v-model="collection.search.value"
          icon="i-lucide-search"
          placeholder="Search projects…"
          class="w-full sm:w-64"
          :loading="collection.status.value === 'loading' && !!collection.search.value"
        />
        <USelect
          v-model="collection.filters.status"
          :items="STATUS_OPTIONS"
          placeholder="Status"
          class="w-32"
        />
        <USelect
          v-model="collection.filters.category"
          :items="CATEGORY_OPTIONS"
          placeholder="Category"
          class="w-40"
        />
        <USelect
          v-model="collection.filters.year"
          :items="YEAR_OPTIONS"
          placeholder="Year"
          class="w-28"
        />
        <UButton
          :label="collection.filters.featured === 'true' ? 'Featured ✓' : 'Featured'"
          size="sm"
          :color="collection.filters.featured === 'true' ? 'primary' : 'neutral'"
          :variant="collection.filters.featured === 'true' ? 'soft' : 'outline'"
          @click="collection.filters.featured = collection.filters.featured === 'true' ? undefined : 'true'"
        />
        <UButton
          v-if="collection.isFiltered.value"
          label="Clear"
          size="sm"
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          @click="collection.clearFilters()"
        />
        <CommonSavedViewsBar scope="projects" :collection="collection" />

        <div class="ms-auto flex items-center gap-0.5 rounded-md border border-default p-0.5">
          <UTooltip v-for="v in (['table', 'grid', 'editorial'] as const)" :key="v" :text="`${v.charAt(0).toUpperCase()}${v.slice(1)} view`">
            <UButton
              :icon="v === 'table' ? 'i-lucide-table-2' : v === 'grid' ? 'i-lucide-layout-grid' : 'i-lucide-gallery-vertical'"
              size="xs"
              :color="view === v ? 'primary' : 'neutral'"
              :variant="view === v ? 'soft' : 'ghost'"
              :aria-label="`Switch to ${v} view`"
              @click="view = v"
            />
          </UTooltip>
        </div>
      </div>

      <!-- Table view -->
      <CommonDataTable
        v-if="view === 'table'"
        v-model:page="collection.page.value"
        :columns="columns"
        :rows="collection.items.value"
        :status="collection.status.value"
        :error="collection.error.value"
        :total="collection.total.value"
        :page-size="collection.pageSize.value"
        :sort-by="collection.sortBy.value"
        :sort-dir="collection.sortDir.value"
        selectable
        exportable
        export-name="projects"
        empty-icon="i-lucide-folder-open"
        empty-title="No projects found"
        :empty-description="collection.isFiltered.value ? 'Try adjusting the search or filters.' : 'Create your first project to start building the portfolio.'"
        @sort="collection.toggleSort"
        @retry="collection.reload"
      >
        <template #cell-title="{ row }">
          <NuxtLink :to="`/admin/projects/${row.id}`" class="group/link flex items-center gap-3 focus-visible:outline-primary">
            <span class="flex size-9 shrink-0 items-center justify-center rounded-md text-white" :style="{ backgroundColor: row.coverColor }" aria-hidden="true">
              <UIcon name="i-lucide-image" class="size-4 opacity-80" />
            </span>
            <span class="min-w-0">
              <span class="block truncate font-medium text-highlighted group-hover/link:text-primary">
                {{ row.title }}
                <UIcon v-if="row.featured" name="i-lucide-star" class="ms-1 inline size-3 text-warning" aria-label="Featured" />
              </span>
              <span class="block truncate text-xs text-muted">{{ row.year }} · {{ row.industry }}</span>
            </span>
          </NuxtLink>
        </template>
        <template #cell-status="{ row }">
          <CommonStatusBadge :status="row.status" />
        </template>
        <template #cell-views="{ row }">
          <span class="block text-right text-default tabular-nums">{{ formatCompact(row.views) }}</span>
        </template>
        <template #cell-updatedAt="{ row }">
          <span class="text-muted">{{ relativeTime(row.updatedAt) }}</span>
        </template>
        <template #actions="{ row }">
          <CommonRowActionsMenu :items="rowActions(row)" />
        </template>
        <template #bulk-actions="{ selected, clear }">
          <UButton
            v-if="app.can('publish')"
            label="Publish"
            size="xs"
            variant="soft"
            @click="bulkAction('publish', selected, clear)"
          />
          <UButton
            label="Archive"
            size="xs"
            color="neutral"
            variant="soft"
            @click="bulkAction('archive', selected, clear)"
          />
          <UButton
            v-if="app.can('delete')"
            label="Move to Trash"
            size="xs"
            color="error"
            variant="soft"
            @click="bulkTrash(selected, clear)"
          />
        </template>
        <template #empty-actions>
          <UButton v-if="app.can('create') && !collection.isFiltered.value" label="New project" icon="i-lucide-plus" @click="openCreate" />
        </template>
      </CommonDataTable>

      <!-- Grid view -->
      <div v-else-if="view === 'grid'">
        <div v-if="collection.status.value === 'loading'" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <USkeleton v-for="i in 6" :key="i" class="h-56 w-full" />
        </div>
        <CommonErrorState v-else-if="collection.status.value === 'error'" :message="collection.error.value" @retry="collection.reload" />
        <UEmpty v-else-if="collection.items.value.length === 0" icon="i-lucide-folder-open" title="No projects found" class="py-16" />
        <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <UCard v-for="project in collection.items.value" :key="project.id" :ui="{ body: 'p-0 sm:p-0' }" class="group overflow-hidden">
            <NuxtLink :to="`/admin/projects/${project.id}`" class="block focus-visible:outline-primary">
              <div class="flex h-32 items-end p-4" :style="{ background: `linear-gradient(135deg, ${project.coverColor}, ${project.coverColor}99)` }">
                <span class="rounded bg-black/25 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">{{ project.category }}</span>
              </div>
              <div class="space-y-1 p-4">
                <div class="flex items-center justify-between gap-2">
                  <h3 class="truncate font-medium text-highlighted group-hover:text-primary">{{ project.title }}</h3>
                  <CommonStatusBadge :status="project.status" />
                </div>
                <p class="truncate text-xs text-muted">{{ project.clientName }} · {{ project.year }}</p>
              </div>
            </NuxtLink>
          </UCard>
        </div>
        <div v-if="collection.total.value > collection.pageSize.value" class="mt-4 flex justify-center">
          <UPagination v-model:page="collection.page.value" :total="collection.total.value" :items-per-page="collection.pageSize.value" />
        </div>
      </div>

      <!-- Editorial view -->
      <div v-else>
        <div v-if="collection.status.value === 'loading'" class="space-y-6">
          <USkeleton v-for="i in 3" :key="i" class="h-40 w-full" />
        </div>
        <CommonErrorState v-else-if="collection.status.value === 'error'" :message="collection.error.value" @retry="collection.reload" />
        <UEmpty v-else-if="collection.items.value.length === 0" icon="i-lucide-folder-open" title="No projects found" class="py-16" />
        <div v-else class="divide-y divide-default">
          <article v-for="project in collection.items.value" :key="project.id" class="group grid gap-6 py-8 first:pt-2 sm:grid-cols-[10rem_1fr]">
            <NuxtLink :to="`/admin/projects/${project.id}`" class="block h-28 rounded-lg sm:h-full" :style="{ background: `linear-gradient(135deg, ${project.coverColor}, ${project.coverColor}88)` }" :aria-label="`Edit ${project.title}`" />
            <div class="min-w-0">
              <p class="type-overline">{{ project.clientName }} · {{ project.year }}</p>
              <NuxtLink :to="`/admin/projects/${project.id}`" class="focus-visible:outline-primary">
                <h3 class="mt-1 font-display text-xl font-medium text-highlighted transition-colors group-hover:text-primary">{{ project.title }}</h3>
              </NuxtLink>
              <p class="type-body mt-2 line-clamp-2 max-w-2xl text-muted">{{ project.summary }}</p>
              <div class="mt-3 flex flex-wrap items-center gap-2">
                <CommonStatusBadge :status="project.status" />
                <UBadge v-for="service in project.services.slice(0, 3)" :key="service" color="neutral" variant="soft" size="sm">{{ service }}</UBadge>
                <span class="text-xs text-dimmed tabular-nums">{{ formatCompact(project.views) }} views</span>
              </div>
            </div>
          </article>
        </div>
        <div v-if="collection.total.value > collection.pageSize.value" class="mt-4 flex justify-center">
          <UPagination v-model:page="collection.page.value" :total="collection.total.value" :items-per-page="collection.pageSize.value" />
        </div>
      </div>
    </div>
  </LayoutAdminPage>
</template>

<script setup lang="ts">
import type { TrashedItem } from '~/types'
import { trashRepository, TRASH_RESOURCE_LABELS, type TrashTarget } from '~/repositories/trash'
import { mockConfig } from '~/repositories/support'
import { projectRepository } from '~/repositories/projects'
import { caseStudyRepository, blogRepository, pageRepository, serviceRepository } from '~/repositories/content'
import { slugify } from '~/utils/format'
import { useAppStore } from '~/stores/app'

const app = useAppStore()
const confirm = useConfirm()
const typedConfirm = useTypedConfirm()
const checkRestoreConflict = useRestoreConflict()
const toast = useToast()

const { data: items, status, error, load } = useResource<TrashedItem<unknown>[]>(() => trashRepository.list())

const typeFilter = ref<string | undefined>(undefined)
const selected = ref<string[]>([])
const detailItem = ref<TrashedItem<unknown> | null>(null)

const filtered = computed(() => {
  const list = items.value ?? []
  return typeFilter.value ? list.filter(i => i.resourceType === typeFilter.value) : list
})

const typeOptions = computed(() => Object.entries(TRASH_RESOURCE_LABELS).map(([value, label]) => ({ label, value })))

/* --------------------------- Retention helpers --------------------------- */

function daysRemaining(t: TrashedItem<unknown>): number {
  const elapsed = (Date.now() - new Date(t.trash.deletedAt).getTime()) / 86_400_000
  return Math.ceil(t.trash.retentionDays - elapsed)
}

function retentionLabel(t: TrashedItem<unknown>): string {
  if (!Number.isFinite(t.trash.retentionDays)) return 'Kept indefinitely'
  const remaining = daysRemaining(t)
  if (remaining <= 0) return 'Eligible for permanent deletion'
  if (remaining === 1) return 'Auto-delete in 1 day'
  return `Auto-delete in ${remaining} days`
}

function retentionStatus(t: TrashedItem<unknown>): string {
  if (!Number.isFinite(t.trash.retentionDays)) return 'kept-indefinitely'
  const remaining = daysRemaining(t)
  if (remaining <= 0) return 'eligible-deletion'
  if (remaining <= 3) return 'expiring-soon'
  return 'kept'
}

/* --------------------------------- Restore -------------------------------- */

/** Types that carry a slug and can therefore hit a restore conflict. */
const SLUG_REPOS: Record<string, { all: () => { id: string, slug: string }[], update: (id: string, patch: Record<string, unknown>) => Promise<unknown> }> = {
  'project': projectRepository,
  'case-study': caseStudyRepository,
  'blog-post': blogRepository,
  'page': pageRepository,
  'service': serviceRepository
}

async function restoreOne(target: TrashTarget & { itemSlug?: string }) {
  const repo = SLUG_REPOS[target.resourceType]
  const slug = (target.itemSlug ?? '').trim()

  if (repo && slug) {
    const conflict = repo.all().some(i => i.slug === slug)
    if (conflict) {
      const choice = await checkRestoreConflict(slug)
      if (!choice) return
      const restored = await trashRepository.restore(target) as { id: string } | undefined
      if (choice === 'new-slug' && restored) {
        await repo.update(restored.id, { slug: `${slugify(slug)}-${Date.now().toString(36).slice(-4)}` })
      }
      toast.add({ title: 'Item restored', color: 'success', icon: 'i-lucide-history' })
      detailItem.value = null
      load()
      return
    }
  }

  await trashRepository.restore(target)
  toast.add({ title: 'Item restored', color: 'success', icon: 'i-lucide-history' })
  detailItem.value = null
  load()
}

function slugOf(item: TrashedItem<unknown>): string | undefined {
  const value = (item.item as Record<string, unknown> | null)?.slug
  return typeof value === 'string' ? value : undefined
}

const restoring = ref(false)
async function handleRestore(item: TrashedItem<unknown>) {
  restoring.value = true
  try {
    await restoreOne({ resourceType: item.resourceType, resourceId: item.resourceId, itemSlug: slugOf(item) })
  } catch (err) {
    toast.add({ title: 'Restore failed', description: err instanceof Error ? err.message : undefined, color: 'error', icon: 'i-lucide-triangle-alert' })
  } finally {
    restoring.value = false
  }
}

async function handleBulkRestore() {
  const targets = filtered.value.filter(i => selected.value.includes(i.id))
  restoring.value = true
  try {
    for (const t of targets) await restoreOne({ resourceType: t.resourceType, resourceId: t.resourceId, itemSlug: slugOf(t) })
    selected.value = []
  } finally {
    restoring.value = false
  }
}

/* ------------------------------ Permanent delete -------------------------- */

async function handlePermanentDelete(item: TrashedItem<unknown>) {
  const result = await typedConfirm({
    title: 'Permanent delete',
    description: 'This action cannot be undone.',
    itemLabel: item.title,
    itemType: TRASH_RESOURCE_LABELS[item.resourceType] ?? item.resourceType,
    confirmPhrase: `DELETE ${(TRASH_RESOURCE_LABELS[item.resourceType] ?? item.resourceType).toUpperCase()}`,
    confirmLabel: 'Permanently Delete',
    showReauthPlaceholder: true
  })
  if (!result?.confirmed) return
  await trashRepository.permanentlyDelete({ resourceType: item.resourceType, resourceId: item.resourceId })
  toast.add({ title: 'Permanently deleted', color: 'success', icon: 'i-lucide-check' })
  detailItem.value = null
  load()
}

async function handleBulkPermanentDelete() {
  const targets = filtered.value.filter(i => selected.value.includes(i.id))
  const result = await typedConfirm({
    title: `Permanently delete ${targets.length} ${targets.length === 1 ? 'item' : 'items'}?`,
    description: 'This action cannot be undone.',
    confirmPhrase: 'DELETE ITEMS',
    confirmLabel: 'Permanently Delete',
    showReauthPlaceholder: true
  })
  if (!result?.confirmed) return
  await trashRepository.bulkPermanentDelete(targets.map(t => ({ resourceType: t.resourceType, resourceId: t.resourceId })))
  selected.value = []
  toast.add({ title: `${targets.length} items permanently deleted`, color: 'success', icon: 'i-lucide-check' })
  load()
}

async function handleEmptyTrash() {
  const total = items.value?.length ?? 0
  const result = await typedConfirm({
    title: 'Empty trash',
    description: `All ${total} items in the trash will be permanently deleted. This action cannot be undone.`,
    confirmPhrase: 'EMPTY TRASH',
    confirmLabel: 'Empty Trash',
    showReauthPlaceholder: true
  })
  if (!result?.confirmed) return
  const count = await trashRepository.emptyTrash()
  toast.add({ title: `Trash emptied — ${count} items permanently deleted`, color: 'success', icon: 'i-lucide-check' })
  load()
}

/* ---------------------------------- Table ---------------------------------- */

const columns = [
  { key: 'title', label: 'Name', sortable: false },
  { key: 'resourceType', label: 'Type', hide: 'md' as const },
  { key: 'originalLocation', label: 'Original location', hide: 'lg' as const },
  { key: 'deletedBy', label: 'Deleted by', hide: 'lg' as const },
  { key: 'deletedAt', label: 'Deleted', hide: 'md' as const },
  { key: 'retention', label: 'Retention' }
]
</script>

<template>
  <LayoutAdminPage title="Trash">
    <template #actions>
      <UButton
        v-if="app.can('delete') && (items?.length ?? 0) > 0"
        label="Empty Trash"
        icon="i-lucide-trash"
        color="error"
        variant="soft"
        @click="handleEmptyTrash"
      />
    </template>

    <div class="mx-auto w-full max-w-7xl space-y-4">
      <UAlert
        icon="i-lucide-info"
        color="neutral"
        variant="subtle"
        title="Deleted items are kept here temporarily"
        :description="`Trash retention is currently ${Number.isFinite(mockConfig.trashRetentionDays) ? mockConfig.trashRetentionDays + ' days' : 'unlimited'}. Change it in Settings → Advanced.`"
      />

      <div class="flex flex-wrap items-center gap-2">
        <USelect v-model="typeFilter" :items="typeOptions" placeholder="All types" class="w-48" />
        <UButton v-if="typeFilter" label="Clear" size="sm" color="neutral" variant="ghost" icon="i-lucide-x" @click="typeFilter = undefined" />
      </div>

      <!-- Bulk bar -->
      <div v-if="selected.length > 0" class="flex flex-wrap items-center gap-3 rounded-lg border border-accented bg-elevated/60 px-3 py-2">
        <p class="text-sm font-medium text-highlighted">{{ selected.length }} selected</p>
        <div class="ms-auto flex flex-wrap gap-1.5">
          <UButton label="Restore Selected" size="xs" variant="soft" icon="i-lucide-history" :loading="restoring" @click="handleBulkRestore" />
          <UButton label="Delete Permanently" size="xs" color="error" variant="soft" icon="i-lucide-trash-2" @click="handleBulkPermanentDelete" />
          <UButton label="Clear" size="xs" color="neutral" variant="ghost" @click="selected = []" />
        </div>
      </div>

      <div v-if="status === 'loading' || status === 'idle'" class="space-y-3">
        <USkeleton v-for="i in 6" :key="i" class="h-16 w-full" />
      </div>
      <CommonErrorState v-else-if="status === 'error'" :message="error" @retry="load" />
      <UEmpty
        v-else-if="filtered.length === 0"
        icon="i-lucide-trash-2"
        :title="typeFilter ? 'No trashed items of this type' : 'Trash is empty'"
        description="Items you move to trash from Projects, Blog, Media and more will show up here."
        class="py-16"
      >
        <template #actions>
          <UButton v-if="typeFilter" label="Clear filter" variant="soft" color="neutral" @click="typeFilter = undefined" />
        </template>
      </UEmpty>

      <div v-else class="overflow-hidden rounded-lg border border-default">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-default bg-elevated/40 text-left">
                <th class="w-10 px-3 py-2.5">
                  <UCheckbox
                    :model-value="selected.length === filtered.length"
                    aria-label="Select all trashed items"
                    @update:model-value="(v: boolean | 'indeterminate') => { selected = v === true ? filtered.map(i => i.id) : [] }"
                  />
                </th>
                <th v-for="column in columns" :key="column.key" scope="col" class="px-3 py-2.5 text-xs font-medium text-muted" :class="column.hide ? `hidden ${column.hide}:table-cell` : ''">
                  {{ column.label }}
                </th>
                <th class="w-24 px-3 py-2.5"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filtered" :key="item.id" class="border-b border-default last:border-0 hover:bg-elevated/40">
                <td class="px-3 py-3">
                  <UCheckbox
                    :model-value="selected.includes(item.id)"
                    :aria-label="`Select ${item.title}`"
                    @update:model-value="(v: boolean | 'indeterminate') => { selected = v === true ? [...selected, item.id] : selected.filter(s => s !== item.id) }"
                  />
                </td>
                <td class="px-3 py-3">
                  <button type="button" class="text-left focus-visible:outline-primary" @click="detailItem = item">
                    <p class="font-medium text-highlighted hover:text-primary">{{ item.title }}</p>
                    <p v-if="item.subtitle" class="truncate text-xs text-muted">{{ item.subtitle }}</p>
                  </button>
                </td>
                <td class="hidden px-3 py-3 md:table-cell">
                  <UBadge color="neutral" variant="soft" size="sm">{{ TRASH_RESOURCE_LABELS[item.resourceType] ?? item.resourceType }}</UBadge>
                </td>
                <td class="hidden px-3 py-3 text-muted lg:table-cell">{{ item.trash.originalLocation }}</td>
                <td class="hidden px-3 py-3 text-muted lg:table-cell">{{ item.trash.deletedBy }}</td>
                <td class="hidden px-3 py-3 text-muted md:table-cell">{{ relativeTime(item.trash.deletedAt) }}</td>
                <td class="px-3 py-3">
                  <CommonStatusBadge :status="retentionStatus(item)" />
                  <p class="mt-0.5 text-[11px] text-dimmed">{{ retentionLabel(item) }}</p>
                </td>
                <td class="px-3 py-3 text-right">
                  <div class="flex justify-end gap-0.5">
                    <UTooltip text="Restore">
                      <UButton icon="i-lucide-history" size="xs" color="neutral" variant="ghost" :aria-label="`Restore ${item.title}`" @click="handleRestore(item)" />
                    </UTooltip>
                    <UTooltip text="Delete permanently">
                      <UButton icon="i-lucide-trash-2" size="xs" color="error" variant="ghost" :aria-label="`Permanently delete ${item.title}`" @click="handlePermanentDelete(item)" />
                    </UTooltip>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Detail / restore preview -->
    <USlideover :open="Boolean(detailItem)" :title="detailItem?.title" description="Trash item details" @update:open="(v: boolean) => { if (!v) detailItem = null }">
      <template #body>
        <div v-if="detailItem" class="space-y-5">
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between gap-3"><dt class="text-muted">Type</dt><dd class="text-default">{{ TRASH_RESOURCE_LABELS[detailItem.resourceType] ?? detailItem.resourceType }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-muted">Original location</dt><dd class="text-default">{{ detailItem.trash.originalLocation }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-muted">Deleted by</dt><dd class="text-default">{{ detailItem.trash.deletedBy }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-muted">Deleted at</dt><dd class="text-default">{{ formatDateTime(detailItem.trash.deletedAt) }}</dd></div>
            <div v-if="detailItem.trash.deletionReason" class="flex justify-between gap-3"><dt class="text-muted">Reason</dt><dd class="text-default">{{ detailItem.trash.deletionReason }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-muted">Retention</dt><dd class="text-default">{{ retentionLabel(detailItem) }}</dd></div>
          </dl>

          <div v-if="detailItem.trash.dependencies.length > 0">
            <p class="type-label mb-2">Related records</p>
            <ul class="space-y-1.5" role="list">
              <li v-for="dep in detailItem.trash.dependencies" :key="dep.label" class="flex items-center gap-2 text-sm text-default">
                <UIcon name="i-lucide-triangle-alert" class="size-3.5 text-warning" />
                {{ dep.count }} {{ dep.label }}
              </li>
            </ul>
          </div>
        </div>
      </template>
      <template #footer>
        <div v-if="detailItem" class="flex w-full justify-end gap-2">
          <UButton label="Delete Permanently" color="error" variant="soft" icon="i-lucide-trash-2" @click="handlePermanentDelete(detailItem)" />
          <UButton label="Restore" icon="i-lucide-history" :loading="restoring" @click="handleRestore(detailItem)" />
        </div>
      </template>
    </USlideover>
  </LayoutAdminPage>
</template>

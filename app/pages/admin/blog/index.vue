<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { BlogPost } from '~/types'
import { makeSeo } from '~/mock-data/shared'
import { slugify } from '~/utils/format'
import { blogRepository } from '~/repositories/content'
import { teamRepository } from '~/repositories/operations'
import { useAppStore } from '~/stores/app'
import { CommonDuplicateModal } from '#components'

const app = useAppStore()
const route = useRoute()
const overlay = useOverlay()

const previewPost = ref<BlogPost | null>(null)
const previewOpen = ref(false)
function openPreview(post: BlogPost) {
  previewPost.value = post
  previewOpen.value = true
}

const collection = useCollection<BlogPost>(query => blogRepository.list(query), {
  pageSize: 10,
  sortBy: 'updatedAt',
  sortDir: 'desc'
})

const columns = [
  { key: 'title', label: 'Post', sortable: true },
  { key: 'authorName', label: 'Author', hide: 'lg' as const },
  { key: 'category', label: 'Category', hide: 'xl' as const },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'views', label: 'Views', sortable: true, hide: 'lg' as const, class: 'text-right' },
  { key: 'publishedAt', label: 'Published', sortable: true, hide: 'md' as const }
]

const CATEGORY_OPTIONS = ['Design', 'Design Systems', 'Engineering', 'Process', 'Branding', 'Motion', 'Marketing', 'Content', 'Strategy', 'Studio']

/* -------------------------------- Create -------------------------------- */

const createOpen = ref(false)
const createState = reactive({ title: '', category: 'Design' })

const create = useMutation(
  async () => {
    const members = await teamRepository.list({ pageSize: 1 })
    const author = members.items[0]
    return blogRepository.create({
      title: createState.title.trim(),
      category: createState.category,
      authorId: author?.id,
      authorName: author?.name
    })
  },
  {
    success: 'Draft created',
    onSuccess: (post) => {
      createOpen.value = false
      if (post) navigateTo(`/admin/blog/${post.id}`)
    }
  }
)

onMounted(() => {
  if (route.query.new) createOpen.value = true
})

/* -------------------------------- Actions -------------------------------- */

const publish = useMutation((id: string) => blogRepository.publish(id), { success: 'Post published', onSuccess: () => collection.reload() })
const archive = useMutation((id: string) => blogRepository.archive(id), { success: 'Post archived', onSuccess: () => collection.reload() })
const restoreFromArchive = useMutation((id: string) => blogRepository.update(id, { status: 'draft' }), { success: 'Restored from Archive', onSuccess: () => collection.reload() })

async function bulkPublish(ids: string[], clear: () => void) {
  await Promise.all(ids.map(id => blogRepository.publish(id)))
  clear()
  collection.reload()
}
const { moveToTrash } = useTrashAction(blogRepository, {
  resourceLabel: 'Blog Post',
  itemName: p => p.title,
  onDone: () => collection.reload()
})

const duplicateModal = overlay.create(CommonDuplicateModal)
async function openDuplicate(post: BlogPost) {
  const created = await duplicateModal.open({
    resourceLabel: 'Post',
    sourceTitle: post.title,
    options: [
      { key: 'content', label: 'Content', description: 'Body copy', default: true },
      { key: 'seo', label: 'SEO', description: 'Meta title, description and social preview', default: true },
      { key: 'tags', label: 'Tags', default: true }
    ],
    onConfirm: (title, selected) => blogRepository.create({
      ...structuredClone(toRaw(post)),
      title,
      slug: slugify(title),
      status: 'draft',
      publishedAt: null,
      scheduledFor: null,
      views: 0,
      content: selected.content ? post.content : '',
      seo: selected.seo ? { ...post.seo, slug: slugify(title) } : makeSeo(title, `journal/${slugify(title)}`, 35),
      tags: selected.tags ? post.tags : []
    } as Partial<BlogPost>)
  }).result
  if (created) collection.reload()
}

function rowActions(post: BlogPost): DropdownMenuItem[][] {
  return [
    [
      { label: 'Edit', icon: 'i-lucide-pen-line', to: `/admin/blog/${post.id}` },
      { label: 'Preview', icon: 'i-lucide-eye', onSelect: () => openPreview(post) },
      { label: 'Duplicate', icon: 'i-lucide-copy', onSelect: () => openDuplicate(post) },
      ...(app.can('publish') && post.status !== 'published' ? [{ label: 'Publish', icon: 'i-lucide-send', onSelect: () => publish.run(post.id) }] : [])
    ],
    [
      ...(post.status === 'archived'
        ? [{ label: 'Restore from Archive', icon: 'i-lucide-archive-restore', onSelect: () => restoreFromArchive.run(post.id) }]
        : [{ label: 'Archive', icon: 'i-lucide-archive', onSelect: () => archive.run(post.id) }]),
      { label: 'Move to Trash', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => moveToTrash(post) }
    ]
  ]
}
</script>

<template>
  <LayoutAdminPage title="Blog">
    <template #actions>
      <UButton v-if="app.can('create')" label="New post" icon="i-lucide-plus" @click="createOpen = true" />
    </template>

    <div class="mx-auto w-full max-w-7xl space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <UInput v-model="collection.search.value" icon="i-lucide-search" placeholder="Search posts, tags, authors…" class="w-full sm:w-64" />
        <USelect v-model="collection.filters.status" :items="['draft', 'review', 'scheduled', 'published', 'archived']" placeholder="Status" class="w-32" />
        <USelect v-model="collection.filters.category" :items="CATEGORY_OPTIONS" placeholder="Category" class="w-40" />
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
        selectable
        exportable
        export-name="blog-posts"
        empty-icon="i-lucide-newspaper"
        empty-title="No posts found"
        :empty-description="collection.isFiltered.value ? 'Try different filters.' : 'Write the first journal entry.'"
        @sort="collection.toggleSort"
        @retry="collection.reload"
      >
        <template #cell-title="{ row }">
          <NuxtLink :to="`/admin/blog/${row.id}`" class="group/link flex items-center gap-3 focus-visible:outline-primary">
            <span class="size-9 shrink-0 rounded-md" :style="{ backgroundColor: row.coverColor }" aria-hidden="true" />
            <span class="min-w-0">
              <span class="block truncate font-medium text-highlighted group-hover/link:text-primary">
                {{ row.title }}
                <UIcon v-if="row.featured" name="i-lucide-star" class="ms-1 inline size-3 text-warning" aria-label="Featured" />
              </span>
              <span class="block truncate text-xs text-muted">{{ row.readingTime }} min read · {{ row.tags.slice(0, 3).join(', ') }}</span>
            </span>
          </NuxtLink>
        </template>
        <template #cell-status="{ row }">
          <CommonStatusBadge :status="row.status" />
        </template>
        <template #cell-views="{ row }">
          <span class="block text-right text-default tabular-nums">{{ formatCompact(row.views) }}</span>
        </template>
        <template #cell-publishedAt="{ row }">
          <span class="text-muted">{{ row.status === 'scheduled' ? `Scheduled ${formatDate(row.scheduledFor)}` : formatDate(row.publishedAt) }}</span>
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
            @click="bulkPublish(selected, clear)"
          />
        </template>
        <template #empty-actions>
          <UButton v-if="app.can('create') && !collection.isFiltered.value" label="New post" icon="i-lucide-plus" @click="createOpen = true" />
        </template>
      </CommonDataTable>
    </div>

    <CommonPreviewModal v-if="previewPost" v-model:open="previewOpen" :status="previewPost.status" :description="`How “${previewPost.title}” reads on the public site.`">
      <template #default>
        <header>
          <p class="type-overline">{{ previewPost.category }}</p>
          <h1 class="type-display mt-2">{{ previewPost.title }}</h1>
          <p class="type-body-lg mt-3 text-muted">{{ previewPost.excerpt }}</p>
        </header>
        <section class="mt-8">
          <p class="type-body whitespace-pre-line text-muted">{{ previewPost.content }}</p>
        </section>
      </template>
    </CommonPreviewModal>

    <!-- Create modal -->
    <UModal v-model:open="createOpen" title="New blog post" description="Start a draft; the editor covers everything else.">
      <template #body>
        <form class="space-y-4" @submit.prevent="createState.title.trim().length >= 3 && create.run()">
          <UFormField label="Title" required :error="createState.title.length > 0 && createState.title.trim().length < 3 ? 'At least 3 characters.' : undefined">
            <UInput v-model="createState.title" placeholder="e.g. Designing for dark mode from day one" class="w-full" autofocus />
          </UFormField>
          <UFormField label="Category">
            <USelect v-model="createState.category" :items="CATEGORY_OPTIONS" class="w-full" />
          </UFormField>
        </form>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="ghost" @click="createOpen = false" />
          <UButton label="Create draft" icon="i-lucide-plus" :loading="create.saving.value" :disabled="createState.title.trim().length < 3" @click="create.run()" />
        </div>
      </template>
    </UModal>
  </LayoutAdminPage>
</template>

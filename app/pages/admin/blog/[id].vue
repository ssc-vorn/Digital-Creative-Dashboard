<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'
import type { ActivityEvent, BlogPost, ContentStatus } from '~/types'
import { blogRepository } from '~/repositories/content'
import { activityRepository, baseLifecycleEvents } from '~/repositories/activity'
import { useAppStore } from '~/stores/app'

const route = useRoute()
const app = useAppStore()
const id = computed(() => String(route.params.id))

const { data: post, status, error, load } = useResource<BlogPost>(async () => {
  const found = await blogRepository.get(id.value)
  if (!found) throw new Error('This post doesn’t exist (it may have been deleted).')
  return found
})

const form = ref<BlogPost | null>(null)
const snapshot = ref('')

const lastSavedAt = ref<string | null>(null)
const draftRecovery = useDraftRecovery<BlogPost>(id.value)
const previewOpen = ref(false)

const activityEvents = ref<ActivityEvent[]>([])
const activityStatus = ref<'idle' | 'loading' | 'loaded' | 'error'>('idle')
async function loadActivity() {
  if (!form.value) return
  activityStatus.value = 'loading'
  try {
    activityEvents.value = await activityRepository.list(form.value.title, baseLifecycleEvents(form.value, app.currentUser.name))
    activityStatus.value = 'loaded'
  } catch {
    activityStatus.value = 'error'
  }
}
const activity = { data: activityEvents, status: activityStatus, load: loadActivity }

watch(post, (value) => {
  if (value) {
    form.value = structuredClone(toRaw(value))
    snapshot.value = JSON.stringify(form.value)
    lastSavedAt.value = value.updatedAt
    draftRecovery.checkFor(form.value)
    loadActivity()
  }
}, { immediate: true })

const dirty = computed(() => Boolean(form.value) && JSON.stringify(form.value) !== snapshot.value)

watchDebounced(form, () => {
  if (form.value && dirty.value) draftRecovery.persist(form.value)
}, { debounce: 1000, deep: true })

function restoreDraft() {
  if (draftRecovery.recoveredDraft.value) form.value = draftRecovery.recoveredDraft.value
  draftRecovery.discard()
}

// Reading time derived from content length; recalculated as the author writes.
watch(() => form.value?.content, (content) => {
  if (form.value && typeof content === 'string') {
    form.value.readingTime = Math.max(1, Math.round(content.split(/\s+/).length / 200))
  }
})

const save = useMutation(
  async () => (form.value ? blogRepository.update(id.value, { ...form.value }) : null),
  {
    success: 'Post saved',
    onSuccess: (updated) => {
      snapshot.value = JSON.stringify(form.value)
      if (updated) lastSavedAt.value = updated.updatedAt
      draftRecovery.clear()
    }
  }
)

const transition = useMutation(
  async (next: ContentStatus, scheduledFor?: string) => {
    if (next === 'published') return blogRepository.publish(id.value)
    if (next === 'scheduled' && scheduledFor) return blogRepository.schedule(id.value, scheduledFor)
    return blogRepository.update(id.value, { status: next })
  },
  {
    success: 'Status updated',
    onSuccess: (updated) => {
      if (updated && form.value) {
        form.value.status = updated.status
        form.value.publishedAt = updated.publishedAt
        form.value.scheduledFor = updated.scheduledFor
        snapshot.value = JSON.stringify(form.value)
      }
    }
  }
)

const CATEGORY_OPTIONS = ['Design', 'Design Systems', 'Engineering', 'Process', 'Branding', 'Motion', 'Marketing', 'Content', 'Strategy', 'Studio']

/** Table of contents derived from markdown headings. */
const toc = computed(() =>
  (form.value?.content.match(/^##\s+(.+)$/gm) ?? []).map(h => h.replace(/^##\s+/, ''))
)
</script>

<template>
  <LayoutAdminPage :title="form?.title ?? 'Blog Post'">
    <div class="mx-auto w-full max-w-7xl">
      <div v-if="status === 'loading' || status === 'idle'" class="space-y-4">
        <USkeleton class="h-10 w-72" />
        <USkeleton class="h-96 w-full" />
      </div>

      <CommonErrorState v-else-if="status === 'error'" :message="error" @retry="load" />

      <EditorsEditorShell
        v-else-if="form"
        :title="form.title"
        back-to="/admin/blog"
        back-label="Blog"
        :status="form.status"
        :saving="save.saving.value"
        :dirty="dirty"
        :save-error="save.error.value"
        :last-saved-at="lastSavedAt"
        :can-save="app.can('edit')"
        @save="save.run()"
      >
        <template #actions>
          <UButton label="Preview" icon="i-lucide-eye" color="neutral" variant="outline" @click="previewOpen = true" />
        </template>

        <EditorsDraftRecoveryBanner v-if="draftRecovery.recoverable.value" @discard="draftRecovery.discard()" @restore="restoreDraft" />

        <UCard :ui="{ body: 'space-y-4' }">
          <template #header>
            <h2 class="type-h3">Post</h2>
          </template>
          <UFormField label="Title" required>
            <UInput v-model="form.title" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Excerpt" :description="`${form.excerpt.length}/240`">
            <UTextarea v-model="form.excerpt" :rows="2" :maxlength="240" class="w-full" />
          </UFormField>
          <UFormField label="Content" :description="`Markdown · ~${form.readingTime} min read`">
            <UTextarea v-model="form.content" :rows="16" class="w-full font-mono text-sm" />
          </UFormField>
        </UCard>

        <UCard :ui="{ body: 'space-y-4' }">
          <template #header>
            <h2 class="type-h3">Metadata</h2>
          </template>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Author">
              <UInput v-model="form.authorName" class="w-full" />
            </UFormField>
            <UFormField label="Category">
              <USelect v-model="form.category" :items="CATEGORY_OPTIONS" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Tags">
            <UInputTags v-model="form.tags" class="w-full" />
          </UFormField>
          <UFormField label="Featured">
            <USwitch v-model="form.featured" label="Feature on the journal landing page" />
          </UFormField>
        </UCard>

        <EditorsRevisionHistory
          :fetcher="() => blogRepository.revisions(id)"
          :on-restore="(v: number) => blogRepository.restoreVersion(id, v)"
        />

        <CommonCommentThread resource-type="blog-post" :resource-id="id" />

        <UCard>
          <template #header>
            <h2 class="type-h3">Activity</h2>
          </template>
          <CommonActivityTimeline :events="activity.data.value ?? []" :status="activity.status.value" @retry="activity.load" />
        </UCard>

        <template #aside>
          <EditorsPublishPanel
            :status="form.status"
            :published-at="form.publishedAt"
            :scheduled-for="form.scheduledFor"
            :saving="transition.saving.value"
            :can-publish="app.can('publish')"
            @transition="(s, d) => transition.run(s, d)"
          />

          <UCard v-if="toc.length > 0">
            <template #header>
              <h2 class="type-h3">Table of contents</h2>
            </template>
            <ol class="list-inside list-decimal space-y-1 text-sm text-muted">
              <li v-for="heading in toc" :key="heading">{{ heading }}</li>
            </ol>
          </UCard>

          <EditorsSeoPanel v-model="form.seo" />
        </template>
      </EditorsEditorShell>

      <CommonPreviewModal v-if="form" v-model:open="previewOpen" :status="form.status" :description="`How “${form.title}” reads on the public site.`">
        <template #default>
          <header>
            <p class="type-overline">{{ form.category }}</p>
            <h1 class="type-display mt-2">{{ form.title }}</h1>
            <p class="type-body-lg mt-3 text-muted">{{ form.excerpt }}</p>
          </header>
          <section class="mt-8">
            <p class="type-body whitespace-pre-line text-muted">{{ form.content }}</p>
          </section>
        </template>
      </CommonPreviewModal>
    </div>
  </LayoutAdminPage>
</template>

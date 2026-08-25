<script setup lang="ts">
import type { ContentStatus, Project } from '~/types'
import { projectRepository } from '~/repositories/projects'
import { useAppStore } from '~/stores/app'

const route = useRoute()
const app = useAppStore()
const id = computed(() => String(route.params.id))

const { data: project, status, error, load } = useResource<Project>(async () => {
  const found = await projectRepository.get(id.value)
  if (!found) throw new Error('This project doesn’t exist (it may have been deleted).')
  return found
})

// Editable working copy + dirty tracking against the last-saved snapshot.
const form = ref<Project | null>(null)
const snapshot = ref('')

watch(project, (value) => {
  if (value) {
    form.value = structuredClone(toRaw(value))
    snapshot.value = JSON.stringify(form.value)
  }
}, { immediate: true })

const dirty = computed(() => Boolean(form.value) && JSON.stringify(form.value) !== snapshot.value)

const save = useMutation(
  async () => {
    if (!form.value) return null
    return projectRepository.update(id.value, { ...form.value })
  },
  {
    success: 'Project saved',
    onSuccess: (updated) => {
      if (updated) {
        form.value = structuredClone(toRaw(updated))
        snapshot.value = JSON.stringify(form.value)
      }
    }
  }
)

const transition = useMutation(
  async (status: ContentStatus, scheduledFor?: string) => {
    if (status === 'published') return projectRepository.publish(id.value)
    if (status === 'scheduled' && scheduledFor) return projectRepository.schedule(id.value, scheduledFor)
    if (status === 'archived') return projectRepository.archive(id.value)
    return projectRepository.update(id.value, { status })
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

const CATEGORIES = ['Branding', 'Web Design', 'Web Development', 'E-commerce', 'Product Design', 'Design System', 'Campaign', 'Content']

function addResult() {
  form.value?.results.push({ label: '', value: '' })
}

function removeResult(index: number) {
  form.value?.results.splice(index, 1)
}
</script>

<template>
  <LayoutAdminPage :title="form?.title ?? 'Project'">
    <div class="mx-auto w-full max-w-7xl">
      <div v-if="status === 'loading' || status === 'idle'" class="space-y-4">
        <USkeleton class="h-10 w-72" />
        <USkeleton class="h-64 w-full" />
        <USkeleton class="h-40 w-full" />
      </div>

      <CommonErrorState v-else-if="status === 'error'" :message="error" @retry="load" />

      <EditorsEditorShell
        v-else-if="form"
        :title="form.title"
        back-to="/admin/projects"
        back-label="Projects"
        :status="form.status"
        :saving="save.saving.value"
        :dirty="dirty"
        :can-save="app.can('edit')"
        @save="save.run()"
      >
        <!-- Basic information -->
        <UCard :ui="{ body: 'space-y-4' }">
          <template #header>
            <h2 class="type-h3">Basic information</h2>
          </template>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Title" required class="sm:col-span-2">
              <UInput v-model="form.title" class="w-full" />
            </UFormField>
            <UFormField label="Client">
              <UInput v-model="form.clientName" disabled class="w-full" />
            </UFormField>
            <UFormField label="Category">
              <USelect v-model="form.category" :items="CATEGORIES" class="w-full" />
            </UFormField>
            <UFormField label="Year">
              <UInputNumber v-model="form.year" :min="2015" :max="2030" :format-options="{ useGrouping: false }" class="w-full" />
            </UFormField>
            <UFormField label="Featured" description="Featured work leads the public portfolio.">
              <USwitch v-model="form.featured" label="Show as featured" />
            </UFormField>
          </div>
          <UFormField label="Summary" :description="`${form.summary.length}/200 — appears in listings and the hero.`">
            <UTextarea v-model="form.summary" :rows="2" :maxlength="200" class="w-full" />
          </UFormField>
        </UCard>

        <!-- Story -->
        <UCard :ui="{ body: 'space-y-4' }">
          <template #header>
            <div>
              <h2 class="type-h3">Case narrative</h2>
              <p class="type-body-sm mt-0.5">Challenge → strategy → solution, in the studio voice.</p>
            </div>
          </template>
          <UFormField label="Challenge">
            <UTextarea v-model="form.challenge" :rows="3" class="w-full" />
          </UFormField>
          <UFormField label="Strategy">
            <UTextarea v-model="form.strategy" :rows="3" class="w-full" />
          </UFormField>
          <UFormField label="Solution">
            <UTextarea v-model="form.solution" :rows="3" class="w-full" />
          </UFormField>
        </UCard>

        <!-- Results -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="type-h3">Results</h2>
              <UButton label="Add metric" icon="i-lucide-plus" size="xs" variant="soft" color="neutral" @click="addResult" />
            </div>
          </template>
          <UEmpty v-if="form.results.length === 0" icon="i-lucide-chart-no-axes-column" title="No results yet" description="Add the outcome metrics that make this project persuasive." variant="naked" class="py-8" />
          <div v-else class="space-y-2">
            <div v-for="(result, i) in form.results" :key="i" class="flex items-center gap-2">
              <UInput v-model="result.label" placeholder="Metric (e.g. Conversion uplift)" class="flex-1" aria-label="Metric label" />
              <UInput v-model="result.value" placeholder="+42%" class="w-28" aria-label="Metric value" />
              <UButton icon="i-lucide-x" size="xs" color="neutral" variant="ghost" aria-label="Remove metric" @click="removeResult(i)" />
            </div>
          </div>
        </UCard>

        <!-- Services & tech -->
        <UCard :ui="{ body: 'space-y-4' }">
          <template #header>
            <h2 class="type-h3">Services & technologies</h2>
          </template>
          <UFormField label="Services delivered">
            <UInputTags v-model="form.services" placeholder="Add a service…" class="w-full" />
          </UFormField>
          <UFormField label="Technologies">
            <UInputTags v-model="form.technologies" placeholder="Add a technology…" class="w-full" />
          </UFormField>
        </UCard>

        <!-- Gallery -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="type-h3">Gallery</h2>
              <UButton label="Add from media library" icon="i-lucide-image-plus" size="xs" variant="soft" color="neutral" to="/admin/media" />
            </div>
          </template>
          <div class="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            <div
              v-for="(image, i) in form.gallery"
              :key="image"
              class="group relative flex aspect-square items-center justify-center rounded-md"
              :style="{ background: `linear-gradient(${135 + i * 30}deg, ${form.coverColor}cc, ${form.coverColor}66)` }"
            >
              <UIcon name="i-lucide-image" class="size-5 text-white/70" />
              <UButton
                icon="i-lucide-x"
                size="xs"
                color="neutral"
                variant="solid"
                class="absolute -right-1.5 -top-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                :aria-label="`Remove ${image}`"
                @click="form.gallery.splice(i, 1)"
              />
            </div>
          </div>
        </UCard>

        <EditorsRevisionHistory :fetcher="() => projectRepository.revisions(id)" />

        <template #aside>
          <EditorsPublishPanel
            :status="form.status"
            :published-at="form.publishedAt"
            :scheduled-for="form.scheduledFor"
            :saving="transition.saving.value"
            :can-publish="app.can('publish')"
            @transition="(s, d) => transition.run(s, d)"
          />
          <EditorsSeoPanel v-model="form.seo" />
        </template>
      </EditorsEditorShell>
    </div>
  </LayoutAdminPage>
</template>

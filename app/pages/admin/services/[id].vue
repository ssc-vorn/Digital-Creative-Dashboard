<script setup lang="ts">
import type { ContentStatus, Service } from '~/types'
import { serviceRepository } from '~/repositories/content'
import { useAppStore } from '~/stores/app'

const route = useRoute()
const app = useAppStore()
const id = computed(() => String(route.params.id))

const { data: service, status, error, load } = useResource<Service>(async () => {
  const found = await serviceRepository.get(id.value)
  if (!found) throw new Error('This service doesn’t exist (it may have been deleted).')
  return found
})

const form = ref<Service | null>(null)
const snapshot = ref('')

const lastSavedAt = ref<string | null>(null)

watch(service, (value) => {
  if (value) {
    form.value = structuredClone(toRaw(value))
    snapshot.value = JSON.stringify(form.value)
    lastSavedAt.value = value.updatedAt
  }
}, { immediate: true })

const dirty = computed(() => Boolean(form.value) && JSON.stringify(form.value) !== snapshot.value)

const save = useMutation(
  async () => (form.value ? serviceRepository.update(id.value, { ...form.value }) : null),
  {
    success: 'Service saved',
    onSuccess: (updated) => {
      snapshot.value = JSON.stringify(form.value)
      if (updated) lastSavedAt.value = updated.updatedAt
    }
  }
)

const transition = useMutation(
  (next: ContentStatus) => serviceRepository.update(id.value, { status: next }),
  {
    success: 'Status updated',
    onSuccess: (updated) => {
      if (updated && form.value) {
        form.value.status = updated.status
        snapshot.value = JSON.stringify(form.value)
      }
    }
  }
)

function addFaq() {
  form.value?.faqs.push({ question: '', answer: '' })
}

function addProcessStep() {
  form.value?.process.push({ step: '', detail: '' })
}

const previewOpen = ref(false)
</script>

<template>
  <LayoutAdminPage :title="form?.title ?? 'Service'">
    <div class="mx-auto w-full max-w-7xl">
      <div v-if="status === 'loading' || status === 'idle'" class="space-y-4">
        <USkeleton class="h-10 w-72" />
        <USkeleton class="h-64 w-full" />
      </div>

      <CommonErrorState v-else-if="status === 'error'" :message="error" @retry="load" />

      <EditorsEditorShell
        v-else-if="form"
        :title="form.title"
        back-to="/admin/services"
        back-label="Services"
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

        <UCard :ui="{ body: 'space-y-4' }">
          <template #header>
            <h2 class="type-h3">Service details</h2>
          </template>
          <UFormField label="Title" required>
            <UInput v-model="form.title" class="w-full" />
          </UFormField>
          <UFormField label="Description">
            <UTextarea v-model="form.description" :rows="3" class="w-full" />
          </UFormField>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Features">
              <UInputTags v-model="form.features" class="w-full" />
            </UFormField>
            <UFormField label="Benefits">
              <UInputTags v-model="form.benefits" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Technologies">
            <UInputTags v-model="form.technologies" class="w-full" />
          </UFormField>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="type-h3">Process</h2>
              <UButton label="Add step" icon="i-lucide-plus" size="xs" variant="soft" color="neutral" @click="addProcessStep" />
            </div>
          </template>
          <div class="space-y-2">
            <div v-for="(step, i) in form.process" :key="i" class="flex items-start gap-2">
              <span class="mt-2 flex size-6 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-semibold tabular-nums">{{ i + 1 }}</span>
              <UInput v-model="step.step" placeholder="Step name" class="w-36" aria-label="Step name" />
              <UInput v-model="step.detail" placeholder="What happens here" class="flex-1" aria-label="Step detail" />
              <UButton icon="i-lucide-x" size="xs" color="neutral" variant="ghost" aria-label="Remove step" @click="form.process.splice(i, 1)" />
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="type-h3">FAQs</h2>
              <UButton label="Add FAQ" icon="i-lucide-plus" size="xs" variant="soft" color="neutral" @click="addFaq" />
            </div>
          </template>
          <div class="space-y-4">
            <div v-for="(faq, i) in form.faqs" :key="i" class="space-y-2 rounded-lg border border-default p-3">
              <div class="flex items-center gap-2">
                <UInput v-model="faq.question" placeholder="Question" class="flex-1" aria-label="FAQ question" />
                <UButton icon="i-lucide-x" size="xs" color="neutral" variant="ghost" aria-label="Remove FAQ" @click="form.faqs.splice(i, 1)" />
              </div>
              <UTextarea v-model="faq.answer" placeholder="Answer" :rows="2" class="w-full" aria-label="FAQ answer" />
            </div>
          </div>
        </UCard>

        <template #aside>
          <EditorsPublishPanel
            :status="form.status"
            :saving="transition.saving.value"
            :can-publish="app.can('publish')"
            @transition="s => transition.run(s)"
          />
          <EditorsSeoPanel v-model="form.seo" />
        </template>
      </EditorsEditorShell>

      <CommonPreviewModal v-if="form" v-model:open="previewOpen" :status="form.status" :description="`How “${form.title}” reads on the public site.`">
        <template #default>
          <header>
            <h1 class="type-display">{{ form.title }}</h1>
            <p class="type-body-lg mt-3 text-muted">{{ form.description }}</p>
          </header>
          <section v-if="form.features.length" class="mt-8">
            <h2 class="type-h2">Features</h2>
            <ul class="mt-2 list-inside list-disc space-y-1 text-muted">
              <li v-for="feature in form.features" :key="feature">{{ feature }}</li>
            </ul>
          </section>
          <section v-if="form.faqs.length" class="mt-8">
            <h2 class="type-h2">FAQs</h2>
            <div class="mt-2 space-y-4">
              <div v-for="(faq, i) in form.faqs" :key="i">
                <p class="font-medium text-highlighted">{{ faq.question }}</p>
                <p class="mt-1 text-muted">{{ faq.answer }}</p>
              </div>
            </div>
          </section>
        </template>
      </CommonPreviewModal>
    </div>
  </LayoutAdminPage>
</template>

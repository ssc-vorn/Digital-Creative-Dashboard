<script setup lang="ts">
import type { Project } from '~/types'
import { makeSeo } from '~/mock-data/shared'
import { slugify } from '~/utils/format'
import { projectRepository } from '~/repositories/projects'

const props = defineProps<{ source: Project }>()
const emit = defineEmits<{ close: [Project | null] }>()

const title = ref(`${props.source.title} (copy)`)
const options = reactive({
  content: true,
  media: true,
  seo: true,
  tags: true,
  analyticsHistory: false
})

const duplicate = useMutation(
  () => {
    const newTitle = title.value.trim() || `${props.source.title} (copy)`
    const patch: Partial<Project> = {
      title: newTitle,
      slug: slugify(newTitle),
      status: 'draft',
      publishedAt: null,
      scheduledFor: null,
      challenge: options.content ? props.source.challenge : '',
      strategy: options.content ? props.source.strategy : '',
      solution: options.content ? props.source.solution : '',
      results: options.content ? props.source.results : [],
      gallery: options.media ? props.source.gallery : [],
      seo: options.seo ? { ...props.source.seo, slug: slugify(newTitle) } : makeSeo(newTitle, `work/${slugify(newTitle)}`, 40),
      services: options.tags ? props.source.services : [],
      technologies: options.tags ? props.source.technologies : [],
      views: options.analyticsHistory ? props.source.views : 0
    }
    return projectRepository.create({ ...props.source, ...patch } as Partial<Project>)
  },
  { success: 'Project duplicated', onSuccess: project => emit('close', project ?? null) }
)
</script>

<template>
  <UModal title="Duplicate project" :description="`Create a copy of “${source.title}”.`" :close="{ onClick: () => emit('close', null) }">
    <template #body>
      <div class="space-y-4">
        <UFormField label="New title" required>
          <UInput v-model="title" class="w-full" autofocus />
        </UFormField>

        <div>
          <p class="type-label mb-2">Include</p>
          <div class="space-y-2.5">
            <UCheckbox v-model="options.content" label="Content" description="Challenge, strategy, solution and results" />
            <UCheckbox v-model="options.media" label="Media references" description="Gallery images" />
            <UCheckbox v-model="options.seo" label="SEO" description="Meta title, description and social preview" />
            <UCheckbox v-model="options.tags" label="Tags" description="Services and technologies" />
            <UCheckbox v-model="options.analyticsHistory" label="Analytics history" description="Carry over view counts (usually left unchecked)" />
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton label="Cancel" color="neutral" variant="ghost" @click="emit('close', null)" />
        <UButton label="Create Copy" icon="i-lucide-copy" :loading="duplicate.saving.value" :disabled="!title.trim()" @click="duplicate.run()" />
      </div>
    </template>
  </UModal>
</template>

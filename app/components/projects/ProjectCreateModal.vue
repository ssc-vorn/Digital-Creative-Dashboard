<script setup lang="ts">
import type { Client, Project } from '~/types'
import { clientRepository } from '~/repositories/crm'
import { projectRepository } from '~/repositories/projects'

const emit = defineEmits<{ close: [Project | null] }>()

const state = reactive({
  title: '',
  clientId: undefined as string | undefined,
  category: 'Web Design'
})

const clients = ref<Client[]>([])
onMounted(async () => {
  try {
    clients.value = (await clientRepository.list({ pageSize: 100, sortBy: 'company', sortDir: 'asc' })).items
  } catch {
    clients.value = []
  }
})

const clientItems = computed(() => clients.value.map(c => ({ label: c.company, value: c.id })))
const CATEGORIES = ['Branding', 'Web Design', 'Web Development', 'E-commerce', 'Product Design', 'Design System', 'Campaign', 'Content']

const errors = computed(() => ({
  title: state.title.trim().length < 3 ? 'Give the project a title (at least 3 characters).' : undefined,
  clientId: !state.clientId ? 'Pick the client this work is for.' : undefined
}))
const touched = reactive({ title: false, clientId: false })
const valid = computed(() => !errors.value.title && !errors.value.clientId)

const create = useMutation(
  () => {
    const client = clients.value.find(c => c.id === state.clientId)
    return projectRepository.create({
      title: state.title.trim(),
      clientId: state.clientId,
      clientName: client?.company ?? '',
      industry: client?.industry ?? '',
      category: state.category
    })
  },
  { success: 'Project created', onSuccess: project => emit('close', project) }
)

function submit() {
  touched.title = true
  touched.clientId = true
  if (valid.value) create.run()
}
</script>

<template>
  <UModal
    title="New project"
    description="Start a portfolio project as a draft. Everything else can be filled in the editor."
    :close="{ onClick: () => emit('close', null) }"
  >
    <template #body>
      <form class="space-y-4" @submit.prevent="submit">
        <UFormField label="Project title" required :error="touched.title ? errors.title : undefined">
          <UInput
            v-model="state.title"
            placeholder="e.g. Meridian Digital Collection"
            class="w-full"
            autofocus
            @blur="touched.title = true"
          />
        </UFormField>

        <UFormField label="Client" required :error="touched.clientId ? errors.clientId : undefined">
          <USelectMenu
            v-model="state.clientId"
            :items="clientItems"
            value-key="value"
            placeholder="Select a client"
            class="w-full"
            @update:model-value="touched.clientId = true"
          />
        </UFormField>

        <UFormField label="Category">
          <USelect v-model="state.category" :items="CATEGORIES" class="w-full" />
        </UFormField>
      </form>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton label="Cancel" color="neutral" variant="ghost" @click="emit('close', null)" />
        <UButton label="Create draft" icon="i-lucide-plus" :loading="create.saving.value" :disabled="!valid" @click="submit" />
      </div>
    </template>
  </UModal>
</template>

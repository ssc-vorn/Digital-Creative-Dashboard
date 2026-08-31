<script setup lang="ts">
export interface DuplicateOption {
  key: string
  label: string
  description?: string
  default: boolean
}

const props = defineProps<{
  resourceLabel: string
  sourceTitle: string
  options: DuplicateOption[]
  onConfirm: (title: string, selected: Record<string, boolean>) => Promise<unknown>
}>()
const emit = defineEmits<{ close: [unknown | null] }>()

const title = ref(`${props.sourceTitle} (copy)`)
const selected = reactive<Record<string, boolean>>(
  Object.fromEntries(props.options.map(o => [o.key, o.default]))
)

const duplicate = useMutation(
  () => props.onConfirm(title.value.trim() || `${props.sourceTitle} (copy)`, { ...selected }),
  { success: `${props.resourceLabel} duplicated`, onSuccess: result => emit('close', result ?? null) }
)
</script>

<template>
  <UModal :title="`Duplicate ${resourceLabel.toLowerCase()}`" :description="`Create a copy of “${sourceTitle}”.`" :close="{ onClick: () => emit('close', null) }">
    <template #body>
      <div class="space-y-4">
        <UFormField label="New title" required>
          <UInput v-model="title" class="w-full" autofocus />
        </UFormField>

        <div v-if="options.length">
          <p class="type-label mb-2">Include</p>
          <div class="space-y-2.5">
            <UCheckbox v-for="option in options" :key="option.key" v-model="selected[option.key]" :label="option.label" :description="option.description" />
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

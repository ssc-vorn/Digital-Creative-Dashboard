<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}>(), {
  description: 'This action cannot be undone.',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  danger: false
})

const emit = defineEmits<{ close: [boolean] }>()
</script>

<template>
  <UModal
    :title="props.title"
    :description="props.description"
    :close="{ onClick: () => emit('close', false) }"
    :dismissible="false"
    :ui="{ footer: 'justify-end' }"
  >
    <template #footer>
      <UButton
        color="neutral"
        variant="ghost"
        :label="props.cancelLabel"
        @click="emit('close', false)"
      />
      <UButton
        :color="props.danger ? 'error' : 'primary'"
        :label="props.confirmLabel"
        @click="emit('close', true)"
      />
    </template>
  </UModal>
</template>

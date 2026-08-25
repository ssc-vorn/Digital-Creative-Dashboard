<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  message?: string | null
  retryLabel?: string
}>(), {
  title: 'Something went wrong',
  message: null,
  retryLabel: 'Try again'
})

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <UEmpty
    icon="i-lucide-cloud-alert"
    :title="title"
    :description="message ?? 'The request failed. It might be a connection issue — retrying usually helps.'"
    class="py-16"
  >
    <template #actions>
      <UButton :label="retryLabel" color="neutral" variant="outline" icon="i-lucide-rotate-cw" @click="emit('retry')" />
    </template>
  </UEmpty>
</template>

<script setup lang="ts">
defineEmits<{ discard: [], restore: [] }>()
</script>

<template>
  <UAlert
    icon="i-lucide-file-clock"
    color="warning"
    variant="subtle"
    title="Recovered draft found"
    description="A newer draft was found on this device — likely from an unsaved session. Restore it to continue where you left off, or discard it to keep what’s currently loaded."
  >
    <template #actions>
      <UButton label="Discard Draft" color="neutral" variant="ghost" size="xs" @click="$emit('discard')" />
      <UButton label="Restore Draft" color="warning" variant="soft" size="xs" @click="$emit('restore')" />
    </template>
  </UAlert>
</template>

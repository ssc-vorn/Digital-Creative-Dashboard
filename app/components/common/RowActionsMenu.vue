<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const props = defineProps<{ items: DropdownMenuItem[][] }>()
</script>

<template>
  <UDropdownMenu :items="props.items" :content="{ align: 'end' }">
    <UButton
      icon="i-lucide-ellipsis"
      size="xs"
      color="neutral"
      variant="ghost"
      aria-label="Row actions"
    />
  </UDropdownMenu>
</template>

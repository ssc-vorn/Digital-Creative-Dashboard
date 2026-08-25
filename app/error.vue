<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const is404 = computed(() => props.error.statusCode === 404)
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-default p-6">
    <UEmpty
      :icon="is404 ? 'i-lucide-compass' : 'i-lucide-server-crash'"
      :title="is404 ? 'Page not found' : 'Something went wrong'"
      :description="is404 ? 'The page you’re looking for doesn’t exist or has moved.' : (error.message || 'An unexpected error occurred.')"
      variant="naked"
      class="max-w-md"
    >
      <template #actions>
        <UButton label="Back to dashboard" icon="i-lucide-layout-dashboard" @click="clearError({ redirect: '/admin' })" />
      </template>
    </UEmpty>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '~/types'
import { projectRepository } from '~/repositories/projects'

const { data, status, load } = useResource<Project[]>(async () => {
  const result = await projectRepository.list({
    sortBy: 'views',
    sortDir: 'desc',
    pageSize: 5,
    filters: { status: 'published' }
  })
  return result.items
})

const rows = computed(() => {
  const items = data.value ?? []
  const max = Math.max(...items.map(p => p.views), 1)
  return items.map(p => ({ label: p.title, value: p.views, share: (p.views / max) * 100 }))
})
</script>

<template>
  <div v-if="status === 'loading' || status === 'idle'" class="space-y-3">
    <USkeleton v-for="i in 5" :key="i" class="h-8 w-full" />
  </div>
  <CommonErrorState v-else-if="status === 'error'" @retry="load" />
  <ChartsMeterList v-else :rows="rows" />
</template>

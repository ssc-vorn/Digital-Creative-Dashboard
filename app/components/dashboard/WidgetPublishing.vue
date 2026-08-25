<script setup lang="ts">
import type { ContentStatus } from '~/types'
import { projectRepository } from '~/repositories/projects'
import { blogRepository, caseStudyRepository } from '~/repositories/content'

const STATUSES: ContentStatus[] = ['draft', 'review', 'approved', 'scheduled', 'published', 'archived']

const { data, status, load } = useResource<Record<ContentStatus, number>>(async () => {
  const [projects, posts, studies] = await Promise.all([
    projectRepository.list({ pageSize: 100 }),
    blogRepository.list({ pageSize: 100 }),
    caseStudyRepository.list({ pageSize: 100 })
  ])
  const counts = Object.fromEntries(STATUSES.map(s => [s, 0])) as Record<ContentStatus, number>
  for (const item of [...projects.items, ...posts.items, ...studies.items]) {
    counts[item.status] += 1
  }
  return counts
})
</script>

<template>
  <div v-if="status === 'loading' || status === 'idle'" class="space-y-3">
    <USkeleton v-for="i in 6" :key="i" class="h-7 w-full" />
  </div>
  <CommonErrorState v-else-if="status === 'error'" @retry="load" />
  <ul v-else-if="data" role="list" class="space-y-2.5">
    <li v-for="s in STATUSES" :key="s" class="flex items-center justify-between gap-2">
      <CommonStatusBadge :status="s" />
      <span class="text-sm font-medium text-highlighted tabular-nums">{{ data[s] }}</span>
    </li>
  </ul>
</template>

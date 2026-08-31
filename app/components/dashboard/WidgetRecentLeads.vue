<script setup lang="ts">
import type { Lead } from '~/types'
import { leadRepository } from '~/repositories/crm'

const { data, status, load } = useResource<Lead[]>(async () => {
  const result = await leadRepository.list({ sortBy: 'createdAt', sortDir: 'desc', pageSize: 5 })
  return result.items
})
</script>

<template>
  <div v-if="status === 'loading' || status === 'idle'" class="space-y-3">
    <USkeleton v-for="i in 5" :key="i" class="h-12 w-full" />
  </div>
  <CommonErrorState v-else-if="status === 'error'" @retry="load" />
  <ul v-else-if="data" role="list" class="divide-y divide-default">
    <li v-for="lead in data" :key="lead.id">
      <NuxtLink
        :to="`/admin/crm/leads/${lead.id}`"
        class="flex items-center gap-3 py-2.5 transition-colors first:pt-0 last:pb-0 hover:bg-elevated/40 focus-visible:outline-primary"
      >
        <CommonScoreRing :score="lead.score" :size="40" label="Lead score" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-highlighted">{{ lead.name }} · {{ lead.company }}</p>
          <p class="truncate text-xs text-muted">{{ lead.service }} · {{ lead.budget }}</p>
        </div>
        <div class="shrink-0 text-right">
          <CommonStatusBadge :status="lead.stage" />
          <p class="mt-1 text-[11px] text-dimmed">{{ relativeTime(lead.createdAt) }}</p>
        </div>
      </NuxtLink>
    </li>
  </ul>
</template>

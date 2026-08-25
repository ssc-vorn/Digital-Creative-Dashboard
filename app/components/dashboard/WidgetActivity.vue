<script setup lang="ts">
import type { AuditLog } from '~/types'
import { auditLogRepository } from '~/repositories/platform'

const { data, status, load } = useResource<AuditLog[]>(async () => {
  const result = await auditLogRepository.list({ pageSize: 7 })
  return result.items
})
</script>

<template>
  <div v-if="status === 'loading' || status === 'idle'" class="space-y-3">
    <USkeleton v-for="i in 6" :key="i" class="h-8 w-full" />
  </div>
  <CommonErrorState v-else-if="status === 'error'" @retry="load" />
  <ol v-else-if="data" role="list" class="space-y-3">
    <li v-for="log in data" :key="log.id" class="flex gap-3 text-sm">
      <span class="mt-1.5 size-1.5 shrink-0 rounded-full" :class="log.result === 'success' ? 'bg-primary' : 'bg-error'" aria-hidden="true" />
      <div class="min-w-0">
        <p class="text-default">
          <span class="font-medium text-highlighted">{{ log.userName }}</span>
          {{ log.action.toLowerCase() }}
          <span class="font-medium">{{ log.resourceName }}</span>
        </p>
        <p class="text-xs text-dimmed">{{ relativeTime(log.date) }}</p>
      </div>
    </li>
  </ol>
</template>

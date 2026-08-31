<script setup lang="ts">
import type { SystemService } from '~/types'
import { systemHealthRepository } from '~/repositories/platform'

const { data, status, load } = useResource<SystemService[]>(() => systemHealthRepository.services())
</script>

<template>
  <div v-if="status === 'loading' || status === 'idle'" class="space-y-3">
    <USkeleton v-for="i in 7" :key="i" class="h-7 w-full" />
  </div>
  <CommonErrorState v-else-if="status === 'error'" @retry="load" />
  <ul v-else-if="data" role="list" class="space-y-2.5">
    <li v-for="service in data" :key="service.id" class="flex items-center justify-between gap-3">
      <div class="flex min-w-0 items-center gap-2">
        <span class="truncate text-sm text-default">{{ service.name }}</span>
        <span class="hidden text-xs text-dimmed tabular-nums sm:inline">{{ service.latencyMs }}ms</span>
      </div>
      <CommonStatusBadge :status="service.status" />
    </li>
  </ul>
</template>

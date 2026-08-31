<script setup lang="ts">
import type { WorkTask } from '~/types'
import { taskRepository } from '~/repositories/operations'

const { data, status, load } = useResource<WorkTask[]>(async () => {
  const result = await taskRepository.list({ sortBy: 'dueDate', sortDir: 'asc', pageSize: 50 })
  return result.items.filter(t => t.status !== 'done' && t.dueDate).slice(0, 6)
})

const completeTask = useMutation(
  (id: string) => taskRepository.moveStatus(id, 'done'),
  { success: 'Task completed', onSuccess: () => load() }
)

function isOverdue(task: WorkTask): boolean {
  return Boolean(task.dueDate && new Date(task.dueDate).getTime() < Date.now())
}
</script>

<template>
  <div v-if="status === 'loading' || status === 'idle'" class="space-y-3">
    <USkeleton v-for="i in 6" :key="i" class="h-9 w-full" />
  </div>
  <CommonErrorState v-else-if="status === 'error'" @retry="load" />
  <ul v-else-if="data" role="list" class="divide-y divide-default">
    <li v-for="task in data" :key="task.id" class="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
      <UCheckbox
        :model-value="false"
        :aria-label="`Complete ${task.title}`"
        :disabled="completeTask.saving.value"
        @update:model-value="completeTask.run(task.id)"
      />
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm text-default">{{ task.title }}</p>
        <p class="truncate text-xs text-muted">{{ task.assigneeName ?? 'Unassigned' }}<template v-if="task.projectName"> · {{ task.projectName }}</template></p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <CommonPriorityBadge :priority="task.priority" />
        <span class="text-xs tabular-nums" :class="isOverdue(task) ? 'font-medium text-error' : 'text-muted'">
          {{ formatDate(task.dueDate) }}
        </span>
      </div>
    </li>
  </ul>
</template>

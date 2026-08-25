<script setup lang="ts">
import type { TaskStatus, TeamMember, WorkTask } from '~/types'
import { taskRepository, teamRepository } from '~/repositories/operations'
import { useAppStore } from '~/stores/app'

const app = useAppStore()
const toast = useToast()

const STATUSES: { key: TaskStatus, label: string }[] = [
  { key: 'todo', label: 'To Do' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'done', label: 'Done' }
]

const board = ref<Record<TaskStatus, WorkTask[]> | null>(null)
const status = ref<'idle' | 'loading' | 'loaded' | 'error'>('idle')

async function load() {
  status.value = 'loading'
  try {
    board.value = await taskRepository.board()
    status.value = 'loaded'
  } catch {
    status.value = 'error'
  }
}

onMounted(load)

/* ------------------------------ Drag & drop ------------------------------ */

const dragging = ref<WorkTask | null>(null)
const dragOver = ref<TaskStatus | null>(null)

async function onDrop(target: TaskStatus) {
  const task = dragging.value
  dragging.value = null
  dragOver.value = null
  if (!task || !board.value || task.status === target) return
  const from = task.status
  board.value[from] = board.value[from].filter(t => t.id !== task.id)
  board.value[target] = [{ ...task, status: target }, ...board.value[target]]
  try {
    await taskRepository.moveStatus(task.id, target)
  } catch (err) {
    board.value[target] = board.value[target].filter(t => t.id !== task.id)
    board.value[from] = [task, ...board.value[from]]
    toast.add({ title: 'Couldn’t move task', description: err instanceof Error ? err.message : undefined, color: 'error', icon: 'i-lucide-triangle-alert' })
  }
}

/* -------------------------------- Create --------------------------------- */

const createOpen = ref(false)
const createState = reactive({
  title: '',
  description: '',
  priority: 'medium' as WorkTask['priority'],
  assigneeId: undefined as string | undefined,
  dueDate: ''
})

const team = ref<TeamMember[]>([])
onMounted(async () => {
  try {
    team.value = (await teamRepository.list({ pageSize: 50, sortBy: 'name', sortDir: 'asc' })).items
  } catch { /* assignee select stays empty */ }
})

const create = useMutation(
  () => {
    const assignee = team.value.find(m => m.id === createState.assigneeId)
    return taskRepository.create({
      title: createState.title.trim(),
      description: createState.description,
      priority: createState.priority,
      assigneeId: assignee?.id ?? null,
      assigneeName: assignee?.name ?? null,
      dueDate: createState.dueDate ? new Date(`${createState.dueDate}T12:00:00`).toISOString() : null
    })
  },
  {
    success: 'Task created',
    onSuccess: () => {
      createOpen.value = false
      Object.assign(createState, { title: '', description: '', priority: 'medium', assigneeId: undefined, dueDate: '' })
      load()
    }
  }
)

function isOverdue(task: WorkTask): boolean {
  return task.status !== 'done' && Boolean(task.dueDate && new Date(task.dueDate).getTime() < Date.now())
}
</script>

<template>
  <LayoutAdminPage title="Tasks">
    <template #actions>
      <UButton v-if="app.can('create')" label="New task" icon="i-lucide-plus" @click="createOpen = true" />
    </template>

    <div class="mx-auto w-full max-w-7xl">
      <div v-if="status === 'loading' || status === 'idle'" class="flex gap-4 overflow-x-auto pb-2">
        <div v-for="i in 5" :key="i" class="w-72 shrink-0 space-y-3">
          <USkeleton class="h-8 w-full" />
          <USkeleton class="h-24 w-full" />
          <USkeleton class="h-24 w-full" />
        </div>
      </div>

      <CommonErrorState v-else-if="status === 'error'" @retry="load" />

      <div v-else-if="board" class="flex gap-4 overflow-x-auto pb-2" role="list" aria-label="Task board">
        <section
          v-for="column in STATUSES"
          :key="column.key"
          class="flex w-72 shrink-0 flex-col rounded-lg border bg-elevated/30 transition-colors"
          :class="dragOver === column.key ? 'border-primary' : 'border-default'"
          role="listitem"
          :aria-label="`${column.label}: ${board[column.key].length} tasks`"
          @dragover.prevent="dragOver = column.key"
          @dragleave="dragOver === column.key && (dragOver = null)"
          @drop="onDrop(column.key)"
        >
          <header class="flex items-center justify-between px-3 py-2.5">
            <h3 class="flex items-center gap-2 text-sm font-medium text-highlighted">
              {{ column.label }}
              <span class="rounded-full bg-elevated px-1.5 text-xs text-muted tabular-nums">{{ board[column.key].length }}</span>
            </h3>
          </header>

          <div class="flex-1 space-y-2 px-2 pb-2">
            <p v-if="board[column.key].length === 0" class="rounded-md border border-dashed border-default px-3 py-6 text-center text-xs text-dimmed">
              Drop a task here
            </p>
            <article
              v-for="task in board[column.key]"
              :key="task.id"
              draggable="true"
              class="cursor-grab rounded-lg border border-default bg-default p-3 shadow-xs transition-all active:cursor-grabbing"
              :class="dragging?.id === task.id ? 'opacity-50' : 'hover:border-accented'"
              @dragstart="dragging = task"
              @dragend="dragging = null"
            >
              <p class="text-sm font-medium text-highlighted">{{ task.title }}</p>
              <p v-if="task.projectName" class="mt-0.5 truncate text-xs text-muted">{{ task.projectName }}</p>
              <div class="mt-2 flex items-center justify-between gap-2">
                <CommonPriorityBadge :priority="task.priority" />
                <span v-if="task.dueDate" class="text-[11px] tabular-nums" :class="isOverdue(task) ? 'font-medium text-error' : 'text-dimmed'">
                  {{ formatDate(task.dueDate) }}
                </span>
              </div>
              <div v-if="task.assigneeName" class="mt-2 flex items-center gap-1.5 border-t border-default pt-2">
                <UAvatar :text="task.assigneeName.split(' ').map(p => p[0]).join('').slice(0, 2)" size="3xs" />
                <span class="truncate text-xs text-muted">{{ task.assigneeName }}</span>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>

    <!-- Create task -->
    <UModal v-model:open="createOpen" title="New task" description="Add work to the studio board.">
      <template #body>
        <form class="space-y-4" @submit.prevent="createState.title.trim() && create.run()">
          <UFormField label="Title" required>
            <UInput v-model="createState.title" class="w-full" autofocus />
          </UFormField>
          <UFormField label="Description">
            <UTextarea v-model="createState.description" :rows="2" class="w-full" />
          </UFormField>
          <div class="grid gap-4 sm:grid-cols-3">
            <UFormField label="Priority">
              <USelect v-model="createState.priority" :items="['low', 'medium', 'high', 'urgent']" class="w-full" />
            </UFormField>
            <UFormField label="Assignee">
              <USelectMenu
                v-model="createState.assigneeId"
                :items="team.map(m => ({ label: m.name, value: m.id }))"
                value-key="value"
                placeholder="Unassigned"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Due date">
              <UInput v-model="createState.dueDate" type="date" class="w-full" />
            </UFormField>
          </div>
        </form>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="ghost" @click="createOpen = false" />
          <UButton label="Create task" icon="i-lucide-plus" :loading="create.saving.value" :disabled="!createState.title.trim()" @click="create.run()" />
        </div>
      </template>
    </UModal>
  </LayoutAdminPage>
</template>

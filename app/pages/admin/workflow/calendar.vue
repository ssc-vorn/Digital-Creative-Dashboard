<script setup lang="ts">
import type { CalendarEvent, CalendarEventKind } from '~/types'
import { calendarRepository } from '~/repositories/operations'

const { data: events, status, load } = useResource<CalendarEvent[]>(() => calendarRepository.list())

const view = ref<'month' | 'agenda'>('month')
const cursor = ref(new Date())
const toast = useToast()

const KIND_META: Record<CalendarEventKind, { label: string, icon: string, class: string }> = {
  task: { label: 'Task', icon: 'i-lucide-list-todo', class: 'bg-(--viz-1)/15 text-(--viz-1)' },
  deadline: { label: 'Deadline', icon: 'i-lucide-flag', class: 'bg-(--viz-2)/15 text-(--viz-2)' },
  meeting: { label: 'Meeting', icon: 'i-lucide-users', class: 'bg-(--viz-3)/15 text-(--viz-3)' },
  publishing: { label: 'Publishing', icon: 'i-lucide-send', class: 'bg-(--viz-5)/15 text-(--viz-5)' },
  campaign: { label: 'Campaign', icon: 'i-lucide-megaphone', class: 'bg-(--viz-4)/15 text-(--viz-4)' },
  review: { label: 'Review', icon: 'i-lucide-eye', class: 'bg-elevated text-muted' }
}

const monthLabel = computed(() =>
  cursor.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
)

interface DayCell {
  iso: string
  day: number
  inMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
}

function isoOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const grid = computed<DayCell[]>(() => {
  const year = cursor.value.getFullYear()
  const month = cursor.value.getMonth()
  const first = new Date(year, month, 1)
  const start = new Date(first)
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7)) // Monday start
  const todayIso = isoOf(new Date())
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const iso = isoOf(date)
    return {
      iso,
      day: date.getDate(),
      inMonth: date.getMonth() === month,
      isToday: iso === todayIso,
      events: (events.value ?? []).filter(e => e.date === iso)
    }
  })
})

const agenda = computed(() => {
  const todayIso = isoOf(new Date())
  return [...(events.value ?? [])]
    .filter(e => e.date >= todayIso)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 20)
})

function shiftMonth(delta: number) {
  const next = new Date(cursor.value)
  next.setMonth(next.getMonth() + delta)
  cursor.value = next
}

/* Drag events between days (updates local state; persisted by the backend later). */
const draggingEvent = ref<CalendarEvent | null>(null)

function dropOn(day: DayCell) {
  const event = draggingEvent.value
  draggingEvent.value = null
  if (!event || event.date === day.iso) return
  event.date = day.iso
  toast.add({ title: `“${event.title}” moved to ${formatDate(day.iso)}`, color: 'success', icon: 'i-lucide-calendar-check' })
}
</script>

<template>
  <LayoutAdminPage title="Calendar">
    <template #actions>
      <div class="hidden items-center gap-0.5 rounded-md border border-default p-0.5 sm:flex">
        <UButton
          v-for="v in (['month', 'agenda'] as const)"
          :key="v"
          :label="v === 'month' ? 'Month' : 'Agenda'"
          size="xs"
          :color="view === v ? 'primary' : 'neutral'"
          :variant="view === v ? 'soft' : 'ghost'"
          @click="view = v"
        />
      </div>
    </template>

    <div class="mx-auto w-full max-w-7xl space-y-4">
      <!-- Month nav -->
      <div class="flex items-center justify-between gap-2">
        <h2 class="type-h2">{{ monthLabel }}</h2>
        <div class="flex items-center gap-1">
          <UButton icon="i-lucide-chevron-left" color="neutral" variant="ghost" aria-label="Previous month" @click="shiftMonth(-1)" />
          <UButton label="Today" color="neutral" variant="outline" size="sm" @click="cursor = new Date()" />
          <UButton icon="i-lucide-chevron-right" color="neutral" variant="ghost" aria-label="Next month" @click="shiftMonth(1)" />
        </div>
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap gap-3">
        <span v-for="(meta, kind) in KIND_META" :key="kind" class="inline-flex items-center gap-1.5 text-xs text-muted">
          <span class="flex size-5 items-center justify-center rounded" :class="meta.class"><UIcon :name="meta.icon" class="size-3" /></span>
          {{ meta.label }}
        </span>
      </div>

      <USkeleton v-if="status === 'loading' || status === 'idle'" class="h-[32rem] w-full" />
      <CommonErrorState v-else-if="status === 'error'" @retry="load" />

      <!-- Month grid -->
      <div v-else-if="view === 'month'" class="overflow-x-auto">
        <div class="min-w-[42rem] overflow-hidden rounded-lg border border-default">
          <div class="grid grid-cols-7 border-b border-default bg-elevated/40">
            <div v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']" :key="day" class="px-2 py-2 text-center text-xs font-medium text-muted">
              {{ day }}
            </div>
          </div>
          <div class="grid grid-cols-7">
            <div
              v-for="cell in grid"
              :key="cell.iso"
              class="min-h-24 border-b border-e border-default p-1.5 [&:nth-child(7n)]:border-e-0"
              :class="cell.inMonth ? '' : 'bg-elevated/30'"
              @dragover.prevent
              @drop="dropOn(cell)"
            >
              <p
                class="mb-1 inline-flex size-6 items-center justify-center rounded-full text-xs tabular-nums"
                :class="cell.isToday ? 'bg-primary font-semibold text-inverted' : cell.inMonth ? 'text-default' : 'text-dimmed'"
              >
                {{ cell.day }}
              </p>
              <div class="space-y-1">
                <button
                  v-for="event in cell.events.slice(0, 3)"
                  :key="event.id"
                  type="button"
                  draggable="true"
                  class="flex w-full cursor-grab items-center gap-1 truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium active:cursor-grabbing"
                  :class="KIND_META[event.kind].class"
                  :title="event.title"
                  @dragstart="draggingEvent = event"
                  @dragend="draggingEvent = null"
                >
                  <UIcon :name="KIND_META[event.kind].icon" class="size-3 shrink-0" />
                  <span class="truncate">{{ event.time ? `${event.time} · ` : '' }}{{ event.title }}</span>
                </button>
                <p v-if="cell.events.length > 3" class="px-1.5 text-[11px] text-dimmed">+{{ cell.events.length - 3 }} more</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Agenda -->
      <div v-else>
        <UEmpty v-if="agenda.length === 0" icon="i-lucide-calendar" title="Nothing coming up" class="py-16" />
        <ul v-else role="list" class="divide-y divide-default overflow-hidden rounded-lg border border-default">
          <li v-for="event in agenda" :key="event.id" class="flex items-center gap-3 px-4 py-3">
            <span class="flex size-8 shrink-0 items-center justify-center rounded-md" :class="KIND_META[event.kind].class">
              <UIcon :name="KIND_META[event.kind].icon" class="size-4" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-highlighted">{{ event.title }}</p>
              <p class="text-xs text-muted">{{ KIND_META[event.kind].label }}<template v-if="event.relatedTo"> · {{ event.relatedTo }}</template></p>
            </div>
            <p class="shrink-0 text-sm text-muted tabular-nums">{{ formatDate(event.date) }}<template v-if="event.time"> · {{ event.time }}</template></p>
          </li>
        </ul>
      </div>
    </div>
  </LayoutAdminPage>
</template>
